const assert = require("node:assert/strict");
const test = require("node:test");
const { createStorageKey } = require("../src/services/image/storageKeyService");

test("createStorageKey generates internal report-scoped WebP keys", () => {
  const key = createStorageKey("report-1", "standard");

  assert.match(key, /^reports\/report-1\/standard-[0-9a-f-]+\.webp$/);
  assert.equal(key.includes("my-original-file"), false);
});
