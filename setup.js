require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // Drop tables in correct order to avoid FK errors
    await client.query(`DROP TABLE IF EXISTS FeedBacks CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS QuestionLikes CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Answers CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Questions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS sessions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS TutorRequests CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Accounts CASCADE;`);

    // Create Accounts
    await client.query(`
      CREATE TABLE Accounts (
        username VARCHAR(50) NOT NULL PRIMARY KEY,
        password VARCHAR(50) NOT NULL,
        role VARCHAR(50),
        CONSTRAINT CK_Accounts CHECK (username ~ '^[a-zA-Z0-9]{1,15}$'),
        CONSTRAINT CK_Accounts_Password CHECK (password ~ '^[a-zA-Z0-9]{6,15}$')
      );
    `);

    // Create Questions
    await client.query(`
      CREATE TABLE Questions (
        question_id SERIAL PRIMARY KEY,
        username VARCHAR(50) REFERENCES Accounts(username),
        text_content TEXT,
        subject VARCHAR(50),
        date_posted TIMESTAMP
      );
    `);

    // Create Answers (1-1 with Questions)
    await client.query(`
      CREATE TABLE Answers (
        question_id INTEGER PRIMARY KEY REFERENCES Questions(question_id) ON DELETE CASCADE,
        user_ask VARCHAR(50) REFERENCES Accounts(username),
        user_answer VARCHAR(50) REFERENCES Accounts(username),
        text_content TEXT,
        date_posted TIMESTAMP
      );
    `);

    // Create FeedBacks (no answer_id)
    await client.query(`
      CREATE TABLE FeedBacks (
        feedback_id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES Questions(question_id) ON DELETE CASCADE,
        username VARCHAR(50) REFERENCES Accounts(username),
        rating SMALLINT,
        comment TEXT,
        date_posted TIMESTAMP
      );
    `);

    // Create QuestionLikes
    await client.query(`
      CREATE TABLE QuestionLikes (
        like_id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES Questions(question_id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
        UNIQUE (question_id, username)
      );
    `);

    // Create sessions
    await client.query(`
      CREATE TABLE sessions (
        sid VARCHAR(200) NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);

    // Create TutorRequests
    await client.query(`
      CREATE TABLE TutorRequests (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username),
        full_name VARCHAR(100) NOT NULL,
        university VARCHAR(100) NOT NULL,
        faculty VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        student_card_image TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sample data
    await client.query(`
      INSERT INTO Accounts (username, password, role) VALUES
        ('nguyenanh', 'pass1234', 'student'),
        ('tranhoa', 'abc12345', 'teacher'),
        ('student1', 'pass1234', 'student'),
        ('teacher1', 'teach123', 'teacher')
      ON CONFLICT (username) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Questions (username, text_content, subject, date_posted) VALUES
        ('nguyenanh', 'Tính diện tích hình tròn có bán kính 5cm?', 'toán', '2025-06-01 10:00:00'),
        ('tranhoa', 'Lực hấp dẫn giữa hai vật được tính như thế nào?', 'lý', '2025-06-01 12:00:00'),
        ('student1', 'Phương trình hóa học của phản ứng giữa Na và Cl2 là gì?', 'hóa', '2025-06-02 09:00:00'),
        ('teacher1', 'Giải phương trình bậc hai: x^2 - 4x + 3 = 0', 'toán', '2025-06-02 14:00:00'),
        ('nguyenanh', 'Tốc độ ánh sáng trong chân không là bao nhiêu?', 'lý', '2025-06-02 15:30:00')
      ON CONFLICT (question_id) DO NOTHING;
    `);

    console.log("✅ Tables created and initialized successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    await client.end();
  }
}

createTables();
