const { Router } = require("express");
const {
  listReportsAdminController,
  getReportAdminController,
  verifyReportAdminController,
  assignDepartmentAdminController,
  updateStatusAdminController,
  resolveReportAdminController,
} = require("../controllers/adminController");
const { authenticateUser } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const { uploadImage } = require("../middleware/uploadMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

const adminAuth = [authenticateUser, requireAdmin];

router.get("/admin/reports", adminAuth, asyncHandler(listReportsAdminController));
router.get("/admin/reports/:reportId", adminAuth, asyncHandler(getReportAdminController));
router.patch("/admin/reports/:reportId/verify", adminAuth, asyncHandler(verifyReportAdminController));
router.patch("/admin/reports/:reportId/assign", adminAuth, asyncHandler(assignDepartmentAdminController));
router.patch("/admin/reports/:reportId/status", adminAuth, asyncHandler(updateStatusAdminController));
router.post(
  "/admin/reports/:reportId/resolve",
  adminAuth,
  uploadImage.single("resolutionImage"),
  asyncHandler(resolveReportAdminController),
);

module.exports = router;
