const Report = require("../../models/Report");
const { REPORT_STATUSES } = require("../../constants/reportStatuses");
const sanitizeReport = require("../../utils/sanitizeReport");
const { createReportSchema } = require("../../validators/reportValidators");

function mapIssueLocation(location) {
  return {
    point: {
      type: "Point",
      coordinates: location.coordinates,
    },
    displayAddress: location.displayAddress,
  };
}

function createInitialTimelineEntry(userId) {
  return {
    status: REPORT_STATUSES.SUBMITTED,
    message: "Report submitted by citizen.",
    actorId: userId,
  };
}

async function createReport(userId, input, dependencies = {}) {
  const reportModel = dependencies.reportModel || Report;
  const data = createReportSchema.parse(input);
  const report = await reportModel.create({
    reporterId: userId,
    category: data.category,
    title: data.title,
    description: data.description,
    location: mapIssueLocation(data.location),
    status: REPORT_STATUSES.SUBMITTED,
    timeline: [createInitialTimelineEntry(userId)],
  });

  return sanitizeReport(report);
}

module.exports = {
  createInitialTimelineEntry,
  createReport,
  mapIssueLocation,
};
