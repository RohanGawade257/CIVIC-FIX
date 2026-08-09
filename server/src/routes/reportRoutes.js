const { Router } = require("express");
const reportController = require("../controllers/reportController");
const { authenticateUser } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

router.post("/reports", authenticateUser, asyncHandler(reportController.createReportController));
router.get("/reports/my", authenticateUser, asyncHandler(reportController.listMyReportsController));
router.get("/reports/:reportId", authenticateUser, asyncHandler(reportController.getReportController));

module.exports = router;
