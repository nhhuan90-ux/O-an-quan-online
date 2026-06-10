// Game State Variables
let currentLevelType = 'campaign'; // 'campaign', 'custom'
let currentLevelIndex = 0;    // 0 to 305 for campaign
let currentGridSize = 5;
let currentGrid = [];
let currentPath = [];         // List of {r, c}
let totalTargets = 0;         // Total orange + start/end nodes to visit
let startNodes = [];          // The two 'S' node positions
let solvedPath = [];          // Current level solution path
let activeSolution = null;    // Stored DFS solution for hints

// Interactive State
let isDragging = false;
let lastDraggedCell = null;
let autoSolveInterval = null;
let isAutoSolving = false;
let isSoundMuted = false;

// Audio Context
let audioCtx = null;

// Timer and moves
let gameTimer = null;
let secondsElapsed = 0;
let movesCount = 0;
let levelCompleted = false;

// Canvas details
let canvas, ctx;
let confettiCanvas, confettiCtx;
let confettiActive = false;
let confettiParticles = [];
let hoverCell = null;

// Original PDF Levels (6 mazes extracted from PDF)
const pdfLevels = [
  {
    name: "Mẫu PDF 1",
    size: 5,
    difficulty: "easy",
    grid: [
      ['W', 'O', 'O', 'O', 'O'],
      ['O', 'O', 'W', 'W', 'S'],
      ['O', 'O', 'O', 'O', 'W'],
      ['O', 'O', 'W', 'O', 'S'],
      ['W', 'W', 'W', 'O', 'O']
    ]
  },
  {
    name: "Màn PDF 2",
    size: 5,
    difficulty: "easy",
    grid: [
      ['W', 'O', 'O', 'O', 'O'],
      ['W', 'O', 'O', 'O', 'O'],
      ['S', 'O', 'O', 'O', 'O'],
      ['O', 'O', 'W', 'W', 'O'],
      ['W', 'W', 'W', 'W', 'S']
    ]
  },
  {
    name: "Màn PDF 3",
    size: 5,
    difficulty: "easy",
    grid: [
      ['O', 'O', 'O', 'O', 'W'],
      ['O', 'O', 'O', 'O', 'O'],
      ['O', 'O', 'W', 'O', 'O'],
      ['W', 'O', 'W', 'O', 'S'],
      ['S', 'O', 'W', 'W', 'W']
    ]
  },
  {
    name: "Màn PDF 4",
    size: 5,
    difficulty: "easy",
    grid: [
      ['W', 'W', 'W', 'S', 'W'],
      ['W', 'O', 'O', 'O', 'W'],
      ['W', 'O', 'O', 'O', 'O'],
      ['O', 'O', 'O', 'W', 'O'],
      ['S', 'W', 'O', 'O', 'O']
    ]
  },
  {
    name: "Màn PDF 5",
    size: 5,
    difficulty: "easy",
    grid: [
      ['O', 'O', 'O', 'O', 'O'],
      ['S', 'W', 'O', 'O', 'O'],
      ['W', 'W', 'O', 'O', 'O'],
      ['O', 'O', 'O', 'O', 'O'],
      ['O', 'O', 'S', 'W', 'W']
    ]
  },
  {
    name: "Màn PDF 6",
    size: 5,
    difficulty: "easy",
    grid: [
      ['S', 'O', 'O', 'O', 'O'],
      ['W', 'O', 'O', 'O', 'O'],
      ['W', 'O', 'O', 'O', 'W'],
      ['W', 'W', 'O', 'O', 'S'],
      ['W', 'W', 'O', 'O', 'O']
    ]
  }
];

