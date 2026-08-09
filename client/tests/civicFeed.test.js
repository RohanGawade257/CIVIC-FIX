import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("feedApi exports getCivicFeed and getPublicFeed", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/services/feedApi.js"), "utf8");
  assert.ok(source.includes("getCivicFeed"), "should export getCivicFeed");
  assert.ok(source.includes("getPublicFeed"), "should export getPublicFeed");
  assert.ok(source.includes("/feed"), "should call /feed endpoint");
});

test("CivicFeedPage uses feedApi and renders feed UI", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/pages/CivicFeedPage.jsx"), "utf8");
  assert.ok(source.includes("getCivicFeed"), "should call getCivicFeed");
  assert.ok(source.includes("CivicFeed"), "should render CivicFeed heading");
  assert.ok(source.includes("geolocation"), "should use browser geolocation API");
  assert.ok(source.includes("distanceMeters"), "should display distance");
  assert.ok(source.includes("pagination"), "should handle pagination");
});

test("CivicFeed route is registered in AppRoutes", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/routes/AppRoutes.jsx"), "utf8");
  assert.ok(source.includes("CivicFeedPage"), "should import CivicFeedPage");
  assert.ok(source.includes("/feed"), "should register /feed route");
});
