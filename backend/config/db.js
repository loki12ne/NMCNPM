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

client.connect().then(() => {
  console.log('Connected to PostgreSQL database');
}).catch(err => {
  console.error('Database connection error:', err);
});

module.exports = client;