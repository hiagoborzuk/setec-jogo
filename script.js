"use strict";

const canvas = document.querySelector("#gameCanvas");
const ui = {
  menuScreen: document.querySelector("#menuScreen"),
  helpScreen: document.querySelector("#helpScreen"),
  settingsScreen: document.querySelector("#settingsScreen"),
  pauseScreen: document.querySelector("#pauseScreen"),
  phaseScreen: document.querySelector("#phaseScreen"),
  resultScreen: document.querySelector("#resultScreen"),
  errorScreen: document.querySelector("#errorScreen"),
  playButton: document.querySelector("#playButton"),
  howToButton: document.querySelector("#howToButton"),
  accessibilityButton: document.querySelector("#accessibilityButton"),
  startTitle: document.querySelector("#menuTitle"),
  soundButton: document.querySelector("#soundButton"),
  pauseButton: document.querySelector("#pauseButton"),
  scoreValue: document.querySelector("#scoreValue"),
  distanceValue: document.querySelector("#distanceValue"),
  speedValue: document.querySelector("#speedValue"),
  comboValue: document.querySelector("#comboValue"),
  bestValue: document.querySelector("#bestValue"),
  phaseLabel: document.querySelector("#phaseLabel"),
  missionFill: document.querySelector("#missionFill"),
  missionValue: document.querySelector("#missionValue"),
  healthDots: document.querySelector("#healthDots"),
  statusMessage: document.querySelector("#statusMessage"),
  countdown: document.querySelector("#countdown"),
  countdownValue: document.querySelector("#countdownValue"),
  resumeButton: document.querySelector("#resumeButton"),
  pauseSettingsButton: document.querySelector("#pauseSettingsButton"),
  pauseRestartButton: document.querySelector("#pauseRestartButton"),
  pauseMenuButton: document.querySelector("#pauseMenuButton"),
  phaseBadge: document.querySelector("#phaseBadge"),
  phaseTag: document.querySelector("#phaseTag"),
  phaseTitle: document.querySelector("#phaseTitle"),
  phaseDescription: document.querySelector("#phaseDescription"),
  phaseDistance: document.querySelector("#phaseDistance"),
  phaseCrystalsValue: document.querySelector("#phaseCrystalsValue"),
  phaseNextText: document.querySelector("#phaseNextText"),
  nextPhaseButton: document.querySelector("#nextPhaseButton"),
  phaseSettingsButton: document.querySelector("#phaseSettingsButton"),
  resultIcon: document.querySelector("#resultIcon"),
  resultTitle: document.querySelector("#resultTitle"),
  resultMessage: document.querySelector("#resultMessage"),
  finalScore: document.querySelector("#finalScore"),
  finalDistance: document.querySelector("#finalDistance"),
  finalCrystals: document.querySelector("#finalCrystals"),
  finalCombo: document.querySelector("#finalCombo"),
  finalPhases: document.querySelector("#finalPhases"),
  recordMessage: document.querySelector("#recordMessage"),
  playAgainButton: document.querySelector("#playAgainButton"),
  resultMenuButton: document.querySelector("#resultMenuButton"),
  errorMessage: document.querySelector("#errorMessage"),
  motionToggle: document.querySelector("#motionToggle"),
  contrastToggle: document.querySelector("#contrastToggle"),
  largeTextToggle: document.querySelector("#largeTextToggle"),
  colorSafeToggle: document.querySelector("#colorSafeToggle"),
  announcerToggle: document.querySelector("#announcerToggle"),
  soundToggle: document.querySelector("#soundToggle"),
  resetSettingsButton: document.querySelector("#resetSettingsButton"),
  leftButton: document.querySelector("#leftButton"),
  rightButton: document.querySelector("#rightButton"),
  jumpButton: document.querySelector("#jumpButton"),
  slideButton: document.querySelector("#slideButton"),
  hitFlash: document.querySelector("#hitFlash")
};

let gl = null;
try {
  gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
} catch (error) {
  console.error(error);
}

const SETTINGS_KEY = "aurora-dash-3d-settings";
const HIGH_SCORE_KEY = "aurora-dash-3d-high-score";
const DEFAULT_SETTINGS = {
  motion: typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false,
  contrast: false,
  largeText: false,
  colorSafe: false,
  announcer: false,
  sound: true
};

const CONFIG = Object.freeze({
  lanes: [-2.8, 0, 2.8],
  baseSpeed: 16,
  maxSpeed: 33,
  rowGap: 14,
  spawnAhead: 112,
  goalCrystals: 57,
  gravity: 30,
  jumpVelocity: 11.4,
  slideDuration: 0.72,
  maxHealth: 3
});

const PHASES = Object.freeze([
  {
    number: 1,
    name: "Entrada do Vale",
    shortName: "Entrada",
    distance: 800,
    crystalGoal: 14,
    baseSpeed: 16,
    difficulty: 0.18,
    description: "Aprenda a controlar as três faixas. Aqui, os cristais são mais fáceis de encontrar e o ritmo começa suave."
  },
  {
    number: 2,
    name: "Minas de Cristal",
    shortName: "Minas",
    distance: 1000,
    crystalGoal: 17,
    baseSpeed: 19,
    difficulty: 0.36,
    description: "As minas se estreitam e os obstáculos chegam mais rápido. Use o impulso e procure combinações de cristais."
  },
  {
    number: 3,
    name: "Bosque Suspenso",
    shortName: "Bosque",
    distance: 1100,
    crystalGoal: 19,
    baseSpeed: 22,
    difficulty: 0.54,
    description: "Atravesse o bosque flutuante e misture saltos e deslizes para não perder o ritmo."
  },
  {
    number: 4,
    name: "Tempestade de Luz",
    shortName: "Tempestade",
    distance: 1250,
    crystalGoal: 21,
    baseSpeed: 25,
    difficulty: 0.74,
    description: "A luz muda de direção e os cristais surgem em sequências apertadas. Foque na faixa livre."
  },
  {
    number: 5,
    name: "Arco da Aurora",
    shortName: "Arco",
    distance: 1400,
    crystalGoal: 24,
    baseSpeed: 28,
    difficulty: 0.92,
    description: "A última velocidade do vale. Mantenha a integridade, escolha bem as faixas e alcance o arco final."
  }
]);

const TOTAL_DISTANCE = PHASES.reduce((total, phase) => total + phase.distance, 0);
const NUMBER_FORMATTER = new Intl.NumberFormat("pt-BR");

const PALETTES = {
  normal: {
    road: [0.035, 0.045, 0.16, 1],
    shoulder: [0.07, 0.1, 0.25, 1],
    rail: [0.2, 0.8, 0.95, 1],
    lane: [0.27, 0.43, 0.85, 1],
    laneBright: [0.35, 0.93, 1, 1],
    star: [0.55, 0.83, 1, 1],
    starWarm: [1, 0.64, 0.88, 1],
    mountain: [0.1, 0.08, 0.29, 1],
    mountainFar: [0.16, 0.12, 0.38, 1],
    crystal: [0.35, 0.95, 1, 1],
    cyan: [0.35, 0.95, 1, 1],
    violet: [0.55, 0.3, 1, 1],
    boost: [0.72, 0.45, 1, 1],
    wall: [1, 0.23, 0.48, 1],
    branch: [0.54, 0.26, 0.95, 1],
    rock: [1, 0.55, 0.25, 1],
    board: [0.16, 0.76, 0.94, 1],
    suit: [0.28, 0.36, 0.82, 1],
    helmet: [0.75, 0.9, 1, 1],
    visor: [0.08, 0.12, 0.32, 1],
    thruster: [0.48, 0.95, 1, 1],
    fog: [0.012, 0.018, 0.08]
  },
  safe: {
    road: [0.025, 0.055, 0.11, 1],
    shoulder: [0.06, 0.14, 0.2, 1],
    rail: [0.1, 0.8, 1, 1],
    lane: [0.2, 0.45, 0.95, 1],
    laneBright: [0.2, 0.9, 1, 1],
    star: [0.8, 0.9, 1, 1],
    starWarm: [1, 0.83, 0.25, 1],
    mountain: [0.05, 0.11, 0.2, 1],
    mountainFar: [0.09, 0.2, 0.3, 1],
    crystal: [0.2, 0.9, 1, 1],
    cyan: [0.2, 0.9, 1, 1],
    violet: [0.5, 0.4, 1, 1],
    boost: [0.8, 0.6, 0.1, 1],
    wall: [1, 0.2, 0.15, 1],
    branch: [0.8, 0.45, 0.05, 1],
    rock: [0.95, 0.72, 0.1, 1],
    board: [0.1, 0.55, 0.9, 1],
    suit: [0.2, 0.25, 0.7, 1],
    helmet: [0.9, 0.95, 1, 1],
    visor: [0.03, 0.05, 0.2, 1],
    thruster: [0.2, 0.9, 1, 1],
    fog: [0.01, 0.025, 0.06]
  },
  contrast: {
    road: [0.02, 0.025, 0.08, 1],
    shoulder: [0.04, 0.06, 0.14, 1],
    rail: [0.2, 1, 1, 1],
    lane: [0.2, 0.35, 1, 1],
    laneBright: [0.2, 1, 1, 1],
    star: [1, 1, 1, 1],
    starWarm: [1, 0.8, 0.2, 1],
    mountain: [0.04, 0.05, 0.14, 1],
    mountainFar: [0.08, 0.11, 0.24, 1],
    crystal: [0.2, 1, 1, 1],
    cyan: [0.2, 1, 1, 1],
    violet: [0.8, 0.5, 1, 1],
    boost: [1, 0.8, 0.1, 1],
    wall: [1, 0.1, 0.25, 1],
    branch: [0.8, 0.35, 1, 1],
    rock: [1, 0.6, 0.05, 1],
    board: [0.15, 0.75, 1, 1],
    suit: [0.2, 0.25, 0.9, 1],
    helmet: [1, 1, 1, 1],
    visor: [0, 0, 0.1, 1],
    thruster: [0.2, 1, 1, 1],
    fog: [0, 0, 0.03]
  }
};

