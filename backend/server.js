const express = require('express');
const cors = require('cors');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const path = require('path');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const rootRoutes = require('./routes/root');
const client = require('./config/db');
const tutorRequestRoutes = require('./routes/tutorRequest');
const notificationRouter = require('./routes/notification');
const statisticRoutes = require('./routes/statistic');
const learnerStatisticsRoutes = require('./routes/learner_statistics');
const tutorStatisticsRoutes = require('./routes/tutor_statistics');
const studyPlannerRoutes = require('./routes/studyPlanner');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api', tutorRequestRoutes);
app.use('/notifications', notificationRouter);
app.use('/statistics', statisticRoutes);
app.use('/learner-statistics', learnerStatisticsRoutes);
app.use('/tutor-statistics', tutorStatisticsRoutes);
app.use('/study-planner', studyPlannerRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});