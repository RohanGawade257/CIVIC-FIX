const jwt = require("jsonwebtoken");
const { env } = require("../../config/env");

const AUTH_COOKIE_NAME = "civicfix_auth";
const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 2;

function requireAuthSecret(secret = env.authSecret) {
  if (!secret || secret.startsWith("replace-with")) {
    throw new Error("Authentication secret is not configured.");
  }

  return secret;
}

function createAuthToken(user, secret = env.authSecret) {
  return jwt.sign(
    {
      role: user.role,
    },
    requireAuthSecret(secret),
    {
      expiresIn: AUTH_TOKEN_TTL_SECONDS,
      issuer: "civicfix-ai",
      subject: user.id,
    },
  );
}

function verifyAuthToken(token, secret = env.authSecret) {
  return jwt.verify(token, requireAuthSecret(secret), {
    issuer: "civicfix-ai",
  });
}

function getAuthCookieOptions(config = env) {
  return {
    httpOnly: true,
    maxAge: AUTH_TOKEN_TTL_SECONDS * 1000,
    path: "/",
    sameSite: "lax",
    secure: config.nodeEnv === "production",
  };
}

function setAuthCookie(res, token, config = env) {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions(config));
}

function clearAuthCookie(res, config = env) {
  const clearOptions = { ...getAuthCookieOptions(config) };

  delete clearOptions.maxAge;

  res.clearCookie(AUTH_COOKIE_NAME, clearOptions);
}

module.exports = {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_TTL_SECONDS,
  clearAuthCookie,
  createAuthToken,
  getAuthCookieOptions,
  requireAuthSecret,
  setAuthCookie,
  verifyAuthToken,
};
