const Report = require("../../models/Report");
const User = require("../../models/User");
const { REPORT_STATUSES } = require("../../constants/reportStatuses");

async function getHomepageImpactStats() {
  const [reportStats, userStats] = await Promise.all([
    Report.aggregate([
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          resolvedIssues: {
            $sum: {
              $cond: [
                { $in: ["$status", [REPORT_STATUSES.RESOLVED, REPORT_STATUSES.CITIZEN_CONFIRMATION, REPORT_STATUSES.CLOSED]] },
                1,
                0,
              ],
            },
          },
          activeIssues: {
            $sum: {
              $cond: [
                {
                  $in: ["$status", [
                    REPORT_STATUSES.SUBMITTED,
                    REPORT_STATUSES.AI_ANALYZED,
                    REPORT_STATUSES.VERIFICATION_PENDING,
                    REPORT_STATUSES.VERIFIED,
                    REPORT_STATUSES.ASSIGNED,
                    REPORT_STATUSES.IN_PROGRESS,
                    REPORT_STATUSES.REOPENED,
                  ]],
                },
                1,
                0,
              ],
            },
          },
          totalRatings: {
            $sum: { $cond: [{ $ifNull: ["$feedback.rating", false] }, 1, 0] },
          },
          ratingSum: {
            $sum: { $ifNull: ["$feedback.rating", 0] },
          },
        },
      },
    ]),
    User.countDocuments({}),
  ]);

  const stats = reportStats[0] || {
    totalReports: 0,
    resolvedIssues: 0,
    activeIssues: 0,
    totalRatings: 0,
    ratingSum: 0,
  };

  const resolutionRate = stats.totalReports > 0 ? (stats.resolvedIssues / stats.totalReports) * 100 : 0;
  const citizenSatisfaction = stats.totalRatings > 0 ? (stats.ratingSum / stats.totalRatings) : 0;

  return {
    totalReports: stats.totalReports,
    resolvedIssues: stats.resolvedIssues,
    activeIssues: stats.activeIssues,
    resolutionRate: Math.round(resolutionRate),
    citizenSatisfaction: Math.round(citizenSatisfaction * 10) / 10,
    totalCitizens: userStats,
  };
}

async function getAdminAnalytics() {
  const [
    categoryStats,
    statusStats,
    priorityStats,
    feedbackStats,
  ] = await Promise.all([
    Report.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Report.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Report.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ["$priority", 80] }, then: "CRITICAL" },
                { case: { $gte: ["$priority", 60] }, then: "HIGH" },
                { case: { $gte: ["$priority", 40] }, then: "MEDIUM" },
              ],
              default: "LOW",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Report.aggregate([
      { $match: { "feedback.rating": { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$feedback.rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]),
  ]);

  const categoryDistribution = categoryStats.map((item) => ({
    category: item._id,
    count: item.count,
  }));

  const statusDistribution = statusStats.map((item) => ({
    status: item._id,
    count: item.count,
  }));

  const priorityDistribution = priorityStats.map((item) => ({
    priority: item._id,
    count: item.count,
  }));

  const feedback = feedbackStats[0] || { averageRating: 0, totalReviews: 0 };

  return {
    categoryDistribution,
    statusDistribution,
    priorityDistribution,
    citizenSatisfaction: {
      averageRating: Math.round(feedback.averageRating * 10) / 10,
      totalReviews: feedback.totalReviews,
    },
  };
}

module.exports = {
  getHomepageImpactStats,
  getAdminAnalytics,
};
