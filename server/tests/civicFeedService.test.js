const assert = require("node:assert/strict");
const test = require("node:test");

const {
  parseRadiusKm,
  parsePagination,
  DEFAULT_RADIUS_KM,
  MAX_RADIUS_KM,
} = require("../src/services/feed/civicFeedService");

test("parseRadiusKm clamps to defaults and max", () => {
  assert.equal(parseRadiusKm(undefined), DEFAULT_RADIUS_KM);
  assert.equal(parseRadiusKm("abc"), DEFAULT_RADIUS_KM);
  assert.equal(parseRadiusKm(-5), DEFAULT_RADIUS_KM);
  assert.equal(parseRadiusKm(0), DEFAULT_RADIUS_KM);
  assert.equal(parseRadiusKm(10), 10);
  assert.equal(parseRadiusKm(100), MAX_RADIUS_KM);
});

test("parsePagination extracts page, limit, and skip", () => {
  const result = parsePagination(2, 10);
  assert.equal(result.page, 2);
  assert.equal(result.limit, 10);
  assert.equal(result.skip, 10);
});

test("parsePagination clamps negative and excessive values", () => {
  const result1 = parsePagination(-1, 200);
  assert.equal(result1.page, 1);
  assert.equal(result1.limit, 50);
  assert.equal(result1.skip, 0);

  const result2 = parsePagination(undefined, undefined);
  assert.equal(result2.page, 1);
  assert.equal(result2.limit, 20);
});

test("getCivicFeedForUser returns empty for user without preferred location", async () => {
  const { getCivicFeedForUser } = require("../src/services/feed/civicFeedService");
  const User = require("../src/models/User");

  const originalFindById = User.findById;
  User.findById = () => ({
    select: () => ({
      lean: async () => ({ preferredLocation: null }),
    }),
  });

  try {
    const result = await getCivicFeedForUser("user-1", {});
    assert.deepEqual(result.reports, []);
    assert.ok(result.message);
  } finally {
    User.findById = originalFindById;
  }
});

test("getPublicFeed returns empty for invalid coordinates", async () => {
  const { getPublicFeed } = require("../src/services/feed/civicFeedService");

  const result = await getPublicFeed({ longitude: "abc", latitude: "xyz" });
  assert.deepEqual(result.reports, []);
  assert.ok(result.message);
});
