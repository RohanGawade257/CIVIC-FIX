const assert = require("node:assert/strict");
const test = require("node:test");
const { USER_ROLES } = require("../src/constants/userRoles");
const { authorizeRoles } = require("../src/middleware/authorizationMiddleware");

function runMiddleware(middleware, req) {
  return new Promise((resolve) => {
    middleware(req, {}, (error) => resolve(error));
  });
}

test("authorizeRoles allows a request with an allowed role", async () => {
  const middleware = authorizeRoles(USER_ROLES.ADMIN);
  const error = await runMiddleware(middleware, {
    auth: {
      role: USER_ROLES.ADMIN,
    },
  });

  assert.equal(error, undefined);
});

test("authorizeRoles rejects an authenticated request with the wrong role", async () => {
  const middleware = authorizeRoles(USER_ROLES.ADMIN);
  const error = await runMiddleware(middleware, {
    auth: {
      role: USER_ROLES.USER,
    },
  });

  assert.equal(error.statusCode, 403);
  assert.equal(error.code, "ROLE_FORBIDDEN");
});

test("authorizeRoles rejects unauthenticated requests", async () => {
  const middleware = authorizeRoles(USER_ROLES.USER);
  const error = await runMiddleware(middleware, {});

  assert.equal(error.statusCode, 401);
  assert.equal(error.code, "AUTH_REQUIRED");
});
