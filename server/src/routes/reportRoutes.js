const { Router } = require("express");
const reportController = require("../controllers/reportController");
const { authenticateUser } = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/uploadMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

router.post("/reports", authenticateUser, asyncHandler(reportController.createReportController));
router.get("/reports/my", authenticateUser, asyncHandler(reportController.listMyReportsController));
router.get("/reports/:reportId", authenticateUser, asyncHandler(reportController.getReportController));
router.post(
  "/reports/:reportId/images",
  authenticateUser,
  uploadImage.single("image"),
  asyncHandler(reportController.uploadReportImageController),
);

module.exports = router;
