const ApiError = require("../utils/ApiError");

function authorizeRoles(...allowedRoles) {
  return function authorizeRequest(req, _res, next) {
    if (!req.auth?.role) {
      next(new ApiError(401, "Authentication required.", "AUTH_REQUIRED"));
      return;
    }

    if (!allowedRoles.includes(req.auth.role)) {
      next(new ApiError(403, "You do not have permission to access this resource.", "ROLE_FORBIDDEN"));
      return;
    }

    next();
  };
}

module.exports = {
  authorizeRoles,
};