const state = {
  phase: "menu",
  pausedFrom: "running",
  settingsOrigin: "menu",
  settings: readSettings(),
  width: 0,
  height: 0,
  pixelRatio: 1,
  lastTime: performance.now(),
  visualTime: 0,
  hudTimer: 0,
  distance: 0,
  speed: CONFIG.baseSpeed,
  score: 0,
  crystalScore: 0,
  crystals: 0,
  combo: 0,
  bestCombo: 0,
  health: CONFIG.maxHealth,
  lane: 1,
  targetLane: 1,
  playerX: CONFIG.lanes[1],
  playerY: 0,
  playerVY: 0,
  playerBank: 0,
  sliding: false,
  slideTimer: 0,
  invulnerable: 0,
  boostTimer: 0,
  boostActive: false,
  shake: 0,
  flash: 0,
  stage: 0,
  phaseIndex: 0,
  phaseStartDistance: 0,
  phaseDistance: 0,
  phaseCrystals: 0,
  completedPhases: 0,
  countdown: 0,
  spawnZ: -20,
  gateZ: -170,
  objects: [],
  particles: [],
  stars: [],
  roadMarkers: [],
  decor: [],
  highScore: readHighScore(),
  statusTimeout: null,
  flashTimeout: null,
  input: {
    left: false,
    right: false
  }
};

let program = null;
let uniforms = null;
let cubeMesh = null;
let octahedronMesh = null;
let audioContext = null;
let canvasReady = false;

applySettings();
updateHud();
resetWorld();

function initializeGame() {
  try {
    program = createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
    cubeMesh = createCubeMesh();
    octahedronMesh = createOctahedronMesh();

    uniforms = {
      position: gl.getAttribLocation(program, "aPosition"),
      normal: gl.getAttribLocation(program, "aNormal"),
      model: gl.getUniformLocation(program, "uModel"),
      normalMatrix: gl.getUniformLocation(program, "uNormalMatrix"),
      viewProjection: gl.getUniformLocation(program, "uViewProjection"),
      cameraPosition: gl.getUniformLocation(program, "uCameraPosition"),
      fogColor: gl.getUniformLocation(program, "uFogColor"),
      color: gl.getUniformLocation(program, "uColor"),
      emissive: gl.getUniformLocation(program, "uEmissive"),
      alpha: gl.getUniformLocation(program, "uAlpha")
    };

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      clearInput();
      showWebGLError("O cenário 3D foi pausado porque o navegador perdeu a aceleração gráfica. Recarregue a página para continuar.");
    });

    canvas.addEventListener("webglcontextrestored", () => window.location.reload());

    bindEvents();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    showMenu();
    canvasReady = true;
    requestAnimationFrame(frame);
    renderScene(0);
  } catch (error) {
    console.error(error);
    showWebGLError("Não foi possível criar o cenário 3D neste dispositivo. Verifique se a aceleração gráfica está ativada.");
  }
}

function showWebGLError(message) {
  state.phase = "error";
  ui.errorMessage.textContent = message;
  ui.menuScreen.hidden = true;
  ui.helpScreen.hidden = true;
  ui.settingsScreen.hidden = true;
  ui.pauseScreen.hidden = true;
  ui.phaseScreen.hidden = true;
  ui.resultScreen.hidden = true;
  ui.errorScreen.hidden = false;
  ui.pauseButton.disabled = true;
  ui.playButton.disabled = true;
}

function showMenu() {
  state.phase = "menu";
  state.settingsOrigin = "menu";
  resetWorld();
  hideAllScreens();
  ui.menuScreen.hidden = false;
  ui.pauseButton.disabled = true;
  ui.pauseButton.textContent = "Ⅱ";
  ui.pauseButton.setAttribute("aria-label", "Pausar jogo");
  setStatus("Menu principal • leia a explicação e escolha uma opção");
  window.setTimeout(() => ui.playButton.focus(), 0);
}

function hideAllScreens() {
  ui.menuScreen.hidden = true;
  ui.helpScreen.hidden = true;
  ui.settingsScreen.hidden = true;
  ui.pauseScreen.hidden = true;
  ui.phaseScreen.hidden = true;
  ui.resultScreen.hidden = true;
  ui.errorScreen.hidden = true;
  ui.countdown.hidden = true;
}

function focusGameCanvas() {
  if (state.phase === "running" || state.phase === "countdown") {
    canvas.focus({ preventScroll: true });
  }
}

function startRun() {
  if (!canvasReady) {
    return;
  }

  unlockAudio();
  resetWorld();
  hideAllScreens();
  state.phase = "countdown";
  state.countdown = 3.2;
  ui.countdown.hidden = false;
  ui.countdownValue.textContent = "3";
  ui.pauseButton.disabled = false;
  ui.pauseButton.textContent = "Ⅱ";
  ui.pauseButton.setAttribute("aria-label", "Pausar jogo");
  setStatus(`Fase 1 • ${PHASES[0].name} — contagem regressiva`);
  playTone(440, 0.08, "sine", 0.035);
  focusGameCanvas();
}

function pauseGame() {
  if (state.phase !== "running" && state.phase !== "countdown") {
    return;
  }

  state.pausedFrom = state.phase;
  state.phase = "paused";
  state.shake = 0;
  clearInput();
  ui.countdown.hidden = true;
  ui.pauseScreen.hidden = false;
  ui.pauseButton.textContent = "▶";
  ui.pauseButton.setAttribute("aria-label", "Continuar jogo");
  setStatus("Corrida pausada");
  window.setTimeout(() => ui.resumeButton.focus(), 0);
}

function resumeGame() {
  if (state.phase !== "paused") {
    return;
  }

  state.phase = state.pausedFrom;
  ui.pauseScreen.hidden = true;
  if (state.phase === "countdown") {
    ui.countdown.hidden = false;
  }
  ui.pauseButton.textContent = "Ⅱ";
  ui.pauseButton.setAttribute("aria-label", "Pausar jogo");
  setStatus(state.phase === "countdown" ? "Prepare-se para correr" : "Vale aceso • mantenha o ritmo");
  clearInput();
  window.setTimeout(() => canvas.focus(), 0);
}

function togglePause() {
  if (state.phase === "paused") {
    resumeGame();
  } else {
    pauseGame();
  }
}

function finishRun(completedAllPhases = false) {
  if (state.phase === "finished") {
    return;
  }

  state.phase = "finished";
  state.speed = 0;
  state.shake = 0;
  clearInput();
  ui.countdown.hidden = true;
  ui.pauseScreen.hidden = true;
  ui.phaseScreen.hidden = true;
  ui.pauseButton.disabled = true;
  state.score = Math.floor(state.distance * 2 + state.crystalScore);

  const isRecord = state.score > state.highScore;
  if (isRecord) {
    state.highScore = state.score;
    saveHighScore(state.highScore);
  }

  const completedPhases = completedAllPhases ? PHASES.length : state.completedPhases;
  const goalReached = completedAllPhases;
  ui.resultIcon.textContent = goalReached ? "✦" : "◈";
  ui.resultTitle.textContent = goalReached ? "A aurora brilha!" : "Boa corrida!";
  if (completedAllPhases) {
    ui.resultMessage.textContent = `Você concluiu as ${PHASES.length} fases do vale e percorreu ${formatNumber(Math.floor(state.distance))} metros.`;
  } else {
    const currentPhase = getCurrentPhase();
    ui.resultMessage.textContent = `Você chegou à fase ${currentPhase.number} de ${PHASES.length} — ${currentPhase.name}. Tente completar o próximo trecho!`;
  }
  ui.finalScore.textContent = formatNumber(state.score);
  ui.finalDistance.textContent = `${formatNumber(Math.floor(state.distance))} m`;
  ui.finalCrystals.textContent = formatNumber(state.crystals);
  ui.finalCombo.textContent = `x${state.bestCombo}`;
  ui.finalPhases.textContent = `${completedPhases} / ${PHASES.length}`;
  ui.recordMessage.textContent = isRecord
    ? `🏅 Novo recorde: ${formatNumber(state.highScore)} pontos!`
    : `Recorde atual: ${formatNumber(state.highScore)} pontos.`;
  updateHud();
  ui.resultScreen.hidden = false;
  setStatus(goalReached ? "Meta concluída • a aurora está completa" : "Fim da corrida • veja seu resultado");
  playTone(goalReached ? 740 : 260, 0.28, "triangle", 0.05);
  window.setTimeout(() => ui.playAgainButton.focus(), 0);
}

