import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  APP_VERSION,
  CHANGELOG_URL,
  RELEASE_CHANNEL,
  RELEASE_DATE,
  RELEASE_URL,
  UPDATE_URL,
  getVersionPresentation
} from "../version.js";

const packageData = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const changelog = await readFile(new URL("../CHANGELOG.md", import.meta.url), "utf8");
const versionSource = await readFile(new URL("../version.js", import.meta.url), "utf8");
const indexSource = await readFile(new URL("../index.html", import.meta.url), "utf8");
const gameSource = await readFile(new URL("../game.js", import.meta.url), "utf8");
const en = getVersionPresentation("en");
const zh = getVersionPresentation("zh");

assert.equal(packageData.version, APP_VERSION);
assert.match(APP_VERSION, /^\d+\.\d+\.\d+-beta\.\d+$/);
assert.equal(RELEASE_CHANNEL, "beta");
assert.equal(en.version, `v${APP_VERSION}`);
assert.equal(en.channel, "BETA");
assert.equal(en.codename, "GLOBAL GRID");
assert.equal(en.updates, "View updates");
assert.equal(zh.channel, "测试版");
assert.equal(zh.codename, "全球竞技场");
assert.equal(zh.updates, "查看更新");
assert.equal(RELEASE_DATE, null);
assert.equal(UPDATE_URL, CHANGELOG_URL);
assert.ok(RELEASE_URL.endsWith(`/tag/v${APP_VERSION}`));
assert.ok(changelog.includes("## [Unreleased]"));
assert.ok(changelog.includes(`\`${APP_VERSION}\``));
assert.doesNotMatch(versionSource, /\b(document|window|canvas|firebase|localStorage)\b/i);
assert.match(indexSource, /target="_blank" rel="noopener noreferrer"/);
assert.match(gameSource, /getVersionPresentation\(language\)/);
assert.match(gameSource, /localStorage\.getItem\(LANGUAGE_KEY\) === "zh" \? "zh" : "en"/);

console.log("version-system tests passed");
