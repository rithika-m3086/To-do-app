const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'supersecretjwtkey_todo_app_2026',
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
