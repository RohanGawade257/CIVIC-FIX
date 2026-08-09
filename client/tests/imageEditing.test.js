import assert from "node:assert/strict";
import test from "node:test";
import { calculateCropRect, normalizeImageEdit } from "../src/features/reports/imageEditing.js";

test("normalizeImageEdit clamps crop, zoom, rotation, and quality controls", () => {
  const edit = normalizeImageEdit({
    cropX: -20,
    cropY: 130,
    cropSize: 5,
    zoom: 8,
    rotation: 240,
    quality: 0.2,
  });

  assert.deepEqual(edit, {
    cropX: 0,
    cropY: 100,
    cropSize: 20,
    zoom: 3,
    rotation: 180,
    quality: 0.6,
  });
});

test("calculateCropRect derives a bounded crop rectangle from edit controls", () => {
  const crop = calculateCropRect(1000, 800, {
    cropX: 50,
    cropY: 50,
    cropSize: 80,
    zoom: 2,
  });

  assert.deepEqual(crop, {
    x: 340,
    y: 240,
    width: 320,
    height: 320,
  });
});