// Seedable PRNG (Mulberry32)
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// Procedural Level Generator
// Generates a valid maze grid by running a self-avoiding walk and checking solvability
function generateProceduralLevel(gridSize, targetLength, seed) {
  const rand = mulberry32(seed);
  let attempts = 0;
  
  while (attempts < 500) {
    attempts++;
    
    // Initialize empty grid
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill('W'));
    
    // Start self avoiding walk
    const startR = Math.floor(rand() * gridSize);
    const startC = Math.floor(rand() * gridSize);
    
    const path = [{r: startR, c: startC}];
    const visited = new Set([`${startR},${startC}`]);
    
    let currentR = startR;
    let currentC = startC;
    
    for (let i = 1; i < targetLength; i++) {
      // Find neighbors
      const neighbors = [];
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        const nr = currentR + dr;
        const nc = currentC + dc;
        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
          if (!visited.has(`${nr},${nc}`)) {
            neighbors.push({r: nr, c: nc});
          }
        }
      }
      
      if (neighbors.length === 0) {
        break; // Stuck
      }
      
      // Select random neighbor
      const nextCell = neighbors[Math.floor(rand() * neighbors.length)];
      path.push(nextCell);
      visited.add(`${nextCell.r},${nextCell.c}`);
      currentR = nextCell.r;
      currentC = nextCell.c;
    }
    
    // Check if the generated path meets length requirements
    if (path.length >= targetLength - 2 && path.length > 5) {
      // Build grid representation
      path.forEach((cell, index) => {
        if (index === 0 || index === path.length - 1) {
          grid[cell.r][cell.c] = 'S'; // Start / End
        } else {
          grid[cell.r][cell.c] = 'O'; // Orange path
        }
      });
      
      // Direct solution from the path we used to generate it!
      // This is guaranteed to be valid and avoids any DFS verification overhead.
      return {
        grid: grid,
        size: gridSize,
        solution: path
      };
    }
  }
  
  // Fallback if generator failed: return a simple deterministic zig-zag grid
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill('W'));
  const path = [];
  for (let r = 0; r < gridSize; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < gridSize; c++) path.push({r, c});
    } else {
      for (let c = gridSize - 1; c >= 0; c--) path.push({r, c});
    }
  }
  path.forEach((cell, index) => {
    if (index === 0 || index === path.length - 1) grid[cell.r][cell.c] = 'S';
    else grid[cell.r][cell.c] = 'O';
  });
  return { grid, size: gridSize, solution: path };
}

// Deep First Search Maze Solver
function solveMazeDFS(grid) {
  const size = grid.length;
  let starts = [];
  let totalTargets = 0;
  
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 'O' || grid[r][c] === 'S') {
        totalTargets++;
      }
      if (grid[r][c] === 'S') {
        starts.push({r, c});
      }
    }
  }
  
  if (starts.length !== 2) return [];
  const startNode = starts[0];
  const endNode = starts[1];
  
  const solutions = [];
  const visited = new Set([`${startNode.r},${startNode.c}`]);
  const currentPath = [startNode];
  
  function getNeighbors(r, c) {
    const res = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (grid[nr][nc] === 'O' || grid[nr][nc] === 'S') {
          res.push({r: nr, c: nc});
        }
      }
    }
    return res;
  }
  
  function dfs(r, c) {
    // Found solution
    if (currentPath.length === totalTargets) {
      if (r === endNode.r && c === endNode.c) {
        solutions.push([...currentPath]);
      }
      return;
    }
    
    // Prune: if we reached the end node early, we can't complete the path
    if (r === endNode.r && c === endNode.c) {
      return;
    }
    
    const neighbors = getNeighbors(r, c);
    for (const n of neighbors) {
      const key = `${n.r},${n.c}`;
      if (!visited.has(key)) {
        visited.add(key);
        currentPath.push(n);
        
        dfs(n.r, n.c);
        
        currentPath.pop();
        visited.remove(key);
      }
    }
  }
  
  // Set helper custom methods for Set
  visited.remove = function(val) { this.delete(val); };
  
  dfs(startNode.r, startNode.c);
  return solutions;
}

// Initial Loading
window.addEventListener('load', () => {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  confettiCanvas = document.getElementById('confetti-canvas');
  confettiCtx = confettiCanvas.getContext('2d');
  
  // Set up resize handler
  window.addEventListener('resize', resizeCanvas);
  
  // Set up event listeners for inputs
  setupInputListeners();
  
  // Populate levels in Sidebar
  populateCampaignLevels();
  
  // Check local storage muted state
  isSoundMuted = localStorage.getItem('circle_maze_muted') === 'true';
  updateSoundButtonUI();
  
  // Load first level
  loadLevel('campaign', 0);
  
  // Start animation loop for canvas effects
  requestAnimationFrame(animationLoop);
});

// Resize canvases dynamically
function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  const size = container.clientWidth;
  
  // High-DPR screen support (retina display rendering)
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.scale(dpr, dpr);
  
  confettiCanvas.width = size * dpr;
  confettiCanvas.height = size * dpr;
  confettiCanvas.style.width = `${size}px`;
  confettiCanvas.style.height = `${size}px`;
  confettiCtx.scale(dpr, dpr);
  
  drawBoard();
}

// Sidebar Populate Functions
function populateCampaignLevels() {
  const list = document.getElementById('campaign-levels-list');
  list.innerHTML = '';
  
  for (let index = 0; index < 306; index++) {
    const btn = document.createElement('button');
    btn.className = `level-btn ${isLevelCompleted('campaign', index) ? 'completed' : ''}`;
    btn.id = `btn-campaign-${index}`;
    btn.dataset.difficulty = getCampaignDifficulty(index);
    btn.innerText = (index + 1).toString();
    btn.onclick = () => loadLevel('campaign', index);
    list.appendChild(btn);
  }
}

