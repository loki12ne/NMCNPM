const express = require('express');
const router = express.Router();
const client = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

function isTutor(req, res, next) {
  console.log('Checking isTutor:', req.session.user); // Debug
  if (req.session && req.session.user && req.session.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({ error: 'Only tutors can answer questions.' });
  }
}

function isLearner(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ error: 'Only learners can submit feedback.' });
  }
}

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

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user?.username || null;
    const query = `
      SELECT q.question_id, q.username, q.text_content, q.subject, q.date_posted,
        COUNT(ql.like_id) AS so_luot_like,
        MAX(CASE WHEN ql.username = $1 THEN 1 ELSE 0 END) AS da_like
      FROM Questions q
      LEFT JOIN QuestionLikes ql ON q.question_id = ql.question_id
      GROUP BY q.question_id, q.username, q.text_content, q.subject, q.date_posted
      ORDER BY q.date_posted DESC
    `;
    const result = await client.query(query, [username]);
    res.json({ questions: result.rows });
  } catch (err) {
    console.error('Questions fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/like', isAuthenticated, async (req, res) => {
  const username = req.session.user?.username;
  const question_id = req.params.id;
  try {
    const check = await client.query(
      'SELECT * FROM QuestionLikes WHERE question_id = $1 AND username = $2',
      [question_id, username]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Bạn đã like câu hỏi này rồi.' });
    }
    await client.query(
      'INSERT INTO QuestionLikes (question_id, username) VALUES ($1, $2)',
      [question_id, username]
    );
    res.json({ message: 'Đã like câu hỏi.' });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id/like', isAuthenticated, async (req, res) => {
  const username = req.session.user?.username;
  const question_id = req.params.id;
  try {
    const del = await client.query(
      'DELETE FROM QuestionLikes WHERE question_id = $1 AND username = $2',
      [question_id, username]
    );
    if (del.rowCount === 0) {
      return res.status(400).json({ error: 'Bạn chưa like câu hỏi này.' });
    }
    res.json({ message: 'Đã bỏ like.' });
  } catch (err) {
    console.error('Unlike error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/answer', isAuthenticated, isTutor, async (req, res) => {
  const { question_id, text_content } = req.body;
  const user_answer = req.session.user.username;

  console.log('Answer request:', { question_id, text_content, user_answer }); // Debug

  if (!question_id || !text_content) {
    return res.status(400).json({ error: 'Missing question_id or text_content.' });
  }

  try {
    const existingAnswer = await client.query(
      'SELECT question_id FROM Answers WHERE question_id = $1',
      [question_id]
    );
    if (existingAnswer.rows.length > 0) {
      return res.status(400).json({ error: 'Câu hỏi này đã được trả lời.' });
    }

    const question = await client.query(
      'SELECT username FROM Questions WHERE question_id = $1',
      [question_id]
    );
    if (question.rows.length === 0) {
      return res.status(404).json({ error: 'Câu hỏi không tồn tại.' });
    }
    const user_ask = question.rows[0].username;

    await client.query(
      `INSERT INTO Answers (question_id, user_ask, user_answer, text_content, date_posted)
       VALUES ($1, $2, $3, $4, NOW())`,
      [question_id, user_ask, user_answer, text_content]
    );

    res.json({ message: 'Câu trả lời đã được gửi thành công.' });
  } catch (err) {
    console.error('Answer error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.post('/feedback', isAuthenticated, isLearner, async (req, res) => {
  const { question_id, rating, comment } = req.body;
  const username = req.session.user.username;

  if (!question_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Missing question_id or invalid rating (1-5).' });
  }

  try {
    const answer = await client.query(
      'SELECT question_id FROM Answers WHERE question_id = $1',
      [question_id]
    );
    if (answer.rows.length === 0) {
      return res.status(400).json({ error: 'Câu hỏi chưa được trả lời.' });
    }

    await client.query(
      `INSERT INTO FeedBacks (question_id, username, rating, comment, date_posted)
       VALUES ($1, $2, $3, $4, NOW())`,
      [question_id, username, rating, comment || null]
    );

    res.json({ message: 'Phản hồi đã được gửi thành công.' });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/answer/:questionId', isAuthenticated, async (req, res) => {
  const { questionId } = req.params;

  try {
    const result = await client.query(
      `SELECT a.question_id, a.user_ask, a.user_answer, a.text_content, a.date_posted
       FROM Answers a
       WHERE a.question_id = $1`,
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy câu trả lời.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get answer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/feedback/:questionId', isAuthenticated, async (req, res) => {
  const { questionId } = req.params;

  try {
    const result = await client.query(
      `SELECT f.feedback_id, f.question_id, f.username, f.rating, f.comment, f.date_posted
       FROM FeedBacks f
       WHERE f.question_id = $1
       ORDER BY f.date_posted DESC`,
      [questionId]
    );

    res.json({ feedbacks: result.rows });
  } catch (err) {
    console.error('Get feedback error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;