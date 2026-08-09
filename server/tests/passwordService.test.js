const assert = require("node:assert/strict");
const test = require("node:test");
const { hashPassword, verifyPassword } = require("../src/services/auth/passwordService");

test("hashPassword stores a bcrypt hash instead of plaintext", async () => {
  const password = "correct horse battery";
  const passwordHash = await hashPassword(password);

  assert.notEqual(passwordHash, password);
  assert.match(passwordHash, /^\$2[aby]\$/);
  assert.equal(await verifyPassword(password, passwordHash), true);
  assert.equal(await verifyPassword("wrong password", passwordHash), false);
});
