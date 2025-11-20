// Admin verification fallback
const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  }
  else {
    return res.status(403).json({
      ok: false,
      message: "Admin role is required"
    });
  }
}

module.exports = { isAdmin };