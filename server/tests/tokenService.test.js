const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");
const {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  createAuthToken,
  getAuthCookieOptions,
  requireAuthSecret,
  verifyAuthToken,
} = require("../src/services/auth/tokenService");

test("createAuthToken signs a short-lived user token", () => {
  const secret = "a-secure-test-secret-with-more-than-32-chars";
  const token = createAuthToken({ id: "user-1", role: "USER" }, secret);
  const payload = jwt.verify(token, secret, { issuer: "civicfix-ai" });

  assert.equal(payload.sub, "user-1");
  assert.equal(payload.role, "USER");
  assert.equal(payload.exp - payload.iat, 7200);
});

test("verifyAuthToken accepts valid issuer-signed tokens", () => {
  const secret = "a-secure-test-secret-with-more-than-32-chars";
  const token = createAuthToken({ id: "user-1", role: "USER" }, secret);
  const payload = verifyAuthToken(token, secret);

  assert.equal(payload.sub, "user-1");
  assert.equal(payload.role, "USER");
});

test("requireAuthSecret rejects missing or placeholder secrets", () => {
  assert.throws(() => requireAuthSecret(""), /not configured/);
  assert.throws(() => requireAuthSecret("replace-with-random-auth-secret"), /not configured/);
});

test("getAuthCookieOptions uses httpOnly and production secure cookies", () => {
  const devOptions = getAuthCookieOptions({ nodeEnv: "development" });
  const prodOptions = getAuthCookieOptions({ nodeEnv: "production" });

  assert.equal(AUTH_COOKIE_NAME, "civicfix_auth");
  assert.equal(devOptions.httpOnly, true);
  assert.equal(devOptions.sameSite, "lax");
  assert.equal(devOptions.secure, false);
  assert.equal(prodOptions.sameSite, "none");
  assert.equal(prodOptions.secure, true);
});

test("clearAuthCookie clears the auth cookie with matching security options", () => {
  let clearedName;
  let clearedOptions;
  const res = {
    clearCookie(name, options) {
      clearedName = name;
      clearedOptions = options;
    },
  };

  clearAuthCookie(res, { nodeEnv: "production" });

  assert.equal(clearedName, AUTH_COOKIE_NAME);
  assert.equal(clearedOptions.httpOnly, true);
  assert.equal(clearedOptions.sameSite, "none");
  assert.equal(clearedOptions.secure, true);
  assert.equal(clearedOptions.maxAge, undefined);
});
