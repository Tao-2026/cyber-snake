import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  APP_VERSION,
  CHANGELOG_URL,
  RELEASE_CHANNEL,
  RELEASE_DATE,
  RELEASE_URL,
  UPDATE_URL,
  getVersionPresentation
} from "../version.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => readFile(path.join(root, file), "utf8");
const [packageText, versionSource, changelog, gameSource, indexSource, stylesSource] = await Promise.all([
  read("package.json"), read("version.js"), read("CHANGELOG.md"), read("game.js"), read("index.html"), read("styles.css")
]);
const packageData = JSON.parse(packageText);
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc)\.(0|[1-9]\d*))?$/;
const releaseTag = `v${APP_VERSION}`;
const failures = [];

function check(label, action) {
  try { action(); console.log(`PASS ${label}`); }
  catch (error) { failures.push(`${label}: ${error.message}`); console.error(`FAIL ${label}: ${error.message}`); }
}

check("package.json and version.js match", () => assert.equal(packageData.version, APP_VERSION));
check("version is valid Semantic Versioning", () => assert.match(APP_VERSION, semver));
check("CHANGELOG contains Unreleased and current prerelease", () => {
  assert.match(changelog, /## \[Unreleased\]/);
  assert.ok(changelog.includes(`\`${APP_VERSION}\``));
});
check("Release URL tag matches current version", () => assert.ok(RELEASE_URL.endsWith(`/tag/${releaseTag}`)));
check("product update URL matches release state", () => {
  assert.equal(CHANGELOG_URL, "https://github.com/Tao-2026/cyber-snake/blob/main/CHANGELOG.md");
  assert.equal(UPDATE_URL, RELEASE_DATE ? RELEASE_URL : CHANGELOG_URL);
});
check("UI imports the single version source", () => {
  assert.match(gameSource, /from "\.\/version\.js"/);
  assert.match(gameSource, /const GAME_VERSION = APP_VERSION/);
});
check("current version is not duplicated in UI files", () => {
  for (const [name, source] of [["game.js", gameSource], ["index.html", indexSource], ["styles.css", stylesSource]]) {
    assert.equal(source.includes(APP_VERSION), false, `${name} hard-codes ${APP_VERSION}`);
  }
});
check("beta channel matches beta suffix", () => {
  assert.equal(RELEASE_CHANNEL, "beta");
  assert.match(APP_VERSION, /-beta\.\d+$/);
});
check("browser titles contain current version", () => {
  assert.ok(getVersionPresentation("en").title.includes(releaseTag));
  assert.ok(getVersionPresentation("zh").title.includes(releaseTag));
});
check("links support /cyber-snake/ deployment", () => {
  assert.match(UPDATE_URL, /^https:\/\/github\.com\/Tao-2026\/cyber-snake\//);
  assert.doesNotMatch(indexSource, /href="\//);
});
check("version.js is a pure module", () => {
  assert.doesNotMatch(versionSource, /\b(document|window|canvas|firebase|localStorage)\b/i);
});

if (failures.length) {
  console.error(`\n${failures.length} version check(s) failed.`);
  process.exitCode = 1;
} else console.log("\nVersion checks passed.");
