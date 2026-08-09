const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");
const { AUTH_COOKIE_NAME, createAuthToken } = require("../src/services/auth/tokenService");
const { createAuthenticationMiddleware } = require("../src/middleware/authMiddleware");

function runMiddleware(middleware, req) {
  return new Promise((resolve) => {
    middleware(req, {}, (error) => resolve(error));
  });
}

test("authenticateUser attaches sanitized user and auth context", async () => {
  const secret = "a-secure-test-secret-with-more-than-32-chars";
  const token = createAuthToken({ id: "user-1", role: "USER" }, secret);
  let selectedFields;
  const userModel = {
    findById(id) {
      assert.equal(id, "user-1");

      return {
        async select(fields) {
          selectedFields = fields;

          return {
            _id: "user-1",
            name: "Asha Citizen",
            email: "asha@example.com",
            role: "USER",
            passwordHash: "should-not-leak",
          };
        },
      };
    },
  };
  const middleware = createAuthenticationMiddleware({ userModel, authSecret: secret });
  const req = {
    cookies: {
      [AUTH_COOKIE_NAME]: token,
    },
  };

  const error = await runMiddleware(middleware, req);

  assert.equal(error, undefined);
  assert.equal(selectedFields, "-passwordHash");
  assert.equal(req.user.id, "user-1");
  assert.equal(req.user.passwordHash, undefined);
  assert.deepEqual(req.auth, { userId: "user-1", role: "USER" });
});

test("authenticateUser rejects requests without an auth cookie", async () => {
  const middleware = createAuthenticationMiddleware({
    userModel: {
      findById() {
        throw new Error("User lookup should not run");
      },
    },
    authSecret: "a-secure-test-secret-with-more-than-32-chars",
  });

  const error = await runMiddleware(middleware, { cookies: {} });

  assert.equal(error.statusCode, 401);
  assert.equal(error.code, "AUTH_REQUIRED");
});

test("authenticateUser rejects expired sessions", async () => {
  const secret = "a-secure-test-secret-with-more-than-32-chars";
  const token = jwt.sign({ role: "USER" }, secret, {
    expiresIn: -1,
    issuer: "civicfix-ai",
    subject: "user-1",
  });
  const middleware = createAuthenticationMiddleware({
    userModel: {
      findById() {
        throw new Error("User lookup should not run");
      },
    },
    authSecret: secret,
  });

  const error = await runMiddleware(middleware, {
    cookies: {
      [AUTH_COOKIE_NAME]: token,
    },
  });

  assert.equal(error.statusCode, 401);
  assert.equal(error.code, "AUTH_SESSION_EXPIRED");
});

test("authenticateUser rejects sessions for missing users", async () => {
  const secret = "a-secure-test-secret-with-more-than-32-chars";
  const token = createAuthToken({ id: "missing-user", role: "USER" }, secret);
  const middleware = createAuthenticationMiddleware({
    userModel: {
      async findById() {
        return null;
      },
    },
    authSecret: secret,
  });

  const error = await runMiddleware(middleware, {
    cookies: {
      [AUTH_COOKIE_NAME]: token,
    },
  });

  assert.equal(error.statusCode, 401);
  assert.equal(error.code, "INVALID_AUTH_SESSION");
});
