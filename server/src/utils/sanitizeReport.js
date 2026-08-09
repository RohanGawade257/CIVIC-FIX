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
    timeline: sanitizeTimeline(source.timeline),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

module.exports = sanitizeReport;
