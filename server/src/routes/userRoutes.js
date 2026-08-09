const { Router } = require("express");
const userController = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

router.get("/users/me", authenticateUser, asyncHandler(userController.getCurrentUser));
router.patch("/users/me", authenticateUser, asyncHandler(userController.updateCurrentUser));

module.exports = router;