function completeCurrentPhase() {
  if (state.phase !== "running") {
    return;
  }

  const completedPhase = getCurrentPhase();
  state.completedPhases = completedPhase.number;
  const crystalGoalReached = state.phaseCrystals >= completedPhase.crystalGoal;

  if (crystalGoalReached) {
    state.crystalScore += 100;
    state.health = Math.min(CONFIG.maxHealth, state.health + 1);
  }

  if (state.phaseIndex >= PHASES.length - 1) {
    finishRun(true);
    return;
  }

  const nextPhase = PHASES[state.phaseIndex + 1];
  state.phase = "intermission";
  state.speed = 0;
  state.shake = 0;
  clearInput();
  ui.countdown.hidden = true;
  ui.pauseScreen.hidden = true;
  ui.pauseButton.disabled = true;
  ui.phaseBadge.textContent = completedPhase.number === 1 ? "✦" : "◈";
  ui.phaseTag.textContent = `Fase ${completedPhase.number} concluída`;
  ui.phaseTitle.textContent = completedPhase.name;
  ui.phaseDescription.textContent = crystalGoalReached
    ? `Você atravessou ${completedPhase.name}. Meta de cristais cumprida: +100 pontos e uma integridade reparada.`
    : `Você atravessou ${completedPhase.name}. Coletar mais cristais teria dado um bônus de pontos e integridade.`;
  ui.phaseDistance.textContent = `${formatNumber(completedPhase.distance)} m`;
  ui.phaseCrystalsValue.textContent = `${state.phaseCrystals} / ${completedPhase.crystalGoal}`;
  ui.phaseNextText.textContent = `Próxima: ${nextPhase.name} — ${nextPhase.description}`;
  ui.phaseScreen.hidden = false;
  updateHud();
  setStatus(`Fase ${completedPhase.number} concluída • prepare-se para ${nextPhase.name}`);
  playTone(520, 0.16, "triangle", 0.04);
  window.setTimeout(() => ui.nextPhaseButton.focus(), 0);
}

function beginNextPhase() {
  if (state.phase !== "intermission") {
    return;
  }

  state.phaseIndex += 1;
  state.phaseStartDistance = state.distance;
  state.phaseDistance = 0;
  state.phaseCrystals = 0;
  state.stage = 0;
  state.boostTimer = 0;
  state.boostActive = false;
  state.invulnerable = 1;
  state.playerY = 0;
  state.playerVY = 0;
  state.sliding = false;
  state.slideTimer = 0;
  state.gateZ = -150;
  populateTrack();

  const nextPhase = getCurrentPhase();
  state.phase = "countdown";
  state.countdown = 2.6;
  clearInput();
  ui.phaseScreen.hidden = true;
  ui.countdown.hidden = false;
  ui.countdownValue.textContent = "3";
  ui.pauseButton.disabled = false;
  updateHud();
  setStatus(`Fase ${nextPhase.number} • ${nextPhase.name} — contagem regressiva`);
  playTone(440, 0.08, "sine", 0.035);
  focusGameCanvas();
}

function openHelp() {
  if (state.phase === "running" || state.phase === "countdown") {
    pauseGame();
    return;
  }
  state.settingsOrigin = "help";
  ui.menuScreen.hidden = true;
  ui.helpScreen.hidden = false;
  window.setTimeout(() => document.querySelector("[data-close-screen='helpScreen']").focus(), 0);
}

function closeHelp() {
  ui.helpScreen.hidden = true;
  if (state.phase === "menu") {
    ui.menuScreen.hidden = false;
    window.setTimeout(() => ui.howToButton.focus(), 0);
  }
}

function openSettings(origin = "menu") {
  if (state.phase === "running" || state.phase === "countdown") {
    pauseGame();
    origin = "pause";
  }
  state.settingsOrigin = origin;
  ui.menuScreen.hidden = true;
  ui.pauseScreen.hidden = true;
  ui.phaseScreen.hidden = true;
  ui.resultScreen.hidden = true;
  ui.settingsScreen.hidden = false;
  window.setTimeout(() => document.querySelector("[data-close-screen='settingsScreen']").focus(), 0);
}

function closeSettings() {
  ui.settingsScreen.hidden = true;
  if (state.settingsOrigin === "phase" || state.phase === "intermission") {
    ui.phaseScreen.hidden = false;
    window.setTimeout(() => ui.nextPhaseButton.focus(), 0);
  } else if (state.settingsOrigin === "pause" || state.phase === "paused") {
    ui.pauseScreen.hidden = false;
    window.setTimeout(() => ui.resumeButton.focus(), 0);
  } else {
    ui.menuScreen.hidden = false;
    window.setTimeout(() => ui.accessibilityButton.focus(), 0);
  }
}

function resetWorld() {
  state.distance = 0;
  state.speed = PHASES[0].baseSpeed;
  state.score = 0;
  state.crystalScore = 0;
  state.crystals = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.health = CONFIG.maxHealth;
  state.lane = 1;
  state.targetLane = 1;
  state.playerX = CONFIG.lanes[1];
  state.playerY = 0;
  state.playerVY = 0;
  state.playerBank = 0;
  state.sliding = false;
  state.slideTimer = 0;
  state.invulnerable = 0;
  state.boostTimer = 0;
  state.boostActive = false;
  state.shake = 0;
  state.flash = 0;
  state.stage = 0;
  state.hudTimer = 0;
  state.phaseIndex = 0;
  state.phaseStartDistance = 0;
  state.phaseDistance = 0;
  state.phaseCrystals = 0;
  state.completedPhases = 0;
  state.gateZ = -170;
  state.roadMarkers = Array.from({ length: 19 }, (_, index) => ({ z: -index * 9.5 }));

  state.stars = Array.from({ length: 110 }, () => ({
    x: randomBetween(-35, 35),
    y: randomBetween(4, 23),
    z: randomBetween(-165, -5),
    size: randomBetween(0.06, 0.19),
    phase: randomBetween(0, Math.PI * 2),
    warm: Math.random() > 0.82
  }));

  state.decor = Array.from({ length: 26 }, (_, index) => ({
    x: (index % 2 === 0 ? -1 : 1) * randomBetween(5.6, 13.5),
    y: randomBetween(0.3, 2.4),
    z: -8 - index * 6.2,
    size: randomBetween(0.5, 1.8),
    phase: randomBetween(0, Math.PI * 2)
  }));

  populateTrack();
  state.lastTime = performance.now();
  updateHud();
}

function populateTrack() {
  state.objects = [];
  state.particles = [];
  state.spawnZ = -20;
  for (let index = 0; index < 15; index += 1) {
    spawnRow(state.spawnZ - index * CONFIG.rowGap);
  }
  state.spawnZ = -20 - 15 * CONFIG.rowGap;
}

function getCurrentPhase() {
  return PHASES[clamp(state.phaseIndex, 0, PHASES.length - 1)];
}

function getPhaseProgress() {
  const phase = getCurrentPhase();
  return clamp(state.phaseDistance / phase.distance, 0, 1);
}

