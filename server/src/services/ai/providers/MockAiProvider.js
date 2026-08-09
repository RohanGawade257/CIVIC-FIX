const CATEGORY_MAP = Object.freeze({
  ROADS: {
    category: "ROADS",
    label: "Road Damage / Pothole",
    defaultSeverity: "HIGH",
    description: "Visual analysis detects significant road surface damage and potential pothole hazards.",
  },
  STREETLIGHTS: {
    category: "STREETLIGHTS",
    label: "Streetlight Malfunction",
    defaultSeverity: "MEDIUM",
    description: "Visual analysis shows damaged or non-functional public street lighting equipment.",
  },
  GARBAGE: {
    category: "GARBAGE",
    label: "Garbage & Sanitation",
    defaultSeverity: "MEDIUM",
    description: "Visual analysis indicates an accumulation of uncollected waste or public litter.",
  },
  WATER: {
    category: "WATER",
    label: "Water Leakage / Pipe Overflow",
    defaultSeverity: "HIGH",
    description: "Visual analysis detects active water leakage or damaged water infrastructure.",
  },
  TRAFFIC: {
    category: "TRAFFIC",
    label: "Traffic Signal Infrastructure",
    defaultSeverity: "CRITICAL",
    description: "Visual analysis identifies a compromised traffic signal or missing road safety signs.",
  },
  PARKS: {
    category: "PARKS",
    label: "Public Parks & Recreation",
    defaultSeverity: "LOW",
    description: "Visual analysis indicates damaged public park facilities or hazardous public fixtures.",
  },
  OTHER: {
    category: "OTHER",
    label: "General Civic Infrastructure Issue",
    defaultSeverity: "MEDIUM",
    description: "Visual analysis indicates a legitimate public infrastructure defect needing attention.",
  },
});

class MockAiProvider {
  async analyzeImage({ category = "OTHER", imageBuffer, imageUrl } = {}) {
    const isMockInvalidImage =
      (typeof imageUrl === "string" && imageUrl.toLowerCase().includes("non-civic")) ||
      (Buffer.isBuffer(imageBuffer) && imageBuffer.toString("utf8", 0, 30).includes("NON_CIVIC_MOCK"));

    if (isMockInvalidImage) {
      return {
        predictedCategory: "NON_CIVIC",
        confidence: 0.15,
        isCivicIssue: false,
        isRelevantToCategory: false,
        mismatch: true,
        relevanceReason: "The uploaded image does not appear to depict a public infrastructure or civic issue.",
        generatedDescription: "Image contains non-civic subject matter.",
        severity: "LOW",
        severityReason: "No public infrastructure damage identified.",
        provider: "mock",
      };
    }

    const matched = CATEGORY_MAP[category] || CATEGORY_MAP.OTHER;

    return {
      predictedCategory: matched.category,
      confidence: 0.92,
      isCivicIssue: true,
      isRelevantToCategory: true,
      mismatch: false,
      relevanceReason: `Image matches reported ${matched.label} category.`,
      generatedDescription: matched.description,
      severity: matched.defaultSeverity,
      severityReason: `Estimated based on typical risk factors associated with ${matched.label}.`,
      provider: "mock",
    };
  }
}

module.exports = MockAiProvider;
