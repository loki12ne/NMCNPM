const express = require('express');
const router = express.Router();
const client = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

/**
 * Lấy thống kê tổng quan về learners
 */
router.get('/overview', isAuthenticated, async (req, res) => {
  try {
    // Tổng số learners hiện tại
    const totalLearnersQuery = `
      SELECT COUNT(*) as count 
      FROM Accounts 
      WHERE role = 'learner'
    `;
    
    // Số learners hoạt động hôm nay (có câu hỏi hôm nay)
    const activeLearnersTodayQuery = `
      SELECT COUNT(DISTINCT a.username) as count 
      FROM Accounts a
      JOIN Questions q ON a.username = q.username
      WHERE a.role = 'learner' 
      AND DATE(q.date_posted) = CURRENT_DATE
    `;
    
    // Số learners hoạt động trong tuần này
    const activeLearnersThisWeekQuery = `
      SELECT COUNT(DISTINCT a.username) as count 
      FROM Accounts a
      JOIN Questions q ON a.username = q.username
      WHERE a.role = 'learner' 
      AND q.date_posted >= CURRENT_DATE - INTERVAL '7 days'
    `;
    
    // Số learners hoạt động trong tháng này
    const activeLearnersThisMonthQuery = `
      SELECT COUNT(DISTINCT a.username) as count 
      FROM Accounts a
      JOIN Questions q ON a.username = q.username
      WHERE a.role = 'learner' 
      AND q.date_posted >= CURRENT_DATE - INTERVAL '1 month'
    `;
    
    const results = await Promise.all([
      client.query(totalLearnersQuery),
      client.query(activeLearnersTodayQuery),
      client.query(activeLearnersThisWeekQuery),
      client.query(activeLearnersThisMonthQuery)
    ]);
    
    const overview = {
      totalLearners: parseInt(results[0].rows[0].count),
      activeLearnersToday: parseInt(results[1].rows[0].count),
      activeLearnersThisWeek: parseInt(results[2].rows[0].count),
      activeLearnersThisMonth: parseInt(results[3].rows[0].count)
    };
    
    res.json({
      success: true,
      overview: overview
    });
  } catch (error) {
    console.error('Error fetching learner overview:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy thống kê tổng quan learners' 
    });
  }
});

/**
 * Lấy thống kê câu hỏi mới theo ngày trong tuần (7 ngày gần nhất)
 */
