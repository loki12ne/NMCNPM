const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "qanda",
  password: "thuongcdv123", // thay bằng mật khẩu thật
  database: "qadb",
});

app.post("/questions", (req, res) => {
  const { user_name, question_text, subject } = req.body;
  const sql =
    "INSERT INTO questions (user_name, question_text, subject) VALUES (?, ?, ?)";
  db.query(sql, [user_name, question_text, subject], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

app.listen(3001, () =>
  console.log("✅ Backend đang chạy tại http://localhost:3001")
);
