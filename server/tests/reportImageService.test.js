const assert = require("node:assert/strict");
const test = require("node:test");
const sharp = require("sharp");
const { USER_ROLES } = require("../src/constants/userRoles");
const {
  attachImageToReport,
  buildImageMetadata,
  canAttachImage,
} = require("../src/services/image/reportImageService");

async function createImageFile() {
  const buffer = await sharp({
    create: {
      width: 240,
      height: 180,
      channels: 3,
      background: "#666666",
    },
  })
    .png()
    .toBuffer();

  return {
    buffer,
    mimetype: "image/png",
    originalname: "citizen-upload.png",
    size: buffer.length,
  };
}

test("canAttachImage allows report owners and admins only", () => {
  const report = { reporterId: "user-1" };

  assert.equal(canAttachImage({ id: "user-1", role: USER_ROLES.USER }, report), true);
  assert.equal(canAttachImage({ id: "user-2", role: USER_ROLES.USER }, report), false);
  assert.equal(canAttachImage({ id: "admin-1", role: USER_ROLES.ADMIN }, report), true);
});

test("buildImageMetadata stores URLs and metadata without binary image data", () => {
  const metadata = buildImageMetadata({
    originalFile: {
      mimetype: "image/png",
      size: 1234,
    },
    processed: {
      standard: {
        mimeType: "image/webp",
        sizeBytes: 800,
        width: 1280,
        height: 720,
      },
    },
    standardUpload: {
      secureUrl: "https://res.cloudinary.com/demo/standard.webp",
    },
    thumbnailUpload: {
      secureUrl: "https://res.cloudinary.com/demo/thumb.webp",
    },
    standardKey: "reports/report-1/standard-id.webp",
    thumbnailKey: "reports/report-1/thumbnail-id.webp",
  });

  assert.equal(metadata.standardUrl, "https://res.cloudinary.com/demo/standard.webp");
  assert.equal(metadata.thumbnailUrl, "https://res.cloudinary.com/demo/thumb.webp");
  assert.equal(metadata.originalMimeType, "image/png");
  assert.equal(metadata.data, undefined);
  assert.equal(metadata.buffer, undefined);
  assert.equal(metadata.binary, undefined);
});

test("attachImageToReport validates, processes, uploads, and saves metadata", async () => {
  const file = await createImageFile();
  const report = {
    _id: "report-1",
    reporterId: "user-1",
    category: "ROADS",
    title: "Damaged footpath",
    description: "The footpath tiles are broken near the bus stand.",
    location: {
      point: {
        type: "Point",
        coordinates: [73.8278, 15.4909],
      },
    },
    status: "SUBMITTED",
    images: [],
    async save() {
      this.saved = true;
    },
  };
  const uploadedKeys = [];
  const reportModel = {
    async findById(id) {
      assert.equal(id, "report-1");
      return report;
    },
  };

  const sanitizedReport = await attachImageToReport(
    "report-1",
    { id: "user-1", role: USER_ROLES.USER },
    file,
    {
      reportModel,
      async uploadImage(_processedImage, storageKey) {
        uploadedKeys.push(storageKey);
        return {
          secureUrl: `https://res.cloudinary.com/demo/${storageKey}`,
        };
      },
    },
  );

  assert.equal(report.saved, true);
  assert.equal(report.images.length, 1);
  assert.equal(report.images[0].mimeType, "image/webp");
  assert.equal(report.images[0].processingStatus, "PROCESSED");
  assert.equal(uploadedKeys.length, 2);
  assert.equal(sanitizedReport.images[0].buffer, undefined);
});

test("attachImageToReport rejects non-owner citizen uploads", async () => {
  const file = await createImageFile();
  const reportModel = {
    async findById() {
      return {
        _id: "report-1",
        reporterId: "user-1",
        images: [],
      };
    },
  };

  await assert.rejects(
    attachImageToReport("report-1", { id: "user-2", role: USER_ROLES.USER }, file, { reportModel }),
    (error) => error.statusCode === 403 && error.code === "REPORT_FORBIDDEN",
  );
});