function spawnRow(z) {
  const phase = getCurrentPhase();
  const difficulty = clamp(phase.difficulty + getPhaseProgress() * 0.16, 0, 1);
  const roll = Math.random();
  const lane = randomInteger(0, 2);
  const palette = activePalette();

  if (roll < 0.28) {
    const count = Math.random() < 0.42 ? 2 : 1;
    for (let index = 0; index < count; index += 1) {
      const crystalLane = count === 1 ? lane : (lane + index) % 3;
      state.objects.push({
        type: "crystal",
        lane: crystalLane,
        x: CONFIG.lanes[crystalLane],
        y: 0.9,
        z: z - index * 1.8,
        width: 0.7,
        height: 0.7,
        depth: 0.7,
        rotationX: randomBetween(0, Math.PI),
        rotationY: randomBetween(0, Math.PI),
        rotationZ: randomBetween(0, Math.PI),
        phase: randomBetween(0, Math.PI * 2),
        color: palette.crystal
      });
    }
    return;
  }

  if (roll < 0.72) {
    const types = difficulty > 0.5
      ? ["wall", "rock", "branch", "rock"]
      : ["wall", "rock", "branch"];
    const type = types[randomInteger(0, types.length - 1)];
    const color = type === "wall" ? palette.wall : type === "branch" ? palette.branch : palette.rock;
    const base = {
      type,
      lane,
      x: CONFIG.lanes[lane],
      y: type === "branch" ? 1.8 : type === "wall" ? 1.15 : 0.55,
      z,
      width: type === "wall" ? 1.95 : type === "branch" ? 2.15 : 1.3,
      height: type === "wall" ? 2.3 : type === "branch" ? 0.5 : 1.15,
      depth: type === "wall" ? 0.7 : 0.9,
      rotationX: 0,
      rotationY: randomBetween(-0.08, 0.08),
      rotationZ: 0,
      phase: randomBetween(0, Math.PI * 2),
      color
    };
    state.objects.push(base);

    if (Math.random() < 0.3) {
      const crystalLane = (lane + 1 + randomInteger(0, 1)) % 3;
      state.objects.push({
        type: "crystal",
        lane: crystalLane,
        x: CONFIG.lanes[crystalLane],
        y: 0.95,
        z: z - 1.5,
        width: 0.7,
        height: 0.7,
        depth: 0.7,
        rotationX: 0,
        rotationY: randomBetween(0, Math.PI),
        rotationZ: 0,
        phase: randomBetween(0, Math.PI * 2),
        color: palette.crystal
      });
    }
    return;
  }

  if (roll < 0.84) {
    state.objects.push({
      type: "boost",
      lane,
      x: CONFIG.lanes[lane],
      y: 0.9,
      z,
      width: 0.8,
      height: 0.8,
      depth: 0.8,
      rotationX: 0,
      rotationY: randomBetween(0, Math.PI),
      rotationZ: 0,
      phase: randomBetween(0, Math.PI * 2),
      color: palette.boost
    });
  }
}

function ensureFutureRows() {
  while (state.spawnZ > -CONFIG.spawnAhead) {
    spawnRow(state.spawnZ);
    state.spawnZ -= CONFIG.rowGap;
  }
}

function updateGame(deltaTime) {
  state.invulnerable = Math.max(0, state.invulnerable - deltaTime);
  state.shake = Math.max(0, state.shake - deltaTime * 1.7);
  state.flash = Math.max(0, state.flash - deltaTime * 2.2);
  state.boostTimer = Math.max(0, state.boostTimer - deltaTime);
  state.boostActive = state.boostTimer > 0;
  state.hudTimer = Math.max(0, state.hudTimer - deltaTime);

  if (state.slideTimer > 0) {
    state.slideTimer = Math.max(0, state.slideTimer - deltaTime);
    if (state.slideTimer === 0) {
      state.sliding = false;
    }
  }

  updatePlayer(deltaTime);

  const phase = getCurrentPhase();
  const phaseProgress = getPhaseProgress();
  const baseSpeed = phase.baseSpeed + phaseProgress * 3;
  state.speed = clamp(baseSpeed + (state.boostActive ? 8 : 0), phase.baseSpeed, CONFIG.maxSpeed + 8);
  const worldMovement = state.speed * deltaTime;
  state.distance += worldMovement;
  state.spawnZ += worldMovement;
  state.phaseDistance = state.distance - state.phaseStartDistance;
  state.score = Math.floor(state.distance * 2 + state.crystalScore);
  state.gateZ += worldMovement;
  if (state.gateZ > 16) {
    state.gateZ = -170;
  }

  state.roadMarkers.forEach((marker) => {
    marker.z += worldMovement;
    if (marker.z > 9) {
      marker.z -= 19 * 9.5;
    }
  });

  state.decor.forEach((item) => {
    item.z += worldMovement * 0.48;
    if (item.z > 8) {
      item.z -= 160;
      item.x = (item.x < 0 ? -1 : 1) * randomBetween(5.6, 13.5);
      item.y = randomBetween(0.3, 2.4);
      item.size = randomBetween(0.5, 1.8);
    }
  });

  state.stars.forEach((star) => {
    star.z += worldMovement * 0.08;
    if (star.z > -3) {
      star.z -= 165;
    }
  });

  updateObjects(worldMovement);
  if (state.phase !== "running") {
    updateParticles(deltaTime, worldMovement);
    if (state.hudTimer <= 0) {
      updateHud();
      state.hudTimer = 0.08;
    }
    return;
  }

  updateParticles(deltaTime, worldMovement);
  if (state.boostActive && Math.random() < deltaTime * 18) {
    spawnParticles(state.playerX, 0.42, 1.2, activePalette().thruster, 1, true);
  }

  ensureFutureRows();
  if (state.phaseDistance >= getCurrentPhase().distance) {
    completeCurrentPhase();
    return;
  }

  updateStageMessage();
  if (state.hudTimer <= 0) {
    updateHud();
    state.hudTimer = 0.08;
  }
}

function updatePlayer(deltaTime) {
  const previousX = state.playerX;
  const targetX = CONFIG.lanes[state.targetLane];
  state.playerX += (targetX - state.playerX) * Math.min(1, deltaTime * 13);
  const horizontalVelocity = (state.playerX - previousX) / Math.max(deltaTime, 0.001);
  state.playerBank += (horizontalVelocity * 0.025 - state.playerBank) * Math.min(1, deltaTime * 9);
  state.playerBank = clamp(state.playerBank, -0.38, 0.38);

  state.playerVY -= CONFIG.gravity * deltaTime;
  state.playerY += state.playerVY * deltaTime;
  if (state.playerY <= 0) {
    state.playerY = 0;
    state.playerVY = 0;
  }
}

function updateObjects(worldMovement) {
  for (const object of state.objects) {
    const previousZ = object.z;
    object.z += worldMovement;
    object.rotationY += object.type === "crystal" ? worldMovement * 0.018 : 0.004;
    object.rotationX += object.type === "rock" ? worldMovement * 0.005 : 0;

    if (object.z > 14 || object.remove) {
      object.remove = true;
      continue;
    }

    if (object.passed || !overlapsPlayer(object, previousZ)) {
      if (state.settings.announcer && !object.announced && object.type !== "crystal" && object.z > -12 && object.z < -10) {
        object.announced = true;
        announce(`À frente: ${describeObject(object)}`, true);
      }
      continue;
    }

    if (object.type === "crystal") {
      collectCrystal(object);
    } else if (object.type === "boost") {
      collectBoost(object);
    } else if (object.type === "branch") {
      if (state.sliding) {
        object.passed = true;
        state.crystalScore += 5;
        spawnParticles(object.x, object.y, object.z, activePalette().cyan, 8);
        playTone(520, 0.07, "triangle", 0.025);
        announce("Deslize perfeito • +5 pontos", false);
      } else {
        object.remove = true;
        takeDamage(object);
      }
    } else if (object.type === "rock") {
      if (state.playerY >= 0.86) {
        object.passed = true;
        announce("Bom salto", false);
      } else {
        object.remove = true;
        takeDamage(object);
      }
    } else {
      object.remove = true;
      takeDamage(object);
    }
  }

  state.objects = state.objects.filter((object) => !object.remove);
}

function overlapsPlayer(object, previousZ) {
  const halfDepth = object.depth * 0.5 + 0.42;
  const objectMinZ = Math.min(previousZ, object.z) - halfDepth;
  const objectMaxZ = Math.max(previousZ, object.z) + halfDepth;
  const overlapsDepth = objectMaxZ >= -0.42 && objectMinZ <= 0.42;
  const overlapsSide = Math.abs(object.x - state.playerX) <= object.width * 0.5 + 0.48;
  return overlapsDepth && overlapsSide;
}

function collectCrystal(object) {
  object.remove = true;
  state.crystals += 1;
  state.phaseCrystals += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const comboBonus = Math.min(Math.max(state.combo - 1, 0) * 5, 50);
  state.crystalScore += 25 + comboBonus;
  state.score = Math.floor(state.distance * 2 + state.crystalScore);
  spawnParticles(object.x, object.y, object.z, activePalette().crystal, 14);
  playTone(620 + Math.min(state.combo, 8) * 35, 0.09, "sine", 0.035);
  announce(`Cristal coletado • sequência x${state.combo}`, false);
  updateHud();
}

function collectBoost(object) {
  object.remove = true;
  state.boostTimer = Math.min(5.5, state.boostTimer + 3.2);
  state.crystalScore += 20;
  spawnParticles(object.x, object.y, object.z, activePalette().boost, 18);
  playTone(280, 0.2, "sawtooth", 0.028);
  announce("Impulso de cristal • velocidade extra por alguns segundos", false);
}

