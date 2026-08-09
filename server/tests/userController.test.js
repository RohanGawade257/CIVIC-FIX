const assert = require("node:assert/strict");
const test = require("node:test");
const { getCurrentUser } = require("../src/controllers/userController");

test("getCurrentUser returns the authenticated sanitized user", async () => {
  let statusCode;
  let payload;
  const req = {
    user: {
      id: "user-1",
      name: "Asha Citizen",
      email: "asha@example.com",
      role: "USER",
    },
  };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
    },
  };

  await getCurrentUser(req, res);

  assert.equal(statusCode, 200);
  assert.deepEqual(payload, {
    success: true,
    user: req.user,
  });
});
