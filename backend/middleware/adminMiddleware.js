// Admin-only middleware - must be used AFTER protect middleware
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.includes("admin")) {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

module.exports = adminOnly;
