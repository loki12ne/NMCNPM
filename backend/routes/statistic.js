const express = require('express');
const router = express.Router();
const client = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

// Cache for storing data to avoid frequent database calls
const cache = {
  questionsOverTime: null,
  questionsOverTimeExpiry: null
};

/**
 * Lấy thống kê tổng quan về câu hỏi theo thời gian
 * Trả về số lượng câu hỏi theo từng tháng trong 6 tháng gần nhất
 * Cache kết quả trong 30 phút để tránh gọi database liên tục
 */
router.get('/questions-over-time', isAuthenticated, async (req, res) => {
  try {
    // Check cache first
    const now = new Date();
    if (cache.questionsOverTime && cache.questionsOverTimeExpiry && now < cache.questionsOverTimeExpiry) {
      console.log('Returning cached questions-over-time data');
      return res.json(cache.questionsOverTime);
    }

    console.log('Fetching fresh questions-over-time data from database');
    
    const query = `
      WITH monthly_series AS (
        SELECT 
          generate_series(
            DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months'),
            DATE_TRUNC('month', CURRENT_DATE),
            INTERVAL '1 month'
          ) as month_date
      )
      SELECT 
        TO_CHAR(ms.month_date, 'Mon') as month,
        COALESCE(COUNT(q.question_id), 0) as count
      FROM monthly_series ms
      LEFT JOIN Questions q ON DATE_TRUNC('month', q.date_posted) = ms.month_date
      GROUP BY ms.month_date, TO_CHAR(ms.month_date, 'Mon')
      ORDER BY ms.month_date
    `;
    
    const result = await client.query(query);
    
    console.log('Raw database result:', result.rows);
    
    const labels = result.rows.map(row => row.month);
    const data = result.rows.map(row => parseInt(row.count));
    
    console.log('Processed labels:', labels);
    console.log('Processed data:', data);
    
    const responseData = {
      success: true,
      labels: labels,
      data: data
    };

    // Cache for 30 minutes
    cache.questionsOverTime = responseData;
    cache.questionsOverTimeExpiry = new Date(now.getTime() + 30 * 60 * 1000);
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching questions over time:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy dữ liệu câu hỏi theo thời gian' 
    });
  }
});

/**
 * Lấy thống kê trạng thái câu hỏi (đã trả lời vs chưa trả lời)
 */
router.get('/question-status', isAuthenticated, async (req, res) => {
  try {
    const query = `
      SELECT 
        'answered' as status,
        COUNT(*) as count
      FROM Questions 
      WHERE is_answered = true
      UNION ALL
      SELECT 
        'unanswered' as status,
        COUNT(*) as count
      FROM Questions 
      WHERE COALESCE(is_answered, false) = false
    `;
    
    const result = await client.query(query);
    
    let answered = 0;
    let unanswered = 0;
    
    result.rows.forEach(row => {
      if (row.status === 'answered') {
        answered = parseInt(row.count);
      } else if (row.status === 'unanswered') {
        unanswered = parseInt(row.count);
      }
    });
    
    res.json({
      success: true,
      answered: answered,
      unanswered: unanswered
    });
  } catch (error) {
    console.error('Error fetching question status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy trạng thái câu hỏi' 
    });
  }
});

/**
 * Lấy thống kê câu hỏi mới theo người dùng
 */
router.get('/new-questions', isAuthenticated, async (req, res) => {
  try {
    const query = `
      SELECT 
        'learner' as role,
        COUNT(CASE WHEN q.date_posted >= CURRENT_DATE - INTERVAL '7 days' THEN q.question_id END) as count
      FROM Questions q
      WHERE q.username IN (SELECT username FROM Accounts WHERE role = 'learner')
      UNION ALL
      SELECT 
        'tutor' as role,
        COUNT(CASE WHEN q.date_posted >= CURRENT_DATE - INTERVAL '7 days' THEN q.question_id END) as count
      FROM Questions q
      WHERE q.username IN (SELECT username FROM Accounts WHERE role = 'tutor')
    `;
    
    const result = await client.query(query);
    
    let byLearners = 0;
    let byTutors = 0;
    
    result.rows.forEach(row => {
      if (row.role === 'learner') {
        byLearners = parseInt(row.count);
      } else if (row.role === 'tutor') {
        byTutors = parseInt(row.count);
      }
    });
    
    res.json({
      success: true,
      byLearners: byLearners,
      byTutors: byTutors
    });
  } catch (error) {
    console.error('Error fetching new questions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy thống kê câu hỏi mới' 
    });
  }
});

/**
 * Lấy thống kê năng suất người dùng
 */
