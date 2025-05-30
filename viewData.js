const { Client } = require('pg');

const client = new Client({
  user: 'avnadmin',
  host: 'nmcnpm-panda-thanh-loc.i.aivencloud.com',
  database: 'panda',
  password: 'AVNS_K8x-Tv90Ap_Y_Vi0p44',
  port: 28733,
  ssl: { rejectUnauthorized: false },
});

async function viewData() {
  try {
    await client.connect();

    // Xem bảng users
    const usersRes = await client.query('SELECT * FROM users');
    console.log("Users table:");
    console.table(usersRes.rows);

    // Xem bảng questions
    const questionsRes = await client.query('SELECT * FROM questions');
    console.log("Questions table:");
    console.table(questionsRes.rows);

    await client.end();
  } catch (err) {
    console.error("Error viewing data:", err);
  }
}

viewData();
