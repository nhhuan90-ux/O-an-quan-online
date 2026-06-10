// --- Questions Bank (30 riddles with 4 multiple-choice options) ---
const questionBank = [
  {
    question: "Cái gì tuy ăn được nhưng bạn không thể ăn vào bữa tối?",
    options: ["Bánh mì kẹp thịt", "Bữa sáng và bữa trưa", "Quả táo chín đỏ", "Cơm rang dưa bò"],
    answer: 1
  },
  {
    question: "Chỉ tăng mà không giảm, đó là gì?",
    options: ["Chiều cao cơ thể", "Nhiệt độ ngoài trời", "Tuổi tác", "Giá xăng dầu"],
    answer: 2
  },
  {
    question: "Bạn tưởng tượng mình giữa đàn cá mập trên thuyền thủng. Cách đơn giản nhất để thoát ra?",
    options: ["Nhảy xuống nước bơi thật nhanh", "Vá thuyền bằng kẹo cao su", "Ngừng tưởng tượng", "Kêu cứu người trên bờ"],
    answer: 2
  },
  {
    question: "Từ gì mà ai cũng phải phát âm sai?",
    options: ["Từ 'Sai'", "Từ 'Khó'", "Từ 'Ngắn'", "Từ 'Tròn'"],
    answer: 0
  },
  {
    question: "Tôi mong manh đến nỗi nếu bạn mở miệng gọi tên tôi, bạn sẽ giết chết tôi. Tôi là gì?",
    options: ["Bong bóng xà phòng", "Sương mù", "Sự im lặng", "Tiếng thở dài"],
    answer: 2
  },
  {
    question: "Một thợ điện ngã từ cầu thang cao 20 mét nhưng không hề bị thương. Vì sao?",
    options: ["Anh ấy có siêu năng lực", "Anh ấy rơi trúng đệm hơi", "Anh ấy ngã từ bậc dưới cùng", "Anh ấy có dây bảo hiểm"],
    answer: 2
  },
  {
    question: "Làm cách nào để bạn có thể thức 7 ngày liền mà không buồn ngủ?",
    options: ["Uống thật nhiều cà phê", "Ngủ vào ban đêm", "Chơi game liên tục", "Uống nước tăng lực"],
    answer: 1
  },
  {
    question: "Cái gì chắc chắn luôn xuất hiện ở cuối cầu vồng?",
    options: ["Hũ vàng của yêu tinh", "Mặt đất", "Chữ 'G'", "Những giọt mưa"],
    answer: 2
  },
  {
    question: "Cây gì không thể cao lên mà chỉ có thể thấp đi?",
    options: ["Cây tre non", "Cây nến (hoặc bút chì)", "Cây chuối cảnh", "Cây cỏ ngọt"],
    answer: 1
  },
  {
    question: "Cái gì xuất hiện một lần trong tháng nhưng lại không xuất hiện lần nào trong năm?",
    options: ["Ngày rằm", "Kỳ lĩnh lương", "Chữ 'T'", "Ngày 31"],
    answer: 2
  },
  {
    question: "Xe tải 10 tấn chở 2.1 tấn hàng đi qua cầu chịu tải tối đa 12 tấn. Tài xế qua cầu thế nào?",
    options: ["Bác tài xế đi bộ qua cầu", "Lái xe thật nhanh qua cầu", "Bơm căng lốp xe để giảm xóc", "Chờ ban đêm rồi đi qua"],
    answer: 0
  },
  {
    question: "Nhờ tôi, bạn có thể nhìn xuyên qua các bức tường. Tôi là gì?",
    options: ["Chiếc kính hiển vi", "Cửa sổ", "Kính thiên văn", "Bức ảnh chụp"],
    answer: 1
  },
  {
    question: "Cái gì có thể giữ mà không cần chạm vào?",
    options: ["Không khí", "Hơi thở (hoặc lời hứa)", "Ánh nắng mặt trời", "Dòng nước chảy"],
    answer: 1
  },
  {
    question: "Đâu là danh sách 10 bộ phận cơ thể người bắt đầu bằng chữ 'T' và chỉ có một từ?",
    options: [
      "Tim, Tai, Tóc, Tay, Trán, Thận, Tủy, Trĩ, Táo, Tơ",
      "Tim, Thận, Gan, Phổi, Tóc, Tai, Tay, Trán, Tủy, Trĩ",
      "Tim, Tai, Tóc, Tay, Trán, Thận, Tủy, Trĩ, Tì, Tinh",
      "Tim, Phổi, Ruột, Dạ dày, Tay, Chân, Tóc, Tai, Tay, Trán"
    ],
    answer: 2
  },
  {
    question: "Tôi nhẹ tựa lông hồng, nhưng người khỏe nhất không thể giữ tôi quá 10 phút. Tôi là gì?",
    options: ["Một cốc nước lọc", "Sợi chỉ nhỏ", "Hơi thở", "Quả bóng bay"],
    answer: 2
  },
  {
    question: "Người đàn ông đi mưa không ô áo mưa trùm đầu, quần áo ướt sũng nhưng không sợi tóc nào ướt. Vì sao?",
    options: ["Trời mưa quá nhỏ", "Tóc ông ta làm bằng nhựa", "Ông ta bị hói đầu", "Ông ta chạy rất nhanh"],
    answer: 2
  },
  {
    question: "Cái gì bạn có thể tạo ra nhưng không một ai (kể cả bạn) nhìn thấy?",
    options: ["Tiếng động / Tiếng nói", "Nước mắt", "Lửa nóng", "Mùi hương"],
    answer: 0
  },
  {
    question: "Cái gì có thể to bằng hoặc hơn cả một con voi nhưng không hề nặng chút nào?",
    options: ["Quả bong bóng hình voi", "Cái bóng của con voi", "Đám mây hình voi", "Bộ xương con voi"],
    answer: 1
  },
  {
    question: "Trò chơi có hai người đấu với nhau và chỉ có thể kết thúc khi có người ra được nước?",
    options: ["Chèo thuyền", "Cờ tướng / Cờ vua", "Bơi lội", "Đấu vật dưới nước"],
    answer: 1
  },
  {
    question: "Nóng và lạnh, cái nào chạy nhanh hơn?",
    options: ["Lạnh (vì lạnh buốt chạy nhanh)", "Nóng (vì nóng nở ra còn lạnh co lại, nên nóng lan truyền nhanh hơn)", "Cả hai chạy bằng nhau", "Không cái nào biết chạy"],
    answer: 1
  },
  {
    question: "Cái gì có cổ nhưng không có đầu?",
    options: ["Con hươu cao cổ", "Cái chai (hoặc cái áo)", "Con giun", "Cái bàn gỗ"],
    answer: 1
  },
  {
    question: "Cái gì có răng nhưng không biết nhai?",
    options: ["Con chó con", "Cái lược", "Con cá sấu", "Máy xay sinh tố"],
    answer: 1
  },
  {
    question: "Cái gì đi nằm, đứng nằm, nằm lại đứng?",
    options: ["Cái bóng", "Bàn chân", "Cái kính", "Cái đồng hồ"],
    answer: 1
  },
  {
    question: "Con gì đập thì sống, không đập thì chết?",
    options: ["Con tim", "Con cá", "Con ruồi", "Con muỗi"],
    answer: 0
  },
  {
    question: "Lịch nào dài nhất?",
    options: ["Lịch vạn niên", "Lịch lịch sử", "Lịch treo tường", "Lịch âm dương"],
    answer: 1
  },
  {
    question: "Xã nào đông dân nhất?",
    options: ["Xã hội", "Xã đàn", "Xã tắc", "Xã hội chủ nghĩa"],
    answer: 0
  },
  {
    question: "Bỏ ngoài nướng trong, ăn ngoài bỏ trong là gì?",
    options: ["Cây mía", "Bắp ngô", "Củ sắn", "Quả dừa"],
    answer: 1
  },
  {
    question: "Con đường nào ngắn nhất?",
    options: ["Đường đi lối tắt", "Đường sữa", "Đường cao tốc", "Đường hàng không"],
    answer: 1
  },
  {
    question: "Quần gì rộng nhất?",
    options: ["Quần ống sớ", "Quần đảo", "Quần jean", "Quần đùi"],
    answer: 1
  },
  {
    question: "Con cá nào không biết bơi?",
    options: ["Cá voi", "Cá gỗ (hoặc cá kho, cá chết)", "Cá chuồn", "Cá đuối"],
    answer: 1
  }
];

