const assert = require("node:assert/strict");
const test = require("node:test");
const {
  classifyIssue,
  validateImage,
  generateDescription,
  estimateSeverity,
  calculatePriorityScore,
  detectPotentialDuplicate,
  analyzeReportImage,
} = require("../src/services/ai/aiService");
const MockAiProvider = require("../src/services/ai/providers/MockAiProvider");

test("classifyIssue returns predicted category and confidence score", async () => {
  const provider = new MockAiProvider();
  const result = await classifyIssue({ category: "ROADS", provider });

  assert.equal(result.category, "ROADS");
  assert.equal(typeof result.confidence, "number");
  assert.ok(result.confidence > 0.5);
});

test("validateImage returns relevance and mismatch flags", async () => {
  const provider = new MockAiProvider();
  const valid = await validateImage({ category: "GARBAGE", provider });
  assert.equal(valid.isCivicIssue, true);
  assert.equal(valid.mismatch, false);

  const invalid = await validateImage({
    category: "GARBAGE",
    imageBuffer: Buffer.from("NON_CIVIC_MOCK_IMAGE_DATA"),
    provider,
  });
  assert.equal(invalid.isCivicIssue, false);
  assert.equal(invalid.mismatch, true);
});

test("generateDescription produces complaint text", async () => {
  const provider = new MockAiProvider();
  const res = await generateDescription({ category: "STREETLIGHTS", provider });
  assert.ok(res.description.length > 10);
});

test("estimateSeverity produces severity rating and reasoning", async () => {
  const provider = new MockAiProvider();
  const res = await estimateSeverity({ category: "TRAFFIC", provider });
  assert.equal(res.severity, "CRITICAL");
  assert.ok(res.reason.length > 5);
});

test("calculatePriorityScore combines S(40) + C(30) + R(20) + L(10)", () => {
  const score1 = calculatePriorityScore({
    severity: "CRITICAL",
    confirmationsCount: 5,
    duplicateCount: 2,
    createdAt: new Date(),
    isHighPriorityArea: true,
  });
  // S=40, C=min(30, (5+2)*5)=30, R=20, L=10 -> Total = 100
  assert.equal(score1, 100);

  const score2 = calculatePriorityScore({
    severity: "LOW",
    confirmationsCount: 0,
    duplicateCount: 0,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days old
    isHighPriorityArea: false,
  });
  // S=10, C=0, R=5, L=0 -> Total = 15
  assert.equal(score2, 15);
});

test("detectPotentialDuplicate queries nearby unresolved reports", async () => {
  const mockMatches = [
    { _id: "507f191e810c19729de860ea", title: "Existing pothole" },
  ];
  const mockReportModel = {
    find() {
      return {
        limit() {
          return {
            select() {
              return mockMatches;
            },
          };
        },
      };
    },
  };

  const result = await detectPotentialDuplicate({
    reportId: "507f191e810c19729de860eb",
    category: "ROADS",
    coordinates: [77.5946, 12.9716],
    reportModel: mockReportModel,
  });

  assert.equal(result.isPotentialDuplicate, true);
  assert.equal(result.candidateCount, 1);
});

test("analyzeReportImage updates report model with AI analysis and priority score", async () => {
  const fakeReport = {
    _id: "507f191e810c19729de860eb",
    category: "ROADS",
    status: "SUBMITTED",
    createdAt: new Date(),
    location: { point: { coordinates: [77.5946, 12.9716] } },
    images: [{ standardUrl: "https://example.com/pothole.webp" }],
    timeline: [],
    saveCalls: 0,
    async save() {
      this.saveCalls += 1;
    },
  };

  const mockReportModel = {
    async findById() {
      return fakeReport;
    },
    find() {
      return {
        limit() {
          return {
            select() {
              return [];
            },
          };
        },
      };
    },
  };

  const updated = await analyzeReportImage(fakeReport._id, {
    reportModel: mockReportModel,
    provider: new MockAiProvider(),
  });

  assert.ok(updated.aiAnalysis);
  assert.equal(updated.aiAnalysis.predictedCategory, "ROADS");
  assert.equal(updated.aiAnalysis.severity, "HIGH");
  assert.ok(updated.priority > 0);
  assert.equal(updated.status, "AI_ANALYZED");
  assert.equal(fakeReport.saveCalls, 1);
});
