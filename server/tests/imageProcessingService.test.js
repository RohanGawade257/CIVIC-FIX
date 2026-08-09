const assert = require("node:assert/strict");
const test = require("node:test");
const sharp = require("sharp");
const { processImage } = require("../src/services/image/imageProcessingService");

test("processImage creates compressed standard and thumbnail WebP variants", async () => {
  const source = await sharp({
    create: {
      width: 1800,
      height: 1200,
      channels: 3,
      background: "#777777",
    },
  })
    .jpeg({ quality: 95 })
    .toBuffer();

  const processed = await processImage(source);

  assert.equal(processed.standard.mimeType, "image/webp");
  assert.equal(processed.thumbnail.mimeType, "image/webp");
  assert.ok(processed.standard.width <= 1600);
  assert.ok(processed.standard.height <= 1600);
  assert.equal(processed.thumbnail.width, 360);
  assert.equal(processed.thumbnail.height, 360);
  assert.ok(processed.standard.sizeBytes > 0);
  assert.ok(processed.thumbnail.sizeBytes > 0);
});