// --- State Variables ---
let grid = [];
let gridSize = 19; // Must be odd
let shapeType = "square";
let startCell = null;
let endCell = null;
let playerPos = null;
let gates = []; // Array of { r, c, riddle, solved: false }
let activeGate = null;
let lives = 5;
let score = 0;
let soundMuted = false;
let audioCtx = null;
let canvas, ctx;
let usedRiddles = [];

// Chest placement states (randomly allocated at end-game)
let chestStates = {}; // e.g. {1: 'gold', 2: 'silver', 3: 'poison', 4: 'poison', 5: 'poison'}

// --- Shape Definitions (Mask functions returning true if cell is inside boundary) ---
function isInsideShape(r, c, type) {
  // Convert coordinate to float space (-1.0 to 1.0)
  const cx = (c - (gridSize - 1) / 2) / ((gridSize - 1) / 2);
  const cy = (((gridSize - 1) / 2) - r) / ((gridSize - 1) / 2); // invert y for math standard
  
  const dist = Math.sqrt(cx * cx + cy * cy);

  switch (type) {
    case "square":
      return Math.abs(cx) <= 0.95 && Math.abs(cy) <= 0.95;

    case "rectangle":
      return Math.abs(cx) <= 0.95 && Math.abs(cy) <= 0.75;

    case "circle":
      return dist <= 0.95;

    case "moon":
      // Main circle minus subtracting circle shifted to the right
      const inMainCircle = dist <= 0.95;
      const subCx = cx - 0.45;
      const subCy = cy;
      const inSubCircle = Math.sqrt(subCx * subCx + subCy * subCy) <= 0.75;
      return inMainCircle && !inSubCircle;

    case "heart":
      // (x^2 + y^2 - 1)^3 - x^2 * y^3 < 0
      const x = cx * 1.15;
      const y = cy * 1.15 + 0.15; // slightly shifted up
      const a = x * x + y * y - 1.0;
      return (a * a * a - x * x * y * y * y) < 0.0;

    case "star": {
      // 5-pointed star formula in polar coordinates
      const angle = Math.atan2(cy, cx);
      const k = 5;
      // standard radius variation
      const rLimit = 0.55 + 0.4 * Math.cos(k * angle - Math.PI / 2);
      return dist <= rLimit;
    }

    case "triangle":
      // Triangle pointing up
      return cy >= -0.85 && cy <= 0.85 && Math.abs(cx) <= (0.85 - cy) * 0.58;

    case "diamond":
      return (Math.abs(cx) + Math.abs(cy)) <= 0.95;

    case "cross":
      return (Math.abs(cx) <= 0.35 && Math.abs(cy) <= 0.95) || 
             (Math.abs(cy) <= 0.35 && Math.abs(cx) <= 0.95);

    default:
      return true;
  }
}

