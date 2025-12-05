/*Here goes the attempt limit (3) in a range of
 5 minutes */
const rateLimit  = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 3, // 3 attempts
  message: {
    success: false,
    message: "Too many login attempts. Try again after 5 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { limiter };