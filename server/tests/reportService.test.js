const assert = require("node:assert/strict");
const test = require("node:test");
const { REPORT_STATUSES } = require("../src/constants/reportStatuses");
const {
  createInitialTimelineEntry,
  createReport,
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