// --- Audio Synthesizer (Web Audio API) ---
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(freq, type, duration, volume = 0.1, sweepEnd = null) {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (sweepEnd) {
      osc.frequency.exponentialRampToValueAtTime(sweepEnd, ctx.currentTime + duration);
    }
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
}

function playCorrectSound() {
  playSound(523.25, 'sine', 0.15, 0.08); // C5
  setTimeout(() => playSound(659.25, 'sine', 0.2, 0.08), 100); // E5
}

function playErrorSound() {
  playSound(150, 'sawtooth', 0.25, 0.08); // Buzz
}

function playMoveSound() {
  playSound(600, 'triangle', 0.05, 0.04);
}

function playChestWinSound() {
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Arpeggio
  notes.forEach((f, i) => {
    setTimeout(() => playSound(f, 'sine', 0.25, 0.06), i * 100);
  });
}

function playPoisonSound() {
  playSound(200, 'sawtooth', 0.8, 0.15, 60); // Low sliding buzz explosion
}

// --- Maze Generator (DFS Carving) ---
function generateMaze() {
  grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill('W'));
  
  // 1. Mark cells that are outside the shape mask as 'B' (Blocked / Blank)
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!isInsideShape(r, c, shapeType)) {
        grid[r][c] = 'B';
      }
    }
  }

  // 2. DFS Maze Carving on valid odd coordinates
  const visited = new Set();
  
  // Find first valid odd cell inside shape to start DFS
  let startR = 1, startC = 1;
  let found = false;
  for (let r = 1; r < gridSize - 1; r += 2) {
    for (let c = 1; c < gridSize - 1; c += 2) {
      if (grid[r][c] === 'W') {
        startR = r;
        startC = c;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  function carve(r, c) {
    visited.add(`${r},${c}`);
    grid[r][c] = 'O'; // Path cell

    // Get random directions
    const dirs = [
      [0, 2], [0, -2], [2, 0], [-2, 0]
    ];
    // Shuffle directions
    dirs.sort(() => Math.random() - 0.5);

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < gridSize - 1 && nc > 0 && nc < gridSize - 1) {
        if (grid[nr][nc] === 'W' && !visited.has(`${nr},${nc}`)) {
          // Carve wall in between
          grid[r + dr / 2][c + dc / 2] = 'O';
          carve(nr, nc);
        }
      }
    }
  }

  carve(startR, startC);

  // 3. Find Entrance & Exit
  // Look for first valid cell on top rows (row 1 or 2 or 3) for entrance
  startCell = null;
  for (let r = 1; r < gridSize - 1; r++) {
    for (let c = 1; c < gridSize - 1; c++) {
      if (grid[r][c] === 'O') {
        startCell = { r, c };
        grid[r - 1][c] = 'O'; // open wall above as entrance
        break;
      }
    }
    if (startCell) break;
  }

  // Look for last valid cell on bottom rows for exit
  endCell = null;
  for (let r = gridSize - 2; r > 0; r--) {
    for (let c = gridSize - 2; c > 0; c--) {
      if (grid[r][c] === 'O') {
        endCell = { r, c };
        grid[r + 1][c] = 'O'; // open wall below as exit
        break;
      }
    }
    if (endCell) break;
  }

  playerPos = { r: startCell.r - 1, c: startCell.c }; // Start at the entrance entrance path
}

