/*Here goes the attempt limit (3) in a range of
 5 minutes */
const rateLimit  = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 3, // 3 attempts
  message: {
    success: false,
    message: "Varios intentos fallidos. Intenta de nuevo en 5 minutos"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (req, res) => {
    // Return true if request should NOT count against the limit
    return res.statusCode != 401;
  }
});

module.exports = { limiter };