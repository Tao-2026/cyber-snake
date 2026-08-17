import assert from "node:assert/strict";
import {
  compareLeaderboardEntries,
  createLeaderboardService,
  isValidLeaderboardEntry,
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
assert.equal(shouldReplacePersonalBest(null, valid), true);
assert.equal(shouldReplacePersonalBest({ score:1300, cores:1 }, valid), false);
assert.equal(shouldReplacePersonalBest({ score:1200, cores:7 }, valid), true);
assert.equal(shouldReplacePersonalBest({ score:1200, cores:9 }, valid), false);

const states = [];
const unconfigured = createLeaderboardService({ onStatus:state => states.push(state.value) });
const result = await unconfigured.init();
assert.equal(result.online, false);
assert.equal(result.reason, "unconfigured");
assert.deepEqual(states, ["offline"]);

console.log("leaderboard-service tests passed");
