const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found: ' + req.originalUrl });
};

module.exports = { errorHandler, notFound };
