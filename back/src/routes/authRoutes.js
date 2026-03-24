const express = require("express");

const {
  signup,
  login,
  logout,
  sendResetPassword,
  resetPassword,
} = require("../controllers/authController");
const { getCaptcha } = require("../controllers/captchaController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { limiter } = require("../middlewares/rateLimiter");

const router = express.Router();

router.post("/signup", signup);
router.post("/register", signup);
router.get("/captcha", getCaptcha);
router.get("/getCaptcha", getCaptcha);
router.post("/login", limiter, login);
router.post("/logout", verifyToken(), logout);
router.post("/forgot-password", sendResetPassword);
router.post("/reset-password", resetPassword);
router.post("/resetPassword", resetPassword);

module.exports = router;
