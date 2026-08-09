const { Router } = require("express");
const authController = require("../controllers/authController");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

router.post("/auth/register", asyncHandler(authController.register));
router.post("/auth/login", asyncHandler(authController.login));
router.post("/auth/logout", asyncHandler(authController.logout));

module.exports = router;
