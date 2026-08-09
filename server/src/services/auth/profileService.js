const User = require("../../models/User");
const ApiError = require("../../utils/ApiError");
const sanitizeUser = require("../../utils/sanitizeUser");
const { updateProfileSchema } = require("../../validators/userValidators");

function mapPreferredLocation(input) {
  if (input === null) {
    return null;
  }

  const preferredLocation = {};

  if (input.locality !== undefined) {
    preferredLocation.locality = input.locality;
  }

  if (input.coordinates !== undefined) {
    preferredLocation.point = {
      type: "Point",
      coordinates: input.coordinates,
    };
  }

  return preferredLocation;
}

function buildProfileUpdate(data) {
  const update = {};

  if (data.name !== undefined) {
    update.name = data.name;
  }

  if (data.preferredLocation !== undefined) {
    update.preferredLocation = mapPreferredLocation(data.preferredLocation);
  }

  if (data.notificationPreferences !== undefined) {
    update.notificationPreferences = data.notificationPreferences;
  }

  return update;
}

async function updateCurrentUserProfile(userId, input, dependencies = {}) {
  const userModel = dependencies.userModel || User;
  const data = updateProfileSchema.parse(input);
  const user = await userModel.findByIdAndUpdate(userId, buildProfileUpdate(data), {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, "User profile not found.", "USER_NOT_FOUND");
  }

  return sanitizeUser(user);
}

module.exports = {
  buildProfileUpdate,
  mapPreferredLocation,
  updateCurrentUserProfile,
};
