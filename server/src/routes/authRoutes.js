const { Router } = require("express");
const authController = require("../controllers/authController");
const asyncHandler = require("../utils/asyncHandler");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = Router();

router.post("/auth/register", authLimiter, asyncHandler(authController.register));
router.post("/auth/login", authLimiter, asyncHandler(authController.login));
router.post("/auth/logout", asyncHandler(authController.logout));

module.exports = router;
