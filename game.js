"use strict";

const GRID = 24;
const BASE_DELAY = 145;
const MIN_DELAY = 62;
const STORAGE_KEY = "cyberSnake.competitiveHighScore.v2";
const LANGUAGE_KEY = "cyberSnake.language";
const LEADERBOARD_KEY = "cyberSnake.emojiPodium.v2";
const EMOJI_POOL = ["🤖","👾","👽","🦾","🥷","🧙","🦹","🦸","🐲","🦊","🐼","🐸","🐵","🦄","🦖","🐙","🦈","🔥","⚡","💀","😎","🤩","🥳","😈"];

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const coresEl = document.querySelector("#cores");
const currentScoreEl = document.querySelector("#currentScore");
const speedEl = document.querySelector("#speed");
const coresLabel = document.querySelector("#coresLabel");
const currentScoreLabel = document.querySelector("#currentScoreLabel");
const speedLabel = document.querySelector("#speedLabel");
const scoreBurst = document.querySelector("#scoreBurst");
const scoreFxLayer = document.querySelector("#scoreFxLayer");
const burstPoints = document.querySelector("#burstPoints");
const burstTier = document.querySelector("#burstTier");
const canvasFrame = document.querySelector("#canvasFrame");
const stateEl = document.querySelector("#systemState");
const liveStatus = document.querySelector("#liveStatus");
const overlay = document.querySelector("#gameOverlay");
const overlayKicker = document.querySelector("#overlayKicker");
const overlayTitle = document.querySelector("#overlayTitle");
const overlayText = document.querySelector("#overlayText");
const primaryBtn = document.querySelector("#primaryBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const restartBtn = document.querySelector("#restartBtn");
const languageToggle = document.querySelector("#languageToggle");
const statsHint = document.querySelector("#statsHint");
const moveHint = document.querySelector("#moveHint");
const pauseHint = document.querySelector("#pauseHint");
const podium = document.querySelector("#podium");
const leaderboard = document.querySelector(".leaderboard");
const emojiForm = document.querySelector("#emojiForm");
const emojiLabel = document.querySelector("#emojiLabel");
const emojiHint = document.querySelector("#emojiHint");
const candidateEmoji = document.querySelector("#candidateEmoji");
const randomEmojiBtn = document.querySelector("#randomEmojiBtn");
const saveScoreBtn = document.querySelector("#saveScoreBtn");
const clearScoresBtn = document.querySelector("#clearScoresBtn");

const copy = {
  zh: {
    switchLabel:"Switch to English", toggle:"EN", readyKicker:"NEURAL LINK READY", readyTitle:"CYBER SNAKE", readyText:"接入霓虹网络，收集数据核心。", start:"开始游戏",
    statsHint:"吞噬数据核心以增长。速度会随总豆数提升。", moveHint:"或 WASD 移动", pauseHint:"暂停 / 继续", pause:"暂停", resume:"继续", restart:"重新开始",
    canvasLabel:"贪吃蛇游戏区域。按开始游戏，然后使用方向键或 WASD 控制。", gameLabel:"Cyber Snake 游戏", statsLabel:"游戏数据", controlsLabel:"操作说明", touchLabel:"触屏方向控制", directions:["向上","向左","向下","向右"],
    running:"RUNNING", paused:"PAUSED", terminated:"RUN TERMINATED", startAnnounce:"游戏开始", pausedAnnounce:"游戏已暂停", resumeAnnounce:"游戏继续", readyAnnounce:"游戏待开始",
    coresLabel:"总豆数", currentScoreLabel:"当前竞技分", speedLabel:"速度", scoreAnnounce:(earned,value,multiplier)=>`获得 ${earned} 分，倍率 ${multiplier}，当前竞技分 ${value}`, tierNormal:"核心吸收", tierFast:"快速连击 ×2", tierUltra:"极速爆分 ×3", pauseTitle:"已暂停", pauseText:"按空格或点击继续返回网络。", resumeGame:"继续游戏", overTitle:"游戏结束", retry:"重新挑战",
    overText:(value,best,cores)=>`吞噬 ${cores} 颗豆。最终竞技分 ${value}，最高 ${best}。`, overAnnounce:(value,cores)=>`游戏结束，共 ${cores} 颗豆，最终竞技分 ${value}`, leaderboardLabel:"Top 3 Emoji 领奖台", qualifiedTitle:"破榜成功", qualifiedText:(value,cores)=>`${cores} 颗豆转化为 ${value} 分，进入 TOP 3。`, emojiLabel:"随机选择你的领奖台角色", emojiHint:"不满意可以继续随机", randomEmoji:"🎲 随机 Emoji", save:"确认登台", skip:"跳过 / 重试", savedTitle:"登台成功", savedText:emoji=>`${emoji} 已登上荣誉领奖台。`, clear:"清空", clearConfirm:"确定清空 TOP 3 领奖台吗？", rankLabel:(rank,emoji,value)=>`第 ${rank} 名，${emoji}，${value} 分`, emptyRank:rank=>`第 ${rank} 名空缺`
  },
  en: {
    switchLabel:"切换到中文", toggle:"中", readyKicker:"NEURAL LINK READY", readyTitle:"CYBER SNAKE", readyText:"Enter the neon grid and collect data cores.", start:"Start game",
    statsHint:"Consume data cores to grow. Speed increases with total cores.", moveHint:"or WASD to move", pauseHint:"Pause / resume", pause:"Pause", resume:"Resume", restart:"Restart",
    canvasLabel:"Snake game area. Start the game, then use arrow keys or WASD to steer.", gameLabel:"Cyber Snake game", statsLabel:"Game statistics", controlsLabel:"Instructions", touchLabel:"Touch direction controls", directions:["Up","Left","Down","Right"],
    running:"RUNNING", paused:"PAUSED", terminated:"RUN TERMINATED", startAnnounce:"Game started", pausedAnnounce:"Game paused", resumeAnnounce:"Game resumed", readyAnnounce:"Game ready",
    coresLabel:"TOTAL CORES", currentScoreLabel:"CURRENT SCORE", speedLabel:"SPEED", scoreAnnounce:(earned,value,multiplier)=>`Scored ${earned} at ×${multiplier}. Competitive score ${value}.`, tierNormal:"CORE ABSORBED", tierFast:"FAST COMBO ×2", tierUltra:"ULTRA SCORE ×3", pauseTitle:"PAUSED", pauseText:"Press Space or Resume to return to the grid.", resumeGame:"Resume game", overTitle:"GAME OVER", retry:"Try again",
    overText:(value,best,cores)=>`${cores} ${cores===1?"core":"cores"} consumed. Final score ${value}; best ${best}.`, overAnnounce:(value,cores)=>`Game over. ${cores} ${cores===1?"core":"cores"} and ${value} competitive points.`, leaderboardLabel:"Top 3 emoji podium", qualifiedTitle:"NEW HIGH SCORE", qualifiedText:(value,cores)=>`${cores} ${cores===1?"core":"cores"} converted into ${value} points and a TOP 3 finish.`, emojiLabel:"Randomize your podium character", emojiHint:"Keep rolling until you find your champion", randomEmoji:"🎲 Random Emoji", save:"Claim podium", skip:"Skip / retry", savedTitle:"PODIUM CLAIMED", savedText:emoji=>`${emoji} entered the Hall of Fame.`, clear:"Clear", clearConfirm:"Clear the TOP 3 podium?", rankLabel:(rank,emoji,value)=>`Rank ${rank}, ${emoji}, ${value} points`, emptyRank:rank=>`Rank ${rank} empty`
  }
};

let snake = [];
let food = { x: 17, y: 12 };
let direction = { x: 1, y: 0 };
let queuedDirection = { x: 1, y: 0 };
let score = 0;
let cores = 0;
let highScore = loadHighScore();
let status = "ready";
let timer = null;
let touchStart = null;
let language = loadLanguage();
let scores = loadLeaderboard();
let awaitingEmoji = false;
let selectedEmoji = null;
let lastFoodAt = 0;
let pausedAt = 0;

function loadLanguage() {
  try { return localStorage.getItem(LANGUAGE_KEY) === "zh" ? "zh" : "en"; }
  catch { return "en"; }
}

function loadLeaderboard() {
  try {
    const value = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter(entry => entry && Number.isFinite(entry.score)).slice(0, 3).map((entry, index) => ({ emoji:typeof entry.emoji === "string" ? entry.emoji : EMOJI_POOL[index], score:entry.score }));
  } catch { return []; }
}

function saveLeaderboard() {
  try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores)); } catch { /* Storage may be disabled. */ }
}

