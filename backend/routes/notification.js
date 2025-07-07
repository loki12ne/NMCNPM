const express = require('express');
const router = express.Router();
const client = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

// Lấy tất cả notification của user hiện tại
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user?.username;
    if (!username) return res.status(401).json({ error: 'Chưa đăng nhập' });
    const result = await client.query(
      `SELECT notification_id, type, title, message, related_id, related_type, is_read, created_at
       FROM Notifications
       WHERE username = $1
       ORDER BY created_at DESC`,
      [username]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Đánh dấu đã đọc 1 notification
router.patch('/:id/read', isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user?.username;
    const id = req.params.id;
    const result = await client.query(
      `UPDATE Notifications SET is_read = 1 WHERE notification_id = $1 AND username = $2`,
      [id, username]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Đánh dấu đã đọc tất cả notification
router.patch('/read-all', isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user?.username;
    await client.query(
      `UPDATE Notifications SET is_read = 1 WHERE username = $1`,
      [username]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// (Tùy chọn) Thêm notification (dùng cho test/manual)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user?.username;
    const { type, title, message, related_id, related_type } = req.body;
    await client.query(
      `INSERT INTO Notifications (username, type, title, message, related_id, related_type) VALUES ($1, $2, $3, $4, $5, $6)`,
      [username, type, title, message, related_id, related_type]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 