"use strict";

const GRID = 24;
const BASE_DELAY = 145;
const MIN_DELAY = 62;
const SCORE_STEP = 10;
const STORAGE_KEY = "cyberSnake.highScore";

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

let snake = [];
let food = { x: 17, y: 12 };
let direction = { x: 1, y: 0 };
let queuedDirection = { x: 1, y: 0 };
let score = 0;
let highScore = loadHighScore();
let status = "ready";
let timer = null;
let touchStart = null;

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
  pauseBtn.textContent = "暂停";
  updateState("RUNNING");
  announce("游戏开始");
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
    announce(`获得 ${SCORE_STEP} 分，当前 ${score} 分`);
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
    pauseBtn.textContent = "继续";
    showOverlay("CONNECTION SUSPENDED", "已暂停", "按空格或点击继续返回网络。", "继续游戏");
    updateState("PAUSED");
    announce("游戏已暂停");
  } else if (status === "paused") {
    status = "running";
    overlay.classList.add("hidden");
    pauseBtn.textContent = "暂停";
    updateState("RUNNING");
    announce("游戏继续");
    canvas.focus({ preventScroll: true });
    scheduleTick();
  }
}

function endGame() {
  status = "over";
  clearTimer();
  pauseBtn.disabled = true;
  showOverlay("SIGNAL LOST", "游戏结束", `最终得分 ${score}。最高分 ${highScore}。`, "重新挑战");
  updateState("RUN TERMINATED");
  announce(`游戏结束，最终得分 ${score}`);
}

function showOverlay(kicker, title, text, button) {
  overlayKicker.textContent = kicker;
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  primaryBtn.textContent = button;
  overlay.classList.remove("hidden");
  primaryBtn.focus({ preventScroll: true });
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

updateHud();
resetModel();
