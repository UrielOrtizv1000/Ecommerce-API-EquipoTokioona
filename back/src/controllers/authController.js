const jwt = require("jsonwebtoken");

const FailedLogin = require("../models/FailedLogin");
const User = require("../models/User");
const { disposeToken, storeToken } = require("../middlewares/authMiddleware");
const { verifyCaptcha } = require("../utils/generateCaptcha");
const hashPassword = require("../utils/hashPassword");
const sendEmail = require("../utils/sendEmail");

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Username, email, and password are required.",
      });
    }

    const passwordHash = await hashPassword(password);
    const insertedId = await User.createUser(username, email, passwordHash);

    if (!insertedId) {
      return res.status(400).json({
        ok: false,
        message: "User already exists.",
      });
    }

    return res.status(201).json({
      ok: true,
      message: "User signed up successfully.",
      insertedId,
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password, captchaId, captchaText } = req.body;
    const captchaResult = verifyCaptcha(captchaId, captchaText);

    if (!captchaResult.valid) {
      return res.status(400).json({
        ok: false,
        message: captchaResult.reason,
      });
    }

    const userData = await User.userLogin(username, password);
    if (!userData) {
      return res.status(401).json({
        ok: false,
        message: "Invalid credentials.",
      });
    }

    if (userData.failedAttempt) {
      const updatedAttempts = await FailedLogin.iterateFailedAttempt(userData.affectedId);
      if (!updatedAttempts) {
        return res.status(500).json({
          ok: false,
          message: "Login failed.",
        });
      }

      const currentAttempts = await FailedLogin.getCurrentAttempts(userData.affectedId);
      if (!currentAttempts) {
        return res.status(401).json({
          ok: false,
          message: "Invalid credentials.",
        });
      }

      if (currentAttempts % 3 === 0) {
        await FailedLogin.setLockout(userData.affectedId);
      }

      return res.status(401).json({
        ok: false,
        message: "Invalid credentials.",
      });
    }

    await FailedLogin.resetAttempts(userData.id);
    await FailedLogin.removeLockout(userData.id);

    const token = storeToken(userData);

    return res.status(200).json({
      ok: true,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};

const logout = async (req, res) => {
  try {
    const disposed = disposeToken(req.token);

    if (!disposed) {
      return res.status(404).json({
        ok: false,
        message: "Token was not found.",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Token disposed successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};

const sendResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ ok: false, message: "An email address is required." });
    }

    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found." });
    }

    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetBaseUrl = process.env.FRONT_URL || "http://127.0.0.1:5500";
    const resetUrl = `${resetBaseUrl}/recuperar.html?token=${token}`;

    const html = `
      <h1>Password Reset</h1>
      <p>Click the button below to continue.</p>
      <a
        href="${resetUrl}"
        style="background:#007bff;padding:10px 15px;color:white;border-radius:5px;text-decoration:none;"
      >
        Reset Password
      </a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({
      to: email,
      subject: "Password Reset",
      html,
    });

    return res.status(200).json({ ok: true, message: "Email sent." });
  } catch (error) {
    console.error("Forgot-password error:", error);
    return res.status(500).json({ ok: false, message: "Internal server error." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "No token was provided.",
      });
    }

    if (!password) {
      return res.status(400).json({
        ok: false,
        message: "A password is required.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_tokenError) {
      return res.status(401).json({
        ok: false,
        message: "Invalid or expired token.",
      });
    }

    const passwordHash = await hashPassword(password);
    const updatedRows = await User.resetPassword(passwordHash, decoded.id);

    if (!updatedRows) {
      return res.status(500).json({
        ok: false,
        message: "Password reset failed.",
      });
    }

    const user = await User.getUserById(decoded.id);
    const newToken = jwt.sign(
      {
        id: user.user_id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      ok: true,
      message: "Password has been reset successfully.",
      token: newToken,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  sendResetPassword,
  resetPassword,
};
