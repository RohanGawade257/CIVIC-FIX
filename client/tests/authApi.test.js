import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateCurrentUser,
} from "../src/services/authApi.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(handler) {
  globalThis.fetch = async (url, options) => handler(url, options);
}

function jsonResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    async json() {
      return body;
    },
  };
}

test("registerUser posts credentials with cookie credentials enabled", async () => {
  mockFetch((url, options) => {
    assert.equal(url, "http://localhost:4000/api/v1/auth/register");
    assert.equal(options.method, "POST");
    assert.equal(options.credentials, "include");
    assert.deepEqual(JSON.parse(options.body), {
      name: "Asha Citizen",
      email: "asha@example.com",
      password: "correct horse battery",
    });

    return jsonResponse({ success: true, user: { id: "user-1" } }, { status: 201 });
  });

  const response = await registerUser({
    name: "Asha Citizen",
    email: "asha@example.com",
    password: "correct horse battery",
  });

  assert.equal(response.success, true);
});

test("loginUser, logoutUser, getCurrentUser, and updateCurrentUser call expected endpoints", async () => {
  const calls = [];

  mockFetch((url, options) => {
    calls.push({ url, options });
    return jsonResponse({ success: true, user: { id: "user-1" } });
  });

  await loginUser({ email: "asha@example.com", password: "correct horse battery" });
  await logoutUser();
  await getCurrentUser();
  await updateCurrentUser({ name: "Asha Updated" });

  assert.deepEqual(
    calls.map((call) => [call.options.method, call.url]),
    [
      ["POST", "http://localhost:4000/api/v1/auth/login"],
      ["POST", "http://localhost:4000/api/v1/auth/logout"],
      ["GET", "http://localhost:4000/api/v1/users/me"],
      ["PATCH", "http://localhost:4000/api/v1/users/me"],
    ],
  );
  assert.equal(calls.every((call) => call.options.credentials === "include"), true);
});

test("auth API throws predictable errors from API responses", async () => {
  mockFetch(() =>
    jsonResponse(
      {
        success: false,
        message: "Invalid email or password.",
        code: "INVALID_CREDENTIALS",
      },
      { ok: false, status: 401 },
    ),
  );

  await assert.rejects(loginUser({ email: "asha@example.com", password: "wrong password" }), (error) => {
    assert.equal(error.message, "Invalid email or password.");
    assert.equal(error.statusCode, 401);
    assert.equal(error.code, "INVALID_CREDENTIALS");
    return true;
  });
});
