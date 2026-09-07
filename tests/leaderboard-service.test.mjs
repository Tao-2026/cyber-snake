import assert from "node:assert/strict";
import {
  classifyLeaderboardError,
  compareLeaderboardEntries,
  createSubmissionGuard,
  createLeaderboardService,
  isValidGameVersion,
  isValidLeaderboardEntry,
  shouldRetryLeaderboardSubmission,
  shouldReplacePersonalBest
} from "../leaderboard-service.js";

const entries = [
  { playerId:"later", emoji:"🐍", score:500, cores:7, createdAt:200 },
  { playerId:"higher-cores", emoji:"🤖", score:500, cores:9, createdAt:300 },
  { playerId:"earlier", emoji:"👾", score:500, cores:7, createdAt:100 },
  { playerId:"highest", emoji:"🐲", score:800, cores:3, createdAt:400 }
].sort(compareLeaderboardEntries);

assert.deepEqual(entries.map(entry => entry.playerId), ["highest", "higher-cores", "earlier", "later"]);

const valid = {
  emoji:"🐍",
  score:1200,
  cores:8,
  runDuration:45000,
  maxLength:12,
  gameVersion:"v008"
};

assert.equal(isValidLeaderboardEntry(valid), true);
assert.equal(isValidLeaderboardEntry({ ...valid, score:-1 }), false);
assert.equal(isValidLeaderboardEntry({ ...valid, cores:601 }), false);
assert.equal(isValidLeaderboardEntry({ ...valid, gameVersion:"latest" }), false);

for (const gameVersion of ["v001", "v008", "0.9.0", "0.9.0-alpha.1", "0.9.0-beta.1", "0.9.0-rc.1"]) {
  assert.equal(isValidGameVersion(gameVersion), true, `${gameVersion} should be valid`);
  assert.equal(isValidLeaderboardEntry({ ...valid, gameVersion }), true, `${gameVersion} entry should be valid`);
}

for (const gameVersion of ["latest", "beta", "v0.9.0", "0.9", "v009", "01.0.0", "0.9.0-beta.01", "9".repeat(40)]) {
  assert.equal(isValidGameVersion(gameVersion), false, `${gameVersion} should be rejected`);
}

assert.deepEqual(classifyLeaderboardError({ code:"invalid-score-entry" }), { category:"invalid", diagnosticCode:"invalid-score-entry", retryable:false });
assert.equal(classifyLeaderboardError({ code:"auth/user-token-expired" }).category, "auth");
assert.equal(classifyLeaderboardError({ code:"permission-denied" }).category, "permission");
assert.equal(classifyLeaderboardError({ code:"unavailable" }).category, "network");
assert.equal(classifyLeaderboardError({ code:"submission-throttled" }).category, "throttled");
assert.equal(classifyLeaderboardError({ code:"permission-denied" }).retryable, false);
assert.equal(classifyLeaderboardError({ code:"unavailable" }).retryable, true);
assert.equal(shouldRetryLeaderboardSubmission({ code:"invalid-score-entry" }), false);
assert.equal(shouldRetryLeaderboardSubmission({ code:"permission-denied" }), false);
assert.equal(shouldRetryLeaderboardSubmission({ code:"unavailable" }), true);
assert.equal(shouldRetryLeaderboardSubmission({ code:"submission-throttled" }), true);

const pendingFromPreviousRelease = { ...valid, gameVersion:"0.9.0-beta.1" };
assert.equal(isValidLeaderboardEntry(pendingFromPreviousRelease), true, "existing SemVer pending score should retry after the fix");
assert.equal(shouldReplacePersonalBest(null, valid), true);
assert.equal(shouldReplacePersonalBest({ score:1300, cores:1 }, valid), false);
assert.equal(shouldReplacePersonalBest({ score:1200, cores:7 }, valid), true);
assert.equal(shouldReplacePersonalBest({ score:1200, cores:9 }, valid), false);

let clock = 20000;
const guard = createSubmissionGuard({ cooldown:15000, now:() => clock });
guard.claim(valid);
assert.throws(() => guard.claim(valid), /submission-throttled/);
assert.throws(() => guard.claim({ ...valid, score:1300 }), /submission-throttled/);
clock += 15001;
guard.claim({ ...valid, score:1300 });
guard.reset();
guard.claim(valid);

const states = [];
const unconfigured = createLeaderboardService({
  onStatus:state => states.push(state.value),
  configured:false
});
const result = await unconfigured.init();
assert.equal(result.online, false);
assert.equal(result.reason, "unconfigured");
assert.deepEqual(states, ["offline"]);

console.log("leaderboard-service tests passed");
