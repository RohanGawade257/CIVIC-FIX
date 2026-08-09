const { Router } = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const { getHomepageStatsController, getAdminAnalyticsController } = require("../controllers/analyticsController");

const router = Router();

router.get("/analytics/public", getHomepageStatsController);
router.get("/analytics/admin", authenticateUser, requireAdmin, getAdminAnalyticsController);

module.exports = router;