router.get('/user-productivity', isAuthenticated, async (req, res) => {
  try {
    // Tính điểm hoạt động dựa trên số câu hỏi và câu trả lời
    const query = `
      SELECT 
        a.role,
        COUNT(DISTINCT q.question_id) as questions_posted,
        COUNT(DISTINCT ans.answer_id) as answers_posted,
        COALESCE(AVG(f.rating), 0) as avg_rating
      FROM Accounts a
      LEFT JOIN Questions q ON a.username = q.username
      LEFT JOIN Answers ans ON a.username = ans.user_answer
      LEFT JOIN FeedBacks f ON ans.question_id = f.question_id
      WHERE a.role IN ('learner', 'tutor')
      GROUP BY a.role
    `;
    
    const result = await client.query(query);
    
    const productivity = {};
    
    result.rows.forEach(row => {
      const questions = parseInt(row.questions_posted) || 0;
      const answers = parseInt(row.answers_posted) || 0;
      const rating = parseFloat(row.avg_rating) || 0;
      
      // Tính điểm năng suất (0-100)
      let score = 0;
      if (row.role === 'learner') {
        score = Math.min(100, (questions * 10) + (rating * 10));
      } else if (row.role === 'tutor') {
        score = Math.min(100, (answers * 8) + (rating * 20));
      }
      
      productivity[row.role] = Math.round(score);
    });
    
    res.json({
      success: true,
      learners: productivity.learner || 0,
      tutors: productivity.tutor || 0
    });
  } catch (error) {
    console.error('Error fetching user productivity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy thống kê năng suất người dùng' 
    });
  }
});

/**
 * Lấy danh sách top 10 tutor được đánh giá cao nhất
 */
router.get('/top-tutors', isAuthenticated, async (req, res) => {
  try {
    const { timeFilter = 'month' } = req.query;
    
    let timeInterval = '1 month';
    switch (timeFilter) {
      case 'today':
        timeInterval = '1 day';
        break;
      case 'week':
        timeInterval = '1 week';
        break;
      case 'month':
        timeInterval = '1 month';
        break;
      case 'year':
        timeInterval = '1 year';
        break;
      default:
        timeInterval = '1 month';
    }
    
    const query = `
      SELECT 
        a.username,
        COUNT(DISTINCT ans.answer_id) as answers_count,
        COALESCE(AVG(f.rating), 0) as avg_rating,
        COUNT(DISTINCT f.feedback_id) as feedback_count
      FROM Accounts a
      LEFT JOIN Answers ans ON a.username = ans.user_answer 
        AND ans.date_posted >= CURRENT_DATE - INTERVAL '${timeInterval}'
      LEFT JOIN FeedBacks f ON ans.question_id = f.question_id
      WHERE a.role = 'tutor'
      GROUP BY a.username
      HAVING COUNT(DISTINCT ans.answer_id) > 0
      ORDER BY avg_rating DESC, answers_count DESC
      LIMIT 10
    `;
    
    const result = await client.query(query);
    
    const tutors = result.rows.map(row => ({
      username: row.username,
      answersCount: parseInt(row.answers_count),
      avgRating: parseFloat(row.avg_rating).toFixed(2),
      feedbackCount: parseInt(row.feedback_count)
    }));
    
    res.json({
      success: true,
      tutors: tutors
    });
  } catch (error) {
    console.error('Error fetching top tutors:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy danh sách top tutors' 
    });
  }
});

/**
 * Lấy thống kê tổng quan hệ thống
 */
router.get('/overview', isAuthenticated, async (req, res) => {
  try {
    const queries = [
      'SELECT COUNT(*) as count FROM Accounts',
      'SELECT COUNT(*) as count FROM Questions',
      'SELECT COUNT(*) as count FROM Answers',
      'SELECT COUNT(*) as count FROM FeedBacks',
      'SELECT COUNT(*) as count FROM Accounts WHERE role = \'learner\'',
      'SELECT COUNT(*) as count FROM Accounts WHERE role = \'tutor\''
    ];
    
    const results = await Promise.all(
      queries.map(query => client.query(query))
    );
    
    const overview = {
      totalUsers: parseInt(results[0].rows[0].count),
      totalQuestions: parseInt(results[1].rows[0].count),
      totalAnswers: parseInt(results[2].rows[0].count),
      totalFeedbacks: parseInt(results[3].rows[0].count),
      totalLearners: parseInt(results[4].rows[0].count),
      totalTutors: parseInt(results[5].rows[0].count)
    };
    
    res.json({
      success: true,
      overview: overview
    });
  } catch (error) {
    console.error('Error fetching overview statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy thống kê tổng quan' 
    });
  }
});

module.exports = router;
