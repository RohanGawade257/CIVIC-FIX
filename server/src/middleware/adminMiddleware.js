const { USER_ROLES } = require("../constants/userRoles");
const ApiError = require("../utils/ApiError");

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
    throw new ApiError(403, "Administrator access required.", "ADMIN_REQUIRED");
  }
  next();
}

module.exports = {
  requireAdmin,
};
