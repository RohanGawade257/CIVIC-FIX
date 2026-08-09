import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("auth routes are wired into the client router", () => {
  const routesSource = readFileSync(join(process.cwd(), "src", "routes", "AppRoutes.jsx"), "utf8");

  assert.match(routesSource, /path="\/login"/);
  assert.match(routesSource, /path="\/register"/);
  assert.match(routesSource, /path="\/profile"/);
});

test("auth pages use the auth context and semantic forms", () => {
  const loginPage = readFileSync(join(process.cwd(), "src", "pages", "LoginPage.jsx"), "utf8");
  const registerPage = readFileSync(join(process.cwd(), "src", "pages", "RegisterPage.jsx"), "utf8");
  const profilePage = readFileSync(join(process.cwd(), "src", "pages", "ProfilePage.jsx"), "utf8");

  assert.match(loginPage, /useAuth/);
  assert.match(registerPage, /useAuth/);
  assert.match(profilePage, /Save profile/);
  assert.match(profilePage, /Logout/);
  assert.match(profilePage, /Preferred locality/);
});

test("AuthProvider wraps the routed app", () => {
  const mainSource = readFileSync(join(process.cwd(), "src", "main.jsx"), "utf8");

  assert.match(mainSource, /<AuthProvider>/);
  assert.match(mainSource, /<AppRoutes \/>/);
});