function text(key, ...args) {
  const value = copy[language][key];
  return typeof value === "function" ? value(...args) : value;
}

function updateActionButtons() {
  const pauseText = status === "paused" ? text("resume") : text("pause");
  const restartText = text("restart");
  pauseBtn.textContent = pauseText;
  pauseBtn.setAttribute("aria-label", pauseText);
  pauseBtn.dataset.icon = status === "paused" ? "▶" : "⏸";
  restartBtn.textContent = restartText;
  restartBtn.setAttribute("aria-label", restartText);
}

function applyLanguage() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  languageToggle.textContent = text("toggle");
  languageToggle.setAttribute("aria-label", text("switchLabel"));
  statsHint.textContent = text("statsHint"); moveHint.textContent = text("moveHint"); pauseHint.textContent = text("pauseHint");
  updateActionButtons();
  coresLabel.textContent = text("coresLabel"); currentScoreLabel.textContent = text("currentScoreLabel"); speedLabel.textContent = text("speedLabel");
  canvas.setAttribute("aria-label", text("canvasLabel"));
  document.querySelector(".game-layout").setAttribute("aria-label", text("gameLabel"));
  document.querySelector(".stats-panel").setAttribute("aria-label", text("statsLabel"));
  document.querySelector(".controls-panel").setAttribute("aria-label", text("controlsLabel"));
  document.querySelector(".touch-controls").setAttribute("aria-label", text("touchLabel"));
  leaderboard.setAttribute("aria-label", text("leaderboardLabel"));
  emojiLabel.textContent = text("emojiLabel"); emojiHint.textContent = text("emojiHint"); randomEmojiBtn.textContent = text("randomEmoji"); saveScoreBtn.textContent = text("save");
  clearScoresBtn.textContent = text("clear");
  document.querySelectorAll("[data-direction]").forEach((button, index) => button.setAttribute("aria-label", text("directions")[index]));
  if (status === "ready") { showOverlay(text("readyKicker"), text("readyTitle"), text("readyText"), text("start"), false); announce(text("readyAnnounce")); }
  else if (status === "paused") showOverlay("CONNECTION SUSPENDED", text("pauseTitle"), text("pauseText"), text("resumeGame"), false);
  else if (status === "over" && awaitingEmoji) showOverlay("HALL OF FAME", text("qualifiedTitle"), text("qualifiedText", score, cores), text("skip"), false);
  else if (status === "over") showOverlay("SIGNAL LOST", text("overTitle"), text("overText", score, highScore, cores), text("retry"), false);
  renderLeaderboard();
}

