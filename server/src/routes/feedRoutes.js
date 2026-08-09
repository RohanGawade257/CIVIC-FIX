const { Router } = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { getCivicFeedController, getPublicFeedController } = require("../controllers/feedController");

const router = Router();

router.get("/feed", authenticateUser, asyncHandler(getCivicFeedController));
router.get("/feed/public", asyncHandler(getPublicFeedController));

module.exports = router;