function takeDamage(object) {
  if (state.invulnerable > 0 || state.phase !== "running") {
    return;
  }

  state.health = Math.max(0, state.health - 1);
  state.invulnerable = 1.35;
  state.combo = 0;
  state.shake = 0.45;
  state.flash = 0.26;
  spawnParticles(state.playerX, 0.75, 0.15, activePalette().wall, 18);
  showHitFlash();
  playTone(110, 0.2, "sawtooth", 0.045);

  const description = state.settings.announcer
    ? `Colisão com ${describeObject(object)}. `
    : "Colisão! ";
  announce(`${description}Integridade ${state.health} de ${CONFIG.maxHealth}.`, true);
  updateHud();

  if (state.health <= 0) {
    finishRun();
  }
}

function updateParticles(deltaTime, worldMovement) {
  for (const particle of state.particles) {
    particle.life -= deltaTime;
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.z += worldMovement * 0.65 + particle.vz * deltaTime;
    particle.vy -= 5.5 * deltaTime;
    particle.rotationX += deltaTime * 3;
    particle.rotationY += deltaTime * 5;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0 && particle.z < 8);
}

function spawnParticles(x, y, z, color, amount, trail = false) {
  const safeAmount = state.settings.motion ? Math.ceil(amount * 0.35) : amount;
  for (let index = 0; index < safeAmount; index += 1) {
    const life = randomBetween(0.28, trail ? 0.55 : 0.8);
    state.particles.push({
      x,
      y,
      z,
      vx: randomBetween(-1.7, 1.7),
      vy: randomBetween(0.2, trail ? 2.2 : 4.2),
      vz: randomBetween(-1.4, 1.4),
      size: randomBetween(trail ? 0.08 : 0.1, trail ? 0.2 : 0.28),
      rotationX: randomBetween(0, Math.PI),
      rotationY: randomBetween(0, Math.PI),
      rotationZ: randomBetween(0, Math.PI),
      life,
      maxLife: life,
      color
    });
  }
  if (state.particles.length > 130) {
    state.particles.splice(0, state.particles.length - 130);
  }
}

function updateStageMessage() {
  const progress = getPhaseProgress();
  const nextStage = progress >= 0.72 ? 2 : progress >= 0.38 ? 1 : 0;
  if (nextStage <= state.stage || state.boostActive) {
    return;
  }
  state.stage = nextStage;
  const phase = getCurrentPhase();
  const messages = [
    `${phase.name} • mantenha o ritmo`,
    `${phase.name} • a parte mais intensa está chegando`,
    `${phase.name} • o portal da fase está próximo`
  ];
  announce(messages[nextStage - 1], false);
}

function updateCountdown(deltaTime) {
  state.countdown -= deltaTime;
  const nextCountdown = String(Math.max(1, Math.ceil(state.countdown)));
  if (ui.countdownValue.textContent !== nextCountdown) {
    ui.countdownValue.textContent = nextCountdown;
  }
  if (state.countdown <= 0) {
    state.phase = "running";
    ui.countdown.hidden = true;
    ui.pauseButton.disabled = false;
    focusGameCanvas();
    const phase = getCurrentPhase();
    setStatus(`Valendo! • Fase ${phase.number}: ${phase.name}`);
    playTone(660, 0.12, "sine", 0.04);
  }
}

function frame(now) {
  const deltaTime = Math.min(Math.max((now - state.lastTime) / 1000, 0), 0.05);
  state.lastTime = now;
  state.visualTime += state.settings.motion ? deltaTime * 0.12 : deltaTime;

  if (state.phase === "countdown") {
    updateCountdown(deltaTime);
  } else if (state.phase === "running") {
    updateGame(deltaTime);
  }

  if (canvasReady) {
    renderScene(state.visualTime);
  }
  requestAnimationFrame(frame);
}

