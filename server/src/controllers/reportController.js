const { createReport } = require("../services/report/reportService");

async function createReportController(req, res) {
  const report = await createReport(req.auth.userId, req.body);

  res.status(201).json({
    success: true,
    report,
  });
}

module.exports = {
  createReportController,
};
