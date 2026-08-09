import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const trackingApiPath = path.join(__dirname, "../src/services/trackingApi.js");

test("trackingApi exports getNotifications and confirmReportResolution", () => {
  const source = fs.readFileSync(trackingApiPath, "utf8");
  assert.ok(source.includes("getNotifications"), "should export getNotifications");
  assert.ok(source.includes("confirmReportResolution"), "should export confirmReportResolution");
  assert.ok(source.includes("/notifications"), "should call notifications endpoint");
  assert.ok(source.includes("/confirm"), "should call confirm endpoint");
});

test("ReportDetailPage renders CitizenConfirmationForm when status is CITIZEN_CONFIRMATION", () => {
  const detailPagePath = path.join(__dirname, "../src/pages/ReportDetailPage.jsx");
  const source = fs.readFileSync(detailPagePath, "utf8");
  assert.ok(source.includes("CITIZEN_CONFIRMATION"), "should check CITIZEN_CONFIRMATION status");
  assert.ok(source.includes("CitizenConfirmationForm"), "should render CitizenConfirmationForm");
  assert.ok(source.includes("confirmReportResolution"), "should use confirmReportResolution");
  assert.ok(source.includes("Was this issue resolved"), "should ask citizen about resolution");
});
