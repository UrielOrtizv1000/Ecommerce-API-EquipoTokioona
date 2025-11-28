
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const sessions = new Map();

/*
  Middleware to verify JWT and optionally validate admin privileges
 
  param {boolean} requireAdmin - If true, the request must come from an admin user
  returns Express middleware function.
 */

const verifyToken = (requireAdmin = false) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;//token received

            // Must come as: "Bearer TOKEN"
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    ok: false,
                    message: "Token not provided. Please log in."
                });
            }

            const token = authHeader.split(" ")[1];

            // Validate token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Attach user information to the request (note: Adjust this part based on 
            // the parameters returned by the frontend login request)
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };

            // Check for admin permission if required
            if (requireAdmin && decoded.role !== "admin") {
                return res.status(403).json({
                    ok: false,
                    message: "Access denied. Administrator role required."
                });
            }
            
            req.token = token;

            next();

        } catch (error) {
            return res.status(401).json({
                ok: false,
                message: "Invalid or expired token.",
                error: error.message
            });
        }
    };
};

const storeToken = (userData) => {
    const token = jwt.sign(
        userData,
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN
        }
    );
    sessions.set(token, userData.id);
    return token;
}

const disposeToken = (token) => {
    return sessions.delete(token);
}

module.exports = { verifyToken, storeToken, disposeToken };


