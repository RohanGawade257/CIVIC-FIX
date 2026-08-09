const MockAiProvider = require("./MockAiProvider");

class GeminiAiProvider {
  constructor(apiKey = process.env.AI_API_KEY) {
    this.apiKey = apiKey;
    this.fallbackMock = new MockAiProvider();
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey !== "replace-with-ai-provider-key" && !this.apiKey.includes("placeholder"));
  }

  async analyzeImage(options = {}) {
    if (!this.isConfigured()) {
      return this.fallbackMock.analyzeImage(options);
    }

    try {
      const { category = "OTHER", imageBuffer, imageUrl } = options;
      let base64Data = "";
      let mimeType = "image/jpeg";

      if (Buffer.isBuffer(imageBuffer)) {
        base64Data = imageBuffer.toString("base64");
      } else if (imageUrl && typeof fetch === "function") {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString("base64");
        mimeType = response.headers.get("content-type") || "image/jpeg";
      } else {
        return this.fallbackMock.analyzeImage(options);
      }

      const prompt = `Analyze this civic issue report photo for category: "${category}".
Return a raw JSON object only with these exact keys:
{
  "predictedCategory": "ROADS" | "STREETLIGHTS" | "GARBAGE" | "WATER" | "TRAFFIC" | "PARKS" | "OTHER" | "NON_CIVIC",
  "confidence": number between 0.0 and 1.0,
  "isCivicIssue": boolean,
  "isRelevantToCategory": boolean,
  "mismatch": boolean,
  "relevanceReason": string explanation,
  "generatedDescription": concise 1-2 sentence description of the complaint,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "severityReason": string explanation
}`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2,
        },
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return this.fallbackMock.analyzeImage(options);
      }

      const jsonResult = await res.json();
      const textResponse = jsonResult?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        return this.fallbackMock.analyzeImage(options);
      }

      const parsed = JSON.parse(textResponse);
      return {
        ...parsed,
        provider: "gemini",
      };
    } catch {
      return this.fallbackMock.analyzeImage(options);
    }
  }
}

module.exports = GeminiAiProvider;
