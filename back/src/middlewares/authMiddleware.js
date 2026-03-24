const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const sessions = new Map();
const revokedTokens = new Set();

const verifyToken = (requireAdmin = false) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          ok: false,
          message: "Token not provided. Please log in.",
        });
      }

      const token = authHeader.split(" ")[1];
      if (revokedTokens.has(token)) {
        return res.status(401).json({
          ok: false,
          message: "Invalid or expired token.",
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      req.token = token;

      if (requireAdmin && decoded.role !== "admin") {
        return res.status(403).json({
          ok: false,
          message: "Access denied. Administrator role required.",
        });
      }

      next();
    } catch (_error) {
      return res.status(401).json({
        ok: false,
        message: "Invalid or expired token.",
      });
    }
  };
};

const storeToken = (userData) => {
  const token = jwt.sign(userData, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  revokedTokens.delete(token);
  sessions.set(token, userData.id);

  return token;
};

const disposeToken = (token) => {
  revokedTokens.add(token);
  return sessions.delete(token) || revokedTokens.has(token);
};

module.exports = { verifyToken, storeToken, disposeToken };
