const assert = require("node:assert/strict");
const test = require("node:test");
const { createReportSchema } = require("../src/validators/reportValidators");
const { detectPotentialDuplicate, classifyIssue } = require("../src/services/ai/aiService");
const MockAiProvider = require("../src/services/ai/providers/MockAiProvider");
const GeminiAiProvider = require("../src/services/ai/providers/GeminiAiProvider");
const { errorHandler } = require("../src/middleware/errorMiddleware");

test("Phase 11 QA: Fake reports / invalid input prevention", () => {
  // Reject short title
  const invalidTitle = createReportSchema.safeParse({
    category: "POTHOLE",
    title: "bad",
    description: "This is a long enough description of the pothole problem.",
    location: { coordinates: [73.85, 18.52], displayAddress: "Pune" },
  });
  assert.equal(invalidTitle.success, false);

  // Reject invalid coordinates
  const invalidCoords = createReportSchema.safeParse({
    category: "POTHOLE",
    title: "Valid Title Here",
    description: "This is a long enough description of the pothole problem.",
    location: { coordinates: [200, 18.52], displayAddress: "Pune" },
  });
  assert.equal(invalidCoords.success, false);
});

test("Phase 11 QA: Duplicate reports detection logic", async () => {
  const mockReportModel = {
    find: () => ({
      limit: () => ({
        select: async () => [{ _id: "existing-1", title: "Existing Pothole" }],
      }),
    }),
  };

  const result = await detectPotentialDuplicate({
    reportId: "new-report",
    category: "POTHOLE",
    coordinates: [73.85, 18.52],
    reportModel: mockReportModel,
  });

  assert.equal(result.isPotentialDuplicate, true);
  assert.equal(result.candidateCount, 1);
});

test("Phase 11 QA: AI failure & fallback without environment API keys", async () => {
  // When GEMINI_API_KEY is not set or invalid, it gracefully falls back to MockAiProvider
  const res = await classifyIssue({});
  assert.ok(res.category);
  assert.ok(res.confidence > 0);
  assert.ok(res.provider);
  
  // MockAiProvider must return valid fallback object structure
  const mockProvider = new MockAiProvider();
  const mockRes = await mockProvider.analyzeImage({});
  assert.ok(mockRes.predictedCategory);
  assert.ok(mockRes.severity);
  assert.ok(mockRes.confidence > 0);
});

test("Phase 11 QA: Database failure handling via centralized middleware", () => {
  const dbError = new Error("MongoNetworkTimeoutError: connection timed out");
  dbError.statusCode = 500;

  const mockRes = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };

  errorHandler(dbError, {}, mockRes, () => {});

  assert.equal(mockRes.statusCode, 500);
  assert.equal(mockRes.body.success, false);
  // Ensure internal database details aren't exposed in 500 responses
  assert.equal(mockRes.body.message, "An unexpected error occurred.");
});
