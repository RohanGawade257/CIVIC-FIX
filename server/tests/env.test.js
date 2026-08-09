const assert = require("node:assert/strict");
const test = require("node:test");
const { getEnv, validateProductionEnv } = require("../src/config/env");

test("getEnv applies safe development defaults", () => {
  const config = getEnv({});

  assert.equal(config.nodeEnv, "development");
  assert.equal(config.port, 4000);
  assert.equal(config.clientUrl, "http://localhost:5173");
  assert.equal(config.storageProvider, "unselected");
});

test("getEnv parses a valid custom port", () => {
  const config = getEnv({ PORT: "5050" });

  assert.equal(config.port, 5050);
});

test("validateProductionEnv rejects missing required production values", () => {
  assert.throws(
    () => validateProductionEnv(getEnv({ NODE_ENV: "production", CLIENT_URL: "" })),
    /MONGODB_URI, AUTH_SECRET/,
  );
});
