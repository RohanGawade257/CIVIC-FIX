const multer = require("multer");
const { MAX_IMAGE_SIZE_BYTES } = require("../constants/imagePolicy");

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1,
  },
});

module.exports = {
  uploadImage,
};
