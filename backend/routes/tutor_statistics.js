const express = require('express');
const router = express.Router();
const client = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

/**
 * Lấy thống kê tổng quan về tutors
 */
router.get('/overview', isAuthenticated, async (req, res) => {
  try {
    // Tổng số tutors hiện tại
    const totalTutorsQuery = `
      SELECT COUNT(*) as count 
      FROM Accounts 
      WHERE role = 'tutor'
    `;
    
    // Số tutors đang chờ phê duyệt
    const pendingApprovalsQuery = `
      SELECT COUNT(*) as count 
      FROM TutorRequests 
      WHERE status = 'pending'
    `;
    
    // Số tutors hoạt động hôm nay (có trả lời hôm nay)
    const activeTutorsTodayQuery = `
      SELECT COUNT(DISTINCT a.user_answer) as count 
      FROM Answers a
      INNER JOIN Accounts acc ON a.user_answer = acc.username
      WHERE acc.role = 'tutor' 
      AND DATE(a.date_posted) = CURRENT_DATE
    `;

    const results = await Promise.all([
      client.query(totalTutorsQuery),
      client.query(pendingApprovalsQuery),
      client.query(activeTutorsTodayQuery)
    ]);
    
    const overview = {
      totalTutors: parseInt(results[0].rows[0].count),
      pendingApprovals: parseInt(results[1].rows[0].count),
      activeTutorsToday: parseInt(results[2].rows[0].count)
    };
    
    res.json({
      success: true,
      overview: overview
    });
  } catch (error) {
    console.error('Error fetching tutor overview:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy thống kê tổng quan tutors' 
    });
  }
});

/**
 * Lấy thống kê answers mới theo ngày trong tuần (7 ngày gần nhất)
 */
