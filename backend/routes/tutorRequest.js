const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const client = require('../config/db');

// Cấu hình storage cho multer dùng Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'student_cards',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});
const upload = multer({ storage: storage });

// Middleware kiểm tra quyền admin
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Chỉ admin mới được phép thực hiện.' });
  }
}

// Hàm thêm notification
const addNotification = async (client, username, type, message, related_id, related_type) => {
  await client.query(
    `INSERT INTO Notifications (username, type, message, related_id, related_type) VALUES ($1, $2, $3, $4, $5)`,
    [username, type, message, related_id, related_type]
  );
};

// API nhận form đăng ký gia sư kèm ảnh (upload lên Cloudinary)
router.post('/tutor-request', upload.single('student_card_image'), async (req, res) => {
  const { username, full_name, university, faculty, year } = req.body;
  const student_card_image = req.file ? req.file.path : null; // URL ảnh trên cloud

  try {
    await client.query(
      `INSERT INTO TutorRequests (username, full_name, university, faculty, year, student_card_image)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [username, full_name, university, faculty, year, student_card_image]
    );
    res.json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API: Lấy danh sách yêu cầu gia sư (chỉ admin)
router.get('/tutor-request-list', isAdmin, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM TutorRequests ORDER BY created_at DESC');
    res.json({ requests: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API: Duyệt hoặc từ chối yêu cầu (chỉ admin)
router.patch('/tutor-request-action', isAdmin, async (req, res) => {
  const { id, action } = req.body;
  if (!id || !['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'Thiếu hoặc sai tham số.' });
  }
  try {
    // Cập nhật trạng thái yêu cầu
    await client.query('UPDATE TutorRequests SET status = $1 WHERE id = $2', [action, id]);
    const result = await client.query('SELECT username FROM TutorRequests WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      const username = result.rows[0].username;
      if (action === 'approved') {
        await client.query('UPDATE Accounts SET role = $1 WHERE username = $2', ['tutor', username]);
        // Add to TutorPerformance table when approved
        await client.query(`
          INSERT INTO TutorPerformance (username, average_rating, questions_answered, total_feedback, last_updated) 
          VALUES ($1, 0.00, 0, 0, CURRENT_TIMESTAMP) 
          ON CONFLICT (username) DO NOTHING
        `, [username]);
        await addNotification(client, username, 'tutor_approved', 'Congratulations! Your tutor application has been approved.', id, 'tutor_request');
      } else if (action === 'rejected') {
        await addNotification(client, username, 'tutor_rejected', 'Sorry! Your tutor application has been rejected.', id, 'tutor_request');
      }
    }
    res.json({ message: `Đã cập nhật trạng thái yêu cầu thành '${action}'.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router; 
