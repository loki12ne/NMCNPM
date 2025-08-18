const express = require('express');
const router = express.Router();
const client = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

// Get all plans for a user
router.get('/plans', isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user?.username;
    
    // Get classes
    const classesQuery = `
      SELECT id, class_name as title, subject, start_date as date, 
             start_time, end_time, created_at
      FROM Classes 
      WHERE username = $1 
      ORDER BY start_date, start_time
    `;
    const classesResult = await client.query(classesQuery, [username]);
    
    // Get tasks
    const tasksQuery = `
      SELECT id, title, description, subject, time, due_date, start_time, end_time,
             created_at, due_date as date
      FROM Tasks 
      WHERE username = $1 
      ORDER BY due_date
    `;
    const tasksResult = await client.query(tasksQuery, [username]);
    
    // Get exams
    const examsQuery = `
      SELECT id, subject, type as exam_type, exam_date as date, 
             exam_time, duration_minutes as duration, created_at
      FROM Exams 
      WHERE username = $1 
      ORDER BY exam_date, exam_time
    `;
    const examsResult = await client.query(examsQuery, [username]);
    
    // Format the data
    const classes = classesResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      type: 'class'
    }));
    
    const tasks = tasksResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      subject: row.subject,
      time: row.time,
      dueDate: row.due_date,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      type: 'task'
    }));
    
    const exams = examsResult.rows.map(row => ({
      id: row.id,
      subject: row.subject,
      examType: row.exam_type,
      date: row.date,
      examTime: row.exam_time,
      duration: row.duration,
      title: row.subject, // Use subject as title for exams
      type: 'exam'
    }));
    
    res.json({
      success: true,
      data: {
        classes,
        tasks,
        exams
      }
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add a new class
router.post('/classes', isAuthenticated, async (req, res) => {
  try {
    const { class_name, subject, start_date, start_time, end_time } = req.body;
    const username = req.session.user?.username;
    
    if (!class_name || !subject || !start_date || !start_time || !end_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    const query = `
      INSERT INTO Classes (username, class_name, subject, start_date, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      username, class_name, subject, start_date, start_time, end_time
    ]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update a class
router.put('/classes/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { class_name, subject, start_date, start_time, end_time } = req.body;
    const username = req.session.user?.username;
    
    if (!class_name || !subject || !start_date || !start_time || !end_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    const query = `
      UPDATE Classes 
      SET class_name = $1, subject = $2, start_date = $3, start_time = $4, end_time = $5
      WHERE id = $6 AND username = $7
      RETURNING *
    `;
    
    const result = await client.query(query, [
      class_name, subject, start_date, start_time, end_time, id, username
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete a class
router.delete('/classes/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.session.user?.username;
    
    const query = `
      DELETE FROM Classes 
      WHERE id = $1 AND username = $2
      RETURNING *
    `;
    
    const result = await client.query(query, [id, username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add a new task
router.post('/tasks', isAuthenticated, async (req, res) => {
  try {
    const { title, description, subject, time, due_date, end_time } = req.body;
    const username = req.session.user?.username;
    
    if (!title || !subject || !due_date || !end_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, subject, due_date and end_time are required' 
      });
    }
    // Derive start_time from end_time; use 60-minute default if time is missing
    const durationMinutes = Number(time) > 0 ? Number(time) : 60;
    const endHour = parseInt(String(end_time).split(':')[0], 10);
    const durationHours = Math.max(1, Math.ceil(durationMinutes / 60));
    const startHour = Math.max(0, endHour - durationHours);
    const start_time = `${String(startHour).padStart(2,'0')}:00`;
    
    const query = `
      INSERT INTO Tasks (username, title, description, subject, time, due_date, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      username, title, description, subject, durationMinutes, due_date, start_time, end_time
    ]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update a task
router.put('/tasks/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, time, due_date, end_time } = req.body;
    const username = req.session.user?.username;
    
    if (!title || !subject || !due_date || !end_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, subject, due_date and end_time are required' 
      });
    }
    const durationMinutes = Number(time) > 0 ? Number(time) : 60;
    const endHour = parseInt(String(end_time).split(':')[0], 10);
    const durationHours = Math.max(1, Math.ceil(durationMinutes / 60));
    const startHour = Math.max(0, endHour - durationHours);
    const start_time = `${String(startHour).padStart(2,'0')}:00`;
    
    const query = `
      UPDATE Tasks 
      SET title = $1, description = $2, subject = $3, time = $4, due_date = $5, start_time = $6, end_time = $7
      WHERE id = $8 AND username = $9
      RETURNING *
    `;
    
    const result = await client.query(query, [
      title, description, subject, durationMinutes, due_date, start_time, end_time, id, username
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete a task
router.delete('/tasks/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.session.user?.username;
    
    const query = `
      DELETE FROM Tasks 
      WHERE id = $1 AND username = $2
      RETURNING *
    `;
    
    const result = await client.query(query, [id, username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add a new exam
router.post('/exams', isAuthenticated, async (req, res) => {
  try {
    const { subject, type, exam_date, exam_time, duration_minutes } = req.body;
    const username = req.session.user?.username;
    
    if (!subject || !type || !exam_date || !exam_time || !duration_minutes) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    const query = `
      INSERT INTO Exams (username, subject, type, exam_date, exam_time, duration_minutes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      username, subject, type, exam_date, exam_time, duration_minutes
    ]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding exam:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update an exam
router.put('/exams/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, type, exam_date, exam_time, duration_minutes } = req.body;
    const username = req.session.user?.username;
    
    if (!subject || !type || !exam_date || !exam_time || !duration_minutes) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    const query = `
      UPDATE Exams 
      SET subject = $1, type = $2, exam_date = $3, exam_time = $4, duration_minutes = $5
      WHERE id = $6 AND username = $7
      RETURNING *
    `;
    
    const result = await client.query(query, [
      subject, type, exam_date, exam_time, duration_minutes, id, username
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete an exam
router.delete('/exams/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.session.user?.username;
    
    const query = `
      DELETE FROM Exams 
      WHERE id = $1 AND username = $2
      RETURNING *
    `;
    
    const result = await client.query(query, [id, username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
