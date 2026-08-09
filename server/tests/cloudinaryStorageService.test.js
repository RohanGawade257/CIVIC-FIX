const assert = require("node:assert/strict");
const test = require("node:test");
const {
  assertCloudinaryConfigured,
  getCloudinaryConfig,
  uploadBufferToCloudinary,
} = require("../src/services/image/cloudinaryStorageService");

test("getCloudinaryConfig maps storage env fields to Cloudinary config", () => {
  const config = getCloudinaryConfig({
    storageBucket: "demo-cloud",
    storageAccessKey: "demo-key",
    storageSecretKey: "demo-secret",
  });

  assert.deepEqual(config, {
    cloud_name: "demo-cloud",
    api_key: "demo-key",
    api_secret: "demo-secret",
  });
});

test("assertCloudinaryConfigured rejects missing provider configuration", () => {
  assert.throws(
    () =>
      assertCloudinaryConfigured({
        storageProvider: "unselected",
        storageBucket: "demo-cloud",
        storageAccessKey: "demo-key",
        storageSecretKey: "demo-secret",
      }),
    /Cloudinary storage provider/,
  );
});

test("uploadBufferToCloudinary streams buffers to Cloudinary uploader", async () => {
  let capturedOptions;
  let capturedBuffer;
  const uploader = {
    upload_stream(options, callback) {
      capturedOptions = options;

      return {
        end(buffer) {
          capturedBuffer = buffer;
          callback(null, {
            secure_url: "https://res.cloudinary.com/demo/report.webp",
            public_id: options.public_id,
          });
        },
      };
    },
  };

  const result = await uploadBufferToCloudinary(Buffer.from("image"), { public_id: "reports/1/standard" }, uploader);

  assert.deepEqual(capturedOptions, { public_id: "reports/1/standard" });
  assert.equal(capturedBuffer.toString(), "image");
  assert.equal(result.secure_url, "https://res.cloudinary.com/demo/report.webp");
});
