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
    await client.query(`DROP TABLE IF EXISTS Notifications CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS TutorPerformance CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS FeedBacks CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS QuestionLikes CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Answers CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Questions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS TutorRequests CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS sessions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Accounts CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS QuestionTopics CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS SystemStatistics CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS LearnerStatistics CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS TutorAnswered CASCADE;`);

    // Create Accounts
    await client.query(`
      CREATE TABLE Accounts (
        username VARCHAR(50) NOT NULL PRIMARY KEY,
        password VARCHAR(50) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'tutor', 'admin')),
        CONSTRAINT CK_Username CHECK (username ~ '^[a-zA-Z0-9]{1,15}$'),
        CONSTRAINT CK_Password CHECK (password ~ '^[a-zA-Z0-9]{6,15}$')
      );
    `);

    // Create Questions
    await client.query(`
      CREATE TABLE Questions (
        question_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username),
        text_content TEXT NOT NULL,
        img_url TEXT,
        pdf_url TEXT,
        subject VARCHAR(50) NOT NULL,
        date_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_answered BOOLEAN DEFAULT FALSE
      );
      CREATE INDEX idx_questions_subject ON Questions(subject);
    `);

    // Create QuestionLikes
    await client.query(`
      CREATE TABLE QuestionLikes (
        question_id INTEGER NOT NULL,
        username VARCHAR(50) NOT NULL,
        PRIMARY KEY (question_id, username),
        FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE,
        FOREIGN KEY (username) REFERENCES Accounts(username) ON DELETE CASCADE
      );
    `);

    // Create Answers
    await client.query(`
      CREATE TABLE Answers (
        answer_id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES Questions(question_id) ON DELETE CASCADE,
        user_ask VARCHAR(50) NOT NULL REFERENCES Accounts(username),
        user_answer VARCHAR(50) NOT NULL REFERENCES Accounts(username),
        text_content TEXT NOT NULL,
        date_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        img_url TEXT,
        pdf_url TEXT
      );
    `);

    // Create FeedBacks
    await client.query(`
      CREATE TABLE FeedBacks (
        feedback_id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES Questions(question_id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username),
        rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        date_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create sessions
    await client.query(`
      CREATE TABLE sessions (
        sid VARCHAR(200) NOT NULL PRIMARY KEY,
        sess JSONB NOT NULL,
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
        year INTEGER NOT NULL,
        student_card_image TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);


    // Drop new tables if exist
    await client.query(`DROP TABLE IF EXISTS Tasks CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Classes CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Exams CASCADE;`);

    // Create Tasks table
    await client.query(`
      CREATE TABLE Tasks (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        subject VARCHAR(100),
        time INTEGER NOT NULL,
        due_date DATE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Classes table
    await client.query(`
      CREATE TABLE Classes (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
        class_name VARCHAR(200) NOT NULL,
        subject VARCHAR(100),
        start_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Exams table
    await client.query(`
      CREATE TABLE Exams (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
        subject VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        exam_date DATE NOT NULL,
        exam_time TIME NOT NULL,
        duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Notifications
    await client.query(`
      CREATE TABLE Notifications (
        notification_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('answer', 'feedback', 'tutor_approved', 'tutor_rejected', 'tutor_removed')),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        related_id INTEGER,
        related_type VARCHAR(50),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create TutorPerformance
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
        ('learner', '1234567', 'learner'),
        ('giasu', '1234567', 'tutor'),
        ('admin', '1234567', 'admin'),
        ('teacher1', 'teach123', 'tutor')
      ON CONFLICT (username) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Questions (username, text_content, subject, date_posted) VALUES
        ('learner', 'Lực hấp dẫn giữa hai vật được tính như thế nào?', 'lý', '2025-06-01 12:00:00'),
        ('learner', 'Phương trình hóa học của phản ứng giữa Na và Cl2 là gì?', 'hóa', '2025-06-02 09:00:00'),
        ('teacher1', 'Giải phương trình bậc hai: x^2 - 4x + 3 = 0', 'toán', '2025-06-02 14:00:00'),
        ('learner', 'Tốc độ ánh sáng trong chân không là bao nhiêu?', 'lý', '2025-06-02 15:30:00')
      ON CONFLICT (question_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Answers (question_id, user_ask, user_answer, text_content, date_posted) VALUES
        (1, 'learner', 'giasu', 'Lực hấp dẫn F = G * (m1 * m2) / r^2', '2025-06-03 10:00:00'),
        (2, 'learner', 'teacher1', '2Na + Cl2 → 2NaCl', '2025-06-03 11:00:00')
      ON CONFLICT (answer_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO FeedBacks (question_id, username, rating, comment, date_posted) VALUES
        (1, 'learner', 4, 'Giải thích rõ ràng!', '2025-06-04 09:00:00'),
        (2, 'learner', 5, 'Rất tốt!', '2025-06-04 10:00:00')
      ON CONFLICT (feedback_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO QuestionLikes (question_id, username) VALUES
        (1, 'learner'),
        (2, 'learner')
      ON CONFLICT ON CONSTRAINT questionlikes_pkey DO NOTHING;
    `);

    await client.query(`
      INSERT INTO TutorRequests (username, full_name, university, faculty, year, student_card_image, status) VALUES
        ('giasu', 'Nguyen Van A', 'HCMUS', 'CNTT', 3, 'http://example.com/card.jpg', 'pending')
      ON CONFLICT (id) DO NOTHING;
    `);



    await client.query(`
      INSERT INTO Notifications (username, type, title, message, related_id, related_type) VALUES
        ('learner', 'answer', 'Câu hỏi đã được trả lời', 'Câu hỏi của bạn đã được giasu trả lời', 1, 'question'),
        ('learner', 'feedback', 'Phản hồi đã được gửi', 'Bạn đã gửi phản hồi cho câu hỏi', 1, 'question')
      ON CONFLICT (notification_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO TutorPerformance (username, average_rating, questions_answered, total_feedback) VALUES
        ('giasu', 4.5, 2, 1),
        ('teacher1', 4.8, 1, 1)
      ON CONFLICT (username) DO NOTHING;
    `);

    console.log("✅ Tables created and initialized successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    await client.end();
  }
}

createTables();