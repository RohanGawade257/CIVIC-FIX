const assert = require("node:assert/strict");
const test = require("node:test");
const { USER_ROLES } = require("../src/constants/userRoles");
const { REPORT_STATUSES } = require("../src/constants/reportStatuses");
const {
  canViewReport,
  createInitialTimelineEntry,
  createReport,
  getReportByIdForUser,
  listReportsForUser,
  mapIssueLocation,
} = require("../src/services/report/reportService");

test("mapIssueLocation maps submitted coordinates to issue GeoJSON", () => {
  const location = mapIssueLocation({
    coordinates: [73.8278, 15.4909],
    displayAddress: "Near Panjim bus stand",
  });

  assert.deepEqual(location, {
    point: {
      type: "Point",
      coordinates: [73.8278, 15.4909],
    },
    displayAddress: "Near Panjim bus stand",
  });
});

test("createInitialTimelineEntry records citizen submission", () => {
  const entry = createInitialTimelineEntry("user-1");

  assert.equal(entry.status, REPORT_STATUSES.SUBMITTED);
  assert.equal(entry.actorId, "user-1");
});

test("createReport creates a submitted report owned by the authenticated user", async () => {
  let createdRecord;
  const reportModel = {
    async create(record) {
      createdRecord = record;

      return {
        _id: "report-1",
        ...record,
        priority: 0,
        images: [],
        createdAt: new Date("2026-08-09T00:00:00.000Z"),
        updatedAt: new Date("2026-08-09T00:00:00.000Z"),
      };
    },
  };

  const report = await createReport(
    "user-1",
    {
      category: "ROADS",
      title: "Damaged footpath",
      description: "The footpath tiles are broken near the bus stand.",
      location: {
        coordinates: [73.8278, 15.4909],
        displayAddress: "Near Panjim bus stand",
      },
    },
    { reportModel },
  );

  assert.equal(createdRecord.reporterId, "user-1");
  assert.equal(createdRecord.status, REPORT_STATUSES.SUBMITTED);
  assert.deepEqual(createdRecord.location.point.coordinates, [73.8278, 15.4909]);
  assert.equal(report.id, "report-1");
  assert.equal(report.reporterId, "user-1");
  assert.equal(report.status, REPORT_STATUSES.SUBMITTED);
});

test("canViewReport allows owners and admins only", () => {
  const report = { reporterId: "user-1" };

  assert.equal(canViewReport({ id: "user-1", role: USER_ROLES.USER }, report), true);
  assert.equal(canViewReport({ id: "user-2", role: USER_ROLES.USER }, report), false);
  assert.equal(canViewReport({ id: "admin-1", role: USER_ROLES.ADMIN }, report), true);
});

test("getReportByIdForUser returns owned reports", async () => {
  const reportModel = {
    async findById(id) {
      return {
        _id: id,
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
        status: REPORT_STATUSES.SUBMITTED,
      };
    },
  };

  const report = await getReportByIdForUser("report-1", { id: "user-1", role: USER_ROLES.USER }, { reportModel });

  assert.equal(report.id, "report-1");
  assert.equal(report.reporterId, "user-1");
});

test("getReportByIdForUser rejects IDOR access to another citizen's report", async () => {
  const reportModel = {
    async findById() {
      return {
        _id: "report-1",
        reporterId: "user-1",
        status: REPORT_STATUSES.SUBMITTED,
      };
    },
  };

  await assert.rejects(
    getReportByIdForUser("report-1", { id: "user-2", role: USER_ROLES.USER }, { reportModel }),
    (error) => error.statusCode === 403 && error.code === "REPORT_FORBIDDEN",
  );
});

test("getReportByIdForUser returns not found for missing reports", async () => {
  const reportModel = {
    async findById() {
      return null;
    },
  };

  await assert.rejects(
    getReportByIdForUser("missing-report", { id: "user-1", role: USER_ROLES.USER }, { reportModel }),
    (error) => error.statusCode === 404 && error.code === "REPORT_NOT_FOUND",
  );
});

test("listReportsForUser queries only the authenticated user's reports", async () => {
  let capturedQuery;
  let capturedSort;
  let capturedLimit;
  const reportModel = {
    find(query) {
      capturedQuery = query;

      return {
        sort(sort) {
          capturedSort = sort;
          return this;
        },
        async limit(limit) {
          capturedLimit = limit;
          return [
            {
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
              status: REPORT_STATUSES.SUBMITTED,
            },
          ];
        },
      };
    },
  };

  const reports = await listReportsForUser("user-1", { reportModel });

  assert.deepEqual(capturedQuery, { reporterId: "user-1" });
  assert.deepEqual(capturedSort, { createdAt: -1 });
  assert.equal(capturedLimit, 50);
  assert.equal(reports.length, 1);
});
