const express = require('express');
const router = express.Router();
const client = require('../config/db');

router.get('/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  try {
    const query = 'SELECT * FROM Accounts WHERE username = $1';
    const result = await client.query(query, [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    req.session.user = { username: user.username, role: user.role };
    console.log('Session set for user:', req.session.user);
    res.json({ message: 'Login successful', role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Missing username, password, or role' });
  }
  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const checkQuery = 'SELECT * FROM Accounts WHERE username = $1';
    const checkResult = await client.query(checkQuery, [username]);
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const insertQuery = 'INSERT INTO Accounts (username, password, role) VALUES ($1, $2, $3)';
    await client.query(insertQuery, [username, password, role]);
    res.json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
