const { Router } = require("express");
const reportController = require("../controllers/reportController");
const { authenticateUser } = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/uploadMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { uploadLimiter } = require("../middleware/rateLimitMiddleware");
const router = Router();

router.post("/reports", authenticateUser, asyncHandler(reportController.createReportController));
router.get("/reports/my", authenticateUser, asyncHandler(reportController.listMyReportsController));
router.get("/reports/:reportId", authenticateUser, asyncHandler(reportController.getReportController));
router.post(
  "/reports/:reportId/images",
  authenticateUser,
  uploadLimiter,
  uploadImage.single("image"),
  asyncHandler(reportController.uploadReportImageController),
);
router.post(
  "/reports/:reportId/analyze",
  authenticateUser,
  asyncHandler(reportController.analyzeReportController),
);

const trackingController = require("../controllers/trackingController");
router.get("/notifications", authenticateUser, asyncHandler(trackingController.getNotificationsController));
router.post(
  "/reports/:reportId/confirm",
  authenticateUser,
  asyncHandler(trackingController.confirmResolutionController),
);

module.exports = router;