router.get('/replies-per-day', isAuthenticated, async (req, res) => {
  try {
    const query = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date as date
      ),
      answer_counts AS (
        SELECT 
          DATE(a.date_posted) as answer_date,
          COUNT(*) as count
        FROM Answers a
        INNER JOIN Accounts acc ON a.user_answer = acc.username
        WHERE acc.role = 'tutor'
          AND a.date_posted >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(a.date_posted)
      )
      SELECT 
        TO_CHAR(ds.date, 'Dy') as day,
        COALESCE(ac.count, 0) as count
      FROM date_series ds
      LEFT JOIN answer_counts ac ON ds.date = ac.answer_date
      ORDER BY ds.date
    `;
    
    const result = await client.query(query);
    
    const labels = result.rows.map(row => row.day);
    const data = result.rows.map(row => parseInt(row.count));
    
    res.json({
      success: true,
      repliesPerDay: {
        labels: labels,
        data: data
      }
    });
  } catch (error) {
    console.error('Error fetching replies per day:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy thống kê replies theo ngày' 
    });
  }
});

/**
 * Lấy danh sách tutors với các filter khác nhau
 */
router.get('/list', isAuthenticated, async (req, res) => {
  try {
    const { filter = 'recently-active' } = req.query;
    
    let query = '';
    
    switch (filter) {
      case 'recently-active':
        // Tutors hoạt động gần đây (có answers trong 7 ngày qua)
        query = `
          SELECT DISTINCT
            acc.username,
            COUNT(a.answer_id) as total_answers,
            MAX(a.date_posted) as last_answer_date,
            CASE 
              WHEN MAX(a.date_posted) >= CURRENT_DATE - INTERVAL '1 day' THEN 'Active now'
              WHEN MAX(a.date_posted) >= CURRENT_DATE - INTERVAL '3 days' THEN 'Recently active'
              WHEN MAX(a.date_posted) >= CURRENT_DATE - INTERVAL '7 days' THEN 'Active this week'
              ELSE 'Inactive'
            END as status
          FROM Accounts acc
          LEFT JOIN Answers a ON acc.username = a.user_answer
          WHERE acc.role = 'tutor'
          GROUP BY acc.username
          HAVING MAX(a.date_posted) >= CURRENT_DATE - INTERVAL '7 days'
          ORDER BY last_answer_date DESC
        `;
        break;
        
      case 'all':
        // Tất cả tutors
        query = `
          SELECT DISTINCT
            acc.username,
            COUNT(a.answer_id) as total_answers,
            MAX(a.date_posted) as last_answer_date,
            CASE 
              WHEN MAX(a.date_posted) >= CURRENT_DATE - INTERVAL '1 day' THEN 'Active now'
              WHEN MAX(a.date_posted) >= CURRENT_DATE - INTERVAL '3 days' THEN 'Recently active'
              WHEN MAX(a.date_posted) >= CURRENT_DATE - INTERVAL '7 days' THEN 'Active this week'
              ELSE 'Inactive'
            END as status
          FROM Accounts acc
          LEFT JOIN Answers a ON acc.username = a.user_answer
          WHERE acc.role = 'tutor'
          GROUP BY acc.username
          ORDER BY acc.username
        `;
        break;
        
      case 'new':
        // Tutors mới (được approve trong 30 ngày qua)
        query = `
          SELECT DISTINCT
            acc.username,
            COUNT(a.answer_id) as total_answers,
            MAX(a.date_posted) as last_answer_date,
            'New tutor' as status
          FROM Accounts acc
          LEFT JOIN Answers a ON acc.username = a.user_answer
          LEFT JOIN TutorRequests tr ON acc.username = tr.username
          WHERE acc.role = 'tutor'
            AND tr.status = 'approved'
            AND tr.created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY acc.username
          ORDER BY tr.created_at DESC
        `;
        break;
        
      case 'inactive':
        // Tutors không hoạt động (không có answers trong 30 ngày)
        query = `
          SELECT DISTINCT
            acc.username,
            COUNT(a.answer_id) as total_answers,
            MAX(a.date_posted) as last_answer_date,
            'Inactive' as status
          FROM Accounts acc
          LEFT JOIN Answers a ON acc.username = a.user_answer
          WHERE acc.role = 'tutor'
          GROUP BY acc.username
          HAVING MAX(a.date_posted) < CURRENT_DATE - INTERVAL '30 days' 
            OR MAX(a.date_posted) IS NULL
          ORDER BY last_answer_date DESC NULLS LAST
        `;
        break;
        
      default:
        query = `
          SELECT DISTINCT
            acc.username,
            COUNT(a.answer_id) as total_answers,
            MAX(a.date_posted) as last_answer_date,
            'Active' as status
          FROM Accounts acc
          LEFT JOIN Answers a ON acc.username = a.user_answer
          WHERE acc.role = 'tutor'
          GROUP BY acc.username
          ORDER BY acc.username
        `;
    }
    
    const result = await client.query(query);
    
    // Format the results
    const tutors = result.rows.map(row => ({
      username: row.username,
      totalAnswers: parseInt(row.total_answers) || 0,
      lastAnswerDate: row.last_answer_date,
      status: row.status || 'Unknown'
    }));
    
    res.json({
      success: true,
      tutors: tutors
    });
  } catch (error) {
    console.error('Error fetching tutors list:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy danh sách tutors' 
    });
  }
});

/**
 * Lấy thông tin profile của một tutor cụ thể
 */
router.get('/profile/:username', isAuthenticated, async (req, res) => {
  try {
    const { username } = req.params;
    
    const query = `
      SELECT 
        a.username,
        a.role,
        tr.created_at as joined_date,
        tp.average_rating,
        tp.questions_answered,
        tp.total_feedback
      FROM Accounts a
      LEFT JOIN TutorRequests tr ON a.username = tr.username AND tr.status = 'approved'
      LEFT JOIN TutorPerformance tp ON a.username = tp.username
      WHERE a.username = $1 AND a.role = 'tutor'
    `;
    
    const result = await client.query(query, [username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tutor not found' 
      });
    }
    
    const tutor = result.rows[0];
    
    res.json({
      success: true,
      username: tutor.username,
      joinedDate: tutor.joined_date,
      points: Math.round(tutor.average_rating * 20) || 0, // Convert rating to points (5 stars = 100 points)
      averageRating: parseFloat(tutor.average_rating) || 0,
      questionsAnswered: parseInt(tutor.questions_answered) || 0,
      totalFeedbacks: parseInt(tutor.total_feedback) || 0
    });
  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy thông tin tutor' 
    });
  }
});

/**
 * Lấy thống kê chi tiết của một tutor cụ thể
 */
router.get('/overview/:username', isAuthenticated, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Verify tutor exists
    const tutorCheck = await client.query(
      'SELECT username FROM Accounts WHERE username = $1 AND role = $2',
      [username, 'tutor']
    );
    
    if (tutorCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tutor not found' 
      });
    }

    // Get tutor statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT a.question_id) as questions_answered,
        COUNT(DISTINCT ql.username) as total_likes,
        COUNT(DISTINCT f.feedback_id) as total_feedbacks,
        AVG(f.rating) as average_rating
      FROM Answers a
      LEFT JOIN QuestionLikes ql ON a.question_id = ql.question_id
      LEFT JOIN FeedBacks f ON a.question_id = f.question_id
      WHERE a.user_answer = $1
    `;
    
    const result = await client.query(statsQuery, [username]);
    const stats = result.rows[0];
    
    res.json({
      success: true,
      questionsAnswered: parseInt(stats.questions_answered) || 0,
      totalLikes: parseInt(stats.total_likes) || 0,
      totalFeedbacks: parseInt(stats.total_feedbacks) || 0,
      averageRating: parseFloat(stats.average_rating) || 0
    });
  } catch (error) {
    console.error('Error fetching tutor overview:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy thống kê tutor' 
    });
  }
});

/**
 * Xóa tutor (chuyển role về learner và xóa tutor requests)
 */
router.delete('/delete/:username', isAuthenticated, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Verify admin role
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admin can delete tutors' 
      });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    try {
      // Update account role to learner
      await client.query(
        'UPDATE Accounts SET role = $1 WHERE username = $2 AND role = $3',
        ['learner', username, 'tutor']
      );
      
      // Delete from TutorPerformance
      await client.query(
        'DELETE FROM TutorPerformance WHERE username = $1',
        [username]
      );
      
      // Update TutorRequests status to rejected
      await client.query(
        'UPDATE TutorRequests SET status = $1 WHERE username = $2',
        ['rejected', username]
      );
      
      // Send notification to user
      await client.query(
        `INSERT INTO Notifications (username, type, message, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [
          username,
          'tutor_removed',
          'Your tutor status has been removed by an administrator. If you believe this is an error, please contact support.'
        ]
      );
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        message: 'Tutor deleted successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting tutor:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi xóa tutor' 
    });
  }
});

module.exports = router;