function loadHighScore() {
  try { return Math.max(0, Number.parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0); }
  catch { return 0; }
}

function saveHighScore() {
  try { localStorage.setItem(STORAGE_KEY, String(highScore)); } catch { /* Storage may be disabled. */ }
}

function formatScore(value) { return String(value).padStart(4, "0"); }
function level() { return Math.min(12, Math.floor(cores / 3) + 1); }
function delay() { return Math.max(MIN_DELAY, BASE_DELAY - (level() - 1) * 8); }

function resetModel() {
  snake = [{ x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 }, { x: 5, y: 12 }];
  direction = { x: 1, y: 0 };
  queuedDirection = { ...direction };
  score = 0;
  cores = 0;
  lastFoodAt = performance.now();
  food = { x: 12, y: 12 };
  updateHud();
  draw();
}

function startGame() {
  clearTimer();
  resetModel();
  status = "running";
  awaitingEmoji = false;
  selectedEmoji = null;
  emojiForm.classList.add("hidden");
  overlay.classList.add("hidden");
  pauseBtn.disabled = false;
  updateActionButtons();
  updateState(text("running"));
  announce(text("startAnnounce"));
  canvas.focus({ preventScroll: true });
  scheduleTick();
}

function scheduleTick() {
  clearTimer();
  if (status === "running") timer = window.setTimeout(tick, delay());
}

function tick() {
  direction = queuedDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const ate = head.x === food.x && head.y === food.y;
  const bodyToCheck = ate ? snake : snake.slice(0, -1);
  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || bodyToCheck.some(part => part.x === head.x && part.y === head.y)) {
    endGame();
    return;
  }
  snake.unshift(head);
  if (ate) {
    cores += 1;
    const now = performance.now();
    const interval = now - lastFoodAt;
    const multiplier = interval <= 2000 ? 3 : interval <= 4000 ? 2 : interval <= 6000 ? 1.5 : 1;
    const earned = Math.round(snake.length * 10 * multiplier);
    score += earned;
    lastFoodAt = now;
    if (score > highScore) { highScore = score; saveHighScore(); }
    placeFood();
    announce(text("scoreAnnounce", earned, score, multiplier));
    showScoreBurst(earned, multiplier, head);
  } else snake.pop();
  updateHud();
  draw();
  scheduleTick();
}

function placeFood() {
  const free = [];
  for (let y = 0; y < GRID; y += 1) for (let x = 0; x < GRID; x += 1) {
    if (!snake.some(part => part.x === x && part.y === y)) free.push({ x, y });
  }
  food = free[Math.floor(Math.random() * free.length)] || { x: 0, y: 0 };
}

