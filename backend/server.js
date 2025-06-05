const express = require('express');
const cors = require('cors');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const path = require('path');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const rootRoutes = require('./routes/root');
const client = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Session configuration
app.use(session({
  store: new PgSession({
    pool: client,
    tableName: 'sessions'
  }),
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000
  }
}));

// Routes
app.use('/auth', authRoutes);
app.use('/questions', questionRoutes);
app.use('/', rootRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});