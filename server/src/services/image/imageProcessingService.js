const sharp = require("sharp");
const {
  STANDARD_IMAGE_MAX_DIMENSION,
  THUMBNAIL_IMAGE_MAX_DIMENSION,
} = require("../../constants/imagePolicy");

async function processImage(buffer) {
  const standardBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: STANDARD_IMAGE_MAX_DIMENSION,
      height: STANDARD_IMAGE_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const thumbnailBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: THUMBNAIL_IMAGE_MAX_DIMENSION,
      height: THUMBNAIL_IMAGE_MAX_DIMENSION,
      fit: "cover",
    })
    .webp({ quality: 74 })
    .toBuffer();

  const standardMetadata = await sharp(standardBuffer).metadata();
  const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();

  return {
    standard: {
      buffer: standardBuffer,
      width: standardMetadata.width,
      height: standardMetadata.height,
      mimeType: "image/webp",
      sizeBytes: standardBuffer.length,
    },
    thumbnail: {
      buffer: thumbnailBuffer,
      width: thumbnailMetadata.width,
      height: thumbnailMetadata.height,
      mimeType: "image/webp",
      sizeBytes: thumbnailBuffer.length,
    },
  };
}

module.exports = {
  processImage,
};
