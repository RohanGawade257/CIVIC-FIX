const Report = require("../../models/Report");
const { USER_ROLES } = require("../../constants/userRoles");
const ApiError = require("../../utils/ApiError");
const sanitizeReport = require("../../utils/sanitizeReport");
const { processImage } = require("./imageProcessingService");
const { validateImageUpload } = require("./imageValidationService");
const { createStorageKey } = require("./storageKeyService");
const { uploadProcessedImage } = require("./cloudinaryStorageService");

function canAttachImage(user, report) {
  return user.role === USER_ROLES.ADMIN || String(report.reporterId) === user.id;
}

function buildImageMetadata({ originalFile, processed, standardUpload, thumbnailUpload, standardKey, thumbnailKey }) {
  return {
    originalUrl: null,
    standardUrl: standardUpload.secureUrl,
    thumbnailUrl: thumbnailUpload.secureUrl,
    storageKey: standardKey,
    mimeType: processed.standard.mimeType,
    sizeBytes: processed.standard.sizeBytes,
    width: processed.standard.width,
    height: processed.standard.height,
    processingStatus: "PROCESSED",
    originalMimeType: originalFile.mimetype,
    originalSizeBytes: originalFile.size,
    thumbnailStorageKey: thumbnailKey,
  };
}

async function attachImageToReport(reportId, user, file, dependencies = {}) {
  const reportModel = dependencies.reportModel || Report;
  const report = await reportModel.findById(reportId);

  if (!report) {
    throw new ApiError(404, "Report not found.", "REPORT_NOT_FOUND");
  }

  if (!canAttachImage(user, report)) {
    throw new ApiError(403, "You do not have permission to update this report.", "REPORT_FORBIDDEN");
  }

  await validateImageUpload(file);

  const processed = await processImage(file.buffer);
  const standardKey = createStorageKey(reportId, "standard");
  const thumbnailKey = createStorageKey(reportId, "thumbnail");
  const uploadImage = dependencies.uploadImage || uploadProcessedImage;
  const standardUpload = await uploadImage(processed.standard, standardKey);
  const thumbnailUpload = await uploadImage(processed.thumbnail, thumbnailKey);
  const imageMetadata = buildImageMetadata({
    originalFile: file,
    processed,
    standardUpload,
    thumbnailUpload,
    standardKey,
    thumbnailKey,
  });

  report.images.push(imageMetadata);
  await report.save();

  return sanitizeReport(report);
}

module.exports = {
  attachImageToReport,
  buildImageMetadata,
  canAttachImage,
};
