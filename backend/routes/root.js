const express = require('express');
const router = express.Router();
const path = require('path');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../..', 'frontend', 'index.html'));
});

router.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../..', 'frontend', 'login.html'));
});

router.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../..', 'frontend', 'signup.html'));
});

router.get('/post-question.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../..', 'frontend', 'post-question.html'));
});

router.get('/answer.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../..', 'frontend', 'answer.html'));
});

router.get('/learner.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../..', 'frontend', 'learner.html'));
});

router.get('/tutor.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../..', 'frontend', 'tutor.html'));
});

module.exports = router;