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

    // Drop tables
    await client.query(`DROP TABLE IF EXISTS FeedBacks CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Answers CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Questions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS sessions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Accounts CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS TutorRequests CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS QuestionLikes CASCADE;`);
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
        img_url TEXT,
        pdf_url TEXT,
        subject VARCHAR(50),
        date_posted TIMESTAMP
      );
    `);
    
    // Create QuestionLikes
    await client.query(`
      CREATE TABLE QuestionLikes (
        question_id INTEGER NOT NULL REFERENCES Questions(question_id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
        PRIMARY KEY (question_id, username)
      );
    `);
     
    // Create Answers
    await client.query(`
      CREATE TABLE Answers (
        answer_id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES Questions(question_id) ON DELETE CASCADE,
        user_ask VARCHAR(50) REFERENCES Accounts(username),
        user_answer VARCHAR(50) REFERENCES Accounts(username),
        text_content TEXT,
        date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        img_url TEXT,
        pdf_url TEXT
      );
    `);

    // Create FeedBacks
    await client.query(`
      CREATE TABLE FeedBacks (
        feedback_id SERIAL PRIMARY KEY,
        answer_id INTEGER NOT NULL REFERENCES Answers(answer_id) ON DELETE CASCADE,
        username VARCHAR(50) REFERENCES Accounts(username),
        rating SMALLINT,
        comment TEXT,
        date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    //Create StudyPlans
    await client.query(`
        CREATE TABLE StudyPlans (
          plan_id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
          title VARCHAR(200) NOT NULL,
          subject VARCHAR(100),
          description TEXT,
          priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
          due_date DATE,
          progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    //Create Notifications
    await client.query(`
      CREATE TABLE Notifications (
        notification_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        related_id INTEGER,
        related_type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    //Create TutorPerformance
    await client.query(`
      CREATE TABLE TutorPerformance (
        username VARCHAR(50) PRIMARY KEY REFERENCES Accounts(username) ON DELETE CASCADE,
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        questions_answered INTEGER DEFAULT 0,
        total_feedback INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Insert sample data
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

    console.log("Tables 'Accounts', 'Questions', 'Answers', 'FeedBacks', 'sessions', 'TutorRequests', 'QuestionLikes', 'StudyPlans', 'Notifications', 'TutorPerformance' created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    await client.end();
  }
}

createTables();
