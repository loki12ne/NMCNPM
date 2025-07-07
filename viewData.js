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

    // Xem bảng TutorRequests
    const tutorRequestsRes = await client.query('SELECT * FROM TutorRequests');
    console.log("TutorRequests table:");
    console.table(tutorRequestsRes.rows);

    // Xem bảng StudyPlans
    const studyPlansRes = await client.query('SELECT * FROM StudyPlans');
    console.log("StudyPlans table:");
    console.table(studyPlansRes.rows);

    // Xem bảng Notifications
    const notificationsRes = await client.query('SELECT * FROM Notifications');
    console.log("Notifications table:");
    console.table(notificationsRes.rows);

    // Xem bảng TutorPerformance
    const tutorPerformanceRes = await client.query('SELECT * FROM TutorPerformance');
    console.log("TutorPerformance table:");
    console.table(tutorPerformanceRes.rows);

    // Xem bảng QuestionTopics
    const questionTopicsRes = await client.query('SELECT * FROM QuestionTopics');
    console.log("QuestionTopics table:");
    console.table(questionTopicsRes.rows);

    // Xem bảng SystemStatistics
    const systemStatisticsRes = await client.query('SELECT * FROM SystemStatistics');
    console.log("SystemStatistics table:");
    console.table(systemStatisticsRes.rows);

    // Xem bảng LearnerStatistics
    const learnerStatisticsRes = await client.query('SELECT * FROM LearnerStatistics');
    console.log("LearnerStatistics table:");
    console.table(learnerStatisticsRes.rows);

    // Xem bảng TutorAnswered
    const tutorAnsweredRes = await client.query('SELECT * FROM TutorAnswered');
    console.log("TutorAnswered table:");
    console.table(tutorAnsweredRes.rows);

    await client.end();
  } catch (err) {
    console.error("Error viewing data:", err);
  }
}

viewData();