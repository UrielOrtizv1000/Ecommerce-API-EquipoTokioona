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
const { storeToken, disposeToken } = require("../middlewares/authMiddleware");


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
    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "Wrong credentials"
      });
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

module.exports = { signup, login, logout }
