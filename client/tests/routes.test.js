import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("client route scaffold includes home and fallback routes", () => {
  const routesSource = readFileSync(join(process.cwd(), "src", "routes", "AppRoutes.jsx"), "utf8");

  assert.match(routesSource, /path="\/"/);
  assert.match(routesSource, /path="\*"/);
});
