const assert = require("node:assert/strict");
const test = require("node:test");
const { createReportSchema } = require("../src/validators/reportValidators");

test("createReportSchema accepts category, description, and issue coordinates", () => {
  const payload = createReportSchema.parse({
    category: "ROADS",
    title: "Damaged footpath",
    description: "The footpath tiles are broken near the bus stand.",
    location: {
      coordinates: [73.8278, 15.4909],
      displayAddress: "Near Panjim bus stand",
    },
  });

  assert.equal(payload.category, "ROADS");
  assert.deepEqual(payload.location.coordinates, [73.8278, 15.4909]);
});

test("createReportSchema rejects invalid issue coordinates", () => {
  assert.throws(
    () =>
      createReportSchema.parse({
        category: "ROADS",
        title: "Damaged footpath",
        description: "The footpath tiles are broken near the bus stand.",
        location: {
          coordinates: [200, 95],
        },
      }),
    /Too big/,
  );
});
