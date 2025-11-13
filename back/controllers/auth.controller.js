// NOTE: Testing with user model
// New user entries will not be registered in the file, but in the actual
// server session. If the server restarts, new entries will be lost.
// This will be replaced with a DB connection in next commits.

// Please do not use real user info during POST testing (yet).
const users = require("../model/users.json");

// User signup controller
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if one or more form entries are empty
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "One or more form entries are empty."
      });
    }

    // Adding a new user entry (in server session)
    // TO DO: INSERT query into DB 
    const newUser = {
      id: users.length + 1,
      username: username,
      email: email,
      password: password
    }

    users.push(newUser);

    return res.status(201).json({
      success: true,
      message: "User signed up successfully.",
      user: {
        id: newUser.id,
        username: username
      }
    });
  } catch (error) {
    console.error("Sign-up error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
}

module.exports = { signup }