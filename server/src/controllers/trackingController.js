const { getNotificationsForUser, submitCitizenConfirmation } = require("../services/report/trackingService");

async function getNotificationsController(req, res) {
  const notifications = await getNotificationsForUser(req.auth.userId);
  res.status(200).json({
    success: true,
    notifications,
  });
}

async function confirmResolutionController(req, res) {
  const { confirmed, rating, reviewText } = req.body;
  const report = await submitCitizenConfirmation(req.params.reportId, req.auth.userId, {
    confirmed: Boolean(confirmed),
    rating,
    reviewText,
  });
  res.status(200).json({
    success: true,
    report,
  });
}

module.exports = {
  getNotificationsController,
  confirmResolutionController,
};
