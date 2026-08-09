const assert = require("node:assert/strict");
const test = require("node:test");
const { REPORT_STATUSES } = require("../src/constants/reportStatuses");

function makeMockReportAggregate(statsOverrides = {}) {
  const originalAggregate = require("../src/models/Report").aggregate;
  const Report = require("../src/models/Report");
  Report.aggregate = async () => [statsOverrides];
  return { originalAggregate, Report };
}

function makeMockUserCount(count = 1) {
  const originalCount = require("../src/models/User").countDocuments;
  const User = require("../src/models/User");
  User.countDocuments = async () => count;
  return { originalCount, User };
}

test("getHomepageImpactStats returns correct stats and percentages", async () => {
  const { getHomepageImpactStats } = require("../src/services/analytics/analyticsService");

  const { originalAggregate, Report } = makeMockReportAggregate({
    totalReports: 100,
    resolvedIssues: 70,
    activeIssues: 30,
    totalRatings: 10,
    ratingSum: 47,
  });

  const { originalCount, User } = makeMockUserCount(150);

  try {
    const stats = await getHomepageImpactStats();

    assert.equal(stats.totalReports, 100);
    assert.equal(stats.resolvedIssues, 70);
    assert.equal(stats.activeIssues, 30);
    assert.equal(stats.resolutionRate, 70);
    assert.equal(stats.citizenSatisfaction, 4.7);
    assert.equal(stats.totalCitizens, 150);
  } finally {
    Report.aggregate = originalAggregate;
    User.countDocuments = originalCount;
  }
});

test("getHomepageImpactStats handles empty state safely", async () => {
  const { getHomepageImpactStats } = require("../src/services/analytics/analyticsService");

  const { originalAggregate, Report } = makeMockReportAggregate();
  Report.aggregate = async () => []; // empty aggregation return

  const { originalCount, User } = makeMockUserCount(0);

  try {
    const stats = await getHomepageImpactStats();
    assert.equal(stats.totalReports, 0);
    assert.equal(stats.resolvedIssues, 0);
    assert.equal(stats.activeIssues, 0);
    assert.equal(stats.resolutionRate, 0);
    assert.equal(stats.citizenSatisfaction, 0);
    assert.equal(stats.totalCitizens, 0);
  } finally {
    Report.aggregate = originalAggregate;
    User.countDocuments = originalCount;
  }
});

test("getAdminAnalytics returns formatted distributions", async () => {
  const { getAdminAnalytics } = require("../src/services/analytics/analyticsService");
  const Report = require("../src/models/Report");
  const originalAggregate = Report.aggregate;

  Report.aggregate = async (pipeline) => {
    // Determine which mock data to return based on the pipeline content
    const pipelineStr = JSON.stringify(pipeline);
    if (pipelineStr.includes("$category")) {
      return [{ _id: "INFRASTRUCTURE", count: 10 }, { _id: "SANITATION", count: 5 }];
    }
    if (pipelineStr.includes("$status")) {
      return [{ _id: REPORT_STATUSES.RESOLVED, count: 12 }, { _id: REPORT_STATUSES.SUBMITTED, count: 3 }];
    }
    if (pipelineStr.includes("$priority")) {
      return [{ _id: "CRITICAL", count: 2 }, { _id: "LOW", count: 13 }];
    }
    if (pipelineStr.includes("feedback.rating")) {
      return [{ averageRating: 4.8, totalReviews: 5 }];
    }
    return [];
  };

  try {
    const analytics = await getAdminAnalytics();
    
    assert.equal(analytics.categoryDistribution.length, 2);
    assert.equal(analytics.categoryDistribution[0].category, "INFRASTRUCTURE");
    
    assert.equal(analytics.statusDistribution.length, 2);
    assert.equal(analytics.statusDistribution[0].status, REPORT_STATUSES.RESOLVED);
    
    assert.equal(analytics.priorityDistribution.length, 2);
    assert.equal(analytics.priorityDistribution[0].priority, "CRITICAL");
    
    assert.equal(analytics.citizenSatisfaction.averageRating, 4.8);
    assert.equal(analytics.citizenSatisfaction.totalReviews, 5);
  } finally {
    Report.aggregate = originalAggregate;
  }
});