function renderScene(time) {
  if (!gl || !program || gl.isContextLost()) {
    return;
  }

  const displayWidth = canvas.width;
  const displayHeight = canvas.height;
  const aspect = displayWidth / displayHeight;
  const portraitAmount = Math.max(0, 1 - aspect);
  const fieldOfView = (58 + portraitAmount * 10) * Math.PI / 180;
  const cameraZ = 9.4 + portraitAmount * 25;
  const cameraY = 4.5 + portraitAmount * 1.25;
  const shakeAmount = state.phase === "running" && !state.settings.motion ? state.shake * 0.12 : 0;
  const camera = [
    state.playerX * 0.16 + randomBetween(-shakeAmount, shakeAmount),
    cameraY + randomBetween(-shakeAmount, shakeAmount),
    cameraZ
  ];
  const target = [state.playerX * 0.28, 0.8, -18];
  const viewProjection = multiply(
    perspective(fieldOfView, aspect, 0.1, 220),
    lookAt(camera, target, [0, 1, 0])
  );
  const palette = activePalette();

  gl.viewport(0, 0, displayWidth, displayHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniformMatrix4fv(uniforms.viewProjection, false, viewProjection);
  gl.uniform3fv(uniforms.cameraPosition, camera);
  gl.uniform3fv(uniforms.fogColor, palette.fog);

  drawEnvironment(time, palette);
  drawObjects(time, palette);
  drawParticles(palette);
  drawPlayer(time, palette);
}

function drawEnvironment(time, palette) {
  drawCube(0, -0.48, -70, 11, 0.72, 174, palette.road, 0, 0, 0, 0);
  drawCube(-6.35, 0.04, -70, 2.5, 0.42, 174, palette.shoulder, 0, 0, 0, 0.02);
  drawCube(6.35, 0.04, -70, 2.5, 0.42, 174, palette.shoulder, 0, 0, 0, 0.02);
  drawCube(-5.15, 0.48, -70, 0.18, 0.18, 174, palette.rail, 0, 0, 0, 0.9);
  drawCube(5.15, 0.48, -70, 0.18, 0.18, 174, palette.rail, 0, 0, 0, 0.9);

  drawCube(-1.4, 0.005, -70, 0.035, 0.018, 174, palette.lane, 0, 0, 0, 0.6);
  drawCube(1.4, 0.005, -70, 0.035, 0.018, 174, palette.lane, 0, 0, 0, 0.6);

  state.roadMarkers.forEach((marker, index) => {
    const color = index % 4 === 0 ? palette.laneBright : palette.lane;
    drawCube(0, 0.025, marker.z, 9.8, 0.035, 0.08, color, 0, 0, 0, index % 4 === 0 ? 1 : 0.55);
  });

  state.decor.forEach((item) => {
    const pulse = 0.85 + Math.sin(time * 1.6 + item.phase) * 0.15;
    drawOctahedron(
      item.x,
      item.y,
      item.z,
      item.size * pulse,
      item.size * 1.8 * pulse,
      item.size * pulse,
      item.x < 0 ? palette.crystal : palette.violet,
      0,
      time * 0.2 + item.phase,
      0,
      0.55
    );
  });

  state.stars.forEach((star) => {
    const pulse = 0.65 + Math.sin(time * 1.8 + star.phase) * 0.35;
    const size = star.size * pulse;
    drawCube(star.x, star.y, star.z, size, size, size, star.warm ? palette.starWarm : palette.star, 0, time * 0.15, 0, 0.95);
  });

  drawOctahedron(-15, 8, -145, 9, 15, 9, palette.mountain, 0, 0.1, 0.05, 0.02);
  drawOctahedron(17, 10, -155, 11, 18, 11, palette.mountainFar, 0, -0.1, -0.04, 0.02);
  drawOctahedron(31, 6, -178, 14, 11, 14, palette.mountain, 0, 0.3, 0, 0.01);
  drawOctahedron(-32, 5, -170, 13, 9, 13, palette.mountainFar, 0, -0.3, 0, 0.01);

  drawPortal(time, palette);
}

function drawPortal(time, palette) {
  if (state.gateZ > 8) {
    return;
  }
  const pulse = 0.85 + Math.sin(time * 4) * 0.15;
  drawCube(-4.65, 3.3, state.gateZ, 0.24, 6.6, 0.24, palette.laneBright, 0, 0, 0, 1);
  drawCube(4.65, 3.3, state.gateZ, 0.24, 6.6, 0.24, palette.laneBright, 0, 0, 0, 1);
  drawCube(0, 6.7, state.gateZ, 9.5, 0.24, 0.24, palette.laneBright, 0, 0, 0, 1);
  drawOctahedron(0, 3.35, state.gateZ, 1.05 * pulse, 1.05 * pulse, 1.05 * pulse, palette.boost, 0, time * 1.4, time, 1);
}

function drawObjects(time, palette) {
  const sortedObjects = state.objects.slice().sort((left, right) => left.z - right.z);
  sortedObjects.forEach((object) => {
    if (object.type === "crystal") {
      const floatY = object.y + Math.sin(time * 4 + object.phase) * 0.16;
      drawOctahedron(
        object.x,
        floatY,
        object.z,
        object.width,
        object.height,
        object.depth,
        object.color,
        object.rotationX,
        object.rotationY + time * 1.8,
        object.rotationZ,
        1
      );
      drawOctahedron(
        object.x,
        floatY,
        object.z,
        object.width * 1.55,
        object.height * 1.55,
        object.depth * 1.55,
        palette.crystal,
        object.rotationX,
        object.rotationY + time * 1.8,
        object.rotationZ,
        0.18,
        0.22
      );
      return;
    }

    if (object.type === "boost") {
      drawOctahedron(object.x, object.y, object.z, object.width, object.height, object.depth, object.color, time * 1.3, time * 2, 0, 1);
      drawCube(object.x, object.y, object.z, 0.16, 1.8, 0.16, palette.laneBright, 0, 0, 0, 1);
      drawCube(object.x, object.y, object.z, 1.8, 0.16, 0.16, palette.laneBright, 0, 0, 0, 1);
      return;
    }

    if (object.type === "rock") {
      drawOctahedron(object.x, object.y, object.z, object.width, object.height, object.depth, object.color, object.rotationX, object.rotationY, object.rotationZ, 0.25);
      drawOctahedron(object.x, object.y + 0.1, object.z - 0.2, object.width * 0.55, object.height * 0.7, object.depth * 0.55, palette.crystal, 0, time, 0, 0.5);
      return;
    }

    if (object.type === "branch") {
      drawCube(object.x, object.y, object.z, object.width, object.height, object.depth, object.color, 0, object.rotationY, 0, 0.3);
      drawCube(object.x - object.width * 0.43, object.y - 0.55, object.z, 0.18, 1.35, 0.18, palette.branch, 0, object.rotationY, 0.15, 0.45);
      drawCube(object.x + object.width * 0.43, object.y - 0.55, object.z, 0.18, 1.35, 0.18, palette.branch, 0, object.rotationY, -0.15, 0.45);
      return;
    }

    drawCube(object.x, object.y, object.z, object.width, object.height, object.depth, object.color, object.rotationX, object.rotationY, object.rotationZ, 0.12);
    drawCube(object.x, object.y + object.height * 0.54, object.z, object.width * 1.05, 0.12, object.depth * 1.05, palette.laneBright, object.rotationX, object.rotationY, object.rotationZ, 0.9);
  });
}

function drawParticles(palette) {
  state.particles.forEach((particle) => {
    const visibility = clamp(particle.life / particle.maxLife, 0, 1);
    const size = particle.size * visibility;
    drawCube(
      particle.x,
      particle.y,
      particle.z,
      size,
      size,
      size,
      particle.color || palette.crystal,
      particle.rotationX,
      particle.rotationY,
      particle.rotationZ,
      1
    );
  });
}

function drawPlayer(time, palette) {
  const hover = Math.sin(time * 4.2) * 0.045;
  const y = state.playerY + hover;
  const bank = state.playerBank;
  const slide = state.sliding;
  const blink = state.invulnerable > 0 && Math.floor(time * 12) % 2 === 0;
  const opacity = blink ? 0.38 : 1;

  if (state.boostActive) {
    drawCube(state.playerX, 0.23, 1.35, 0.44, 0.18, 1.5, palette.thruster, 0, bank, 0, 1, opacity);
    drawCube(state.playerX, 0.2, 2.1, 0.24, 0.1, 1.3, palette.boost, 0, bank, 0, 1, opacity);
  }

  drawCube(state.playerX, y + 0.3, 0, 1.75, 0.26, 2.55, palette.board, 0, bank, bank, 0.8, opacity);
  drawCube(state.playerX, y + 0.16, 0, 1.98, 0.09, 2.1, palette.laneBright, 0, bank, bank, 1, opacity);

  if (!slide) {
    drawCube(state.playerX, y + 0.88, -0.15, 0.78, 0.82, 0.78, palette.suit, 0, bank, bank, 0.25, opacity);
    drawOctahedron(state.playerX, y + 1.55, -0.12, 0.56, 0.56, 0.56, palette.helmet, 0, bank + time * 0.25, 0, 0.45, opacity);
    drawCube(state.playerX, y + 1.56, -0.44, 0.48, 0.2, 0.08, palette.visor, 0, bank, bank, 0.25, opacity);
    drawCube(state.playerX - 0.5, y + 0.72, 0.1, 0.2, 0.65, 0.2, palette.suit, 0, bank, bank + 0.2, 0.1, opacity);
    drawCube(state.playerX + 0.5, y + 0.72, 0.1, 0.2, 0.65, 0.2, palette.suit, 0, bank, bank - 0.2, 0.1, opacity);
    drawCube(state.playerX - 0.22, y + 0.33, 0.15, 0.22, 0.45, 0.24, palette.helmet, 0, bank, bank, 0.1, opacity);
    drawCube(state.playerX + 0.22, y + 0.33, 0.15, 0.22, 0.45, 0.24, palette.helmet, 0, bank, bank, 0.1, opacity);
  } else {
    drawCube(state.playerX, y + 0.54, -0.15, 0.95, 0.5, 1.2, palette.suit, 0, bank, bank - 0.08, 0.25, opacity);
    drawOctahedron(state.playerX, y + 1.0, -0.42, 0.46, 0.46, 0.46, palette.helmet, 0, bank + time * 0.25, 0, 0.45, opacity);
    drawCube(state.playerX, y + 1.0, -0.67, 0.4, 0.18, 0.07, palette.visor, 0, bank, bank, 0.25, opacity);
  }

  if (state.invulnerable > 0 && !state.settings.motion) {
    drawOctahedron(state.playerX, y + 0.85, 0, 1.1, 1.5, 0.8, palette.cyan, 0, time * 3, 0, 0.16, 0.22);
  }

  gl.colorMask(false, false, false, false);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.colorMask(true, true, true, true);
}

function trapDialogFocus(event) {
  const dialogs = [ui.menuScreen, ui.helpScreen, ui.settingsScreen, ui.pauseScreen, ui.phaseScreen, ui.resultScreen, ui.errorScreen];
  const dialog = dialogs.find((screen) => !screen.hidden);
  if (!dialog) {
    return;
  }

  const focusable = [...dialog.querySelectorAll("button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")];
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!dialog.contains(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function bindEvents() {
  ui.playButton.addEventListener("click", startRun);
  ui.howToButton.addEventListener("click", openHelp);
  ui.accessibilityButton.addEventListener("click", () => openSettings("menu"));
  ui.soundButton.addEventListener("click", () => {
    state.settings.sound = !state.settings.sound;
    saveSettings();
    applySettings();
    if (state.settings.sound) {
      unlockAudio();
      playTone(520, 0.1, "sine", 0.035);
    }
  });

  ui.pauseButton.addEventListener("click", togglePause);
  ui.resumeButton.addEventListener("click", resumeGame);
  ui.pauseSettingsButton.addEventListener("click", () => openSettings("pause"));
  ui.pauseRestartButton.addEventListener("click", startRun);
  ui.pauseMenuButton.addEventListener("click", showMenu);
  ui.nextPhaseButton.addEventListener("click", beginNextPhase);
  ui.phaseSettingsButton.addEventListener("click", () => openSettings("phase"));
  ui.playAgainButton.addEventListener("click", startRun);
  ui.resultMenuButton.addEventListener("click", showMenu);

  document.querySelectorAll("[data-close-screen]").forEach((button) => {
    button.addEventListener("click", () => {
      const screenId = button.dataset.closeScreen;
      if (screenId === "helpScreen") {
        closeHelp();
      } else if (screenId === "settingsScreen") {
        closeSettings();
      }
    });
  });

  bindSetting(ui.motionToggle, "motion");
  bindSetting(ui.contrastToggle, "contrast");
  bindSetting(ui.largeTextToggle, "largeText");
  bindSetting(ui.colorSafeToggle, "colorSafe");
  bindSetting(ui.announcerToggle, "announcer");
  bindSetting(ui.soundToggle, "sound");

  ui.resetSettingsButton.addEventListener("click", () => {
    state.settings = { ...DEFAULT_SETTINGS };
    saveSettings();
    applySettings();
    announce("Preferências restauradas", false);
  });

  bindActionButton(ui.leftButton, () => moveLane(-1));
  bindActionButton(ui.rightButton, () => moveLane(1));
  bindActionButton(ui.jumpButton, jump);
  bindActionButton(ui.slideButton, slide);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      trapDialogFocus(event);
      return;
    }

    const targetTag = event.target?.tagName || "";
    const isFormControl = ["BUTTON", "INPUT", "TEXTAREA", "SELECT"].includes(targetTag);
    if (isFormControl && (event.code === "Space" || event.code === "Enter")) {
      return;
    }

    const helpOpen = !ui.helpScreen.hidden;
    const settingsOpen = !ui.settingsScreen.hidden;
    const pauseOpen = !ui.pauseScreen.hidden;
    const phaseOpen = !ui.phaseScreen.hidden;
    const resultOpen = !ui.resultScreen.hidden;
    const errorOpen = !ui.errorScreen.hidden;
    const menuOpen = !ui.menuScreen.hidden;

    if (event.key === "Escape") {
      if (helpOpen) {
        closeHelp();
      } else if (settingsOpen) {
        closeSettings();
      } else if (pauseOpen) {
        resumeGame();
      } else if (!phaseOpen && !resultOpen && !errorOpen && !menuOpen) {
        togglePause();
      }
      return;
    }

    if (settingsOpen || helpOpen || phaseOpen || resultOpen || errorOpen || menuOpen) {
      return;
    }

    if (pauseOpen) {
      if (event.code === "KeyP") {
        event.preventDefault();
        togglePause();
      }
      return;
    }

    if (["INPUT", "TEXTAREA", "SELECT"].includes(targetTag)) {
      return;
    }

    const code = event.code;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "KeyA", "KeyD", "KeyW", "KeyS", "KeyP"].includes(code)) {
      event.preventDefault();
    }

    if (event.repeat && ["KeyA", "KeyD", "ArrowLeft", "ArrowRight", "KeyW", "ArrowUp", "Space", "KeyS", "ArrowDown"].includes(code)) {
      return;
    }

    if (code === "KeyA" || code === "ArrowLeft") {
      moveLane(-1);
    } else if (code === "KeyD" || code === "ArrowRight") {
      moveLane(1);
    } else if (code === "KeyW" || code === "ArrowUp" || code === "Space") {
      jump();
    } else if (code === "KeyS" || code === "ArrowDown") {
      slide();
    } else if (code === "KeyP") {
      togglePause();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseGame();
    }
  });

  window.addEventListener("blur", () => {
    clearInput();
    if (state.phase === "running" || state.phase === "countdown") {
      pauseGame();
    }
  });

  let gestureStart = null;
  canvas.addEventListener("pointerdown", (event) => {
    if (state.phase !== "running" && state.phase !== "countdown") {
      return;
    }
    gestureStart = { x: event.clientX, y: event.clientY, time: performance.now() };
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!gestureStart) {
      return;
    }
    const deltaX = event.clientX - gestureStart.x;
    const deltaY = event.clientY - gestureStart.y;
    const distance = Math.hypot(deltaX, deltaY);
    gestureStart = null;

    if (distance < 28) {
      jump();
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
      moveLane(deltaX > 0 ? 1 : -1);
    } else if (deltaY < 0) {
      jump();
    } else {
      slide();
    }
  });

  canvas.addEventListener("pointercancel", () => {
    gestureStart = null;
  });
}

