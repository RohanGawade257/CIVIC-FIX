const Report = require("../../models/Report");
const { REPORT_STATUSES } = require("../../constants/reportStatuses");
const ApiError = require("../../utils/ApiError");
const sanitizeReport = require("../../utils/sanitizeReport");

async function getNotificationsForUser(userId) {
  const reports = await Report.find({ reporterId: userId })
    .sort({ updatedAt: -1 })
    .limit(50)
    .select("_id title status timeline updatedAt");

  const notifications = reports.flatMap((report) => {
    const recentEntries = report.timeline.slice(-3);
    return recentEntries.map((entry) => ({
      reportId: String(report._id),
      reportTitle: report.title,
      status: entry.status,
      message: entry.message,
      createdAt: entry.createdAt,
    }));
  });

  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return notifications.slice(0, 20);
}

async function submitCitizenConfirmation(reportId, userId, { confirmed, rating, reviewText }) {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new ApiError(404, "Report not found.", "REPORT_NOT_FOUND");
  }

  if (String(report.reporterId) !== String(userId)) {
    throw new ApiError(403, "You do not have permission to confirm this report.", "FORBIDDEN");
  }

  if (report.status !== REPORT_STATUSES.CITIZEN_CONFIRMATION) {
    throw new ApiError(
      400,
      "This report is not awaiting citizen confirmation.",
      "INVALID_STATUS_FOR_CONFIRMATION",
    );
  }

  if (confirmed) {
    report.status = REPORT_STATUSES.CLOSED;
    report.citizenConfirmation = {
      confirmed: true,
      confirmedAt: new Date(),
      confirmedBy: userId,
    };
    report.feedback = {
      rating: Math.min(5, Math.max(1, Number(rating) || 3)),
      reviewText: reviewText ? String(reviewText).trim().slice(0, 1000) : null,
      submittedAt: new Date(),
      verified: true,
    };
    report.timeline.push({
      status: REPORT_STATUSES.CLOSED,
      message: "Citizen confirmed the issue has been resolved.",
      actorId: userId,
      createdAt: new Date(),
    });
  } else {
    report.status = REPORT_STATUSES.REOPENED;
    report.citizenConfirmation = {
      confirmed: false,
      confirmedAt: new Date(),
      confirmedBy: userId,
    };
    report.timeline.push({
      status: REPORT_STATUSES.REOPENED,
      message: "Citizen reported that the issue is still not resolved. Report reopened.",
      actorId: userId,
      createdAt: new Date(),
    });
  }

  await report.save();
  return sanitizeReport(report);
}

module.exports = {
  getNotificationsForUser,
  submitCitizenConfirmation,
};
