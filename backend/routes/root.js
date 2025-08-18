const express = require('express');
const router = express.Router();
const path = require('path');
const { isAuthenticated } = require('../middleware/auth');
const https = require('https');
const http = require('http');

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

router.get('/file', (req, res) => {
  const u = req.query.u;
  if (!u) return res.status(400).send('Missing file url');
  try {
    const decoded = decodeURIComponent(u);
    if (!/^https?:\/\//i.test(decoded)) {
      return res.status(400).send('Invalid file url');
    }

    let finalUrl = decoded;

    // If Cloudinary URL, enhance for inline viewing of PDFs
    try {
      const urlObj = new URL(decoded);
      if (urlObj.hostname.includes('res.cloudinary.com')) {
        // Normalize to inline for PDFs
        const isPdf = /\.pdf($|\?)/i.test(urlObj.pathname);
        if (isPdf) {
          // Ensure resource_type is raw and add fl_inline transformation
          finalUrl = decoded
            .replace('/image/upload/', '/raw/upload/')
            .replace('/raw/upload/', '/raw/upload/fl_inline/');
        }
      }
    } catch (_) {}

    return res.redirect(finalUrl);
  } catch (e) {
    return res.status(400).send('Invalid file url');
  }
});

router.get('/view-pdf', async (req, res) => {
  const u = req.query.u;
  if (!u) return res.status(400).send('Missing file url');
  try {
    const decoded = decodeURIComponent(u);
    if (!/^https?:\/\//i.test(decoded)) {
      return res.status(400).send('Invalid file url');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');

    const client = decoded.startsWith('https') ? https : http;
    client.get(decoded, (proxyRes) => {
      if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
        res.status(proxyRes.statusCode).end();
        return;
      }
      proxyRes.pipe(res);
    }).on('error', (err) => {
      res.status(502).send('Bad gateway');
    });
  } catch (e) {
    return res.status(400).send('Invalid file url');
  }
});

module.exports = router;