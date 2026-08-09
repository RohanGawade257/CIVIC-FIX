import assert from "node:assert/strict";
import test from "node:test";
import { preCheckImageAi } from "../src/services/aiApi.js";

test("preCheckImageAi sends multipart form data with credentials enabled", async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({
        success: true,
        aiAssist: {
          predictedCategory: "ROADS",
          confidence: 0.9,
          suggestedSeverity: "HIGH",
        },
      }),
    };
  };

  const fakeFile = new Blob(["test"], { type: "image/png" });
  const result = await preCheckImageAi(fakeFile, "ROADS");

  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/ai\/pre-check$/);
  assert.equal(calls[0].options.credentials, "include");
  assert.equal(result.aiAssist.predictedCategory, "ROADS");
});
