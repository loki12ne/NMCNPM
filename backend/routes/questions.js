const express = require('express');
const router = express.Router();
const client = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

function isTutor(req, res, next) {
  console.log('Checking isTutor:', req.session.user); // Debug
  if (req.session && req.session.user && req.session.user.role === 'tutor') {
    next();
  } else {
    res.status(403).json({ error: 'Only tutors can answer questions.' });
  }
}

function isLearner(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'learner') {
    next();
  } else {
    res.status(403).json({ error: 'Only learners can submit feedback.' });
  }
}

const question_file_storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const originalName = (file.originalname || 'file').replace(/\.[^/.]+$/, '');
    const safeBase = originalName.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').slice(0, 80);
    const uniqueSuffix = Date.now();
    const publicId = `${safeBase}-${uniqueSuffix}`;
    const isPdf = (file.mimetype === 'application/pdf');
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    return {
      folder: 'question_files',
      public_id: publicId,
      resource_type: isPdf ? 'raw' : 'image',
      format: isPdf ? 'pdf' : undefined,
      allowed_formats: isPdf ? ['pdf'] : ['jpg', 'png', 'jpeg']
    };
  }
});
const upload_question_files = multer({ storage: question_file_storage });

const answer_file_storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const originalName = (file.originalname || 'file').replace(/\.[^/.]+$/, '');
    const safeBase = originalName.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').slice(0, 80);
    const uniqueSuffix = Date.now();
    const publicId = `${safeBase}-${uniqueSuffix}`;
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    const isRaw = !isImage;
    return {
      folder: 'answer_files',
      public_id: publicId,
      resource_type: isRaw ? 'raw' : 'image',
      format: isRaw ? undefined : undefined,
      allowed_formats: isRaw
        ? ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt']
        : ['jpg', 'png', 'jpeg']
    };
  }
});
const upload_answer_files = multer({ storage: answer_file_storage });

// Sử dụng CloudinaryStorage cho 1 file duy nhất (ảnh hoặc PDF)
const single_file_storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const originalName = (file.originalname || 'file').replace(/\.[^/.]+$/, '');
    const safeBase = originalName.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').slice(0, 80);
    const uniqueSuffix = Date.now();
    const publicId = `${safeBase}-${uniqueSuffix}`;
    const isPdf = (file.mimetype === 'application/pdf');
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    return {
      folder: 'question_files',
      public_id: publicId,
      resource_type: isPdf ? 'raw' : 'image',
      format: isPdf ? 'pdf' : undefined,
      allowed_formats: isPdf ? ['pdf'] : ['jpg', 'jpeg', 'png']
    };
  }
});
const upload_single_file = multer({ storage: single_file_storage });


async function save_answer_files(answer_id, files, client) {
  if (!files || files.length === 0) return;
  for (const file of files) {
    await client.query(
      `INSERT INTO AnswerFiles (answer_id, file_url, file_type, file_name) VALUES ($1, $2, $3, $4)`,
      [answer_id, file.path, file.mimetype, file.originalname]
    );
  }
}

async function getQuestionsByUser(username, client) {
  return client.query(
    `SELECT q.question_id, q.text_content, q.subject, q.date_posted, q.is_answered
     FROM Questions q
     WHERE q.username = $1
     ORDER BY q.date_posted DESC`,
    [username]
  );
}

async function getAnswersByUser(username, client) {
  return client.query(
    `SELECT a.answer_id, a.question_id, a.text_content AS answer_content, a.date_posted AS answer_date,
            q.text_content AS question_content, q.subject, q.date_posted AS question_date
     FROM Answers a
     JOIN Questions q ON a.question_id = q.question_id
     WHERE a.user_answer = $1
     ORDER BY a.date_posted DESC`,
    [username]
  );
}

const addNotification = async (client, username, type, message, related_id, related_type) => {
  await client.query(
    `INSERT INTO Notifications (username, type, message, related_id, related_type) VALUES ($1, $2, $3, $4, $5)`,
    [username, type, message, related_id, related_type]
  );
};