// --- Pathfinder (BFS to trace solution path and allocate gates) ---
function findSolutionPath() {
  const queue = [[{ r: startCell.r - 1, c: startCell.c }]];
  const visited = new Set([`${startCell.r - 1},${startCell.c}`]);

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];

    if (current.r === endCell.r + 1 && current.c === endCell.c) {
      return path; // Found solution path!
    }

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      const nr = current.r + dr;
      const nc = current.c + dc;
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
        if (grid[nr][nc] === 'O' && !visited.has(`${nr},${nc}`)) {
          visited.add(`${nr},${nc}`);
          queue.push([...path, { r: nr, c: nc }]);
        }
      }
    }
  }
  return [];
}

function allocateGates() {
  const sol = findSolutionPath();
  gates = [];
  
  if (sol.length < 10) return; // grid too small

  // Place 3 to 4 gates along the solution path
  const numGates = 3 + Math.floor(Math.random() * 2); // 3 or 4 gates
  const step = Math.floor((sol.length - 4) / numGates);

  for (let i = 1; i <= numGates; i++) {
    // Pick cells in solution path
    const node = sol[i * step];
    if (node) {
      // Get a random riddle
      const riddle = getRandomRiddle();
      gates.push({
        r: node.r,
        c: node.c,
        riddle: riddle,
        solved: false
      });
    }
  }
}

function getRandomRiddle() {
  // Reset if all are used
  if (usedRiddles.length >= questionBank.length) {
    usedRiddles = [];
  }
  
  // Pick one not in used list
  let available = questionBank.filter(q => !usedRiddles.includes(q));
  if (available.length === 0) available = questionBank;

  const riddle = available[Math.floor(Math.random() * available.length)];
  usedRiddles.push(riddle);
  return riddle;
}

