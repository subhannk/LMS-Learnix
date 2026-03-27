const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Your role '${req.user.role}' is not allowed to perform this action.`
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };