import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createReport, getMyReports, getReport, uploadReportImage } from "../src/services/reportApi.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(handler) {
  globalThis.fetch = async (url, options) => handler(url, options);
}

function jsonResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    async json() {
      return body;
    },
  };
}

test("createReport posts report data with credentials enabled", async () => {
  mockFetch((url, options) => {
    assert.equal(url, "http://localhost:4000/api/v1/reports");
    assert.equal(options.method, "POST");
    assert.equal(options.credentials, "include");
    assert.deepEqual(JSON.parse(options.body), {
      category: "ROADS",
      title: "Damaged footpath",
      description: "The footpath tiles are broken near the bus stand.",
      location: {
        coordinates: [73.8278, 15.4909],
      },
    });

    return jsonResponse({ success: true, report: { id: "report-1" } }, { status: 201 });
  });

  const response = await createReport({
    category: "ROADS",
    title: "Damaged footpath",
    description: "The footpath tiles are broken near the bus stand.",
    location: {
      coordinates: [73.8278, 15.4909],
    },
  });

  assert.equal(response.report.id, "report-1");
});

test("getMyReports and getReport call expected report endpoints", async () => {
  const calls = [];

  mockFetch((url, options) => {
    calls.push({ url, options });
    return jsonResponse({ success: true, reports: [] });
  });

  await getMyReports();
  await getReport("report-1");

  assert.deepEqual(
    calls.map((call) => [call.options.method, call.url]),
    [
      ["GET", "http://localhost:4000/api/v1/reports/my"],
      ["GET", "http://localhost:4000/api/v1/reports/report-1"],
    ],
  );
  assert.equal(calls.every((call) => call.options.credentials === "include"), true);
});

test("uploadReportImage posts multipart form data with credentials enabled", async () => {
  mockFetch((url, options) => {
    assert.equal(url, "http://localhost:4000/api/v1/reports/report-1/images");
    assert.equal(options.method, "POST");
    assert.equal(options.credentials, "include");
    assert.ok(options.body instanceof FormData);
    assert.equal(options.headers, undefined);

    return jsonResponse({ success: true, report: { id: "report-1" } });
  });

  const response = await uploadReportImage("report-1", new Blob(["image"], { type: "image/webp" }));

  assert.equal(response.report.id, "report-1");
});
