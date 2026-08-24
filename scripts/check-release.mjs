import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { APP_VERSION, RELEASE_URL } from "../version.js";

const results = [];
const git = (...args) => execFileSync("git", args, { encoding:"utf8" }).trim();
const report = (ok, label, detail = "") => {
  results.push({ ok, label, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};

let status = "";
try { status = git("status", "--porcelain"); } catch (error) { report(false, "Git repository available", error.message); }
report(status === "", "Git worktree is clean", status || "clean");

const branch = git("branch", "--show-current");
report(Boolean(branch), "Current branch is named", branch || "detached HEAD");

const remotesContainingHead = git("branch", "-r", "--contains", "HEAD");
report(Boolean(remotesContainingHead), "Current commit exists on a remote", remotesContainingHead || "not pushed");

const semantic = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc)\.(0|[1-9]\d*))?$/;
report(semantic.test(APP_VERSION), "Version is valid Semantic Versioning", APP_VERSION);

const testRun = spawnSync(process.execPath, ["tests/leaderboard-service.test.mjs"], { encoding:"utf8" });
report(testRun.status === 0, "Existing leaderboard regression tests pass", testRun.status === 0 ? "passed" : testRun.stderr.trim());
const versionRun = spawnSync(process.execPath, ["scripts/check-version.mjs"], { encoding:"utf8" });
report(versionRun.status === 0, "Version checks pass", versionRun.status === 0 ? "passed" : versionRun.stderr.trim());

const tagProbe = spawnSync("git", ["rev-parse", "--verify", `refs/tags/v${APP_VERSION}`], { encoding:"utf8" });
const tagExists = tagProbe.status === 0;
report(!tagExists, "Release tag does not already exist", `v${APP_VERSION}`);

const changelog = readFileSync("CHANGELOG.md", "utf8");
report(changelog.includes("## [Unreleased]") && changelog.includes(`\`${APP_VERSION}\``), "CHANGELOG is prepared", APP_VERSION);
report(RELEASE_URL.endsWith(`/tag/v${APP_VERSION}`), "Release URL matches the version", RELEASE_URL);

let archivesIgnored = false;
try { execFileSync("git", ["check-ignore", "-q", "archives/release-check.tmp"]); archivesIgnored = true; } catch { /* Report below. */ }
report(archivesIgnored, "archives/ is ignored by Git");

const candidatePaths = git("ls-files", "--cached", "--others", "--exclude-standard").split(/\r?\n/).filter(Boolean);
const riskyName = /(^|\/)(\.env(?:\..*)?|service-account.*\.json|.*-firebase-adminsdk-.*\.json|firebase-debug\.log|.*\.(?:pem|p12|pfx|key))$/i;
const riskyFiles = candidatePaths.filter(file => riskyName.test(file.replaceAll("\\", "/")));
const privateKeyFiles = candidatePaths.filter(file => {
  try { return /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(readFileSync(file, "utf8")); }
  catch { return false; }
});
const risks = [...new Set([...riskyFiles, ...privateKeyFiles])];
report(risks.length === 0, "No obvious secret or temporary-file risk", risks.join(", ") || "Firebase Web config allowed");

const failures = results.filter(result => !result.ok);
console.log(`\nRelease readiness: ${failures.length ? `${failures.length} check(s) need attention` : "ready for human approval"}.`);
if (failures.length) process.exitCode = 1;
