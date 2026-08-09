import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { listReportsAdmin, verifyReportAdmin } from "../src/services/adminApi.js";

test("admin API endpoints make authenticated requests to /admin/reports", async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({
        success: true,
        reports: [],
        pagination: { page: 1, total: 0 },
      }),
    };
  };

  await listReportsAdmin({ status: "SUBMITTED" });
  await verifyReportAdmin("report123");

  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/admin\/reports\?status=SUBMITTED$/);
  assert.match(calls[1].url, /\/admin\/reports\/report123\/verify$/);
  assert.equal(calls[1].options.method, "PATCH");
});

test("admin route is registered and AdminDashboardPage enforces admin authorization", () => {
  const routesSource = readFileSync(join(process.cwd(), "src", "routes", "AppRoutes.jsx"), "utf8");
  const dashboardSource = readFileSync(join(process.cwd(), "src", "pages", "AdminDashboardPage.jsx"), "utf8");

  assert.match(routesSource, /path="\/admin"/);
  assert.match(dashboardSource, /user.role !== "ADMIN"/);
  assert.match(dashboardSource, /Access Denied/);
  assert.match(dashboardSource, /verifyReportAdmin/);
  assert.match(dashboardSource, /assignDepartmentAdmin/);
  assert.match(dashboardSource, /resolveReportAdmin/);
});
