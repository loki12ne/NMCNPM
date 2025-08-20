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
      `SELECT notification_id, type, message, related_id, related_type, is_read, created_at
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
    const { type, message, related_id, related_type } = req.body;
    await client.query(
      `INSERT INTO Notifications (username, type, message, related_id, related_type) VALUES ($1, $2, $3, $4, $5)`,
      [username, type, message, related_id, related_type]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Gửi reminder đến tutor (dành cho admin)
 */
router.post('/send-reminder', isAuthenticated, async (req, res) => {
  try {
    // Verify admin role
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admin can send reminders' 
      });
    }
    
    const { username, message } = req.body;
    
    if (!username || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and message are required' 
      });
    }
    
    // Verify target user exists
    const userCheck = await client.query(
      'SELECT username FROM Accounts WHERE username = $1',
      [username]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Insert notification
    await client.query(
      `INSERT INTO Notifications (username, type, message, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [username, 'reminder', message || 'Please review your recent activity and improve your performance.']
    );
    
    res.json({ 
      success: true,
      message: 'Reminder sent successfully' 
    });
  } catch (err) {
    console.error('Send reminder error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

module.exports = router; 