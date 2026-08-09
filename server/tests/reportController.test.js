const assert = require("node:assert/strict");
const test = require("node:test");
const reportController = require("../src/controllers/reportController");

test("reportController exposes createReportController", () => {
  assert.equal(typeof reportController.createReportController, "function");
  assert.equal(typeof reportController.getReportController, "function");
  assert.equal(typeof reportController.listMyReportsController, "function");
  assert.equal(typeof reportController.uploadReportImageController, "function");
});