// --- Player Movement & Control handlers ---
function movePlayer(dr, dc) {
  if (lives <= 0) return;
  if (activeGate) return; // blocked by active riddle popup

  const nr = playerPos.r + dr;
  const nc = playerPos.c + dc;

  if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
    if (grid[nr][nc] === 'O') {
      // Check if entering a gate
      const gate = gates.find(g => g.r === nr && g.c === nc);
      if (gate && !gate.solved) {
        // Stop movement and trigger riddle
        activeGate = gate;
        showRiddlePopup(gate);
        return;
      }

      playerPos = { r: nr, c: nc };
      playMoveSound();
      drawBoard();

      // Check if reached exit
      if (playerPos.r === endCell.r + 1 && playerPos.c === endCell.c) {
        showChestSelection();
      }
    }
  }
}

// Click-to-move pathfinding (BFS path to destination)
function navigateToCell(targetR, targetC) {
  if (lives <= 0 || activeGate) return;

  // Find shortest path from current player position to targeted cell
  const path = findPathBFS(playerPos, { r: targetR, c: targetC });
  if (path.length <= 1) return;

  // Move player along the path step-by-step
  let stepIdx = 1;
  const timer = setInterval(() => {
    if (lives <= 0 || activeGate) {
      clearInterval(timer);
      return;
    }

    const next = path[stepIdx];
    if (next) {
      // Check for gate
      const gate = gates.find(g => g.r === next.r && g.c === next.c);
      if (gate && !gate.solved) {
        clearInterval(timer);
        activeGate = gate;
        showRiddlePopup(gate);
        return;
      }

      playerPos = next;
      playMoveSound();
      drawBoard();

      if (playerPos.r === endCell.r + 1 && playerPos.c === endCell.c) {
        clearInterval(timer);
        showChestSelection();
      }
      stepIdx++;
    } else {
      clearInterval(timer);
    }
  }, 100);
}

function findPathBFS(start, target) {
  if (grid[target.r][target.c] !== 'O') return [];

  const queue = [[start]];
  const visited = new Set([`${start.r},${start.c}`]);

  while (queue.length > 0) {
    const path = queue.shift();
    const curr = path[path.length - 1];

    if (curr.r === target.r && curr.c === target.c) {
      return path;
    }

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      const nr = curr.r + dr;
      const nc = curr.c + dc;
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
        if (grid[nr][nc] === 'O' && !visited.has(`${nr},${nc}`)) {
          visited.add(`${nr},${nc}`);
          queue.push([...path, { r: nr, c: nc }]);
        }
      }
    }
  }
  return [];
}

// --- Riddle Overlay Control ---
function showRiddlePopup(gate) {
  const num = gates.indexOf(gate) + 1;
  document.getElementById('riddle-gate-num').innerText = num;
  document.getElementById('riddle-text').innerText = gate.riddle.question;

  const optDiv = document.getElementById('riddle-options');
  optDiv.innerHTML = '';

  gate.riddle.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.innerText = opt;
    btn.onclick = () => submitAnswer(idx);
    optDiv.appendChild(btn);
  });

  document.getElementById('riddle-feedback').classList.add('hidden');
  document.getElementById('riddle-overlay').classList.remove('hidden');
}

function submitAnswer(selectedIdx) {
  if (!activeGate) return;

  const feedback = document.getElementById('riddle-feedback');

  if (selectedIdx === activeGate.riddle.answer) {
    // Correct!
    playCorrectSound();
    activeGate.solved = true;
    activeGate = null;
    score += 50; // Add score for correct answer
    updateProgressUI();
    document.getElementById('riddle-overlay').classList.add('hidden');
    drawBoard();
  } else {
    // Incorrect!
    playErrorSound();
    lives--;
    updateProgressUI();
    
    // Check if dead
    if (lives <= 0) {
      document.getElementById('riddle-overlay').classList.add('hidden');
      document.getElementById('game-over-overlay').classList.remove('hidden');
      return;
    }

    feedback.innerText = `Sai rồi! Đáp án chưa chính xác. Bạn bị mất 1 mạng 💔 (Còn lại ${lives} mạng)`;
    feedback.classList.remove('hidden');
    
    // Shake the riddle popup for visual error feedback
    const box = document.querySelector('.riddle-box');
    box.classList.add('error-shake');
    setTimeout(() => box.classList.remove('error-shake'), 400);

    // Prompt another question or keep current one (user comment says: "trả lời lại đến khi đúng")
    // Keep current question so user must try to solve it.
  }
}

