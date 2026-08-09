const assert = require("node:assert/strict");
const test = require("node:test");
const {
  buildProfileUpdate,
  mapPreferredLocation,
  updateCurrentUserProfile,
} = require("../src/services/auth/profileService");

test("mapPreferredLocation keeps user location separate as GeoJSON point data", () => {
  const preferredLocation = mapPreferredLocation({
    locality: "Panjim",
    coordinates: [73.8278, 15.4909],
  });

  assert.deepEqual(preferredLocation, {
    locality: "Panjim",
    point: {
      type: "Point",
      coordinates: [73.8278, 15.4909],
    },
  });
});

test("buildProfileUpdate ignores role and email fields", () => {
  const update = buildProfileUpdate({
    name: "Asha Citizen",
    preferredLocation: null,
    notificationPreferences: {
      statusUpdates: false,
    },
    role: "ADMIN",
    email: "other@example.com",
  });

  assert.deepEqual(update, {
    name: "Asha Citizen",
    preferredLocation: null,
    notificationPreferences: {
      statusUpdates: false,
    },
  });
});

test("updateCurrentUserProfile updates safe self-owned profile fields", async () => {
  let capturedId;
  let capturedUpdate;
  let capturedOptions;
  const userModel = {
    async findByIdAndUpdate(id, update, options) {
      capturedId = id;
      capturedUpdate = update;
      capturedOptions = options;

      return {
        _id: id,
        name: update.name,
        email: "asha@example.com",
        role: "USER",
        preferredLocation: update.preferredLocation,
        notificationPreferences: update.notificationPreferences,
      };
    },
  };

  const user = await updateCurrentUserProfile(
    "user-1",
    {
      name: "Asha Citizen",
      preferredLocation: {
        locality: "Panjim",
        coordinates: [73.8278, 15.4909],
      },
      notificationPreferences: {
        statusUpdates: false,
        resolutionRequests: true,
      },
    },
    { userModel },
  );

  assert.equal(capturedId, "user-1");
  assert.equal(capturedOptions.new, true);
  assert.equal(capturedOptions.runValidators, true);
  assert.deepEqual(capturedUpdate.preferredLocation.point.coordinates, [73.8278, 15.4909]);
  assert.equal(user.passwordHash, undefined);
});

test("updateCurrentUserProfile validates coordinate ranges", async () => {
  await assert.rejects(
    updateCurrentUserProfile(
      "user-1",
      {
        preferredLocation: {
          coordinates: [220, 95],
        },
      },
      {
        userModel: {
          findByIdAndUpdate() {
            throw new Error("Database update should not run");
          },
        },
      },
    ),
    /Too big/,
  );
});
