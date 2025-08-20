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



    await client.query(`DROP TABLE IF EXISTS Tasks CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Classes CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Exams CASCADE;`);


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
        text_content TEXT,
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

    // Create Notifications
    await client.query(`
      CREATE TABLE Notifications (
        notification_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('answer', 'feedback', 'tutor_approved', 'tutor_rejected', 'tutor_removed')),
        message TEXT NOT NULL,
        related_id INTEGER,
        related_type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
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

    // Create QuestionTopics
    await client.query(`
      CREATE TABLE QuestionTopics (
        topic_id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES Questions(question_id) ON DELETE CASCADE,
        topic_name VARCHAR(50) NOT NULL
      );
    `);

    // Create SystemStatistics
    await client.query(`
      CREATE TABLE SystemStatistics (
        stat_id SERIAL PRIMARY KEY,
        total_users INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        total_answers INTEGER NOT NULL,
        last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create LearnerStatistics 
    await client.query(`
      CREATE TABLE LearnerStatistics (
        stat_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
        questions_posted INTEGER NOT NULL,
        interests VARCHAR(100),
        last_activity TIMESTAMP
      );
    `);

    // Create TutorAnswered
    await client.query(`
      CREATE TABLE TutorAnswered (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES Questions(question_id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL REFERENCES Accounts(username) ON DELETE CASCADE,
        answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample data
    await client.query(`
      INSERT INTO Accounts (username, password, role) VALUES
        ('learner', '1234567', 'learner'),
        ('tutor', '1234567', 'tutor'),
        ('admin', '1234567', 'admin'),
        ('teacher1', 'teach123', 'tutor'),
        ('nguyenvana', 'teach123', 'learner'),
        ('tranvanb', 'teach123', 'learner')
      ON CONFLICT (username) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Questions (username, text_content, subject, date_posted, is_answered) VALUES
        ('learner', 'Lực hấp dẫn giữa hai vật được tính như thế nào?', 'Physics', '2025-06-01 12:00:00', TRUE),
        ('learner', 'Phương trình hóa học của phản ứng giữa Na và Cl2 là gì?', 'Chemistry', '2025-06-02 09:00:00', TRUE),
        ('teacher1', 'Giải phương trình bậc hai: x^2 - 4x + 3 = 0', 'Math', '2025-06-02 14:00:00', FALSE),
        ('learner', 'Tốc độ ánh sáng trong chân không là bao nhiêu?', 'Physics', '2025-06-02 15:30:00', FALSE),
        
        -- Tháng 3: 3 câu hỏi
        ('nguyenvana', 'Định luật Ohm trong điện học được phát biểu như thế nào?', 'Physics', '2025-03-05 08:30:00', TRUE),
        ('tranvanb', 'Tính đạo hàm của hàm số y = x^3 + 2x^2 - 5x + 1', 'Math', '2025-03-12 14:20:00', TRUE),
        ('learner', 'Phản ứng oxi hóa khử là gì? Cho ví dụ', 'Chemistry', '2025-03-25 16:45:00', FALSE),
        
        -- Tháng 4: 1 câu hỏi  
        ('nguyenvana', 'Công thức tính diện tích hình tròn và chu vi hình tròn', 'Math', '2025-04-15 10:30:00', TRUE),
        
        -- Tháng 5: 6 câu hỏi
        ('tranvanb', 'Động năng và thế năng khác nhau như thế nào?', 'Physics', '2025-05-03 09:15:00', FALSE),
        ('learner', 'Phương trình phản ứng trung hòa giữa axit và bazơ', 'Chemistry', '2025-05-08 13:20:00', TRUE),
        ('nguyenvana', 'Giải hệ phương trình: 2x + 3y = 7, x - y = 1', 'Math', '2025-05-12 11:40:00', TRUE),
        ('tranvanb', 'Định luật bảo toàn khối lượng trong hóa học', 'Chemistry', '2025-05-18 15:30:00', FALSE),
        ('learner', 'Tính giới hạn: lim(x→0) sin(x)/x', 'Math', '2025-05-22 14:50:00', FALSE),
        ('nguyenvana', 'Hiện tượng khúc xạ ánh sáng là gì?', 'Physics', '2025-05-28 16:10:00', FALSE),
        
        -- Tháng 7: 2 câu hỏi
        ('tranvanb', 'Cấu hình electron của nguyên tố Oxygen (O)', 'Chemistry', '2025-07-10 09:45:00', FALSE),
        ('learner', 'Định Physics Pythagoras và ứng dụng trong tam giác vuông', 'Math', '2025-07-25 13:15:00', FALSE),
        
        -- Tháng 8: 3 câu hỏi
        ('nguyenvana', 'Lực ly tâm và lực hướng tâm trong chuyển động tròn đều', 'Physics', '2025-08-17 10:20:00', FALSE),
        ('tranvanb', 'Phương trình đường thẳng đi qua hai điểm A(1,2) và B(3,4)', 'Math', '2025-08-18 14:35:00', FALSE),
        ('learner', 'Tính pH của dung dịch HCl 0.1M', 'Chemistry', '2025-08-18 11:50:00', FALSE)
      ON CONFLICT (question_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Answers (question_id, user_ask, user_answer, text_content, date_posted) VALUES
        (1, 'learner', 'tutor', 'Lực hấp dẫn F = G * (m1 * m2) / r^2', '2025-06-03 10:00:00'),
        (2, 'learner', 'teacher1', '2Na + Cl2 → 2NaCl', '2025-06-03 11:00:00'),
        
        -- Thêm câu trả lời cho một số câu hỏi mới
        (5, 'nguyenvana', 'teacher1', 'Định luật Ohm: U = I × R, trong đó U là hiệu điện thế, I là cường độ dòng điện, R là điện trở', '2025-03-06 09:00:00'),
        (6, 'tranvanb', 'tutor', 'y'' = 3x^2 + 4x - 5', '2025-03-13 10:30:00'),
        (8, 'nguyenvana', 'teacher1', 'Diện tích: S = πr^2, Chu vi: C = 2πr', '2025-04-16 11:15:00'),
        (10, 'learner', 'tutor', 'Phản ứng trung hòa: HCl + NaOH → NaCl + H2O', '2025-05-09 08:45:00'),
        (11, 'nguyenvana', 'teacher1', 'x = 2, y = 1', '2025-05-13 12:20:00')
      ON CONFLICT (answer_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO FeedBacks (question_id, username, rating, comment, date_posted) VALUES
        (1, 'learner', 4, 'Giải thích rõ ràng!', '2025-06-04 09:00:00'),
        (2, 'learner', 5, 'Rất tốt!', '2025-06-04 10:00:00'),
        
        -- Thêm feedback cho các câu trả lời mới
        (5, 'nguyenvana', 5, 'Công thức rất chuẩn xác, cảm ơn teacher!', '2025-03-07 10:30:00'),
        (6, 'tranvanb', 4, 'Đạo hàm đúng rồi, dễ hiểu', '2025-03-14 11:45:00'),
        (8, 'nguyenvana', 5, 'Công thức cơ bản nhưng rất hữu ích', '2025-04-17 14:20:00'),
        (10, 'learner', 4, 'Phản ứng cân bằng đúng', '2025-05-10 09:30:00'),
        (11, 'nguyenvana', 5, 'Giải hệ phương trình rất chi tiết', '2025-05-14 13:15:00')
      ON CONFLICT (feedback_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO QuestionLikes (question_id, username) VALUES
        (1, 'learner'),
        (2, 'learner'),
        
        -- Thêm likes cho các câu hỏi mới
        (5, 'tranvanb'),
        (5, 'learner'),
        (6, 'nguyenvana'),
        (8, 'tranvanb'),
        (10, 'nguyenvana'),
        (10, 'tranvanb'),
        (11, 'learner'),
        (17, 'nguyenvana'),
        (18, 'tranvanb')
      ON CONFLICT ON CONSTRAINT questionlikes_pkey DO NOTHING;
    `);

    await client.query(`
      INSERT INTO TutorRequests (username, full_name, university, faculty, year, student_card_image, status) VALUES
        ('tutor', 'Nguyen Van A', 'HCMUS', 'CNTT', 3, 'https://cdn.pixabay.com/photo/2015/11/16/14/43/cat-1045782_1280.jpg', 'pending'),
        ('nguyenvana', 'Nguyen Van An', 'HCMUT', 'Khoa học Ứng dụng', 2, 'https://cdn.pixabay.com/photo/2016/09/05/21/37/cat-1647775_1280.jpg', 'rejected'),
        ('tranvanb', 'Tran Van Binh', 'UEH', 'Kinh tế', 4, 'https://cdn.pixabay.com/photo/2021/12/01/14/10/cat-eyes-6838073_1280.jpg', 'approved')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO Notifications (username, type, message, related_id, related_type) VALUES
        ('learner', 'answer', 'Your question has been answered by a tutor', 1, 'question'),
        ('learner', 'feedback', 'You have submitted feedback for a question', 1, 'question')
      ON CONFLICT (notification_id) DO NOTHING;
    `);



    // Insert TutorPerformance data for existing tutors
    await client.query(`
      INSERT INTO TutorPerformance (username, average_rating, questions_answered, total_feedback, last_updated) VALUES
        ('tutor', 4.00, 3, 3, CURRENT_TIMESTAMP),
        ('teacher1', 5.00, 4, 4, CURRENT_TIMESTAMP)
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