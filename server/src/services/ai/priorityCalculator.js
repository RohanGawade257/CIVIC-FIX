const SEVERITY_WEIGHTS = Object.freeze({
  LOW: 10,
  MEDIUM: 20,
  HIGH: 30,
  CRITICAL: 40,
});

function calculateSeverityWeight(severity) {
  const normalized = String(severity).toUpperCase();
  return SEVERITY_WEIGHTS[normalized] || SEVERITY_WEIGHTS.MEDIUM;
}

function calculateCommunityWeight(confirmations = 0, duplicates = 0) {
  const total = Number(confirmations) + Number(duplicates);
  return Math.min(30, total * 5);
}

function calculateRecencyWeight(createdAt) {
  if (!createdAt) {
    return 20;
  }

  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  if (ageHours <= 24) {
    return 20;
  }
  if (ageHours <= 72) {
    return 15;
  }
  if (ageHours <= 168) {
    return 10;
  }
  return 5;
}

function calculateLocationWeight(isHighPriorityArea = false) {
  return isHighPriorityArea ? 10 : 0;
}

function calculatePriorityScore({
  severity = "MEDIUM",
  confirmationsCount = 0,
  duplicateCount = 0,
  createdAt = new Date(),
  isHighPriorityArea = false,
} = {}) {
  const S = calculateSeverityWeight(severity);
  const C = calculateCommunityWeight(confirmationsCount, duplicateCount);
  const R = calculateRecencyWeight(createdAt);
  const L = calculateLocationWeight(isHighPriorityArea);

  const total = S + C + R + L;
  return Math.min(100, Math.max(0, total));
}

module.exports = {
  SEVERITY_WEIGHTS,
  calculateSeverityWeight,
  calculateCommunityWeight,
  calculateRecencyWeight,
  calculateLocationWeight,
  calculatePriorityScore,
};
