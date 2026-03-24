const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  message: {
    success: false,
    message: "Too many failed attempts. Please try again in 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (_req, res) => res.statusCode !== 401,
});

module.exports = { limiter };
