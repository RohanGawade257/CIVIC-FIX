const assert = require("node:assert/strict");
const test = require("node:test");
const Report = require("../src/models/Report");
const { REPORT_CATEGORIES } = require("../src/constants/reportCategories");
const { REPORT_STATUSES } = require("../src/constants/reportStatuses");

test("Report model keeps issue location as GeoJSON and indexes it", () => {
  const indexes = Report.schema.indexes();

  assert.equal(Report.schema.path("location.point").isRequired, true);
  assert.ok(indexes.some(([fields]) => fields["location.point"] === "2dsphere"));
});

test("Report model stores image metadata only", () => {
  const imageSchemaPaths = Report.schema.path("images").schema.paths;

  assert.equal(imageSchemaPaths.originalUrl.instance, "String");
  assert.equal(imageSchemaPaths.thumbnailUrl.instance, "String");
  assert.equal(imageSchemaPaths.storageKey.instance, "String");
  assert.equal(imageSchemaPaths.thumbnailStorageKey.instance, "String");
  assert.equal(imageSchemaPaths.data, undefined);
  assert.equal(imageSchemaPaths.buffer, undefined);
  assert.equal(imageSchemaPaths.binary, undefined);
});

test("Report model defaults new reports to submitted status", () => {
  const report = new Report({
    reporterId: "64b64c9df9f1a2f4c0a00001",
    category: REPORT_CATEGORIES.ROADS,
    title: "Broken road drain",
    description: "The roadside drain cover is broken and dangerous.",
    location: {
      point: {
        type: "Point",
        coordinates: [73.8278, 15.4909],
      },
    },
  });

  assert.equal(report.status, REPORT_STATUSES.SUBMITTED);
  assert.deepEqual(report.location.point.coordinates, [73.8278, 15.4909]);
});
