import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isValidGameVersion } from "../leaderboard-service.js";

const rules = await readFile(new URL("../firestore.rules", import.meta.url), "utf8");
const match = rules.match(/data\.gameVersion\.matches\('([^']+)'\)/);
assert.ok(match, "firestore.rules must validate gameVersion with matches()")
assert.match(rules, /data\.gameVersion\.size\(\) <= 32/);

const rulesPattern = new RegExp(match[1]);
const accepted = ["v001", "v008", "0.9.0", "0.9.0-alpha.1", "0.9.0-beta.1", "0.9.0-rc.1"];
const rejected = ["latest", "beta", "v0.9.0", "0.9", "v009", "01.0.0", "0.9.0-beta.01", "9".repeat(40)];

for (const value of accepted) {
  assert.equal(rulesPattern.test(value), true, `rules should accept ${value}`);
  assert.equal(isValidGameVersion(value), true, `client should accept ${value}`);
}

for (const value of rejected) {
  const rulesAccepts = value.length <= 32 && rulesPattern.test(value);
  assert.equal(rulesAccepts, false, `rules should reject ${value}`);
  assert.equal(isValidGameVersion(value), false, `client should reject ${value}`);
}

console.log("firestore-rules version tests passed");
