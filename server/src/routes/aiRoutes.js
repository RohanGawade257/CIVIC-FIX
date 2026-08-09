const { Router } = require("express");
const { preCheckImageController } = require("../controllers/aiController");
const { authenticateUser } = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/uploadMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

router.post(
  "/ai/pre-check",
  authenticateUser,
  uploadImage.single("image"),
  asyncHandler(preCheckImageController),
);

module.exports = router;
