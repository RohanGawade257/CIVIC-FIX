import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("report routes are wired into the client router", () => {
  const routesSource = readFileSync(join(process.cwd(), "src", "routes", "AppRoutes.jsx"), "utf8");

  assert.match(routesSource, /path="\/reports\/new"/);
  assert.match(routesSource, /path="\/reports\/my"/);
  assert.match(routesSource, /path="\/reports\/:reportId"/);
});

test("report pages use protected auth context and report API calls", () => {
  const createPage = readFileSync(join(process.cwd(), "src", "pages", "CreateReportPage.jsx"), "utf8");
  const imageEditor = readFileSync(join(process.cwd(), "src", "features", "reports", "ImageEditor.jsx"), "utf8");
  const myReportsPage = readFileSync(join(process.cwd(), "src", "pages", "MyReportsPage.jsx"), "utf8");
  const detailPage = readFileSync(join(process.cwd(), "src", "pages", "ReportDetailPage.jsx"), "utf8");

  assert.match(createPage, /useAuth/);
  assert.match(createPage, /createReport/);
  assert.match(createPage, /uploadReportImage/);
  assert.match(createPage, /createEditedImageFile/);
  assert.match(createPage, /Issue location/);
  assert.match(createPage, /ImageEditor/);
  assert.match(imageEditor, /Issue image/);
  assert.match(imageEditor, /Crop X/);
  assert.match(imageEditor, /Rotate/);
  assert.match(myReportsPage, /getMyReports/);
  assert.match(detailPage, /getReport/);
  assert.match(detailPage, /Timeline/);
});
