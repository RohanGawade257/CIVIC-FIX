function sanitizeTimeline(timeline = []) {
  return timeline.map((entry) => ({
    status: entry.status,
    message: entry.message,
    createdAt: entry.createdAt,
  }));
}

function sanitizeReport(report) {
  const source = typeof report.toObject === "function" ? report.toObject() : report;

  return {
    id: String(source._id || source.id),
    _id: String(source._id || source.id), // alias — frontend uses both
    reporterId: String(source.reporterId),
    category: source.category,
    title: source.title,
    description: source.description,
    location: source.location,
    images: source.images || [],
    status: source.status,
    priority: source.priority || 0,
    aiAnalysis: source.aiAnalysis || null,
    assignedDepartment: source.assignedDepartment || null,
    resolutionEvidence: source.resolutionEvidence || null,
    citizenConfirmation: source.citizenConfirmation || null,
    feedback: source.feedback || null,
    duplicateGroupId: source.duplicateGroupId || null,
    timeline: sanitizeTimeline(source.timeline),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

module.exports = sanitizeReport;