// --- Chest Randomization & End Game Overlay ---
function showChestSelection() {
  // Reset chest graphics
  for (let i = 1; i <= 5; i++) {
    const ch = document.getElementById(`chest-${i}`);
    ch.innerText = '📦';
    ch.style.background = '';
  }

  // Allocate Gold, Silver, and 3 Poison chests randomly
  const roles = ['gold', 'silver', 'poison', 'poison', 'poison'];
  roles.sort(() => Math.random() - 0.5);

  chestStates = {};
  for (let i = 1; i <= 5; i++) {
    chestStates[i] = roles[i - 1];
  }

  document.getElementById('chest-overlay').classList.remove('hidden');
}

function selectChest(idx) {
  const result = chestStates[idx];
  document.getElementById('chest-overlay').classList.add('hidden');

  if (result === 'gold') {
    // Major win!
    playChestWinSound();
    score = score * 2 + 100; // Double score + bonus
    
    document.getElementById('victory-icon-display').innerText = '👑🏆';
    document.getElementById('victory-title-display').innerText = 'KHO BÁU VÀNG! 👑';
    document.getElementById('victory-desc-display').innerText = `Đại thám hiểm xuất sắc! Bạn đã mở trúng Rương Vàng thần thánh, nhân đôi toàn bộ điểm số tích lũy từ các cửa ải!`;
    document.getElementById('victory-final-score').innerText = score;
    document.getElementById('victory-overlay').classList.remove('hidden');
  } 
  else if (result === 'silver') {
    // Medium win!
    playChestWinSound();
    score += 150; // Bonus
    
    document.getElementById('victory-icon-display').innerText = '🥈🎁';
    document.getElementById('victory-title-display').innerText = 'KHO BÁU BẠC! 🥈';
    document.getElementById('victory-desc-display').innerText = `Chúc mừng bạn đã mở trúng Rương Bạc chứa nhiều vàng bạc đá quý quý giá bên trong!`;
    document.getElementById('victory-final-score').innerText = score;
    document.getElementById('victory-overlay').classList.remove('hidden');
  } 
  else {
    // Toxic gas loss!
    playPoisonSound();
    
    // Trigger ghost floating animation
    const ghost = document.getElementById('ghost-char');
    ghost.style.animation = 'none';
    void ghost.offsetWidth; // trigger reflow
    ghost.style.animation = 'float-ghost 4.5s forwards ease-in-out';

    document.getElementById('poison-overlay').classList.remove('hidden');
  }
}

function goHomeSafely() {
  // Safe exit victory
  playCorrectSound();
  document.getElementById('chest-overlay').classList.add('hidden');

  document.getElementById('victory-icon-display').innerText = '🏡💖';
  document.getElementById('victory-title-display').innerText = 'Thoát Hiểm An Toàn! 🏡';
  document.getElementById('victory-desc-display').innerText = `Quyết định sáng suốt! Bạn đã bảo toàn tính mạng, mang toàn bộ điểm số tích lũy vượt qua các cửa ải về nhà an toàn.`;
  document.getElementById('victory-final-score').innerText = score;
  document.getElementById('victory-overlay').classList.remove('hidden');
}

// --- Canvas Drawing Logic ---
function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  const size = container.clientWidth;
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.scale(dpr, dpr);
  
  drawBoard();
}

