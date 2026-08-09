const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const sanitizeUser = require("../utils/sanitizeUser");
const { AUTH_COOKIE_NAME, verifyAuthToken } = require("../services/auth/tokenService");

async function resolveUserById(userModel, userId) {
  const query = userModel.findById(userId);

  if (query && typeof query.select === "function") {
    return query.select("-passwordHash");
  }

  return query;
}

function createAuthenticationMiddleware(dependencies = {}) {
  const userModel = dependencies.userModel || User;
  const verifyToken = dependencies.verifyToken || verifyAuthToken;

  return async function authenticateUser(req, _res, next) {
    try {
      const token = req.cookies?.[AUTH_COOKIE_NAME];

      if (!token) {
        throw new ApiError(401, "Authentication required.", "AUTH_REQUIRED");
      }

      const payload = verifyToken(token, dependencies.authSecret);

      if (!payload.sub) {
        throw new ApiError(401, "Invalid authentication session.", "INVALID_AUTH_SESSION");
      }

      const user = await resolveUserById(userModel, payload.sub);

      if (!user) {
        throw new ApiError(401, "Invalid authentication session.", "INVALID_AUTH_SESSION");
      }

      req.user = sanitizeUser(user);
      req.auth = {
        userId: req.user.id,
        role: req.user.role,
      };

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
        return;
      }

      if (error.name === "TokenExpiredError") {
        next(new ApiError(401, "Authentication session expired.", "AUTH_SESSION_EXPIRED"));
        return;
      }

      next(new ApiError(401, "Invalid authentication session.", "INVALID_AUTH_SESSION"));
    }
  };
}

const authenticateUser = createAuthenticationMiddleware();

module.exports = {
  authenticateUser,
  createAuthenticationMiddleware,
};
