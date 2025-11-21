/*
Here you need to include the controllers for:
Register: Validates password confirmation, hashes with bcrypt, saves to the DB.
Login: Verifies credentials, tracks failed attempts → locks account for 5 minutes.
Lockout: Uses FailedLogin table with last_attempt and attempts.
Forgot Password: Generates a unique token, sends an email with a reset link.
CAPTCHA: Generated in captchaController, validated here.
*/
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const FailedLogin = require("../models/FailedLogin");

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
        success: false,
        message: "One or more form entries are empty"
      });
    }

    // Hashing password input (NEVER STORE PASSWORDS AS PLAINTEXT IN DB!!!)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const insertedId = await User.createUser(username, email, hash);
    if (!insertedId) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }
    res.status(201).json({
      success: true,
      message: "User signed up successfully",
      insertedId
    });
  } catch (error) {
    console.error("Sign-up error: ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

// -- USER LOGIN CONTROLLER --
const login = async (req,res) => {
  try {
    const { username, password } = req.body;

    // Check if one or more form entries are empty
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "One or more form entries are empty"
      });
    }

    const userData = await User.userLogin(username, password);
    if (userData.failedAttempt) {

      const iterateFailedAttempt = FailedLogin.iterateFailedAttempt(userData.affectedId);
      if (iterateFailedAttempt === 0) {
        return res.status(404).json({
          success: false,
          message: "User data was not found. Iiteration failed"
        })
      }

      
      const currAtt = await FailedLogin.getCurrentAttempts(userData.affectedId);
      if (!currAtt) {
        return res.status(404).json({
          success: false,
          message: "User data was not found. Attempt check failed"
        })
      }

      if (currAtt % 3 === 0) {
        const lock = await FailedLogin.setLockout(userData.affectedId);
        if (lock === 0) {
          return res.status(500).json({
            success: false,
            messge: "User lockout failed"
          });
        }
      }

      return res.status(401).json({
        success: false,
        message: "Wrong credentials"
      });
    }

    const clearAtt = await FailedLogin.resetAttempts(userData.id);
    if (clearAtt === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to reset attempts"
      })
    }

    const rmLock = await FailedLogin.removeLockout(userData.id);
    if (rmLock === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to remove lockout"
      })
    }

    const token = storeToken(userData);

    res.status(200).json({
      success: true,
      token: token,
    });
  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).json({
      success: false,
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
        success: false,
        message: "Token was not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Token disposed succesfully"
    });
  } catch (error) {
    console.error("Logout error: ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

const sendResetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: "Email requerido" });

        // CORRECTO: usar tu función real del modelo
        const user = await User.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const resetURL = `${process.env.FRONT_URL}/front/recuperar.html?token=${token}`;

        const html = `
            <h1>Restablecer contraseña</h1>
            <p>Haz clic para continuar:</p>

            <a href="${resetURL}" 
            style="background:#007bff;padding:10px 15px;color:white;border-radius:5px;text-decoration:none;">
                Restablecer contraseña
            </a>

            <p>Si no solicitaste esto, ignora este correo.</p>
        `;

        await sendEmail({
            to: email,
            subject: "Restablecer contraseña",
            html,
        });

        res.json({ message: "Correo enviado" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno" });
    }
};


module.exports = { signup, sendResetPassword, login, logout}
