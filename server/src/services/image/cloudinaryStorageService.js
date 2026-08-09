const { v2: cloudinary } = require("cloudinary");
const { env } = require("../../config/env");

function getCloudinaryConfig(config = env) {
  return {
    cloud_name: config.storageBucket,
    api_key: config.storageAccessKey,
    api_secret: config.storageSecretKey,
  };
}

function assertCloudinaryConfigured(config = env) {
  if (config.storageProvider !== "cloudinary") {
    throw new Error("Cloudinary storage provider is not configured.");
  }

  if (!config.storageBucket || !config.storageAccessKey || !config.storageSecretKey) {
    throw new Error("Cloudinary credentials are not configured.");
  }
}

function uploadBufferToCloudinary(buffer, options, uploader = cloudinary.uploader) {
  return new Promise((resolve, reject) => {
    const stream = uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}

async function uploadProcessedImage(processedImage, storageKey, dependencies = {}) {
  const config = dependencies.config || env;
  const uploader = dependencies.uploader || cloudinary.uploader;

  assertCloudinaryConfigured(config);
  cloudinary.config(getCloudinaryConfig(config));

  const result = await uploadBufferToCloudinary(
    processedImage.buffer,
    {
      public_id: storageKey.replace(/\.webp$/, ""),
      resource_type: "image",
      format: "webp",
      overwrite: false,
    },
    uploader,
  );

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

module.exports = {
  assertCloudinaryConfigured,
  getCloudinaryConfig,
  uploadBufferToCloudinary,
  uploadProcessedImage,
};
