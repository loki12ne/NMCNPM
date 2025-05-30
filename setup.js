const { Client } = require('pg'); 

const client = new Client({
  user: 'avnadmin',
  host: 'nmcnpm-panda-thanh-loc.i.aivencloud.com',
  database: 'panda', 
  password: 'AVNS_K8x-Tv90Ap_Y_Vi0p44',
  port: 28733,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createTables() {
  try {
    await client.connect();

    // Tạo bảng users với ràng buộc dữ liệu tên, password, role
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        name VARCHAR(15) PRIMARY KEY CHECK (name ~ '^[a-zA-Z0-9]{1,15}$'),
        password VARCHAR(15) NOT NULL CHECK (password ~ '^[a-zA-Z0-9]{6,15}$'),
        role VARCHAR(10) CHECK (role IN ('student', 'teacher', 'admin')) NOT NULL
      );
    `);

    // Tạo bảng questions với MaQ tự gen, người đăng liên kết tới users(name)
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        MaQ SERIAL PRIMARY KEY,
        user_name VARCHAR(15) REFERENCES users(name) ON DELETE CASCADE,
        text TEXT NOT NULL,
        subject VARCHAR(10) CHECK (subject IN ('toán', 'lý', 'hóa')) NOT NULL,
        date_posted DATE NOT NULL DEFAULT CURRENT_DATE
      );
    `);

    console.log("Tables 'users' and 'questions' created successfully.");

        await client.query(`
      INSERT INTO users (name, password, role)
      VALUES 
        ('nguyenanh', 'pass1234', 'student'),
        ('tranhoa', 'abc12345', 'teacher')
      ON CONFLICT (name) DO NOTHING;
    `);


        await client.query(`
      INSERT INTO users (name, password, role) VALUES
      ('student1', 'pass1234', 'student'),
      ('teacher1', 'teach123', 'teacher')
      ON CONFLICT (name) DO NOTHING;
    `);

    await client.end();
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}

createTables();