function filterCampaignLevels() {
  const filter = document.getElementById('campaign-filter').value;
  const buttons = document.querySelectorAll('#campaign-levels-list .level-btn');
  buttons.forEach(btn => {
    if (filter === 'all' || btn.dataset.difficulty === filter) {
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
    }
  });
}

// Helper for deterministic pseudo-random difficulty variation
function getDeterministicRandom(index) {
  let t = index * 15485863; // prime number
  t = (t ^ (t >> 15)) * (t | 1);
  return ((t ^ (t >> 7)) >>> 0) % 1000 / 1000;
}

function getCampaignSize(index) {
  if (index < 6) return 5;
  if (index >= 266) return 9; // Lưới 9x9 trở lên luôn là siêu khó (master)
  
  // Mặc định tăng dần kích thước
  if (index >= 206) return 8;
  if (index >= 126) return 7;
  if (index >= 56) return 6;
  return 5;
}

// Retrieve Campaign Grid size & target length based on index
function getCampaignDifficulty(index) {
  if (index < 6) return 'easy'; // PDF levels (5x5)
  if (index >= 266) return 'master'; // 9x9 is always master
  
  const size = getCampaignSize(index);
  const rand = getDeterministicRandom(index);
  
  if (rand < 0.15) {
    // Tỷ lệ ngẫu nhiên 15% xuất hiện màn khó bất ngờ ở các cấp độ lưới nhỏ
    if (rand < 0.05) return 'master'; // Siêu Khó (đối với kích cỡ lưới hiện tại)
    if (rand < 0.10) return 'expert'; // Rất Khó
    return 'hard';                    // Khó
  }
  
  // Mức độ mặc định theo lưới
  if (size === 5) return 'easy';
  if (size === 6) return 'medium';
  if (size === 7) return 'hard';
  return 'expert'; // size 8
}

function getCampaignConfig(index) {
  if (index < 6) return { size: 5, targetLength: 17 }; // placeholder for PDF levels
  
  const size = getCampaignSize(index);
  const difficulty = getCampaignDifficulty(index);
  const campaignIndex = index - 6;
  
  let targetLength = 12;
  if (size === 5) {
    if (difficulty === 'master') targetLength = 22;
    else if (difficulty === 'expert') targetLength = 19;
    else if (difficulty === 'hard') targetLength = 16;
    else targetLength = 12 + Math.floor(campaignIndex / 15); // easy
  } else if (size === 6) {
    if (difficulty === 'master') targetLength = 32;
    else if (difficulty === 'expert') targetLength = 28;
    else if (difficulty === 'hard') targetLength = 24;
    else targetLength = 18 + Math.floor((campaignIndex - 50) / 15); // medium
  } else if (size === 7) {
    if (difficulty === 'master') targetLength = 42;
    else if (difficulty === 'expert') targetLength = 36;
    else targetLength = 26 + Math.floor((campaignIndex - 120) / 15); // hard
  } else if (size === 8) {
    if (difficulty === 'master') targetLength = 52;
    else targetLength = 35 + Math.floor((campaignIndex - 200) / 15); // expert
  } else if (size === 9) {
    targetLength = 48 + Math.floor((campaignIndex - 260) / 2); // master
    if (targetLength > 56) targetLength = 56;
  }
  
  return { size, targetLength };
}

// Save & Check Progress
function isLevelCompleted(type, index) {
  return localStorage.getItem(`circle_maze_${type}_${index}_completed`) === 'true';
}

function setLevelCompleted(type, index) {
  localStorage.setItem(`circle_maze_${type}_${index}_completed`, 'true');
  const btn = document.getElementById(`btn-${type}-${index}`);
  if (btn) btn.classList.add('completed');
}