function bindSetting(input, key) {
  input.addEventListener("change", () => {
    state.settings[key] = input.checked;
    saveSettings();
    applySettings();
    if (key === "sound" && input.checked) {
      unlockAudio();
      playTone(520, 0.1, "sine", 0.035);
    }
  });
}

function bindActionButton(button, action) {
  let lastAction = 0;
  const trigger = () => {
    const now = performance.now();
    if (now - lastAction < 220) {
      return;
    }
    lastAction = now;
    action();
  };

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    button.classList.add("pressed");
    trigger();
  });
  button.addEventListener("pointerup", () => button.classList.remove("pressed"));
  button.addEventListener("pointercancel", () => button.classList.remove("pressed"));
  button.addEventListener("lostpointercapture", () => button.classList.remove("pressed"));
  button.addEventListener("click", (event) => {
    if (event.detail === 0) {
      trigger();
    }
  });
}

function moveLane(direction) {
  if (state.phase !== "running" && state.phase !== "countdown") {
    return;
  }
  const nextLane = clamp(state.targetLane + direction, 0, CONFIG.lanes.length - 1);
  if (nextLane === state.targetLane) {
    return;
  }
  state.targetLane = nextLane;
  playTone(direction < 0 ? 240 : 290, 0.045, "sine", 0.018);
}

function jump() {
  if (state.phase !== "running" || state.playerY > 0.06) {
    return;
  }
  state.sliding = false;
  state.slideTimer = 0;
  state.playerVY = CONFIG.jumpVelocity;
  playTone(420, 0.09, "sine", 0.03);
  spawnParticles(state.playerX, 0.1, 0.2, activePalette().laneBright, 4, true);
}

function slide() {
  if (state.phase !== "running") {
    return;
  }
  state.sliding = true;
  state.slideTimer = CONFIG.slideDuration;
  state.playerVY = Math.min(state.playerVY, -12);
  playTone(190, 0.12, "triangle", 0.025);
}

function clearInput() {
  state.input.left = false;
  state.input.right = false;
  ui.leftButton.classList.remove("pressed");
  ui.rightButton.classList.remove("pressed");
  ui.jumpButton.classList.remove("pressed");
  ui.slideButton.classList.remove("pressed");
}

function announce(message, warning = false) {
  setStatus(message, warning);
  window.clearTimeout(state.statusTimeout);
  state.statusTimeout = window.setTimeout(() => {
    if (state.phase === "running") {
      setStatus(state.boostActive ? "Impulso ativo • aproveite a velocidade" : "Valendo • escolha a próxima faixa", warning && state.health === 1);
    }
  }, 2500);
}

function setStatus(message, warning = false) {
  ui.statusMessage.textContent = message;
  ui.statusMessage.classList.toggle("warning", warning);
}

function showHitFlash() {
  window.clearTimeout(state.flashTimeout);
  ui.hitFlash.classList.add("visible");
  state.flashTimeout = window.setTimeout(() => ui.hitFlash.classList.remove("visible"), 110);
}

function updateHud() {
  const score = Math.max(0, Math.floor(state.score));
  const phase = getCurrentPhase();
  const phaseDistance = clamp(state.phaseDistance, 0, phase.distance);
  const phaseProgress = clamp(phaseDistance / phase.distance, 0, 1);
  const speedMultiplier = state.speed / phase.baseSpeed;

  ui.scoreValue.textContent = formatNumber(score);
  ui.distanceValue.textContent = `${formatNumber(Math.floor(state.distance))} m`;
  ui.speedValue.textContent = `${speedMultiplier.toFixed(1).replace(".", ",")}x`;
  ui.comboValue.textContent = `x${state.combo}`;
  ui.bestValue.textContent = formatNumber(state.highScore);
  ui.phaseLabel.textContent = `Fase ${phase.number} • ${phase.name}`;
  ui.missionFill.style.width = `${phaseProgress * 100}%`;
  ui.missionValue.textContent = `${formatNumber(Math.floor(phaseDistance))} / ${formatNumber(phase.distance)} m`;
  ui.missionFill.parentElement.setAttribute("aria-valuemax", String(phase.distance));
  ui.missionFill.parentElement.setAttribute("aria-valuenow", String(Math.floor(phaseDistance)));
  if (ui.healthDots.dataset.value !== String(state.health)) {
    ui.healthDots.innerHTML = Array.from({ length: CONFIG.maxHealth }, (_, index) => {
      return `<i class="${index < state.health ? "" : "empty"}"></i>`;
    }).join("");
    ui.healthDots.dataset.value = String(state.health);
  }
  ui.healthDots.setAttribute("aria-label", `${state.health} de ${CONFIG.maxHealth} pontos de integridade`);
  ui.pauseButton.disabled = state.phase !== "running" && state.phase !== "countdown";
  ui.pauseButton.textContent = state.phase === "paused" ? "▶" : "Ⅱ";
  ui.pauseButton.setAttribute("aria-label", state.phase === "paused" ? "Continuar jogo" : "Pausar jogo");
}

function applySettings() {
  document.body.classList.toggle("reduce-motion", state.settings.motion);
  document.body.classList.toggle("high-contrast", state.settings.contrast);
  document.body.classList.toggle("large-text", state.settings.largeText);
  document.body.classList.toggle("color-safe", state.settings.colorSafe);
  ui.motionToggle.checked = state.settings.motion;
  ui.contrastToggle.checked = state.settings.contrast;
  ui.largeTextToggle.checked = state.settings.largeText;
  ui.colorSafeToggle.checked = state.settings.colorSafe;
  ui.announcerToggle.checked = state.settings.announcer;
  ui.soundToggle.checked = state.settings.sound;
  ui.soundButton.textContent = state.settings.sound ? "♫" : "♩";
  ui.soundButton.setAttribute("aria-label", state.settings.sound ? "Desativar som" : "Ativar som");
  ui.statusMessage.setAttribute("aria-live", state.settings.announcer ? "polite" : "off");
  ui.countdown.setAttribute("aria-live", state.settings.announcer ? "assertive" : "off");
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  } catch {
    // O jogo continua funcionando se o navegador bloquear o armazenamento.
  }
}

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    return { ...DEFAULT_SETTINGS, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function readHighScore() {
  try {
    return Number.parseInt(localStorage.getItem(HIGH_SCORE_KEY), 10) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // O jogo continua funcionando se o navegador bloquear o armazenamento.
  }
}

function unlockAudio() {
  if (!state.settings.sound) {
    return;
  }
  try {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioContext = new AudioContext();
      }
    }
    if (audioContext?.state === "suspended") {
      audioContext.resume();
    }
  } catch {
    audioContext = null;
  }
}

