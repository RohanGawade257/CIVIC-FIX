const { updateCurrentUserProfile } = require("../services/auth/profileService");

async function getCurrentUser(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}

async function updateCurrentUser(req, res) {
  const user = await updateCurrentUserProfile(req.auth.userId, req.body);

  res.status(200).json({
    success: true,
    user,
  });
}

module.exports = {
  getCurrentUser,
  updateCurrentUser,
};
