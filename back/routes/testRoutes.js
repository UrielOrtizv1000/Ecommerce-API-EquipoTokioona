// src/routes/testRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/test-token", (req, res) => {
  const token = jwt.sign(
    {
      user_id: 1,
      role: "admin"
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  return res.json({ token });
});

module.exports = router;
