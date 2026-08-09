import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("Tailwind is wired through the Vite CSS entry", () => {
  const viteConfig = readFileSync(join(process.cwd(), "vite.config.js"), "utf8");
  const styles = readFileSync(join(process.cwd(), "src", "styles.css"), "utf8");
  const main = readFileSync(join(process.cwd(), "src", "main.jsx"), "utf8");

  assert.match(viteConfig, /@tailwindcss\/vite/);
  assert.match(styles, /@import "tailwindcss"/);
  assert.match(main, /import "\.\/styles\.css"/);
});