router.get('/questions-per-day', isAuthenticated, async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        ), 'Dy') as day,
        COALESCE(COUNT(q.question_id), 0) as count
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      ) gs
      LEFT JOIN Questions q ON DATE(q.date_posted) = gs
        AND q.username IN (SELECT username FROM Accounts WHERE role = 'learner')
      GROUP BY gs
      ORDER BY gs
    `;
    
    const result = await client.query(query);
    
    const labels = result.rows.map(row => row.day);
    const data = result.rows.map(row => parseInt(row.count));
    
    res.json({
      success: true,
      questionsPerDay: {
        labels: labels,
        data: data
      }
    });
  } catch (error) {
    console.error('Error fetching questions per day:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy thống kê câu hỏi theo ngày' 
    });
  }
});

/**
 * Lấy danh sách learners với các filter khác nhau
 */
router.get('/list', isAuthenticated, async (req, res) => {
  try {
    const { filter = 'recently-active' } = req.query;
    
    let query = '';
    let values = [];
    
    switch (filter) {
             case 'recently-active':
         // Learners hoạt động gần đây (có câu hỏi trong 7 ngày qua)
         query = `
           SELECT DISTINCT
             a.username,
             COUNT(q.question_id) as total_questions,
             MAX(q.date_posted) as last_question_date,
             CASE 
               WHEN MAX(q.date_posted) >= CURRENT_DATE - INTERVAL '1 day' THEN 'Active now'
               WHEN MAX(q.date_posted) >= CURRENT_DATE - INTERVAL '3 days' THEN 'Recently active'
               WHEN MAX(q.date_posted) >= CURRENT_DATE - INTERVAL '7 days' THEN 'Active this week'
               ELSE 'Inactive'
             END as status
           FROM Accounts a
           LEFT JOIN Questions q ON a.username = q.username
           WHERE a.role = 'learner'
           GROUP BY a.username
           ORDER BY last_question_date DESC NULLS LAST
         `;
         break;
         
       case 'all':
         // Tất cả learners
         query = `
           SELECT 
             a.username,
             COUNT(q.question_id) as total_questions,
             MAX(q.date_posted) as last_question_date,
             CASE 
               WHEN MAX(q.date_posted) >= CURRENT_DATE - INTERVAL '1 day' THEN 'Active now'
               WHEN MAX(q.date_posted) >= CURRENT_DATE - INTERVAL '3 days' THEN 'Recently active'
               WHEN MAX(q.date_posted) >= CURRENT_DATE - INTERVAL '7 days' THEN 'Active this week'
               ELSE 'Inactive'
             END as status
           FROM Accounts a
           LEFT JOIN Questions q ON a.username = q.username
           WHERE a.role = 'learner'
           GROUP BY a.username
           ORDER BY a.username ASC
         `;
         break;
         
       case 'new':
         // Learners mới đăng ký trong 30 ngày qua (sử dụng date_posted đầu tiên)
         query = `
           SELECT 
             a.username,
             COUNT(q.question_id) as total_questions,
             MAX(q.date_posted) as last_question_date,
             'New learner' as status
           FROM Accounts a
           LEFT JOIN Questions q ON a.username = q.username
           WHERE a.role = 'learner'
           GROUP BY a.username
           HAVING MIN(q.date_posted) >= CURRENT_DATE - INTERVAL '30 days' 
              OR MIN(q.date_posted) IS NULL
           ORDER BY a.username ASC
         `;
         break;
         
       case 'inactive':
         // Learners không hoạt động trong 30 ngày qua
         query = `
           SELECT 
             a.username,
             COUNT(q.question_id) as total_questions,
             MAX(q.date_posted) as last_question_date,
             'Inactive' as status
           FROM Accounts a
           LEFT JOIN Questions q ON a.username = q.username
           WHERE a.role = 'learner'
           GROUP BY a.username
           HAVING MAX(q.date_posted) < CURRENT_DATE - INTERVAL '30 days' 
              OR MAX(q.date_posted) IS NULL
           ORDER BY last_question_date ASC NULLS FIRST
         `;
         break;
         
       default:
         query = `
           SELECT 
             a.username,
             COUNT(q.question_id) as total_questions,
             MAX(q.date_posted) as last_question_date,
             CASE 
               WHEN MAX(q.date_posted) >= CURRENT_DATE - INTERVAL '1 day' THEN 'Active now'
               WHEN MAX(q.date_posted) >= CURRENT_DATE - INTERVAL '3 days' THEN 'Recently active'
               WHEN MAX(q.date_posted) >= CURRENT_DATE - INTERVAL '7 days' THEN 'Active this week'
               ELSE 'Inactive'
             END as status
           FROM Accounts a
           LEFT JOIN Questions q ON a.username = q.username
           WHERE a.role = 'learner'
           GROUP BY a.username
           ORDER BY last_question_date DESC NULLS LAST
         `;
    }
    
    const result = await client.query(query);
    
    const learners = result.rows.map(row => ({
      username: row.username,
      totalQuestions: parseInt(row.total_questions),
      lastQuestionDate: row.last_question_date,
      status: row.status
    }));
    
    res.json({
      success: true,
      learners: learners
    });
  } catch (error) {
    console.error('Error fetching learners list:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy danh sách learners' 
    });
  }
});

/**
 * Lấy thống kê chi tiết về hoạt động của learners
 */
router.get('/activity-stats', isAuthenticated, async (req, res) => {
  try {
    // Số câu hỏi trung bình mỗi learner
    const avgQuestionsQuery = `
      SELECT 
        COALESCE(AVG(question_count), 0) as avg_questions_per_learner,
        COUNT(*) as total_learners,
        SUM(question_count) as total_questions
      FROM (
        SELECT 
          a.username,
          COUNT(q.question_id) as question_count
        FROM Accounts a
        LEFT JOIN Questions q ON a.username = q.username
        WHERE a.role = 'learner'
        GROUP BY a.username
      ) learner_stats
    `;
    
    // Phân bố learners theo số câu hỏi
    const questionDistributionQuery = `
      SELECT 
        CASE 
          WHEN question_count = 0 THEN '0 questions'
          WHEN question_count BETWEEN 1 AND 5 THEN '1-5 questions'
          WHEN question_count BETWEEN 6 AND 10 THEN '6-10 questions'
          WHEN question_count BETWEEN 11 AND 20 THEN '11-20 questions'
          ELSE '20+ questions'
        END as category,
        COUNT(*) as learner_count
      FROM (
        SELECT 
          a.username,
          COUNT(q.question_id) as question_count
        FROM Accounts a
        LEFT JOIN Questions q ON a.username = q.username
        WHERE a.role = 'learner'
        GROUP BY a.username
      ) learner_stats
      GROUP BY category
      ORDER BY 
        CASE category
          WHEN '0 questions' THEN 1
          WHEN '1-5 questions' THEN 2
          WHEN '6-10 questions' THEN 3
          WHEN '11-20 questions' THEN 4
          ELSE 5
        END
    `;
    
    // Top 10 learners có nhiều câu hỏi nhất
    const topLearnersQuery = `
      SELECT 
        a.username,
        COUNT(q.question_id) as question_count,
        MAX(q.date_posted) as last_question_date
      FROM Accounts a
      LEFT JOIN Questions q ON a.username = q.username
      WHERE a.role = 'learner'
      GROUP BY a.username
      HAVING COUNT(q.question_id) > 0
      ORDER BY question_count DESC
      LIMIT 10
    `;
    
    const results = await Promise.all([
      client.query(avgQuestionsQuery),
      client.query(questionDistributionQuery),
      client.query(topLearnersQuery)
    ]);
    
    const activityStats = {
      averageQuestions: parseFloat(results[0].rows[0].avg_questions_per_learner),
      totalLearners: parseInt(results[0].rows[0].total_learners),
      totalQuestions: parseInt(results[0].rows[0].total_questions),
      questionDistribution: results[1].rows.map(row => ({
        category: row.category,
        learnerCount: parseInt(row.learner_count)
      })),
      topLearners: results[2].rows.map(row => ({
        username: row.username,
        questionCount: parseInt(row.question_count),
        lastQuestionDate: row.last_question_date
      }))
    };
    
    res.json({
      success: true,
      activityStats: activityStats
    });
  } catch (error) {
    console.error('Error fetching learner activity stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi lấy thống kê hoạt động learners' 
    });
  }
});

module.exports = router;
