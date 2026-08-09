const assert = require("node:assert/strict");
const test = require("node:test");
const { requireAdmin } = require("../src/middleware/adminMiddleware");
const {
  verifyReport,
  assignReportDepartment,
  updateReportStatus,
  resolveReport,
} = require("../src/services/admin/adminService");
const Report = require("../src/models/Report");

test("requireAdmin passes for ADMIN role and throws 403 for USER role", () => {
  let calledNext = false;
  requireAdmin({ user: { role: "ADMIN" } }, {}, () => {
    calledNext = true;
  });
  assert.equal(calledNext, true);

  assert.throws(
    () => {
      requireAdmin({ user: { role: "USER" } }, {}, () => {});
    },
    (err) => err.statusCode === 403 && err.code === "ADMIN_REQUIRED",
  );
});

test("verifyReport marks report as VERIFIED with timeline entry", async () => {
  const fakeReport = {
    _id: "507f191e810c19729de860eb",
    status: "AI_ANALYZED",
    timeline: [],
    async save() {},
  };

  const origFindById = Report.findById;
  Report.findById = async () => fakeReport;

  try {
    const updated = await verifyReport("507f191e810c19729de860eb", { id: "507f191e810c19729de860ea", role: "ADMIN" });
    assert.equal(updated.status, "VERIFIED");
    assert.equal(fakeReport.timeline.length, 1);
    assert.equal(fakeReport.timeline[0].status, "VERIFIED");
  } finally {
    Report.findById = origFindById;
  }
});

test("assignReportDepartment updates department and status to ASSIGNED", async () => {
  const fakeReport = {
    _id: "507f191e810c19729de860eb",
    status: "VERIFIED",
    assignedDepartment: null,
    timeline: [],
    async save() {},
  };

  const origFindById = Report.findById;
  Report.findById = async () => fakeReport;

  try {
    const updated = await assignReportDepartment(
      "507f191e810c19729de860eb",
      "Public Works Dept",
      { id: "admin1", role: "ADMIN" },
    );
    assert.equal(updated.assignedDepartment, "Public Works Dept");
    assert.equal(updated.status, "ASSIGNED");
  } finally {
    Report.findById = origFindById;
  }
});

test("updateReportStatus changes report status and appends timeline", async () => {
  const fakeReport = {
    _id: "507f191e810c19729de860eb",
    status: "ASSIGNED",
    timeline: [],
    async save() {},
  };

  const origFindById = Report.findById;
  Report.findById = async () => fakeReport;

  try {
    const updated = await updateReportStatus(
      "507f191e810c19729de860eb",
      "IN_PROGRESS",
      "Crew dispatched to site.",
      { id: "admin1", role: "ADMIN" },
    );
    assert.equal(updated.status, "IN_PROGRESS");
    assert.equal(fakeReport.timeline[0].message, "Crew dispatched to site.");
  } finally {
    Report.findById = origFindById;
  }
});

test("resolveReport sets status to CITIZEN_CONFIRMATION with resolution evidence", async () => {
  const fakeReport = {
    _id: "507f191e810c19729de860eb",
    status: "IN_PROGRESS",
    timeline: [],
    async save() {},
  };

  const origFindById = Report.findById;
  Report.findById = async () => fakeReport;

  try {
    const updated = await resolveReport(
      "507f191e810c19729de860eb",
      { resolutionNotes: "Pothole filled and paved." },
      { id: "admin1", role: "ADMIN" },
      null,
    );
    assert.equal(updated.status, "CITIZEN_CONFIRMATION");
    assert.ok(updated.resolutionEvidence);
    assert.equal(updated.resolutionEvidence.notes, "Pothole filled and paved.");
  } finally {
    Report.findById = origFindById;
  }
});
