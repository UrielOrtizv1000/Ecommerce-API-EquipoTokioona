/*
Here you need to include the controllers for:
Register: Validates password confirmation, hashes with bcrypt, saves to the DB.
Login: Verifies credentials, tracks failed attempts → locks account for 5 minutes.
Lockout: Uses FailedLogin table with last_attempt and attempts.
Forgot Password: Generates a unique token, sends an email with a reset link.
CAPTCHA: Generated in captchaController, validated here.
*/
const jwt = require('jsonwebtoken');

const User = require("../models/User");
const FailedLogin = require("../models/FailedLogin");
const hashPassword = require("../utils/hashPassword");

const recaptcha = require("../utils/generateCaptcha");

const { storeToken, disposeToken } = require("../middlewares/authMiddleware");

// for forgot password

const sendEmail = require("../utils/sendEmail");

// -- USER REGISTER CONTROLLER (SIGNUP) --
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if one or more form entries are empty
    if (!username || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "One or more form entries are empty"
      });
    }

    const hash = await hashPassword(password);

    const insertedId = await User.createUser(username, email, hash);
    if (!insertedId) {
      return res.status(400).json({
        ok: false,
        message: "User already exists"
      });
    }
    res.status(201).json({
      ok: true,
      message: "User signed up successfully",
      insertedId
    });
  } catch (error) {
    console.error("Sign-up error: ", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
}

// -- USER LOGIN CONTROLLER --
const login = async (req,res) => {
  try {
    const { username, password, 'g-recaptcha-response': captchaResponse } = req.body;
    if (!captchaResponse) {
      return res.status(400).json({
        ok: false,
        message: "Please verify your CAPTCHA"
      })
    }

    // Verify CAPTCHA
    recaptcha.verify(req, async (error, data) => {
      if (error) {
        return res.status(400).json({
          ok: false,
          message: "CAPTCHA verification failed"
        });
      }

      // CAPTCHA PASSED: proceed with login logic
      
      // Check if one or more form entries are empty
      if (!username || !password) {
        return res.status(400).json({
          ok: false,
          message: "One or more form entries are empty"
        });
      }

      const userData = await User.userLogin(username, password);
      if (userData.failedAttempt) {

        const iterateFailedAttempt = FailedLogin.iterateFailedAttempt(userData.affectedId);
        if (iterateFailedAttempt === 0) {
          return res.status(404).json({
            ok: false,
            message: "User data was not found. Iiteration failed"
          })
        }


        const currAtt = await FailedLogin.getCurrentAttempts(userData.affectedId);
        if (!currAtt) {
          return res.status(404).json({
            ok: false,
            message: "User data was not found. Attempt check failed"
          })
        }

        if (currAtt % 3 === 0) {
          const lock = await FailedLogin.setLockout(userData.affectedId);
          if (lock === 0) {
            return res.status(500).json({
              ok: false,
              messge: "User lockout failed"
            });
          }
        }

        return res.status(401).json({
          ok: false,
          message: "Wrong credentials"
        });
      }

      const clearAtt = await FailedLogin.resetAttempts(userData.id);
      if (clearAtt === 0) {
        return res.status(500).json({
          ok: false,
          message: "Failed to reset attempts"
        })
      }

      const rmLock = await FailedLogin.removeLockout(userData.id);
      if (rmLock === 0) {
        return res.status(500).json({
          ok: false,
          message: "Failed to remove lockout"
        })
      }

      const token = storeToken(userData);

      res.status(200).json({
        ok: true,
        token: token,
      });
    })
  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
}

// -- USER LOGOUT CONTROLLER --
const logout = async (req, res) => {
  try {
    const token = req.token;
    const dispose = disposeToken(token);

    if (!dispose) {
      return res.status(404).json({
        ok: false,
        message: "Token was not found"
      });
    }
    
    res.status(200).json({
      ok: true,
      message: "Token disposed succesfully"
    });
  } catch (error) {
    console.error("Logout error: ", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
}

const sendResetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ ok: false, message: "An email address is required" });

        // CORRECT: use your real model function
        const user = await User.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ ok: false, message: "User not found" });
        }

        const token = jwt.sign(
            { id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const resetURL = `${process.env.FRONT_URL}/front/recuperar.html?token=${token}`;

        const html = `
            <h1>Password Reset</h1>
            <p>Click below to continue:</p>

            <a href="${resetURL}" 
            style="background:#007bff;padding:10px 15px;color:white;border-radius:5px;text-decoration:none;">
                Reset Password
            </a>

            <p>If you did not request this, please ignore this email.</p>
        `;

        await sendEmail({
            to: email,
            subject: "Password Reset",
            html,
        });

        res.status(200).json({ ok: true, message: "Email sent" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "Internal server error" });
    }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.query
    const { password } = req.body;

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "No token was provided"
      })
    }

    if (!password) {
      return res.status(400).json({
        ok: false,
        message: "A password is required"
      })
    }

    let decoded;

    try {
      const jwtDecode = jwt.verify(token, process.env.JWT_SECRET);
      decoded = jwtDecode;
    } catch (tokenError) {
      return res.status(401).json({
        ok: false,
        message: "Invalid or expired token.",
        error: tokenError.message
      });
    }

    const hash = await hashPassword(password);
    const id = decoded.id;

    const passReset = await User.resetPassword(hash, id);
    if (passReset === 0) {
      return res.status(500).json({
        ok: false,
        message: "Password reset failed"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Password has been reset successfully"
    });
  } catch (error) {
    console.error("Password reset error: ", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
}


module.exports = { signup, login, logout , sendResetPassword, resetPassword }