// Đăng câu hỏi mới (chỉ 1 file ảnh hoặc PDF)
router.post('/', isAuthenticated, upload_single_file.single('file'), async (req, res) => {
  const { text_content, subject } = req.body;
  const username = req.session.user?.username;
  const file = req.file;

  if (!username) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  if (!text_content || !subject) {
    return res.status(400).json({ error: 'Missing text or subject' });
  }
  const allowedSubjects = ['toán', 'lý', 'hóa', 'Math', 'Physics', 'Chemistry'];
  if (!allowedSubjects.includes(subject)) {
    return res.status(400).json({ error: 'Invalid subject' });
  }

  try {
    const userCheck = await client.query('SELECT username FROM Accounts WHERE username = $1', [username]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'User does not exist' });
    }
    let img_url = null;
    let pdf_url = null;
    if (file) {
      const ext = (file.originalname || '').split('.').pop().toLowerCase();
      if (["jpg","jpeg","png"].includes(ext)) {
        img_url = file.path;
      } else if (ext === 'pdf') {
        pdf_url = file.path;
      } else {
        return res.status(400).json({ error: 'Chỉ cho phép upload ảnh hoặc PDF.' });
      }
    }
    const query = 'INSERT INTO Questions (username, text_content, subject, img_url, pdf_url, date_posted) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING question_id';
    const result = await client.query(query, [username, text_content, subject, img_url, pdf_url]);
    const question_id = result.rows[0].question_id;
    // Notification cho admin
    await addNotification(client, 'admin', 'answer', `New question posted by ${username}`, question_id, 'question');
    res.json({ message: 'Question posted successfully', question_id });
  } catch (err) {
    console.error('Question post error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user?.username || null;
    const { topic, is_answered } = req.query;
    let filter = [];
    let values = [username];
    let join_topic = '';
    if (topic) {
      join_topic = 'JOIN QuestionTopics qt ON q.question_id = qt.question_id';
      filter.push('qt.topic_name = $' + (values.length + 1));
      values.push(topic);
    }
    if (is_answered === '1' || is_answered === '0') {
      filter.push('q.is_answered = $' + (values.length + 1));
      values.push(is_answered === '1' ? true : false);
    }
    let where_str = filter.length > 0 ? ('WHERE ' + filter.join(' AND ')) : '';
    const query = `
      SELECT q.question_id, q.username, q.text_content, q.subject, q.date_posted, q.is_answered,
        q.img_url, q.pdf_url,
        COUNT(ql.username) AS so_luot_like,
        MAX(CASE WHEN ql.username = $1 THEN 1 ELSE 0 END) AS da_like
      FROM Questions q
      ${join_topic}
      LEFT JOIN QuestionLikes ql ON q.question_id = ql.question_id
      ${where_str}
      GROUP BY q.question_id, q.username, q.text_content, q.subject, q.date_posted, q.is_answered, q.img_url, q.pdf_url
      ORDER BY q.date_posted DESC
    `;
    const result = await client.query(query, values);
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

router.post('/answer', isAuthenticated, isTutor, upload_answer_files.array('files', 10), async (req, res) => {
  const { question_id, text_content } = req.body;
  const user_answer = req.session.user.username;
  const files = req.files;

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

    const answerResult = await client.query(
      `INSERT INTO Answers (question_id, user_ask, user_answer, text_content, date_posted)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING answer_id`,
      [question_id, user_ask, user_answer, text_content]
    );
    const answer_id = answerResult.rows[0].answer_id;
    
    // Cập nhật trạng thái câu hỏi thành đã trả lời
    await client.query(
      'UPDATE Questions SET is_answered = true WHERE question_id = $1',
      [question_id]
    );
    
    await save_answer_files(answer_id, files, client);
    await addNotification(client, user_ask, 'answer', `Your question has been answered by ${user_answer}`, question_id, 'question');

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
    await client.query('BEGIN');
    
    // Check if the question has been answered
    const answer = await client.query(
      'SELECT question_id, user_answer FROM Answers WHERE question_id = $1',
      [question_id]
    );
    if (answer.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Câu hỏi chưa được trả lời.' });
    }

    const tutorUsername = answer.rows[0].user_answer;

    // Insert feedback
    await client.query(
      `INSERT INTO FeedBacks (question_id, username, rating, comment, date_posted)
       VALUES ($1, $2, $3, $4, NOW())`,
      [question_id, username, rating, comment || null]
    );

    // Send notification to the tutor who answered the question
    await addNotification(
      client, 
      tutorUsername, 
      'feedback', 
      `You received new feedback (${rating}★) from ${username} on your answer`, 
      question_id, 
      'question'
    );

    await client.query('COMMIT');
    res.json({ message: 'Phản hồi đã được gửi thành công.' });
  } catch (err) {
    await client.query('ROLLBACK');
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

router.get('/my-questions', isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user?.username;
    if (!username) return res.status(401).json({ error: 'Chưa đăng nhập' });
    const result = await getQuestionsByUser(username, client);
    res.json({ questions: result.rows });
  } catch (err) {
    console.error('My questions fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/my-answers', isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user?.username;
    if (!username) return res.status(401).json({ error: 'Chưa đăng nhập' });
    const result = await getAnswersByUser(username, client);
    res.json({ answers: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Lấy feedback của một tutor cụ thể (dành cho admin)
 */
router.get('/feedback-by-tutor/:username', isAuthenticated, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Verify admin role
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admin can view tutor feedback' 
      });
    }
    
    const query = `
      SELECT 
        f.feedback_id, 
        f.question_id, 
        f.username as reviewer_username, 
        f.rating, 
        f.comment, 
        f.date_posted,
        q.subject,
        q.text_content as question_text
      FROM FeedBacks f
      INNER JOIN Questions q ON f.question_id = q.question_id
      INNER JOIN Answers a ON q.question_id = a.question_id
      WHERE a.user_answer = $1
      ORDER BY f.date_posted DESC
      LIMIT 50
    `;
    
    const result = await client.query(query, [username]);
    
    res.json({ 
      success: true,
      feedbacks: result.rows 
    });
  } catch (err) {
    console.error('Get tutor feedback error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

module.exports = router;