function playTone(frequency, duration, type, volume) {
  if (!state.settings.sound || !audioContext) {
    return;
  }
  try {
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  } catch {
    // Áudio é um recurso opcional.
  }
}

function activePalette() {
  if (state.settings.contrast) {
    return PALETTES.contrast;
  }
  if (state.settings.colorSafe) {
    return PALETTES.safe;
  }
  return PALETTES.normal;
}

function describeObject(object) {
  const labels = {
    wall: "barreira de cristal",
    rock: "pedra baixa",
    branch: "galho suspenso",
    crystal: "cristal",
    boost: "orbe de impulso"
  };
  return labels[object.type] || "obstáculo";
}

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
  const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  state.pixelRatio = pixelRatio;
  state.width = canvas.clientWidth;
  state.height = canvas.clientHeight;
}

function drawCube(x, y, z, scaleX, scaleY, scaleZ, color, rotationX, rotationY, rotationZ, emissive, alpha = 1) {
  bindVertexAttributes(cubeMesh.buffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeMesh.indexBuffer);
  applyModelTransform(x, y, z, scaleX, scaleY, scaleZ, rotationX, rotationY, rotationZ, color, emissive, alpha);
  gl.drawElements(gl.TRIANGLES, cubeMesh.indexCount, gl.UNSIGNED_SHORT, 0);
}

function drawOctahedron(x, y, z, scaleX, scaleY, scaleZ, color, rotationX, rotationY, rotationZ, emissive, alpha = 1) {
  bindVertexAttributes(octahedronMesh.buffer);
  applyModelTransform(x, y, z, scaleX, scaleY, scaleZ, rotationX, rotationY, rotationZ, color, emissive, alpha);
  gl.drawArrays(gl.TRIANGLES, 0, octahedronMesh.vertexCount);
}

function bindVertexAttributes(buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(uniforms.position);
  gl.vertexAttribPointer(uniforms.position, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(uniforms.normal);
  gl.vertexAttribPointer(uniforms.normal, 3, gl.FLOAT, false, 24, 12);
}

function applyModelTransform(x, y, z, scaleX, scaleY, scaleZ, rotationX, rotationY, rotationZ, color, emissive, alpha) {
  // Evita divisão por zero (NaN) quando uma partícula chega ao tamanho zero.
  scaleX = Math.max(Math.abs(scaleX), 0.0001);
  scaleY = Math.max(Math.abs(scaleY), 0.0001);
  scaleZ = Math.max(Math.abs(scaleZ), 0.0001);
  const model = composeModel(
    [x, y, z],
    [scaleX, scaleY, scaleZ],
    [rotationX, rotationY, rotationZ]
  );
  const normalMatrix = new Float32Array([
    model[0] / scaleX, model[1] / scaleX, model[2] / scaleX,
    model[4] / scaleY, model[5] / scaleY, model[6] / scaleY,
    model[8] / scaleZ, model[9] / scaleZ, model[10] / scaleZ
  ]);
  gl.uniformMatrix4fv(uniforms.model, false, model);
  gl.uniformMatrix3fv(uniforms.normalMatrix, false, normalMatrix);
  gl.uniform4fv(uniforms.color, color);
  gl.uniform1f(uniforms.emissive, emissive);
  gl.uniform1f(uniforms.alpha, alpha);
}

function createProgram(vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(shaderProgram);
    gl.deleteProgram(shaderProgram);
    throw new Error(`Erro ao conectar os shaders: ${message}`);
  }
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return shaderProgram;
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Erro ao compilar o shader: ${message}`);
  }
  return shader;
}

function createCubeMesh() {
  const faces = [
    { normal: [0, 0, 1], points: [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]] },
    { normal: [0, 0, -1], points: [[-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, -0.5, -0.5], [-0.5, -0.5, -0.5]] },
    { normal: [1, 0, 0], points: [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]] },
    { normal: [-1, 0, 0], points: [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]] },
    { normal: [0, 1, 0], points: [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]] },
    { normal: [0, -1, 0], points: [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]] }
  ];
  const vertices = [];
  const indices = [];
  faces.forEach((face) => {
    const start = vertices.length / 6;
    face.points.forEach((point) => vertices.push(...point, ...face.normal));
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  });
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  return { buffer, indexBuffer, indexCount: indices.length };
}

function createOctahedronMesh() {
  const points = [
    [0, 0.5, 0], [0, -0.5, 0], [0.5, 0, 0], [-0.5, 0, 0], [0, 0, 0.5], [0, 0, -0.5]
  ];
  const faces = [
    [0, 2, 5], [0, 5, 3], [0, 3, 4], [0, 4, 2],
    [1, 5, 2], [1, 3, 5], [1, 4, 3], [1, 2, 4]
  ];
  const vertices = [];
  faces.forEach((face) => {
    const first = points[face[0]];
    const second = points[face[1]];
    const third = points[face[2]];
    const edgeOne = [second[0] - first[0], second[1] - first[1], second[2] - first[2]];
    const edgeTwo = [third[0] - first[0], third[1] - first[1], third[2] - first[2]];
    const normal = normalize(cross(edgeOne, edgeTwo));
    [first, second, third].forEach((point) => vertices.push(...point, ...normal));
  });
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return { buffer, vertexCount: vertices.length / 6 };
}

function perspective(fieldOfView, aspect, near, far) {
  const scale = 1 / Math.tan(fieldOfView / 2);
  const depth = 1 / (near - far);
  return new Float32Array([
    scale / aspect, 0, 0, 0,
    0, scale, 0, 0,
    0, 0, (far + near) * depth, -1,
    0, 0, 2 * far * near * depth, 0
  ]);
}

function lookAt(eye, target, up) {
  const zAxis = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
  const xAxis = normalize(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);
  return new Float32Array([
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1
  ]);
}

function composeModel(position, scale, rotation) {
  const rx = Math.sin(rotation[0]);
  const cx = Math.cos(rotation[0]);
  const ry = Math.sin(rotation[1]);
  const cy = Math.cos(rotation[1]);
  const rz = Math.sin(rotation[2]);
  const cz = Math.cos(rotation[2]);
  const r00 = cy * cz;
  const r01 = cy * rz;
  const r02 = -ry;
  const r10 = rx * ry * cz - cx * rz;
  const r11 = rx * ry * rz + cx * cz;
  const r12 = cx * ry;
  const r20 = cx * ry * cz + rx * rz;
  const r21 = cx * ry * rz - rx * cz;
  const r22 = cx * cy;
  return new Float32Array([
    r00 * scale[0], r10 * scale[0], r20 * scale[0], 0,
    r01 * scale[1], r11 * scale[1], r21 * scale[1], 0,
    r02 * scale[2], r12 * scale[2], r22 * scale[2], 0,
    position[0], position[1], position[2], 1
  ]);
}

function multiply(left, right) {
  const result = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      result[column * 4 + row] =
        left[row] * right[column * 4] +
        left[4 + row] * right[column * 4 + 1] +
        left[8 + row] * right[column * 4 + 2] +
        left[12 + row] * right[column * 4 + 3];
    }
  }
  return result;
}

function normalize(vector) {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function cross(left, right) {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0]
  ];
}

function dot(left, right) {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function formatNumber(value) {
  return NUMBER_FORMATTER.format(Math.max(0, Math.floor(value)));
}

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function randomInteger(minimum, maximum) {
  return Math.floor(randomBetween(minimum, maximum + 1));
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

const VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;

  uniform mat4 uModel;
  uniform mat3 uNormalMatrix;
  uniform mat4 uViewProjection;
  uniform vec3 uCameraPosition;

  varying vec3 vNormal;
  varying float vFog;

  void main() {
    vec4 worldPosition = uModel * vec4(aPosition, 1.0);
    gl_Position = uViewProjection * worldPosition;
    vNormal = normalize(uNormalMatrix * aNormal);
    float distanceToCamera = length(worldPosition.xyz - uCameraPosition);
    vFog = clamp((distanceToCamera - 30.0) / 115.0, 0.0, 0.9);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  uniform vec4 uColor;
  uniform float uEmissive;
  uniform float uAlpha;
  uniform vec3 uFogColor;

  varying vec3 vNormal;
  varying float vFog;

  void main() {
    vec3 lightDirection = normalize(vec3(-0.35, 0.9, 0.55));
    float lighting = max(dot(normalize(vNormal), lightDirection), 0.0);
    float brightness = 0.3 + lighting * 0.7;
    vec3 litColor = uColor.rgb * brightness + uColor.rgb * uEmissive;
    gl_FragColor = vec4(mix(litColor, uFogColor, vFog), uAlpha);
  }
`;

if (!gl) {
  showWebGLError("Este navegador não conseguiu iniciar o WebGL. Atualize o navegador ou ative a aceleração de hardware.");
} else {
  initializeGame();
}
