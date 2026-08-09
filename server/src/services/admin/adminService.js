const Report = require("../../models/Report");
const { REPORT_STATUSES } = require("../../constants/reportStatuses");
const ApiError = require("../../utils/ApiError");
const sanitizeReport = require("../../utils/sanitizeReport");
const { processImage } = require("../image/imageProcessingService");
const { validateImageUpload } = require("../image/imageValidationService");
const { createStorageKey } = require("../image/storageKeyService");
const { uploadProcessedImage } = require("../image/cloudinaryStorageService");

async function listAllReportsAdmin({ search, status, category, minPriority, page = 1, limit = 20 } = {}) {
  const query = {};

  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { "location.displayAddress": searchRegex },
    ];
  }

  if (status) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (minPriority !== undefined && minPriority !== "") {
    query.priority = { $gte: Number(minPriority) };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [reports, total] = await Promise.all([
    Report.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Report.countDocuments(query),
  ]);

  return {
    reports: reports.map(sanitizeReport),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

async function getReportDetailAdmin(reportId) {
  const report = await Report.findById(reportId).populate("reporterId", "name email role");
  if (!report) {
    throw new ApiError(404, "Report not found.", "REPORT_NOT_FOUND");
  }
  return sanitizeReport(report);
}

async function verifyReport(reportId, adminUser) {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new ApiError(404, "Report not found.", "REPORT_NOT_FOUND");
  }

  report.status = REPORT_STATUSES.VERIFIED;
  report.timeline.push({
    status: REPORT_STATUSES.VERIFIED,
    message: "Report officially verified by administrator.",
    actorId: adminUser.id,
    createdAt: new Date(),
  });

  await report.save();
  return sanitizeReport(report);
}

async function assignReportDepartment(reportId, department, adminUser) {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new ApiError(404, "Report not found.", "REPORT_NOT_FOUND");
  }

  report.assignedDepartment = department;
  report.status = REPORT_STATUSES.ASSIGNED;
  report.timeline.push({
    status: REPORT_STATUSES.ASSIGNED,
    message: `Report assigned to department: ${department}.`,
    actorId: adminUser.id,
    createdAt: new Date(),
  });

  await report.save();
  return sanitizeReport(report);
}

async function updateReportStatus(reportId, newStatus, message, adminUser) {
  if (!Object.values(REPORT_STATUSES).includes(newStatus)) {
    throw new ApiError(400, "Invalid report status.", "INVALID_STATUS");
  }

  const report = await Report.findById(reportId);
  if (!report) {
    throw new ApiError(404, "Report not found.", "REPORT_NOT_FOUND");
  }

  report.status = newStatus;
  report.timeline.push({
    status: newStatus,
    message: message || `Status updated to ${newStatus} by administrator.`,
    actorId: adminUser.id,
    createdAt: new Date(),
  });

  await report.save();
  return sanitizeReport(report);
}

async function resolveReport(reportId, { resolutionNotes }, adminUser, resolutionFile, dependencies = {}) {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new ApiError(404, "Report not found.", "REPORT_NOT_FOUND");
  }

  let resolutionImageMeta = null;
  if (resolutionFile) {
    await validateImageUpload(resolutionFile);
    const processed = await processImage(resolutionFile.buffer);
    const standardKey = createStorageKey(reportId, "resolution-standard");
    const thumbnailKey = createStorageKey(reportId, "resolution-thumbnail");
    const uploadImage = dependencies.uploadImage || uploadProcessedImage;
    const standardUpload = await uploadImage(processed.standard, standardKey);
    const thumbnailUpload = await uploadImage(processed.thumbnail, thumbnailKey);

    resolutionImageMeta = {
      standardUrl: standardUpload.secureUrl,
      thumbnailUrl: thumbnailUpload.secureUrl,
      storageKey: standardKey,
    };
  }

  report.status = REPORT_STATUSES.CITIZEN_CONFIRMATION;
  report.resolutionEvidence = {
    notes: resolutionNotes || "Issue has been resolved.",
    resolvedAt: new Date(),
    resolvedBy: adminUser.id,
    image: resolutionImageMeta,
  };

  report.timeline.push({
    status: REPORT_STATUSES.CITIZEN_CONFIRMATION,
    message: resolutionNotes
      ? `Issue marked resolved by admin: ${resolutionNotes}`
      : "Issue marked resolved by admin. Pending citizen confirmation.",
    actorId: adminUser.id,
    createdAt: new Date(),
  });

  await report.save();
  return sanitizeReport(report);
}

module.exports = {
  listAllReportsAdmin,
  getReportDetailAdmin,
  verifyReport,
  assignReportDepartment,
  updateReportStatus,
  resolveReport,
};