// Load Level Data
function loadLevel(type, index) {
  // Clear any auto-solve interval
  stopAutoSolve();
  
  currentLevelType = type;
  currentLevelIndex = index;
  levelCompleted = false;
  currentPath = [];
  movesCount = 0;
  secondsElapsed = 0;
  hoverCell = null;
  
  // Hide success overlay
  document.getElementById('success-overlay').classList.add('hidden');
  
  // Highlight active button in sidebar
  document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-${type}-${index}`);
  if (activeBtn) activeBtn.classList.add('active');
  
  // Retrieve level grid
  if (type === 'campaign') {
    if (index < 6) {
      const level = pdfLevels[index];
      currentGridSize = level.size;
      currentGrid = JSON.parse(JSON.stringify(level.grid)); // deep copy
      document.getElementById('display-level-name').innerText = `Màn Mẫu ${index + 1}`;
      document.getElementById('display-difficulty').className = 'status-value difficulty-tag easy';
      document.getElementById('display-difficulty').innerText = 'Dễ (5x5)';
      
      // Solve PDF levels via DFS (since it is small and only done once)
      const solutions = solveMazeDFS(currentGrid);
      activeSolution = solutions.length > 0 ? solutions[0] : null;
    } else {
      const config = getCampaignConfig(index);
      currentGridSize = config.size;
      const campaignIndex = index - 6;
      // Generate procedurally based on level index as seed
      const gen = generateProceduralLevel(config.size, config.targetLength, campaignIndex * 12345);
      currentGrid = gen.grid;
      activeSolution = gen.solution; // Use generated path directly!
      
      document.getElementById('display-level-name').innerText = `Màn Thử Thách ${index + 1}`;
      
      const difficulty = getCampaignDifficulty(index);
      const tag = document.getElementById('display-difficulty');
      tag.className = `status-value difficulty-tag ${difficulty}`;
      if (difficulty === 'easy') tag.innerText = 'Dễ (5x5)';
      else if (difficulty === 'medium') tag.innerText = 'Vừa (6x6)';
      else if (difficulty === 'hard') tag.innerText = 'Khó (7x7)';
      else if (difficulty === 'expert') tag.innerText = 'Cực Khó (8x8)';
      else if (difficulty === 'master') tag.innerText = 'Siêu Khó (9x9)';
    }
  }
  
  // Calculate targets & start nodes
  totalTargets = 0;
  startNodes = [];
  for (let r = 0; r < currentGridSize; r++) {
    for (let c = 0; c < currentGridSize; c++) {
      if (currentGrid[r][c] === 'O' || currentGrid[r][c] === 'S') {
        totalTargets++;
      }
      if (currentGrid[r][c] === 'S') {
        startNodes.push({r, c});
      }
    }
  }
  
  // Setup next level button visibility
  const btnNext = document.getElementById('btn-next-level');
  if (type === 'campaign' && index === 305) {
    btnNext.style.display = 'none';
  } else {
    btnNext.style.display = 'inline-flex';
    btnNext.innerText = "Màn Tiếp Theo ➡️";
  }

  // Reset counters
  updateProgressUI();
  document.getElementById('display-moves').innerText = '0';
  document.getElementById('display-timer').innerText = '00:00';
  
  // Start game timer
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    if (!levelCompleted && !isAutoSolving) {
      secondsElapsed++;
      const min = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
      const sec = (secondsElapsed % 60).toString().padStart(2, '0');
      document.getElementById('display-timer').innerText = `${min}:${sec}`;
    }
  }, 1000);
  
  // Trigger resizing and drawing
  resizeCanvas();
}

// Custom level generation handler
function generateCustomLevel() {
  const size = parseInt(document.getElementById('grid-size-select').value);
  let targetLength = 15;
  let difficultyName = "Dễ";
  let difficultyClass = "easy";
  
  if (size === 6) { targetLength = 22; difficultyName = "Vừa (6x6)"; difficultyClass = "medium"; }
  else if (size === 7) { targetLength = 32; difficultyName = "Khó (7x7)"; difficultyClass = "hard"; }
  else if (size === 8) { targetLength = 45; difficultyName = "Cực Khó (8x8)"; difficultyClass = "expert"; }
  else if (size === 9) { targetLength = 58; difficultyName = "Siêu Khó (9x9)"; difficultyClass = "master"; }
  
  const seed = Math.floor(Math.random() * 1000000);
  const gen = generateProceduralLevel(size, targetLength, seed);
  
  stopAutoSolve();
  currentLevelType = 'custom';
  currentLevelIndex = seed;
  levelCompleted = false;
  currentPath = [];
  movesCount = 0;
  secondsElapsed = 0;
  hoverCell = null;
  
  document.getElementById('success-overlay').classList.add('hidden');
  document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
  
  currentGridSize = size;
  currentGrid = gen.grid;
  
  document.getElementById('display-level-name').innerText = `Mê Cung Tự Tạo`;
  const tag = document.getElementById('display-difficulty');
  tag.className = `status-value difficulty-tag ${difficultyClass}`;
  tag.innerText = difficultyName;
  
  // Calculate target length
  totalTargets = 0;
  startNodes = [];
  for (let r = 0; r < currentGridSize; r++) {
    for (let c = 0; c < currentGridSize; c++) {
      if (currentGrid[r][c] === 'O' || currentGrid[r][c] === 'S') {
        totalTargets++;
      }
      if (currentGrid[r][c] === 'S') {
        startNodes.push({r, c});
      }
    }
  }
  
  // Directly use solution from generator
  activeSolution = gen.solution;
  
  // Next button is disabled for custom generator
  document.getElementById('btn-next-level').style.display = 'none';
  
  updateProgressUI();
  document.getElementById('display-moves').innerText = '0';
  document.getElementById('display-timer').innerText = '00:00';
  
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    if (!levelCompleted && !isAutoSolving) {
      secondsElapsed++;
      const min = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
      const sec = (secondsElapsed % 60).toString().padStart(2, '0');
      document.getElementById('display-timer').innerText = `${min}:${sec}`;
    }
  }, 1000);
  
  resizeCanvas();
  playSynthesizerSound(440, 'triangle', 0.1, 0.05); // Play friendly chime on create
}

// Load next level on win
function loadNextLevel() {
  if (currentLevelType === 'campaign') {
    if (currentLevelIndex < 305) {
      loadLevel('campaign', currentLevelIndex + 1);
    }
  }
}

// UI Tabs switching
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`panel-${tab}`).classList.add('active');
}

// UI progress values updater
function updateProgressUI() {
  document.getElementById('display-progress').innerText = `${currentPath.length} / ${totalTargets}`;
}

// Sound System (Web Audio API Synthesizer)
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSynthesizerSound(frequency, type, duration, volume = 0.1, sweepEndFreq = null) {
  if (isSoundMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type; // 'sine', 'triangle', 'sawtooth', 'square'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    if (sweepEndFreq) {
      osc.frequency.exponentialRampToValueAtTime(sweepEndFreq, ctx.currentTime + duration);
    }
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    // Smooth volume fade out (prevents clipping/clicking sound)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error("Audio playback error:", e);
  }
}

function playMoveSound() {
  // Short pleasant high sine beep
  const freq = 450 + (currentPath.length * 15); // rising pitch
  playSynthesizerSound(freq, 'sine', 0.08, 0.08);
}

function playErrorSound() {
  // Low vibration sawtooth buzzer
  playSynthesizerSound(120, 'sawtooth', 0.18, 0.08);
}

function playUndoSound() {
  // Quick frequency slide down
  playSynthesizerSound(350, 'triangle', 0.06, 0.06, 250);
}

function playWinSound() {
  // Playful little arpeggio
  const ctx = getAudioContext();
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major chord arpeggio
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      if (levelCompleted) {
        playSynthesizerSound(freq, 'sine', 0.25, 0.06);
      }
    }, idx * 100);
  });
}

function toggleSound() {
  isSoundMuted = !isSoundMuted;
  localStorage.setItem('circle_maze_muted', isSoundMuted.toString());
  updateSoundButtonUI();
}

function updateSoundButtonUI() {
  const btn = document.getElementById('btn-sound');
  btn.innerText = isSoundMuted ? '🔇' : '🔊';
}

// Canvas Rendering Logic
function drawBoard() {
  if (!canvas || !ctx) return;
  
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  
  ctx.clearRect(0, 0, width, height);
  
  const size = currentGridSize;
  const cellSize = width / size;
  const radius = cellSize * 0.32; // Circle radius relative to cellSize
  
  // 1. Draw connections lines first so they render under the circles
  if (currentPath.length > 1) {
    ctx.beginPath();
    ctx.lineWidth = cellSize * 0.16; // Path line width
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#FF7B89'; // Coral pink line
    
    // Set path shadow effect
    ctx.shadowColor = 'rgba(255, 123, 137, 0.3)';
    ctx.shadowBlur = 10;
    
    // Draw continuous path
    for (let i = 0; i < currentPath.length; i++) {
      const node = currentPath[i];
      const cx = node.c * cellSize + cellSize / 2;
      const cy = node.r * cellSize + cellSize / 2;
      if (i === 0) {
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // reset shadow
  }
  
  // 2. Draw all grid nodes
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cellType = currentGrid[r][c];
      if (cellType === 'W') {
        // Draw white empty cell (obstacle)
        const cx = c * cellSize + cellSize / 2;
        const cy = r * cellSize + cellSize / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#E6DCD2';
        ctx.stroke();
        continue;
      }
      
      // Node is O (orange) or S (start/end)
      const cx = c * cellSize + cellSize / 2;
      const cy = r * cellSize + cellSize / 2;
      
      const isVisited = isNodeInPath(r, c);
      
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      
      // Normal/Hover colors
      let baseColor = '#FFA07A'; // Pastel orange
      if (isVisited) {
        baseColor = '#FF8E99';   // Visited pink
      } else if (hoverCell && hoverCell.r === r && hoverCell.c === c) {
        baseColor = '#FFB394';   // Hover state color
      }
      
      ctx.fillStyle = baseColor;
      ctx.fill();
      
      // Border styles
      if (cellType === 'S') {
        // Start/End nodes have a thick, cute dark border
        ctx.lineWidth = cellSize * 0.08;
        ctx.strokeStyle = '#4A3F35';
        ctx.stroke();
        
        // Add a concentric inner dot
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.35, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      } else {
        // Normal circles have a subtle border
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isVisited ? '#FF7B89' : '#F2E2D2';
        ctx.stroke();
      }
      
      // Pulse animation effect for active drawing tips
      if (currentPath.length > 0 && cellType === 'S' && !isVisited) {
        const lastNode = currentPath[currentPath.length - 1];
        if (Math.abs(lastNode.r - r) + Math.abs(lastNode.c - c) === 1) {
          // Pulse guide overlay
          ctx.beginPath();
          ctx.arc(cx, cy, radius + 4 * Math.sin(Date.now() / 150), 0, 2 * Math.PI);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(74, 63, 53, 0.4)';
          ctx.stroke();
        }
      }
    }
  }
}

function isNodeInPath(r, c) {
  return currentPath.some(node => node.r === r && node.c === c);
}

// User Move Execution Logic
function executeMove(r, c) {
  if (levelCompleted || isAutoSolving) return;
  
  const cellType = currentGrid[r][c];
  if (cellType === 'W') {
    playErrorSound();
    return;
  }
  
  // 1. Handle start/end nodes ('S')
  if (cellType === 'S') {
    if (currentPath.length === 0) {
      currentPath = [{r, c}];
      movesCount++;
      document.getElementById('display-moves').innerText = movesCount;
      updateProgressUI();
      playMoveSound();
      drawBoard();
      return;
    }
    
    const lastNode = currentPath[currentPath.length - 1];
    if (lastNode.r === r && lastNode.c === c) {
      return; // Clicked on current path tip, do nothing
    }
    
    // Check if this is the final step to complete the game
    const dist = Math.abs(lastNode.r - r) + Math.abs(lastNode.c - c);
    const isFinalStep = (currentPath.length === totalTargets - 1) && (dist === 1);
    
    if (isFinalStep) {
      // Complete the path!
      currentPath.push({r, c});
      movesCount++;
      document.getElementById('display-moves').innerText = movesCount;
      updateProgressUI();
      playMoveSound();
      drawBoard();
      checkWinCondition();
      return;
    }
    
    // Otherwise, restart the game from this start/end node
    currentPath = [{r, c}];
    movesCount++;
    document.getElementById('display-moves').innerText = movesCount;
    updateProgressUI();
    playUndoSound();
    drawBoard();
    return;
  }
  
  // 2. Rollback path if clicking a node already in the path
  const indexInPath = currentPath.findIndex(node => node.r === r && node.c === c);
  if (indexInPath !== -1) {
    if (indexInPath === currentPath.length - 1) {
      return; // Clicked on current path tip, do nothing
    }
    
    // Truncate path to roll back to this visited node
    currentPath = currentPath.slice(0, indexInPath + 1);
    movesCount++;
    document.getElementById('display-moves').innerText = movesCount;
    updateProgressUI();
    playUndoSound();
    drawBoard();
    return;
  }
  
  // 3. For new adjacent orange nodes, extend the path
  if (currentPath.length === 0) {
    // Handled by cellType === 'S' check above (only start nodes are allowed first)
    return;
  }
  
  const lastNode = currentPath[currentPath.length - 1];
  const dist = Math.abs(lastNode.r - r) + Math.abs(lastNode.c - c);
  if (dist === 1) {
    // Add to path
    currentPath.push({r, c});
    movesCount++;
    document.getElementById('display-moves').innerText = movesCount;
    updateProgressUI();
    playMoveSound();
    drawBoard();
    
    // Check win conditions
    checkWinCondition();
  } else {
    // Non-adjacent move
    playErrorSound();
  }
}

// Win checking
function checkWinCondition() {
  if (currentPath.length === totalTargets) {
    const lastNode = currentPath[currentPath.length - 1];
    const firstNode = currentPath[0];
    
    // Ended at the other S node
    if (currentGrid[lastNode.r][lastNode.c] === 'S' && (lastNode.r !== firstNode.r || lastNode.c !== firstNode.c)) {
      triggerLevelCompletion();
    }
  }
}

function triggerLevelCompletion() {
  levelCompleted = true;
  setLevelCompleted(currentLevelType, currentLevelIndex);
  
  // Populate levels lists again to refresh completed tags in sidebar
  if (currentLevelType === 'campaign') populateCampaignLevels();
  
  // Show Win Overlay stats
  const min = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
  const sec = (secondsElapsed % 60).toString().padStart(2, '0');
  document.getElementById('stat-time').innerText = `${min}:${sec}`;
  document.getElementById('stat-moves').innerText = movesCount;
  
  document.getElementById('success-overlay').classList.remove('hidden');
  
  // Play win sounds and drop confetti
  playWinSound();
  startConfetti();
}

// Undo & Reset Handlers
function undoMove() {
  if (levelCompleted || isAutoSolving || currentPath.length === 0) return;
  
  currentPath.pop();
  movesCount++;
  document.getElementById('display-moves').innerText = movesCount;
  updateProgressUI();
  playUndoSound();
  drawBoard();
}

function restartLevel() {
  stopAutoSolve();
  levelCompleted = false;
  currentPath = [];
  movesCount = 0;
  secondsElapsed = 0;
  hoverCell = null;
  
  document.getElementById('success-overlay').classList.add('hidden');
  updateProgressUI();
  document.getElementById('display-moves').innerText = '0';
  document.getElementById('display-timer').innerText = '00:00';
  
  drawBoard();
  playSynthesizerSound(300, 'triangle', 0.1, 0.05);
}

// User hint finder
function getHint() {
  if (levelCompleted || isAutoSolving) return;
  
  // Get active audio context to resume if needed
  getAudioContext();
  
  // Find start node
  if (currentPath.length === 0) {
    // Highlight start node
    if (startNodes.length > 0) {
      currentPath.push(startNodes[0]);
      movesCount++;
      document.getElementById('display-moves').innerText = movesCount;
      updateProgressUI();
      playMoveSound();
      drawBoard();
    }
    return;
  }
  
  // Run solver from player's current path state
  // We check if a Hamiltonian path exists using the player's path as a fixed prefix
  const solverSolutions = solveFromCurrentPathState();
  if (solverSolutions.length > 0) {
    const sol = solverSolutions[0];
    const nextStep = sol[currentPath.length];
    
    // Add next step to path
    currentPath.push(nextStep);
    movesCount++;
    document.getElementById('display-moves').innerText = movesCount;
    updateProgressUI();
    playMoveSound();
    drawBoard();
    
    // Pulse animation or check win
    checkWinCondition();
  } else {
    // No solution is possible from this path! Alert the user.
    playErrorSound();
    // Vibrate board or flash red (handled via CSS class)
    canvas.classList.add('error-shake');
    setTimeout(() => canvas.classList.remove('error-shake'), 400);
    alert("Đường đi hiện tại của bạn đã bị cụt hoặc không thể bao phủ hết các ô cam. Hãy Quay Lại (Undo) vài bước để tìm hướng đi khác!");
  }
}

// Dynamic solver from current path
function solveFromCurrentPathState() {
  const size = currentGridSize;
  const visited = new Set();
  
  currentPath.forEach(node => visited.add(`${node.r},${node.c}`));
  const path = [...currentPath];
  const solutions = [];
  
  let endNode = startNodes[0];
  if (path[0].r === startNodes[0].r && path[0].c === startNodes[0].c) {
    endNode = startNodes[1];
  }
  
  function getNeighbors(r, c) {
    const res = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (currentGrid[nr][nc] === 'O' || currentGrid[nr][nc] === 'S') {
          res.push({r: nr, c: nc});
        }
      }
    }
    return res;
  }
  
  function dfs(r, c) {
    if (path.length === totalTargets) {
      if (r === endNode.r && c === endNode.c) {
        solutions.push([...path]);
      }
      return;
    }
    if (r === endNode.r && c === endNode.c) {
      return;
    }
    
    const neighbors = getNeighbors(r, c);
    for (const n of neighbors) {
      const key = `${n.r},${n.c}`;
      if (!visited.has(key)) {
        visited.add(key);
        path.push(n);
        
        dfs(n.r, n.c);
        
        path.pop();
        visited.delete(key);
      }
    }
  }
  
  const last = path[path.length - 1];
  dfs(last.r, last.c);
  return solutions;
}

// Auto Solve animater
function toggleAutoSolve() {
  if (levelCompleted) return;
  
  if (isAutoSolving) {
    stopAutoSolve();
  } else {
    startAutoSolve();
  }
}

function startAutoSolve() {
  // Solve grid
  const solutions = solveMazeDFS(currentGrid);
  if (solutions.length === 0) {
    alert("Mê cung này không có lời giải!");
    return;
  }
  
  const solution = solutions[0];
  isAutoSolving = true;
  document.getElementById('btn-solve').innerText = '⏹️ Dừng Giải';
  document.getElementById('btn-solve').className = 'btn btn-secondary';
  
  currentPath = [solution[0]];
  movesCount = 1;
  document.getElementById('display-moves').innerText = movesCount;
  updateProgressUI();
  playMoveSound();
  drawBoard();
  
  let step = 1;
  autoSolveInterval = setInterval(() => {
    if (step < solution.length) {
      currentPath.push(solution[step]);
      movesCount++;
      document.getElementById('display-moves').innerText = movesCount;
      updateProgressUI();
      playMoveSound();
      drawBoard();
      step++;
    } else {
      stopAutoSolve();
      checkWinCondition();
    }
  }, 180);
}

function stopAutoSolve() {
  if (autoSolveInterval) {
    clearInterval(autoSolveInterval);
    autoSolveInterval = null;
  }
  isAutoSolving = false;
  document.getElementById('btn-solve').innerText = '🤖 Tự Động Giải';
  document.getElementById('btn-solve').className = 'btn btn-primary';
}

// Input Listener Setup
function setupInputListeners() {
  // 1. Mouse/Touch drag interaction (Pointer Events)
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  
  // 2. Keyboard moves
  window.addEventListener('keydown', handleKeyDown);
}

// Translate screen coordinates to grid row, col
function getCellFromCoordinates(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  const size = currentGridSize;
  const cellSize = rect.width / size;
  
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  
  if (col >= 0 && col < size && row >= 0 && row < size) {
    // Check if pointer is close enough to circle center
    const cx = col * cellSize + cellSize / 2;
    const cy = row * cellSize + cellSize / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const radius = cellSize * 0.38; // slightly wider than drawing radius for ease of play
    
    if (dist <= radius) {
      return { r: row, c: col };
    }
  }
  return null;
}

function handlePointerDown(e) {
  if (levelCompleted || isAutoSolving) return;
  
  // Resume AudioContext on first user interaction
  getAudioContext();
  
  const cell = getCellFromCoordinates(e.clientX, e.clientY);
  if (cell) {
    isDragging = true;
    executeMove(cell.r, cell.c);
    lastDraggedCell = cell;
  }
}

function handlePointerMove(e) {
  const cell = getCellFromCoordinates(e.clientX, e.clientY);
  
  // Track hover cell for drawing highlights
  const oldHover = hoverCell;
  hoverCell = cell;
  if (JSON.stringify(oldHover) !== JSON.stringify(hoverCell)) {
    drawBoard();
  }
  
  if (!isDragging || levelCompleted || isAutoSolving || !cell) return;
  
  // Only execute if pointer moved to a new cell
  if (!lastDraggedCell || lastDraggedCell.r !== cell.r || lastDraggedCell.c !== cell.c) {
    executeMove(cell.r, cell.c);
    lastDraggedCell = cell;
  }
}

function handlePointerUp() {
  isDragging = false;
  lastDraggedCell = null;
}

function handleKeyDown(e) {
  if (levelCompleted || isAutoSolving) return;
  
  let dr = 0;
  let dc = 0;
  
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      dr = -1;
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      dr = 1;
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      dc = -1;
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      dc = 1;
      break;
    case 'u':
    case 'U':
    case 'Backspace':
      undoMove();
      e.preventDefault();
      return;
    case 'r':
    case 'R':
      restartLevel();
      return;
    case 'h':
    case 'H':
      getHint();
      return;
    default:
      return; // Ignore other keys
  }
  
  e.preventDefault();
  getAudioContext();
  
  if (currentPath.length === 0) {
    // If no path started, start at first start node
    executeMove(startNodes[0].r, startNodes[0].c);
  } else {
    const lastNode = currentPath[currentPath.length - 1];
    const nr = lastNode.r + dr;
    const nc = lastNode.c + dc;
    
    if (nr >= 0 && nr < currentGridSize && nc >= 0 && nc < currentGridSize) {
      executeMove(nr, nc);
    }
  }
}

// Confetti System
function startConfetti() {
  confettiActive = true;
  confettiParticles = [];
  const colors = ['#FFA07A', '#FF7B89', '#95DAC1', '#86A8E7', '#FFD275', '#E2ECE9'];
  
  // Spawn 120 particles
  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: Math.random() * (confettiCanvas.width / (window.devicePixelRatio || 1)),
      y: Math.random() * -100 - 10,
      r: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      d: Math.random() * 10 + 4,
      vx: Math.random() * 4 - 2,
      vy: Math.random() * 4 + 3,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5
    });
  }
}

function updateConfetti() {
  if (!confettiActive) return;
  
  const w = confettiCanvas.width / (window.devicePixelRatio || 1);
  const h = confettiCanvas.height / (window.devicePixelRatio || 1);
  
  confettiCtx.clearRect(0, 0, w, h);
  
  let activeCount = 0;
  
  confettiParticles.forEach(p => {
    p.y += p.vy;
    p.x += p.vx;
    p.rotation += p.rotationSpeed;
    
    // Wind drift
    p.vx += Math.sin(Date.now() / 1000 + p.d) * 0.05;
    
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rotation * Math.PI / 180);
    
    confettiCtx.fillStyle = p.color;
    // Draw tiny paper rectangles/confetti
    confettiCtx.fillRect(-p.r, -p.r/2, p.r * 2, p.r);
    
    confettiCtx.restore();
    
    if (p.y < h + 20) {
      activeCount++;
    }
  });
  
  if (activeCount === 0) {
    confettiActive = false;
  }
}

// Continuous Animation Loop
function animationLoop() {
  // Redraw board to keep updates for pulses/hover smooth
  drawBoard();
  
  // Update confetti overlays
  if (confettiActive) {
    updateConfetti();
  }
  
  requestAnimationFrame(animationLoop);
}