function setDirection(next) {
  if (status !== "running") return;
  if (next.x + direction.x === 0 && next.y + direction.y === 0) return;
  queuedDirection = next;
}

function togglePause() {
  if (status === "running") {
    status = "paused";
    pausedAt = performance.now();
    clearTimer();
    updateActionButtons();
    showOverlay("CONNECTION SUSPENDED", text("pauseTitle"), text("pauseText"), text("resumeGame"));
    updateState(text("paused"));
    announce(text("pausedAnnounce"));
  } else if (status === "paused") {
    status = "running";
    if (pausedAt) lastFoodAt += performance.now() - pausedAt;
    pausedAt = 0;
    overlay.classList.add("hidden");
    updateActionButtons();
    updateState("RUNNING");
    announce(text("resumeAnnounce"));
    canvas.focus({ preventScroll: true });
    scheduleTick();
  }
}

function endGame() {
  status = "over";
  clearTimer();
  pauseBtn.disabled = true;
  awaitingEmoji = qualifiesForLeaderboard(score);
  if (awaitingEmoji) {
    showOverlay("HALL OF FAME", text("qualifiedTitle"), text("qualifiedText", score, cores), text("skip"), false);
    selectedEmoji = null;
    candidateEmoji.textContent = "❔";
    saveScoreBtn.disabled = true;
    emojiForm.classList.remove("hidden");
    randomEmojiBtn.focus({ preventScroll:true });
  } else showOverlay("SIGNAL LOST", text("overTitle"), text("overText", score, highScore, cores), text("retry"));
  updateState(text("terminated"));
  announce(text("overAnnounce", score, cores));
}

function qualifiesForLeaderboard(value) {
  return value > 0 && (scores.length < 3 || value > scores[scores.length - 1].score);
}

function renderLeaderboard() {
  [1, 2, 3].forEach(rank => {
    const entry = scores[rank - 1];
    const place = podium.querySelector(`[data-rank="${rank}"]`);
    const avatar = place.querySelector(".podium-emoji");
    const value = place.querySelector("strong");
    avatar.textContent = entry ? entry.emoji : "❔";
    value.textContent = entry ? formatScore(entry.score) : "----";
    place.setAttribute("aria-label", entry ? text("rankLabel", rank, entry.emoji, entry.score) : text("emptyRank", rank));
    place.classList.remove("entering");
    if (entry) requestAnimationFrame(() => place.classList.add("entering"));
  });
  clearScoresBtn.disabled = scores.length === 0 && highScore === 0;
}

function recordScore() {
  if (!selectedEmoji) { randomEmojiBtn.focus(); return; }
  scores.push({ emoji:selectedEmoji, score });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 3);
  saveLeaderboard();
  awaitingEmoji = false;
  emojiForm.classList.add("hidden");
  renderLeaderboard();
  showOverlay("HALL OF FAME", text("savedTitle"), text("savedText", selectedEmoji), text("retry"));
  announce(text("savedText", selectedEmoji));
}

function rollEmoji() {
  const alternatives = EMOJI_POOL.filter(emoji => emoji !== selectedEmoji);
  selectedEmoji = alternatives[Math.floor(Math.random() * alternatives.length)];
  candidateEmoji.textContent = selectedEmoji;
  candidateEmoji.classList.remove("rolling");
  void candidateEmoji.offsetWidth;
  candidateEmoji.classList.add("rolling");
  saveScoreBtn.disabled = false;
  announce(selectedEmoji);
}

function showOverlay(kicker, title, body, button, focus = true) {
  overlayKicker.textContent = kicker;
  overlayTitle.textContent = title;
  overlayText.textContent = body;
  primaryBtn.textContent = button;
  overlay.classList.remove("hidden");
  if (focus) primaryBtn.focus({ preventScroll: true });
}

