const assert = require("node:assert/strict");
const test = require("node:test");
const { connectDatabase } = require("../src/config/database");

test("connectDatabase does not connect without a MongoDB URI", async () => {
  const connection = await connectDatabase("");

  assert.equal(connection, null);
});
