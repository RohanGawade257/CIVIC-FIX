const { Router } = require("express");
const reportController = require("../controllers/reportController");
const { authenticateUser } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

router.post("/reports", authenticateUser, asyncHandler(reportController.createReportController));

module.exports = router;
