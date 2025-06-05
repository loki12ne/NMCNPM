const express = require('express');
const router = express.Router();
const client = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

router.post('/', isAuthenticated, async (req, res) => {
  const { text_content, subject } = req.body;
  const username = req.session.user?.username;

  if (!username) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  if (!text_content || !subject) {
    return res.status(400).json({ error: 'Missing text or subject' });
  }
  if (!['toán', 'lý', 'hóa'].includes(subject)) {
    return res.status(400).json({ error: 'Invalid subject' });
  }

  try {
    const userCheck = await client.query('SELECT username FROM Accounts WHERE username = $1', [username]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    const query = 'INSERT INTO Questions (username, text_content, subject, date_posted) VALUES ($1, $2, $3, NOW()) RETURNING question_id';
    const result = await client.query(query, [username, text_content, subject]);
    res.json({ message: 'Question posted successfully', question_id: result.rows[0].question_id });
  } catch (err) {
    console.error('Question post error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const query = 'SELECT question_id, username, text_content, subject, date_posted FROM Questions ORDER BY date_posted DESC';
    const result = await client.query(query);
    console.log('Questions fetched:', result.rows);
    res.json({ questions: result.rows });
  } catch (err) {
    console.error('Questions fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;