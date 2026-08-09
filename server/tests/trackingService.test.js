const assert = require("node:assert/strict");
const test = require("node:test");

const { REPORT_STATUSES } = require("../src/constants/reportStatuses");
const { submitCitizenConfirmation } = require("../src/services/report/trackingService");

function makeMockReport(overrides = {}) {
  const report = {
    _id: "report-1",
    reporterId: "user-1",
    status: REPORT_STATUSES.CITIZEN_CONFIRMATION,
    timeline: [],
    citizenConfirmation: null,
    feedback: null,
    saved: false,
    toObject() {
      return {
        ...report,
        _id: "report-1",
      };
    },
    async save() {
      report.saved = true;
    },
    ...overrides,
  };
  return report;
}

const originalFindById = require("../src/models/Report").findById;

async function withMockFindById(mockReport, fn) {
  const Report = require("../src/models/Report");
  const original = Report.findById;
  Report.findById = async () => mockReport;
  try {
    return await fn();
  } finally {
    Report.findById = original;
  }
}

test("submitCitizenConfirmation closes the report when citizen confirms", async () => {
  const mockReport = makeMockReport();

  await withMockFindById(mockReport, async () => {
    const result = await submitCitizenConfirmation("report-1", "user-1", {
      confirmed: true,
      rating: 4,
      reviewText: "Great job!",
    });

    assert.equal(result.status, REPORT_STATUSES.CLOSED);
    assert.ok(result.feedback);
    assert.equal(result.feedback.rating, 4);
    assert.equal(result.feedback.reviewText, "Great job!");
    assert.ok(result.citizenConfirmation.confirmed);
    assert.ok(mockReport.saved);
  });
});

test("submitCitizenConfirmation reopens the report when citizen disputes", async () => {
  const mockReport = makeMockReport();

  await withMockFindById(mockReport, async () => {
    const result = await submitCitizenConfirmation("report-1", "user-1", {
      confirmed: false,
      rating: null,
      reviewText: null,
    });

    assert.equal(result.status, REPORT_STATUSES.REOPENED);
    assert.equal(result.citizenConfirmation.confirmed, false);
    assert.ok(mockReport.saved);
  });
});

test("submitCitizenConfirmation throws 403 for non-owners", async () => {
  const mockReport = makeMockReport({ reporterId: "other-user" });

  await withMockFindById(mockReport, async () => {
    await assert.rejects(
      () =>
        submitCitizenConfirmation("report-1", "user-1", {
          confirmed: true,
          rating: 5,
          reviewText: null,
        }),
      (err) => {
        assert.equal(err.statusCode, 403);
        return true;
      },
    );
  });
});

test("submitCitizenConfirmation throws 400 for wrong report status", async () => {
  const mockReport = makeMockReport({ status: REPORT_STATUSES.IN_PROGRESS });

  await withMockFindById(mockReport, async () => {
    await assert.rejects(
      () =>
        submitCitizenConfirmation("report-1", "user-1", {
          confirmed: true,
          rating: 5,
          reviewText: null,
        }),
      (err) => {
        assert.equal(err.statusCode, 400);
        return true;
      },
    );
  });
});
