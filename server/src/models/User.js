const mongoose = require("mongoose");
const { USER_ROLES } = require("../constants/userRoles");

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      validate: {
        validator(value) {
          return (
            value.length === 2
            && value[0] >= -180
            && value[0] <= 180
            && value[1] >= -90
            && value[1] <= 90
          );
        },
        message: "Preferred location coordinates must contain valid longitude and latitude.",
      },
    },
  },
  { _id: false },
);

const preferredLocationSchema = new mongoose.Schema(
  {
    locality: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    point: pointSchema,
  },
  { _id: false },
);

const notificationPreferencesSchema = new mongoose.Schema(
  {
    statusUpdates: {
      type: Boolean,
      default: true,
    },
    resolutionRequests: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 254,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
      index: true,
    },
    preferredLocation: {
      type: preferredLocationSchema,
      default: null,
    },
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ "preferredLocation.point": "2dsphere" });

module.exports = mongoose.model("User", userSchema);
