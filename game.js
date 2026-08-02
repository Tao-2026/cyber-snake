"use strict";

const GRID = 24;
const BASE_DELAY = 145;
const MIN_DELAY = 62;
const SCORE_STEP = 10;
const STORAGE_KEY = "cyberSnake.highScore";
const LANGUAGE_KEY = "cyberSnake.language";

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const highScoreEl = document.querySelector("#highScore");
const speedEl = document.querySelector("#speed");
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

const copy = {
  zh: {
    switchLabel:"Switch to English", toggle:"EN", readyKicker:"NEURAL LINK READY", readyTitle:"CYBER SNAKE", readyText:"接入霓虹网络，收集数据核心。", start:"开始游戏",
    statsHint:"吞噬数据核心以增长。速度会随分数提升。", moveHint:"或 WASD 移动", pauseHint:"暂停 / 继续", pause:"暂停", resume:"继续", restart:"重新开始",
    canvasLabel:"贪吃蛇游戏区域。按开始游戏，然后使用方向键或 WASD 控制。", gameLabel:"Cyber Snake 游戏", statsLabel:"游戏数据", controlsLabel:"操作说明", touchLabel:"触屏方向控制", directions:["向上","向左","向下","向右"],
    running:"RUNNING", paused:"PAUSED", terminated:"RUN TERMINATED", startAnnounce:"游戏开始", pausedAnnounce:"游戏已暂停", resumeAnnounce:"游戏继续", readyAnnounce:"游戏待开始",
    scoreAnnounce:value=>`获得 ${SCORE_STEP} 分，当前 ${value} 分`, pauseTitle:"已暂停", pauseText:"按空格或点击继续返回网络。", resumeGame:"继续游戏", overTitle:"游戏结束", retry:"重新挑战",
    overText:(value,best)=>`最终得分 ${value}。最高分 ${best}。`, overAnnounce:value=>`游戏结束，最终得分 ${value}`
  },
  en: {
    switchLabel:"切换到中文", toggle:"中", readyKicker:"NEURAL LINK READY", readyTitle:"CYBER SNAKE", readyText:"Enter the neon grid and collect data cores.", start:"Start game",
    statsHint:"Consume data cores to grow. Speed increases with your score.", moveHint:"or WASD to move", pauseHint:"Pause / resume", pause:"Pause", resume:"Resume", restart:"Restart",
    canvasLabel:"Snake game area. Start the game, then use arrow keys or WASD to steer.", gameLabel:"Cyber Snake game", statsLabel:"Game statistics", controlsLabel:"Instructions", touchLabel:"Touch direction controls", directions:["Up","Left","Down","Right"],
    running:"RUNNING", paused:"PAUSED", terminated:"RUN TERMINATED", startAnnounce:"Game started", pausedAnnounce:"Game paused", resumeAnnounce:"Game resumed", readyAnnounce:"Game ready",
    scoreAnnounce:value=>`Scored ${SCORE_STEP} points. Total ${value}.`, pauseTitle:"PAUSED", pauseText:"Press Space or Resume to return to the grid.", resumeGame:"Resume game", overTitle:"GAME OVER", retry:"Try again",
    overText:(value,best)=>`Final score ${value}. High score ${best}.`, overAnnounce:value=>`Game over. Final score ${value}.`
  }
};

let snake = [];
let food = { x: 17, y: 12 };
let direction = { x: 1, y: 0 };
let queuedDirection = { x: 1, y: 0 };
let score = 0;
let highScore = loadHighScore();
let status = "ready";
let timer = null;
let touchStart = null;
let language = loadLanguage();

function loadLanguage() {
  try { return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "zh"; }
  catch { return "zh"; }
}

function text(key, ...args) {
  const value = copy[language][key];
  return typeof value === "function" ? value(...args) : value;
}

function applyLanguage() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  languageToggle.textContent = text("toggle");
  languageToggle.setAttribute("aria-label", text("switchLabel"));
  statsHint.textContent = text("statsHint"); moveHint.textContent = text("moveHint"); pauseHint.textContent = text("pauseHint");
  pauseBtn.textContent = status === "paused" ? text("resume") : text("pause"); restartBtn.textContent = text("restart");
  canvas.setAttribute("aria-label", text("canvasLabel"));
  document.querySelector(".game-layout").setAttribute("aria-label", text("gameLabel"));
  document.querySelector(".stats-panel").setAttribute("aria-label", text("statsLabel"));
  document.querySelector(".controls-panel").setAttribute("aria-label", text("controlsLabel"));
  document.querySelector(".touch-controls").setAttribute("aria-label", text("touchLabel"));
  document.querySelectorAll("[data-direction]").forEach((button, index) => button.setAttribute("aria-label", text("directions")[index]));
  if (status === "ready") { showOverlay(text("readyKicker"), text("readyTitle"), text("readyText"), text("start"), false); announce(text("readyAnnounce")); }
  else if (status === "paused") showOverlay("CONNECTION SUSPENDED", text("pauseTitle"), text("pauseText"), text("resumeGame"), false);
  else if (status === "over") showOverlay("SIGNAL LOST", text("overTitle"), text("overText", score, highScore), text("retry"), false);
}

function loadHighScore() {
  try { return Math.max(0, Number.parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0); }
  catch { return 0; }
}

function saveHighScore() {
  try { localStorage.setItem(STORAGE_KEY, String(highScore)); } catch { /* Storage may be disabled. */ }
}

function formatScore(value) { return String(value).padStart(4, "0"); }
function level() { return Math.min(12, Math.floor(score / 40) + 1); }
function delay() { return Math.max(MIN_DELAY, BASE_DELAY - (level() - 1) * 8); }

function resetModel() {
  snake = [{ x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 }, { x: 5, y: 12 }];
  direction = { x: 1, y: 0 };
  queuedDirection = { ...direction };
  score = 0;
  placeFood();
  updateHud();
  draw();
}

function startGame() {
  clearTimer();
  resetModel();
  status = "running";
  overlay.classList.add("hidden");
  pauseBtn.disabled = false;
  pauseBtn.textContent = text("pause");
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
    score += SCORE_STEP;
    if (score > highScore) { highScore = score; saveHighScore(); }
    placeFood();
    announce(text("scoreAnnounce", score));
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
    clearTimer();
    pauseBtn.textContent = text("resume");
    showOverlay("CONNECTION SUSPENDED", text("pauseTitle"), text("pauseText"), text("resumeGame"));
    updateState(text("paused"));
    announce(text("pausedAnnounce"));
  } else if (status === "paused") {
    status = "running";
    overlay.classList.add("hidden");
    pauseBtn.textContent = text("pause");
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
  showOverlay("SIGNAL LOST", text("overTitle"), text("overText", score, highScore), text("retry"));
  updateState(text("terminated"));
  announce(text("overAnnounce", score));
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
function announce(message) { liveStatus.textContent = message; }
function updateState(value) { stateEl.textContent = value; }
function updateHud() { scoreEl.textContent = formatScore(score); highScoreEl.textContent = formatScore(highScore); speedEl.textContent = String(level()).padStart(2, "0"); }

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
