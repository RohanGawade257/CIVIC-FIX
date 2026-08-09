const GeminiAiProvider = require("./providers/GeminiAiProvider");
const MockAiProvider = require("./providers/MockAiProvider");
const { calculatePriorityScore } = require("./priorityCalculator");
const Report = require("../../models/Report");
const { REPORT_STATUSES } = require("../../constants/reportStatuses");

function getProvider(options = {}) {
  if (options.provider) {
    return options.provider;
  }
  const gemini = new GeminiAiProvider();
  if (gemini.isConfigured()) {
    return gemini;
  }
  return new MockAiProvider();
}

async function classifyIssue(options = {}) {
  const provider = getProvider(options);
  const result = await provider.analyzeImage(options);
  return {
    category: result.predictedCategory,
    confidence: result.confidence,
    provider: result.provider,
  };
}

async function validateImage(options = {}) {
  const provider = getProvider(options);
  const result = await provider.analyzeImage(options);
  return {
    isCivicIssue: result.isCivicIssue,
    isRelevantToCategory: result.isRelevantToCategory,
    mismatch: result.mismatch,
    reason: result.relevanceReason,
    provider: result.provider,
  };
}

async function generateDescription(options = {}) {
  const provider = getProvider(options);
  const result = await provider.analyzeImage(options);
  return {
    description: result.generatedDescription,
    provider: result.provider,
  };
}

async function estimateSeverity(options = {}) {
  const provider = getProvider(options);
  const result = await provider.analyzeImage(options);
  return {
    severity: result.severity,
    reason: result.severityReason,
    provider: result.provider,
  };
}

async function detectPotentialDuplicate(options = {}) {
  const { reportId, category, coordinates, radiusMeters = 100, reportModel = Report } = options;

  if (!coordinates || coordinates.length !== 2) {
    return { isPotentialDuplicate: false, candidateCount: 0, matches: [] };
  }

  const query = {
    _id: { $ne: reportId },
    category,
    status: { $nin: [REPORT_STATUSES.RESOLVED, REPORT_STATUSES.CLOSED, REPORT_STATUSES.REJECTED] },
    "location.point": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: radiusMeters,
      },
    },
  };

  if (typeof reportModel?.find !== "function") {
    return { isPotentialDuplicate: false, candidateCount: 0, matches: [] };
  }

  const matches = await reportModel.find(query).limit(5).select("_id title category location status createdAt");
  return {
    isPotentialDuplicate: matches.length > 0,
    candidateCount: matches.length,
    matches,
  };
}

async function analyzeReportImage(reportId, options = {}) {
  const reportModel = options.reportModel || Report;
  const report = await reportModel.findById(reportId);

  if (!report) {
    throw new Error("Report not found.");
  }

  const primaryImage = report.images?.[0];
  const imageUrl = primaryImage?.standardUrl || primaryImage?.originalUrl;

  const provider = getProvider(options);
  const analysisResult = await provider.analyzeImage({
    category: report.category,
    imageBuffer: options.imageBuffer,
    imageUrl,
  });

  const duplicateCheck = await detectPotentialDuplicate({
    reportId: report._id,
    category: report.category,
    coordinates: report.location?.point?.coordinates,
    reportModel,
  });

  const calculatedPriority = calculatePriorityScore({
    severity: analysisResult.severity,
    confirmationsCount: report.confirmationsCount || 0,
    duplicateCount: duplicateCheck.candidateCount,
    createdAt: report.createdAt,
    isHighPriorityArea: options.isHighPriorityArea || false,
  });

  const aiAnalysisData = {
    predictedCategory: analysisResult.predictedCategory,
    confidence: analysisResult.confidence,
    isCivicIssue: analysisResult.isCivicIssue,
    isRelevantToCategory: analysisResult.isRelevantToCategory,
    mismatch: analysisResult.mismatch,
    relevanceReason: analysisResult.relevanceReason,
    suggestedDescription: analysisResult.generatedDescription,
    severity: analysisResult.severity,
    severityReason: analysisResult.severityReason,
    priorityScore: calculatedPriority,
    isPotentialDuplicate: duplicateCheck.isPotentialDuplicate,
    duplicateMatchesCount: duplicateCheck.candidateCount,
    analyzedAt: new Date(),
    provider: analysisResult.provider,
  };

  report.aiAnalysis = aiAnalysisData;
  report.priority = calculatedPriority;

  if (analysisResult.isCivicIssue && report.status === REPORT_STATUSES.SUBMITTED) {
    report.status = REPORT_STATUSES.AI_ANALYZED;
  }

  if (!Array.isArray(report.timeline)) {
    report.timeline = [];
  }

  report.timeline.push({
    status: report.status,
    message: `AI analysis completed (${analysisResult.provider}). Severity: ${analysisResult.severity}, Priority Score: ${calculatedPriority}.`,
    actorId: null,
    createdAt: new Date(),
  });

  await report.save();
  return report;
}

module.exports = {
  classifyIssue,
  validateImage,
  generateDescription,
  estimateSeverity,
  detectPotentialDuplicate,
  calculatePriorityScore,
  analyzeReportImage,
};
