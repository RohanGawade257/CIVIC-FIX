const mongoose = require("mongoose");
const { REPORT_CATEGORIES } = require("../constants/reportCategories");
const { REPORT_STATUSES } = require("../constants/reportStatuses");

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
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
        message: "Issue location must contain valid longitude and latitude.",
      },
    },
  },
  { _id: false },
);

const reportLocationSchema = new mongoose.Schema(
  {
    point: {
      type: pointSchema,
      required: true,
    },
    displayAddress: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { _id: false },
);

const imageMetadataSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    standardUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    storageKey: {
      type: String,
      trim: true,
      maxlength: 512,
    },
    mimeType: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    sizeBytes: {
      type: Number,
      min: 0,
    },
    width: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    processingStatus: {
      type: String,
      enum: ["PENDING", "PROCESSED", "FAILED"],
      default: "PENDING",
    },
    originalMimeType: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    originalSizeBytes: {
      type: Number,
      min: 0,
    },
    thumbnailStorageKey: {
      type: String,
      trim: true,
      maxlength: 512,
    },
  },
  { _id: false },
);

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(REPORT_STATUSES),
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(REPORT_CATEGORIES),
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    location: {
      type: reportLocationSchema,
      required: true,
    },
    images: {
      type: [imageMetadataSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUSES),
      default: REPORT_STATUSES.SUBMITTED,
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    assignedDepartment: {
      type: String,
      default: null,
      trim: true,
      maxlength: 120,
    },
    timeline: {
      type: [timelineEntrySchema],
      default: [],
    },
    duplicateGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    resolutionEvidence: {
      type: imageMetadataSchema,
      default: null,
    },
    citizenConfirmation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    feedback: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index({ "location.point": "2dsphere" });
reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);
