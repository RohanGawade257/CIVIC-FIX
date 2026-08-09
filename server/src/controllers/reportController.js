const {
  createReport,
  getReportByIdForUser,
  listReportsForUser,
} = require("../services/report/reportService");
const { attachImageToReport } = require("../services/image/reportImageService");

async function createReportController(req, res) {
  const report = await createReport(req.auth.userId, req.body);

  res.status(201).json({
    success: true,
    report,
  });
}

async function getReportController(req, res) {
  const report = await getReportByIdForUser(req.params.reportId, req.user);

  res.status(200).json({
    success: true,
    report,
  });
}

async function listMyReportsController(req, res) {
  const reports = await listReportsForUser(req.auth.userId);

  res.status(200).json({
    success: true,
    reports,
  });
}

async function uploadReportImageController(req, res) {
  const report = await attachImageToReport(req.params.reportId, req.user, req.file);

  res.status(200).json({
    success: true,
    report,
  });
}

async function analyzeReportController(req, res) {
  const { analyzeReportImage } = require("../services/ai/aiService");
  const { getReportByIdForUser } = require("../services/report/reportService");
  const sanitizeReport = require("../utils/sanitizeReport");

  // Authorization check (must be report owner or admin)
  await getReportByIdForUser(req.params.reportId, req.user);
  const updatedReport = await analyzeReportImage(req.params.reportId);

  res.status(200).json({
    success: true,
    report: sanitizeReport(updatedReport),
  });
}

module.exports = {
  createReportController,
  getReportController,
  listMyReportsController,
  uploadReportImageController,
  analyzeReportController,
};
