const { getCivicFeedForUser, getPublicFeed } = require("../services/feed/civicFeedService");

async function getCivicFeedController(req, res) {
  const feed = await getCivicFeedForUser(req.auth.userId, req.query);
  res.status(200).json({
    success: true,
    ...feed,
  });
}

async function getPublicFeedController(req, res) {
  const feed = await getPublicFeed(req.query);
  res.status(200).json({
    success: true,
    ...feed,
  });
}

module.exports = {
  getCivicFeedController,
  getPublicFeedController,
};