function drawBoard() {
  if (!canvas || !ctx) return;

  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const cellSize = width / gridSize;

  ctx.clearRect(0, 0, width, width);

  // Draw cells
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const type = grid[r][c];
      const cx = c * cellSize;
      const cy = r * cellSize;

      if (type === 'B') {
        // Outside boundary - draw nothing or soft decorative background
        continue;
      }

      if (type === 'W') {
        // Wall - draw soft pastel brown wall
        ctx.fillStyle = '#E8DCD0';
        ctx.fillRect(cx, cy, cellSize, cellSize);
      } else {
        // Path cell - soft pastel cream
        ctx.fillStyle = '#FCFAF6';
        ctx.fillRect(cx, cy, cellSize, cellSize);
      }
    }
  }

  // Draw entrance arrow
  if (startCell) {
    const ecx = startCell.c * cellSize + cellSize / 2;
    const ecy = (startCell.r - 1) * cellSize + cellSize / 2;
    ctx.font = `${cellSize * 0.9}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📥', ecx, ecy - 2);
  }

  // Draw exit arrow
  if (endCell) {
    const excx = endCell.c * cellSize + cellSize / 2;
    const excy = (endCell.r + 1) * cellSize + cellSize / 2;
    ctx.fillText('📤', excx, excy + 2);
  }

  // Draw gates/checkpoints
  gates.forEach((gate, idx) => {
    const gcx = gate.c * cellSize + cellSize / 2;
    const gcy = gate.r * cellSize + cellSize / 2;
    
    ctx.beginPath();
    ctx.arc(gcx, gcy, cellSize * 0.42, 0, 2 * Math.PI);
    ctx.fillStyle = gate.solved ? '#95DAC1' : '#B89CFF'; // green solved, purple unsolved
    ctx.fill();

    // Border
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Text number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${cellSize * 0.5}px 'Quicksand', sans-serif`;
    ctx.fillText(idx + 1, gcx, gcy);
  });

  // Draw Player Avatar
  if (playerPos) {
    const pcx = playerPos.c * cellSize + cellSize / 2;
    const pcy = playerPos.r * cellSize + cellSize / 2;
    
    // Draw cute orange thám hiểm ball
    ctx.beginPath();
    ctx.arc(pcx, pcy, cellSize * 0.38, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFA07A'; // coral
    ctx.fill();

    // Concentric inner highlight
    ctx.beginPath();
    ctx.arc(pcx, pcy, cellSize * 0.16, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Border
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4A3F35';
    ctx.stroke();
  }
}

// --- UI Updates ---
function updateProgressUI() {
  // Score
  document.getElementById('display-score').innerText = score;
  
  // Lives
  const container = document.getElementById('lives-container');
  container.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    if (i < lives) {
      container.innerHTML += '💖';
    } else {
      container.innerHTML += '💔';
    }
  }

  // Gates cleared
  const cleared = gates.filter(g => g.solved).length;
  document.getElementById('display-gates').innerText = `${cleared} / ${gates.length}`;
}

// --- Game Initializer ---
function initGame() {
  lives = 5;
  score = 0;
  activeGate = null;

  // List of shapes
  const shapes = ["square", "rectangle", "circle", "moon", "heart", "star", "triangle", "diamond", "cross"];
  // Select a random shape
  shapeType = shapes[Math.floor(Math.random() * shapes.length)];
  
  // Display shape name in Vietnamese
  const namesDict = {
    square: "Hình vuông",
    rectangle: "Hình chữ nhật",
    circle: "Hình tròn",
    moon: "Trăng khuyết",
    heart: "Trái tim",
    star: "Ngôi sao",
    triangle: "Hình tam giác",
    diamond: "Hình kim cương",
    cross: "Hình chữ thập"
  };
  document.getElementById('display-shape').innerText = namesDict[shapeType];

  // Generate Maze & Gates
  generateMaze();
  allocateGates();
  
  // Reset all UI overlays
  document.getElementById('riddle-overlay').classList.add('hidden');
  document.getElementById('chest-overlay').classList.add('hidden');
  document.getElementById('poison-overlay').classList.add('hidden');
  document.getElementById('victory-overlay').classList.add('hidden');
  document.getElementById('game-over-overlay').classList.add('hidden');

  updateProgressUI();

  // Resize and redraw canvas
  resizeCanvas();
}

// --- Window event wiring ---
window.addEventListener('load', () => {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  window.addEventListener('resize', resizeCanvas);

  // Click / Tap interactions on canvas
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cellSize = rect.width / gridSize;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      navigateToCell(row, col);
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        movePlayer(-1, 0);
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        movePlayer(1, 0);
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        movePlayer(0, -1);
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        movePlayer(0, 1);
        e.preventDefault();
        break;
    }
  });

  initGame();
});
