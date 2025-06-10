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

async function viewData() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // Xem bảng Accounts
    const accountsRes = await client.query('SELECT * FROM Accounts');
    console.log("Accounts table:");
    console.table(accountsRes.rows);

    // Xem bảng Questions
    const questionsRes = await client.query('SELECT * FROM Questions');
    console.log("Questions table:");
    console.table(questionsRes.rows);

    // Xem bảng Answers
    const answersRes = await client.query('SELECT * FROM Answers');
    console.log("Answers table:");
    console.table(answersRes.rows);

    // Xem bảng FeedBacks
    const feedbacksRes = await client.query('SELECT * FROM FeedBacks');
    console.log("FeedBacks table:");
    console.table(feedbacksRes.rows);

    // Xem bảng sessions
    const sessionsRes = await client.query('SELECT * FROM sessions');
    console.log("sessions table:");
    console.table(sessionsRes.rows);

    await client.end();
  } catch (err) {
    console.error("Error viewing data:", err);
  }
}

viewData();