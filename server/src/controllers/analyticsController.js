const { getHomepageImpactStats, getAdminAnalytics } = require("../services/analytics/analyticsService");
const asyncHandler = require("../utils/asyncHandler");

const getHomepageStatsController = asyncHandler(async (req, res) => {
  const stats = await getHomepageImpactStats();
  res.status(200).json({
    success: true,
    stats,
  });
});

const getAdminAnalyticsController = asyncHandler(async (req, res) => {
  const analytics = await getAdminAnalytics();
  res.status(200).json({
    success: true,
    analytics,
  });
});

module.exports = {
  getHomepageStatsController,
  getAdminAnalyticsController,
};
