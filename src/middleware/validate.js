const validateBody = (fields) => (req, res, next) => {
  const missing = [];
  fields.forEach((f) => {
    if (!req.body[f]) missing.push(f);
  });
  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: ' + missing.join(', '),
    });
  }
  next();
};

module.exports = { validateBody };
