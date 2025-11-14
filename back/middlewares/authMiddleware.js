
const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT and optionally validate admin privileges
 *
 * @param {boolean} requireAdmin - If true, the request must come from an admin user
 * @returns Express middleware function.
 */
const verifyToken = (requireAdmin = false) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            // Must come as: "Bearer TOKEN"
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    ok: false,
                    message: "Token not provided. Please log in."
                });
            }

            const token = authHeader.split(" ")[1];

            // Validate token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

module.exports = verifyToken;


