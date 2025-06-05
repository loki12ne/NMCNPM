const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.status(401).json({ error: 'Please log in first' });
};

module.exports = { isAuthenticated };