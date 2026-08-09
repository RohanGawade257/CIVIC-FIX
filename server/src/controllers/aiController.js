const { classifyIssue, validateImage, generateDescription, estimateSeverity } = require("../services/ai/aiService");

async function preCheckImageController(req, res) {
  const file = req.file;
  const category = req.body?.category || "OTHER";

  if (!file) {
    res.status(400).json({
      success: false,
      message: "No image file provided.",
      code: "MISSING_IMAGE",
    });
    return;
  }

  const [classification, validation, descriptionResult, severityResult] = await Promise.all([
    classifyIssue({ category, imageBuffer: file.buffer }),
    validateImage({ category, imageBuffer: file.buffer }),
    generateDescription({ category, imageBuffer: file.buffer }),
    estimateSeverity({ category, imageBuffer: file.buffer }),
  ]);

  res.status(200).json({
    success: true,
    aiAssist: {
      predictedCategory: classification.category,
      confidence: classification.confidence,
      isCivicIssue: validation.isCivicIssue,
      isRelevantToCategory: validation.isRelevantToCategory,
      mismatch: validation.mismatch,
      relevanceReason: validation.reason,
      suggestedDescription: descriptionResult.description,
      suggestedSeverity: severityResult.severity,
      severityReason: severityResult.reason,
      provider: classification.provider,
    },
  });
}

module.exports = {
  preCheckImageController,
};
