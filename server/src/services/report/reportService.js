const Report = require("../../models/Report");
const { USER_ROLES } = require("../../constants/userRoles");
const { REPORT_STATUSES } = require("../../constants/reportStatuses");
const ApiError = require("../../utils/ApiError");
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

function canViewReport(user, report) {
  return user.role === USER_ROLES.ADMIN || String(report.reporterId) === user.id;
}

async function getReportByIdForUser(reportId, user, dependencies = {}) {
  const reportModel = dependencies.reportModel || Report;
  const query = reportModel.findById(reportId);
  const report = typeof query?.lean === "function" ? await query.lean() : await query;

  if (!report) {
    throw new ApiError(404, "Report not found.", "REPORT_NOT_FOUND");
  }

  if (!canViewReport(user, report)) {
    throw new ApiError(403, "You do not have permission to access this report.", "REPORT_FORBIDDEN");
  }

  return sanitizeReport(report);
}

async function listReportsForUser(userId, dependencies = {}) {
  const reportModel = dependencies.reportModel || Report;
  let query = reportModel.find({ reporterId: userId });

  if (query && typeof query.sort === "function") {
    query = query.sort({ createdAt: -1 }).limit(50);
  }

  const reports = typeof query?.lean === "function" ? await query.lean() : await query;
  return reports.map(sanitizeReport);
}

module.exports = {
  canViewReport,
  createInitialTimelineEntry,
  createReport,
  getReportByIdForUser,
  listReportsForUser,
  mapIssueLocation,
};
