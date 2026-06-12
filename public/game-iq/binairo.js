/**
 * Binairo Plus Game Implementation
 */
class BinairoGame {
  constructor(manager) {
    this.manager = manager;
    this.size = 6; // Grid size N x N (6, 8, or 10)
    
    // Board State
    this.grid = [];        // 2D grid: 0 (empty), 1 (white circle), 2 (black circle)
    this.isClue = [];      // 2D grid: boolean, true if the cell is a clue (cannot be edited)
    this.relations = [];   // List of relations: {r1, c1, r2, c2, type: '=' | 'x'}
    
    // Solution for Hint and Solve
    this.solution = [];
  }

  getTitle() { return 'Binairo Plus'; }
  
  getTip() { 
    return 'Nhấp để chuyển trạng thái ô: Trống -> Trắng -> Đen -> Trống. Thỏa mãn số lượng, kề nhau và các liên kết = / x.'; 
  }
  
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '6 × 6';
    if (diff === 'medium') return '8 × 8';
    return '10 × 10';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Điền tròn <strong>Trắng (⚪)</strong> hoặc <strong>Đen (⚫)</strong> vào các ô trống sao cho:</li>
        <li>Mỗi hàng và cột có số ô Trắng bằng số ô Đen.</li>
        <li>Không có quá 2 ô cùng màu nằm kề sát nhau theo chiều ngang hoặc dọc.</li>
        <li>Không có hai hàng hoặc hai cột nào có bố cục hoàn toàn giống nhau.</li>
        <li>Thỏa mãn các ký hiệu liên kết giữa các ô kề nhau:
          <ul>
            <li><strong>Dấu "=" (Equals):</strong> Hai ô kề nhau phải cùng màu.</li>
            <li><strong>Dấu "x" (Not equal):</strong> Hai ô kề nhau phải khác màu.</li>
          </ul>
        </li>
      </ul>
    `;
  }

  init(container, difficulty) {
    if (difficulty === 'easy') {
      this.size = 6;
    } else if (difficulty === 'medium') {
      this.size = 8;
    } else {
      this.size = 10;
    }

    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.isClue = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
    this.relations = [];
    this.solution = [];

    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    let success = false;
    let attempts = 0;
    
    // Generate solved Takuzu grid
    while (!success && attempts < 100) {
      attempts++;
      const solved = this.generateSolvedGrid(this.size);
      if (solved) {
        this.solution = solved;
        success = true;
      }
    }
    
    if (!success) {
      // Fallback
      this.solution = Array(this.size).fill(null).map((_, r) => 
        Array(this.size).fill(null).map((_, c) => ((r + c) % 2 === 0 ? 1 : 2))
      );
    }

    // Determine clues to keep (35% to 45%)
    const totalCells = this.size * this.size;
    const clueCount = Math.floor(totalCells * (0.35 + Math.random() * 0.1));
    const cellIndices = [];
    for (let i = 0; i < totalCells; i++) cellIndices.push(i);
    
    // Shuffle indices
    for (let i = cellIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellIndices[i], cellIndices[j]] = [cellIndices[j], cellIndices[i]];
    }

    // Place clues
    for (let i = 0; i < clueCount; i++) {
      const idx = cellIndices[i];
      const r = Math.floor(idx / this.size);
      const c = idx % this.size;
      this.grid[r][c] = this.solution[r][c];
      this.isClue[r][c] = true;
    }

    // Generate relationship markers (e.g. 5 for easy, 8 for medium, 12 for hard)
    const relCount = this.size === 6 ? 5 : this.size === 8 ? 8 : 12;
    const allBorders = [];
    
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        // Horizontal relation: (r, c) - (r, c+1)
        if (c < this.size - 1) {
          allBorders.push({ r1: r, c1: c, r2: r, c2: c + 1 });
        }
        // Vertical relation: (r, c) - (r+1, c)
        if (r < this.size - 1) {
          allBorders.push({ r1: r, c1: c, r2: r + 1, c2: c });
        }
      }
    }

    // Shuffle borders
    for (let i = allBorders.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allBorders[i], allBorders[j]] = [allBorders[j], allBorders[i]];
    }

    // Pick borders and check their solved values to create '=' or 'x'
    let added = 0;
    for (const border of allBorders) {
      if (added >= relCount) break;
      
      const val1 = this.solution[border.r1][border.c1];
      const val2 = this.solution[border.r2][border.c2];
      
      // Prefer relationships connecting at least one non-clue cell to make them useful
      const hasNonClue = !this.isClue[border.r1][border.c1] || !this.isClue[border.r2][border.c2];
      if (!hasNonClue && Math.random() > 0.1) continue;

      const type = (val1 === val2) ? '=' : 'x';
      this.relations.push({ ...border, type });
      added++;
    }
  }

  generateSolvedGrid(N) {
    const grid = Array(N).fill(null).map(() => Array(N).fill(0));
    
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const checkRowIdentical = (r) => {
      for (let prevR = 0; prevR < r; prevR++) {
        let match = true;
        for (let c = 0; c < N; c++) {
          if (grid[r][c] !== grid[prevR][c]) {
            match = false;
            break;
          }
        }
        if (match) return true;
      }
      return false;
    };

    const checkColIdentical = (c) => {
      for (let prevC = 0; prevC < c; prevC++) {
        let match = true;
        for (let r = 0; r < N; r++) {
          if (grid[r][c] !== grid[r][prevC]) {
            match = false;
            break;
          }
        }
        if (match) return true;
      }
      return false;
    };

    let stepCount = 0;
    const solve = (r, c) => {
      stepCount++;
      if (stepCount > 10000) return false; // Fail-safe recursion limit
      
      if (r === N) return true;
      
      let nextR = r;
      let nextC = c + 1;
      if (nextC === N) {
        nextR = r + 1;
        nextC = 0;
      }
      
      const choices = shuffle([1, 2]);
      for (const val of choices) {
        grid[r][c] = val;
        
        // Count in row r
        let rCount1 = 0, rCount2 = 0;
        for (let x = 0; x <= c; x++) {
          if (grid[r][x] === 1) rCount1++;
          if (grid[r][x] === 2) rCount2++;
        }
        if (rCount1 > N / 2 || rCount2 > N / 2) continue;
        
        // Count in col c
        let cCount1 = 0, cCount2 = 0;
        for (let y = 0; y <= r; y++) {
          if (grid[y][c] === 1) cCount1++;
          if (grid[y][c] === 2) cCount2++;
        }
        if (cCount1 > N / 2 || cCount2 > N / 2) continue;
        
        // Check no 3 consecutive same values
        if (c >= 2 && grid[r][c-1] === val && grid[r][c-2] === val) continue;
        if (r >= 2 && grid[r-1][c] === val && grid[r-2][c] === val) continue;
        
        // Check row identical when completed
        if (c === N - 1) {
          if (checkRowIdentical(r)) continue;
        }
        
        // Check col identical when completed
        if (r === N - 1) {
          if (checkColIdentical(c)) continue;
        }
        
        if (solve(nextR, nextC)) return true;
      }
      grid[r][c] = 0;
      return false;
    };
    
    if (solve(0, 0)) {
      return grid;
    }
    return null;
  }

  render(container) {
    container.classList.add('binairo-board');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
    
    const boardSize = Math.min(420, container.parentElement.clientWidth - 48);
    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;

    // Create cells
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell cell-binairo';
        cell.dataset.row = r;
        cell.dataset.col = c;
        
        if (this.isClue[r][c]) {
          cell.classList.add('clue');
        }
        
        // Create circle container
        const circle = document.createElement('div');
        circle.className = 'binairo-circle';
        cell.appendChild(circle);
        
        this.bindCellEvents(cell);
        container.appendChild(cell);
      }
    }

    // Create relation borders overlay
    const overlay = document.createElement('div');
    overlay.className = 'binairo-borders-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    container.appendChild(overlay);

    this.renderRelations(overlay);
    this.updateCellVisuals();
  }

  renderRelations(overlay) {
    const cellWidth = 100 / this.size;
    const cellHeight = 100 / this.size;

    this.relations.forEach(rel => {
      const marker = document.createElement('div');
      marker.className = `binairo-relation-marker ${rel.type === '=' ? 'eq' : 'neq'}`;
      marker.innerText = rel.type;
      
      // Position calculation
      let x, y;
      if (rel.r1 === rel.r2) {
        // Horizontal connection (between columns)
        x = (rel.c1 + 1) * cellWidth;
        y = (rel.r1 + 0.5) * cellHeight;
        marker.classList.add('horiz');
      } else {
        // Vertical connection (between rows)
        x = (rel.c1 + 0.5) * cellWidth;
        y = (rel.r1 + 1) * cellHeight;
        marker.classList.add('vert');
      }
      
      marker.style.left = `${x}%`;
      marker.style.top = `${y}%`;
      overlay.appendChild(marker);
    });
  }

  bindCellEvents(cell) {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    
    if (this.isClue[r][c]) return;

    const cycleState = (forward) => {
      this.manager.triggerFirstMove();
      const current = this.grid[r][c];
      let next = 0;
      
      if (forward) {
        if (current === 0) next = 1;      // White
        else if (current === 1) next = 2; // Black
        else next = 0;                    // Empty
      } else {
        if (current === 0) next = 2;      // Black
        else if (current === 2) next = 1; // White
        else next = 0;                    // Empty
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

    // Long press and quick tap for mobile
    let touchStartTime = 0;
    cell.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
    });

    cell.addEventListener('touchend', (e) => {
      e.preventDefault();
      const duration = Date.now() - touchStartTime;
      if (duration > 400) {
        cycleState(false); // Counter-clockwise cycle
      } else {
        cycleState(true);  // Clockwise cycle
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
      const val = this.grid[r][c];

      cell.classList.remove('val-1', 'val-2', 'val-0');
      cell.classList.add(`val-${val}`);
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
    let filledCount = 0;
    let countsOk = true;
    let noThreeConsecutive = true;
    let uniqueLines = true;
    let relationsSatisfied = true;

    // 1. Check filled and counts
    for (let r = 0; r < this.size; r++) {
      let rCount1 = 0, rCount2 = 0;
      for (let c = 0; c < this.size; c++) {
        const val = this.grid[r][c];
        if (val !== 0) filledCount++;
        if (val === 1) rCount1++;
        if (val === 2) rCount2++;
      }
      if (rCount1 > this.size / 2 || rCount2 > this.size / 2) {
        countsOk = false;
      }
    }

    for (let c = 0; c < this.size; c++) {
      let cCount1 = 0, cCount2 = 0;
      for (let r = 0; r < this.size; r++) {
        const val = this.grid[r][c];
        if (val === 1) cCount1++;
        if (val === 2) cCount2++;
      }
      if (cCount1 > this.size / 2 || cCount2 > this.size / 2) {
        countsOk = false;
      }
    }

    const allFilled = filledCount === this.size * this.size;

    // 2. Check no 3 consecutive
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = this.grid[r][c];
        if (val !== 0) {
          if (c < this.size - 2 && this.grid[r][c+1] === val && this.grid[r][c+2] === val) {
            noThreeConsecutive = false;
          }
          if (r < this.size - 2 && this.grid[r+1][c] === val && this.grid[r+2][c] === val) {
            noThreeConsecutive = false;
          }
        }
      }
    }

    // 3. Check unique rows and columns (only if board is fully filled)
    if (allFilled) {
      // Check rows
      for (let r1 = 0; r1 < this.size; r1++) {
        for (let r2 = r1 + 1; r2 < this.size; r2++) {
          let identical = true;
          for (let c = 0; c < this.size; c++) {
            if (this.grid[r1][c] !== this.grid[r2][c]) {
              identical = false;
              break;
            }
          }
          if (identical) uniqueLines = false;
        }
      }
      // Check cols
      for (let c1 = 0; c1 < this.size; c1++) {
        for (let c2 = c1 + 1; c2 < this.size; c2++) {
          let identical = true;
          for (let r = 0; r < this.size; r++) {
            if (this.grid[r][c1] !== this.grid[r][c2]) {
              identical = false;
              break;
            }
          }
          if (identical) uniqueLines = false;
        }
      }
    } else {
      uniqueLines = false; // default until fully filled
    }

    // 4. Check relations
    this.relations.forEach(rel => {
      const val1 = this.grid[rel.r1][rel.c1];
      const val2 = this.grid[rel.r2][rel.c2];
      
      if (val1 !== 0 && val2 !== 0) {
        if (rel.type === '=') {
          if (val1 !== val2) relationsSatisfied = false;
        } else if (rel.type === 'x') {
          if (val1 === val2) relationsSatisfied = false;
        }
      } else {
        // If they are not both filled, we don't count it as a violation yet,
        // but it means the relation is not fully satisfied (or we just count it as pending)
        // Let's say relations are satisfied if there are no violations
      }
    });

    const checklist = [
      {
        text: 'Lấp đầy các ô trên bảng',
        status: allFilled ? 'valid' : 'invalid'
      },
      {
        text: 'Số ô Trắng & Đen bằng nhau mỗi hàng/cột',
        status: countsOk ? 'valid' : 'invalid'
      },
      {
        text: 'Không có quá 2 ô cùng màu liền nhau',
        status: noThreeConsecutive ? 'valid' : 'invalid'
      },
      {
        text: 'Hàng/cột độc nhất không trùng nhau',
        status: allFilled ? (uniqueLines ? 'valid' : 'invalid') : 'neutral'
      },
      {
        text: 'Thỏa mãn các ký hiệu liên kết (= / x)',
        status: relationsSatisfied ? 'valid' : 'invalid'
      }
    ];

    return checklist;
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw illustration of equal values (=) and different values (x)
    ctx.strokeStyle = '#4a4560';
    ctx.lineWidth = 1;
    
    // Grid 1 (Equal relations)
    ctx.strokeRect(20, 20, 80, 40);
    ctx.beginPath();
    ctx.moveTo(60, 20); ctx.lineTo(60, 60);
    ctx.stroke();
    
    // Draw white circle in both
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(40, 40, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cccccc';
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(80, 40, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw = marker
    ctx.fillStyle = '#34c759';
    ctx.fillRect(52, 32, 16, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('=', 60, 40);

    ctx.fillStyle = '#34c759';
    ctx.font = 'bold 12px Quicksand';
    ctx.fillText('Cùng màu (=)', 60, 85);

    // Grid 2 (Different relations)
    ctx.strokeStyle = '#4a4560';
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 20, 80, 40);
    ctx.beginPath();
    ctx.moveTo(160, 20); ctx.lineTo(160, 60);
    ctx.stroke();
    
    // Draw white circle and black circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(140, 40, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cccccc';
    ctx.stroke();
    
    ctx.fillStyle = '#1c1530';
    ctx.beginPath();
    ctx.arc(180, 40, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bf5af2';
    ctx.stroke();
    
    // Draw x marker
    ctx.fillStyle = '#ff9f0a';
    ctx.fillRect(152, 32, 16, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('x', 160, 40);

    ctx.fillStyle = '#ff9f0a';
    ctx.font = 'bold 12px Quicksand';
    ctx.fillText('Khác màu (x)', 160, 85);
  }

  onHint() {
    // Find the first empty cell, and fill it with solution value
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) {
          this.grid[r][c] = this.solution[r][c];
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
    this.grid = JSON.parse(JSON.stringify(this.solution));
    this.updateCellVisuals();
    this.manager.saveMoveState();
    window.playChimeSound();
    this.manager.updateChecklist();
  }
}

// Register game
window.IQGames.binairo = BinairoGame;