function clearTimer() { if (timer !== null) { clearTimeout(timer); timer = null; } }
function showScoreBurst(earned, multiplier, position) {
  const tier = multiplier >= 3 || earned >= 400 ? "ultra" : multiplier >= 2 || earned >= 250 ? "fast" : "normal";
  burstPoints.textContent = `+${earned}`;
  burstTier.textContent = text(tier === "ultra" ? "tierUltra" : tier === "fast" ? "tierFast" : "tierNormal");
  scoreFxLayer.style.setProperty("--fx-x", `${((position.x + .5) / GRID) * 100}%`);
  scoreFxLayer.style.setProperty("--fx-y", `${((position.y + .5) / GRID) * 100}%`);
  scoreFxLayer.querySelectorAll(".fx-particle").forEach(particle => particle.remove());
  if (tier !== "normal") {
    const count = tier === "ultra" ? 14 : 8;
    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement("i");
      particle.className = "fx-particle";
      particle.style.setProperty("--angle", `${(360 / count) * index + Math.random() * 12}deg`);
      particle.style.setProperty("--distance", `${tier === "ultra" ? -65 - Math.random() * 35 : -42 - Math.random() * 22}px`);
      scoreFxLayer.append(particle);
    }
  }
  scoreBurst.className = `score-burst ${tier}`;
  scoreFxLayer.className = `score-fx-layer ${tier}`;
  canvasFrame.classList.remove("fx-fast", "fx-ultra");
  void scoreBurst.offsetWidth;
  scoreBurst.classList.add("show");
  if (tier !== "normal") canvasFrame.classList.add(tier === "ultra" ? "fx-ultra" : "fx-fast");
}
function announce(message) { liveStatus.textContent = message; }
function updateState(value) { stateEl.textContent = value; }
function updateHud() { coresEl.textContent = String(cores).padStart(3, "0"); currentScoreEl.textContent = formatScore(score); speedEl.textContent = String(level()).padStart(2, "0"); }

function draw() {
  const cell = canvas.width / GRID;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#050812";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(22,247,255,.055)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID; i += 1) {
    const p = i * cell + .5;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(canvas.width, p); ctx.stroke();
  }
  const pulse = 2 + Math.sin(Date.now() / 160) * 1.5;
  ctx.shadowBlur = 16 + pulse; ctx.shadowColor = "#ff3bd4"; ctx.fillStyle = "#ff3bd4";
  ctx.beginPath(); ctx.arc((food.x + .5) * cell, (food.y + .5) * cell, cell * .27, 0, Math.PI * 2); ctx.fill();
  snake.forEach((part, index) => {
    const inset = index === 0 ? 2 : 3;
    ctx.shadowBlur = index === 0 ? 18 : 8; ctx.shadowColor = index === 0 ? "#7dff6a" : "#16f7ff";
    ctx.fillStyle = index === 0 ? "#7dff6a" : `rgba(22,247,255,${Math.max(.42, 1 - index * .035)})`;
    ctx.fillRect(part.x * cell + inset, part.y * cell + inset, cell - inset * 2, cell - inset * 2);
    if (index === 0) { ctx.fillStyle = "#071013"; ctx.fillRect(part.x * cell + cell * .55, part.y * cell + cell * .23, 3, 3); }
  });
  ctx.shadowBlur = 0;
}

const keyDirections = { ArrowUp:{x:0,y:-1}, w:{x:0,y:-1}, W:{x:0,y:-1}, ArrowDown:{x:0,y:1}, s:{x:0,y:1}, S:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, a:{x:-1,y:0}, A:{x:-1,y:0}, ArrowRight:{x:1,y:0}, d:{x:1,y:0}, D:{x:1,y:0} };
document.addEventListener("keydown", event => {
  if (event.code === "Space") { event.preventDefault(); togglePause(); return; }
  const next = keyDirections[event.key];
  if (next) { event.preventDefault(); setDirection(next); }
});
primaryBtn.addEventListener("click", () => status === "paused" ? togglePause() : startGame());
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", startGame);
emojiForm.addEventListener("submit", event => { event.preventDefault(); recordScore(); });
randomEmojiBtn.addEventListener("click", rollEmoji);
clearScoresBtn.addEventListener("click", () => {
  scores = [];
  highScore = 0;
  saveLeaderboard();
  saveHighScore();
  renderLeaderboard();
  updateHud();
});
languageToggle.addEventListener("click", () => {
  language = language === "zh" ? "en" : "zh";
  try { localStorage.setItem(LANGUAGE_KEY, language); } catch { /* Storage may be disabled. */ }
  applyLanguage();
});
document.querySelectorAll("[data-direction]").forEach(button => button.addEventListener("pointerdown", () => {
  const map = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
  setDirection(map[button.dataset.direction]);
}));
canvas.addEventListener("pointerdown", event => { touchStart = { x:event.clientX, y:event.clientY }; });
canvas.addEventListener("pointerup", event => {
  if (!touchStart) return;
  const x = event.clientX - touchStart.x, y = event.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(x), Math.abs(y)) < 20) return;
  setDirection(Math.abs(x) > Math.abs(y) ? { x:Math.sign(x), y:0 } : { x:0, y:Math.sign(y) });
});
document.addEventListener("visibilitychange", () => { if (document.hidden && status === "running") togglePause(); });

resetModel();
applyLanguage();
