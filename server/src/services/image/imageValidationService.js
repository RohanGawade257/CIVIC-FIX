const path = require("node:path");
const sharp = require("sharp");
const {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_SIZE_BYTES,
  MIN_IMAGE_DIMENSION,
} = require("../../constants/imagePolicy");
const ApiError = require("../../utils/ApiError");

const FILE_SIGNATURES = Object.freeze({
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
});

function hasSignature(buffer, signature) {
  return signature.every((byte, index) => buffer[index] === byte);
}

function validateSignature(buffer, mimeType) {
  const signatures = FILE_SIGNATURES[mimeType] || [];

  if (mimeType === "image/webp") {
    return hasSignature(buffer, signatures[0]) && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }

  return signatures.some((signature) => hasSignature(buffer, signature));
}

function validateImageFileBasics(file) {
  if (!file) {
    throw new ApiError(400, "Image file is required.", "IMAGE_REQUIRED");
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    throw new ApiError(400, "Unsupported image MIME type.", "IMAGE_MIME_UNSUPPORTED");
  }

  if (!file.size || file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ApiError(400, "Image file size is invalid.", "IMAGE_SIZE_INVALID");
  }

  const extension = path.extname(file.originalname || "").toLowerCase();

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    throw new ApiError(400, "Unsupported image extension.", "IMAGE_EXTENSION_UNSUPPORTED");
  }

  if (!validateSignature(file.buffer, file.mimetype)) {
    throw new ApiError(400, "Image file signature does not match its MIME type.", "IMAGE_SIGNATURE_INVALID");
  }
}

async function validateImageDimensions(buffer) {
  let metadata;

  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    throw new ApiError(400, "Uploaded image is corrupted or unreadable.", "IMAGE_UNREADABLE");
  }

  if (!metadata.width || !metadata.height) {
    throw new ApiError(400, "Unable to determine uploaded image dimensions.", "IMAGE_DIMENSIONS_UNKNOWN");
  }

  if (
    metadata.width < MIN_IMAGE_DIMENSION
    || metadata.height < MIN_IMAGE_DIMENSION
    || metadata.width > MAX_IMAGE_DIMENSION
    || metadata.height > MAX_IMAGE_DIMENSION
  ) {
    throw new ApiError(400, "Uploaded image dimensions are outside allowed limits.", "IMAGE_DIMENSIONS_INVALID");
  }

  return metadata;
}

async function validateImageUpload(file) {
  validateImageFileBasics(file);

  return validateImageDimensions(file.buffer);
}

module.exports = {
  validateImageFileBasics,
  validateImageUpload,
};
