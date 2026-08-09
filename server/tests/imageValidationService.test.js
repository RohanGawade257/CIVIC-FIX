const assert = require("node:assert/strict");
const test = require("node:test");
const sharp = require("sharp");
const {
  validateImageFileBasics,
  validateImageUpload,
} = require("../src/services/image/imageValidationService");

async function createPngBuffer(width = 240, height = 180) {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#888888",
    },
  })
    .png()
    .toBuffer();
}

test("validateImageUpload accepts a real supported image", async () => {
  const buffer = await createPngBuffer();
  const metadata = await validateImageUpload({
    buffer,
    mimetype: "image/png",
    originalname: "issue.png",
    size: buffer.length,
  });

  assert.equal(metadata.width, 240);
  assert.equal(metadata.height, 180);
});

test("validateImageFileBasics rejects unsupported MIME types", () => {
  assert.throws(
    () =>
      validateImageFileBasics({
        buffer: Buffer.from("not an image"),
        mimetype: "text/plain",
        originalname: "issue.txt",
        size: 12,
      }),
    (error) => error.statusCode === 400 && error.code === "IMAGE_MIME_UNSUPPORTED",
  );
});

test("validateImageFileBasics rejects mismatched file signatures", () => {
  assert.throws(
    () =>
      validateImageFileBasics({
        buffer: Buffer.from("not an image"),
        mimetype: "image/png",
        originalname: "issue.png",
        size: 12,
      }),
    (error) => error.statusCode === 400 && error.code === "IMAGE_SIGNATURE_INVALID",
  );
});

test("validateImageUpload rejects images outside allowed dimensions", async () => {
  const buffer = await createPngBuffer(40, 40);

  await assert.rejects(
    validateImageUpload({
      buffer,
      mimetype: "image/png",
      originalname: "tiny.png",
      size: buffer.length,
    }),
    (error) => error.statusCode === 400 && error.code === "IMAGE_DIMENSIONS_INVALID",
  );
});
