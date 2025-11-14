/*
Here you need to include the controllers for:
Register: Validates password confirmation, hashes with bcrypt, saves to the DB.
Login: Verifies credentials, tracks failed attempts → locks account for 5 minutes.
Lockout: Uses FailedLogin table with last_attempt and attempts.
Forgot Password: Generates a unique token, sends an email with a reset link.
CAPTCHA: Generated in captchaController, validated here.
*/
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// -- USER SIGNUP CONTROLLER --
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

module.exports = { signup }