/**
 * Hitori Game Implementation
 */
class HitoriGame {
  constructor(manager) {
    this.manager = manager;
    this.size = 5; // Grid size N x N (5, 6, or 7)
    
    // Board State
    this.numbers = [];     // 2D grid: numbers printed in each cell
    this.grid = [];        // 2D grid: 0 (unshaded), 1 (shaded/black), 2 (marked/circle)
    
    // Solution mask for Hint and Solve
    this.solution = [];    // 2D grid: 0 (unshaded), 1 (shaded)
  }

  getTitle() { return 'Hitori'; }
  
  getTip() { 
    return 'Nhấp để chuyển trạng thái ô: Trắng -> Đen (loại bỏ) -> Khoanh tròn (giữ lại) -> Trắng.'; 
  }
  
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '5 × 5';
    if (diff === 'medium') return '6 × 6';
    return '7 × 7';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Bôi đen (loại bỏ) các ô số sao cho:</li>
        <li>Không có số nào xuất hiện trùng lặp trên cùng một hàng hoặc cột ở các ô màu trắng.</li>
        <li>Các ô bôi đen không được nằm liền kề cạnh nhau (chỉ có thể chung góc chéo).</li>
        <li>Tất cả các ô số màu trắng còn lại phải nối liền nhau theo chiều ngang/dọc thành một vùng duy nhất.</li>
      </ul>
    `;
  }

  init(container, difficulty) {
    if (difficulty === 'easy') {
      this.size = 5;
    } else if (difficulty === 'medium') {
      this.size = 6;
    } else {
      this.size = 7;
    }

    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.numbers = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.solution = Array(this.size).fill(null).map(() => Array(this.size).fill(0));

    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    // 1. Generate a valid unshaded connected mask (0 = unshaded, 1 = shaded)
    let success = false;
    let attempts = 0;
    while (!success && attempts < 100) {
      attempts++;
      this.solution = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
      this.generateValidMask();
      if (this.checkConnectivity(this.solution, 0)) {
        success = true;
      }
    }

    // 2. Generate a Latin Square
    const latin = Array(this.size).fill(null).map((_, r) => 
      Array(this.size).fill(null).map((_, c) => ((r + c) % this.size) + 1)
    );

    // Permute rows and columns of Latin square to randomize
    for (let i = this.size - 1; i > 0; i--) {
      const rj = Math.floor(Math.random() * (i + 1));
      // Swap rows
      [latin[i], latin[rj]] = [latin[rj], latin[i]];
    }
    for (let j = this.size - 1; j > 0; j--) {
      const cj = Math.floor(Math.random() * (j + 1));
      // Swap columns
      for (let r = 0; r < this.size; r++) {
        const tmp = latin[r][j];
        latin[r][j] = latin[r][cj];
        latin[r][cj] = tmp;
      }
    }

    // 3. Populate numbers based on Latin square for unshaded cells, and create duplicates for shaded cells
    this.numbers = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.solution[r][c] === 0) {
          // Unshaded: use Latin square value (guarantees no duplicates)
          this.numbers[r][c] = latin[r][c];
        }
      }
    }

    // For shaded cells, place duplicate values
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.solution[r][c] === 1) {
          // Shaded: must duplicate an existing value in its row or column
          // Let's choose randomly to copy from row or col unshaded cells
          const rowUnshaded = [];
          const colUnshaded = [];
          for (let i = 0; i < this.size; i++) {
            if (this.solution[r][i] === 0 && this.numbers[r][i] > 0) rowUnshaded.push(this.numbers[r][i]);
            if (this.solution[i][c] === 0 && this.numbers[i][c] > 0) colUnshaded.push(this.numbers[i][c]);
          }

          let duplicateVal = 0;
          if (rowUnshaded.length > 0 && colUnshaded.length > 0) {
            duplicateVal = Math.random() < 0.5 
              ? rowUnshaded[Math.floor(Math.random() * rowUnshaded.length)]
              : colUnshaded[Math.floor(Math.random() * colUnshaded.length)];
          } else if (rowUnshaded.length > 0) {
            duplicateVal = rowUnshaded[Math.floor(Math.random() * rowUnshaded.length)];
          } else if (colUnshaded.length > 0) {
            duplicateVal = colUnshaded[Math.floor(Math.random() * colUnshaded.length)];
          } else {
            duplicateVal = Math.floor(Math.random() * this.size) + 1;
          }

          this.numbers[r][c] = duplicateVal;
        }
      }
    }
  }

  generateValidMask() {
    // Greedily shade random cells that don't violate adjacency and connectivity rules
    const cellIndices = [];
    for (let i = 0; i < this.size * this.size; i++) cellIndices.push(i);

    // Shuffle
    for (let i = cellIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellIndices[i], cellIndices[j]] = [cellIndices[j], cellIndices[i]];
    }

    // Target shaded count: 18% to 25% of cells
    const targetShaded = Math.floor(this.size * this.size * (0.18 + Math.random() * 0.07));
    let shadedCount = 0;

    for (const idx of cellIndices) {
      if (shadedCount >= targetShaded) break;

      const r = Math.floor(idx / this.size);
      const c = idx % this.size;

      // Check neighbors - none can be shaded
      let hasShadedNeighbor = false;
      const neighbors = [
        { r: r - 1, c }, { r: r + 1, c },
        { r, c: c - 1 }, { r, c: c + 1 }
      ];
      for (const nb of neighbors) {
        if (nb.r >= 0 && nb.r < this.size && nb.c >= 0 && nb.c < this.size) {
          if (this.solution[nb.r][nb.c] === 1) {
            hasShadedNeighbor = true;
            break;
          }
        }
      }

      if (hasShadedNeighbor) continue;

      // Temp shade
      this.solution[r][c] = 1;

      // Check connectivity of remaining unshaded cells
      if (this.checkConnectivity(this.solution, 0)) {
        shadedCount++;
      } else {
        // Revert
        this.solution[r][c] = 0;
      }
    }
  }

  checkConnectivity(mask, targetVal) {
    let startCell = null;
    let targetCount = 0;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (mask[r][c] === targetVal) {
          targetCount++;
          if (!startCell) startCell = { r, c };
        }
      }
    }

    if (targetCount === 0) return false;

    // BFS
    const visited = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
    const queue = [startCell];
    visited[startCell.r][startCell.c] = true;
    let visitedCount = 0;

    while (queue.length > 0) {
      const curr = queue.shift();
      visitedCount++;

      const neighbors = [
        { r: curr.r - 1, c: curr.c }, { r: curr.r + 1, c: curr.c },
        { r: curr.r, c: curr.c - 1 }, { r: curr.r, c: curr.c + 1 }
      ];

      for (const nb of neighbors) {
        if (nb.r >= 0 && nb.r < this.size && nb.c >= 0 && nb.c < this.size) {
          if (mask[nb.r][nb.c] === targetVal && !visited[nb.r][nb.c]) {
            visited[nb.r][nb.c] = true;
            queue.push(nb);
          }
        }
      }
    }

    return visitedCount === targetCount;
  }

  render(container) {
    container.classList.add('hitori-board');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
    
    const boardSize = Math.min(420, container.parentElement.clientWidth - 48);
    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell cell-hitori';
        cell.dataset.row = r;
        cell.dataset.col = c;
        
        const numSpan = document.createElement('span');
        numSpan.className = 'cell-number';
        numSpan.innerText = this.numbers[r][c];
        cell.appendChild(numSpan);
        
        // Circular ring overlay for marked cells
        const ring = document.createElement('div');
        ring.className = 'hitori-ring';
        cell.appendChild(ring);

        this.bindCellEvents(cell);
        container.appendChild(cell);
      }
    }

    this.updateCellVisuals();
  }

  bindCellEvents(cell) {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);

    const cycleState = (forward) => {
      this.manager.triggerFirstMove();
      const current = this.grid[r][c];
      let next = 0;

      if (forward) {
        if (current === 0) next = 1;      // Shaded (Black)
        else if (current === 1) next = 2; // Marked (Circle)
        else next = 0;                    // Unshaded (White)
      } else {
        if (current === 0) next = 2;      // Marked (Circle)
        else if (current === 2) next = 1; // Shaded (Black)
        else next = 0;                    // Unshaded (White)
      }

      this.grid[r][c] = next;
      this.updateCellVisuals();
      this.manager.saveMoveState();
      window.playClickSound();
      this.manager.updateChecklist();
    };

    cell.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        cycleState(true);
      } else if (e.button === 2) {
        cycleState(false);
      }
    });

    cell.addEventListener('contextmenu', (e) => e.preventDefault());

    let touchStartTime = 0;
    cell.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
    });

    cell.addEventListener('touchend', (e) => {
      e.preventDefault();
      const duration = Date.now() - touchStartTime;
      if (duration > 400) {
        cycleState(false);
      } else {
        cycleState(true);
      }
    });
  }

  updateCellVisuals() {
    const container = document.getElementById('board-container');
    const cells = container.getElementsByClassName('cell');

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      const state = this.grid[r][c];

      cell.classList.remove('shaded', 'marked');
      if (state === 1) {
        cell.classList.add('shaded');
      } else if (state === 2) {
        cell.classList.add('marked');
      }
    }
  }

  serialize() {
    return JSON.stringify({
      grid: this.grid
    });
  }

  deserialize(stateString) {
    const state = JSON.parse(stateString);
    this.grid = state.grid;
    this.updateCellVisuals();
  }

  getRulesChecklist() {
    let noAdjacentShaded = true;
    let noDuplicates = true;
    let connected = true;

    // 1. Check no adjacent shaded (horizontal or vertical)
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 1) {
          // Horizontal neighbor
          if (c < this.size - 1 && this.grid[r][c+1] === 1) noAdjacentShaded = false;
          // Vertical neighbor
          if (r < this.size - 1 && this.grid[r+1][c] === 1) noAdjacentShaded = false;
        }
      }
    }

    // 2. Check no duplicates in rows/cols (ignoring shaded cells)
    for (let r = 0; r < this.size; r++) {
      const seen = new Set();
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] !== 1) { // unshaded
          const val = this.numbers[r][c];
          if (seen.has(val)) noDuplicates = false;
          seen.add(val);
        }
      }
    }

    for (let c = 0; c < this.size; c++) {
      const seen = new Set();
      for (let r = 0; r < this.size; r++) {
        if (this.grid[r][c] !== 1) { // unshaded
          const val = this.numbers[r][c];
          if (seen.has(val)) noDuplicates = false;
          seen.add(val);
        }
      }
    }

    // 3. Check connectivity of unshaded cells (0 or 2)
    connected = this.checkConnectivity(this.grid, 1); // targetVal = 1 means we check non-1 connectivity

    // A check connectivity helper where we want connectivity of all non-1 (unshaded) cells
    let unshadedCount = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] !== 1) unshadedCount++;
      }
    }
    const totalCells = this.size * this.size;
    const hasMoves = unshadedCount < totalCells;

    const checklist = [
      {
        text: 'Không có ô bôi Đen kề cạnh nhau',
        status: noAdjacentShaded ? 'valid' : 'invalid'
      },
      {
        text: 'Không trùng số trên cùng hàng/cột',
        status: noDuplicates ? 'valid' : 'invalid'
      },
      {
        text: 'Tất cả ô Trắng nối liền nhau',
        status: connected ? 'valid' : 'invalid'
      }
    ];

    return checklist;
  }

  // Connectivity checker for active cells (state !== 1)
  checkConnectivity(gridState, excludeVal) {
    let startCell = null;
    let countActive = 0;
    
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (gridState[r][c] !== excludeVal) {
          countActive++;
          if (!startCell) startCell = { r, c };
        }
      }
    }

    if (countActive === 0) return false;

    // BFS
    const visited = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
    const queue = [startCell];
    visited[startCell.r][startCell.c] = true;
    let visitedCount = 0;

    while (queue.length > 0) {
      const curr = queue.shift();
      visitedCount++;

      const neighbors = [
        { r: curr.r - 1, c: curr.c }, { r: curr.r + 1, c: curr.c },
        { r: curr.r, c: curr.c - 1 }, { r: curr.r, c: curr.c + 1 }
      ];

      for (const nb of neighbors) {
        if (nb.r >= 0 && nb.r < this.size && nb.c >= 0 && nb.c < this.size) {
          if (gridState[nb.r][nb.c] !== excludeVal && !visited[nb.r][nb.c]) {
            visited[nb.r][nb.c] = true;
            queue.push(nb);
          }
        }
      }
    }

    return visitedCount === countActive;
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Illustrate invalid shaded neighbors (adjacent)
    ctx.strokeStyle = '#4a4560';
    ctx.lineWidth = 1;
    
    // Left Grid (Invalid adjacency)
    ctx.strokeRect(20, 20, 80, 40);
    ctx.beginPath();
    ctx.moveTo(60, 20); ctx.lineTo(60, 60);
    ctx.stroke();
    
    // Both shaded (black)
    ctx.fillStyle = '#1c1530';
    ctx.fillRect(20, 20, 40, 40);
    ctx.fillRect(60, 20, 40, 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3', 40, 40);
    ctx.fillText('3', 80, 40);
    
    ctx.fillStyle = '#ff3b30';
    ctx.font = 'bold 12px Quicksand';
    ctx.fillText('Sai (Kề cạnh)', 60, 85);

    // Right Grid (Valid diagonal adjacency)
    ctx.strokeStyle = '#4a4560';
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 20, 80, 40);
    ctx.beginPath();
    ctx.moveTo(160, 20); ctx.lineTo(160, 60);
    ctx.stroke();
    
    // One shaded (black), one normal (white)
    ctx.fillStyle = '#1c1530';
    ctx.fillRect(120, 20, 40, 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Outfit';
    ctx.fillText('3', 140, 40);
    ctx.fillText('3', 180, 40);
    
    ctx.fillStyle = '#34c759';
    ctx.font = 'bold 12px Quicksand';
    ctx.fillText('Hợp lệ (Chéo ok)', 160, 85);
  }

  onHint() {
    // Find the first discrepancy between the current grid and the solution
    // We only need to fix shaded vs unshaded discrepancy (0 or 2 vs 1)
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const currentIsShaded = this.grid[r][c] === 1;
        const solutionIsShaded = this.solution[r][c] === 1;
        if (currentIsShaded !== solutionIsShaded) {
          this.grid[r][c] = solutionIsShaded ? 1 : 0;
          this.updateCellVisuals();
          this.manager.saveMoveState();
          window.playChimeSound();
          this.manager.updateChecklist();
          return;
        }
      }
    }
  }

  onSolve() {
    // Apply solution mask (0 for unshaded, 1 for shaded)
    this.grid = this.solution.map(row => [...row]);
    this.updateCellVisuals();
    this.manager.saveMoveState();
    window.playChimeSound();
    this.manager.updateChecklist();
  }
}

// Register game
window.IQGames.hitori = HitoriGame;
