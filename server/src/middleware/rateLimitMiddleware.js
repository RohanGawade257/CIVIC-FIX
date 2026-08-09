const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many authentication attempts. Please try again later.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many upload attempts. Please try again later.",
    code: "UPLOAD_RATE_LIMIT_EXCEEDED",
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
  uploadLimiter,
};
