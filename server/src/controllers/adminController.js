const {
  listAllReportsAdmin,
  getReportDetailAdmin,
  verifyReport,
  assignReportDepartment,
  updateReportStatus,
  resolveReport,
} = require("../services/admin/adminService");

async function listReportsAdminController(req, res) {
  const result = await listAllReportsAdmin(req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
}

async function getReportAdminController(req, res) {
  const report = await getReportDetailAdmin(req.params.reportId);
  res.status(200).json({
    success: true,
    report,
  });
}

async function verifyReportAdminController(req, res) {
  const report = await verifyReport(req.params.reportId, req.user);
  res.status(200).json({
    success: true,
    report,
  });
}

async function assignDepartmentAdminController(req, res) {
  const { department } = req.body;
  if (!department) {
    res.status(400).json({ success: false, message: "Department name is required." });
    return;
  }
  const report = await assignReportDepartment(req.params.reportId, department, req.user);
  res.status(200).json({
    success: true,
    report,
  });
}

async function updateStatusAdminController(req, res) {
  const { status, message } = req.body;
  const report = await updateReportStatus(req.params.reportId, status, message, req.user);
  res.status(200).json({
    success: true,
    report,
  });
}

async function resolveReportAdminController(req, res) {
  const { resolutionNotes } = req.body;
  const report = await resolveReport(req.params.reportId, { resolutionNotes }, req.user, req.file);
  res.status(200).json({
    success: true,
    report,
  });
}

module.exports = {
  listReportsAdminController,
  getReportAdminController,
  verifyReportAdminController,
  assignDepartmentAdminController,
  updateStatusAdminController,
  resolveReportAdminController,
};
