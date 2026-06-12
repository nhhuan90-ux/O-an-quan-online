/**
 * Thermometers Game Implementation
 */
class ThermometersGame {
  constructor(manager) {
    this.manager = manager;
    this.size = 5; // Grid size N x N (5, 6, or 7)
    
    // Board State
    this.grid = [];        // 2D grid: 0 (empty), 1 (mercury), 2 (X mark)
    this.rowClues = [];    // Row constraints
    this.colClues = [];    // Col constraints
    
    // Thermometer structure
    this.thermometers = [];          // List of arrays of {r, c}
    this.thermometerIds = [];        // 2D grid: index in this.thermometers, or -1
    this.thermometerCellIndex = [];  // 2D grid: index of cell within its thermometer
    
    // Solution state for Hint and Solve
    this.solution = [];    // 2D grid of 0 or 1
  }

  getTitle() { return 'Thermometers'; }
  
  getTip() { 
    return 'Nhấp để dâng thủy ngân từ bóng chứa tròn lên. Click chuột phải / chạm giữ để đánh dấu X.'; 
  }
  
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '5 × 5';
    if (diff === 'medium') return '6 × 6';
    return '7 × 7';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Điền thủy ngân vào các nhiệt kế sao cho số ô được tô ở mỗi hàng và cột khớp với gợi ý ở biên.</li>
        <li>Thủy ngân luôn bắt đầu dâng từ phần **bóng chứa tròn (bulb)** và chạy dọc theo thân ống nhiệt kế liên tục, không bị ngắt quãng.</li>
        <li>Nhiệt kế có thể nằm ngang hoặc nằm dọc.</li>
        <li>Đánh dấu **X** vào những ô bạn chắc chắn không chứa thủy ngân.</li>
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
    this.thermometerIds = Array(this.size).fill(null).map(() => Array(this.size).fill(-1));
    this.thermometerCellIndex = Array(this.size).fill(null).map(() => Array(this.size).fill(-1));
    this.thermometers = [];
    this.rowClues = [];
    this.colClues = [];
    this.solution = Array(this.size).fill(null).map(() => Array(this.size).fill(0));

    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 100) {
      attempts++;
      this.thermometerIds = Array(this.size).fill(null).map(() => Array(this.size).fill(-1));
      this.thermometerCellIndex = Array(this.size).fill(null).map(() => Array(this.size).fill(-1));
      this.thermometers = [];
      
      this.placeThermometers();
      
      if (this.thermometers.length >= 3) {
        success = true;
      }
    }

    // Set random fill levels for each thermometer to build the solution
    this.solution = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.thermometers.forEach(thermo => {
      const len = thermo.length;
      // Pick a random fill level from 0 to len
      const fillLevel = Math.floor(Math.random() * (len + 1));
      for (let i = 0; i < fillLevel; i++) {
        const cell = thermo.cells[i];
        this.solution[cell.r][cell.c] = 1;
      }
    });

    // Compute clues
    this.rowClues = Array(this.size).fill(0);
    this.colClues = Array(this.size).fill(0);
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.solution[r][c] === 1) {
          this.rowClues[r]++;
          this.colClues[c]++;
        }
      }
    }
  }

  placeThermometers() {
    const directions = [
      { dr: -1, dc: 0, dir: 'U' }, // Up
      { dr: 1, dc: 0, dir: 'D' },  // Down
      { dr: 0, dc: -1, dir: 'L' }, // Left
      { dr: 0, dc: 1, dir: 'R' }   // Right
    ];

    // Try placing thermometers greedily
    for (let attempt = 0; attempt < 150; attempt++) {
      const r = Math.floor(Math.random() * this.size);
      const c = Math.floor(Math.random() * this.size);
      
      // Bulb must be empty
      if (this.thermometerIds[r][c] !== -1) continue;

      // Pick direction and length (2 to 4)
      const d = directions[Math.floor(Math.random() * directions.length)];
      const len = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4

      // Validate bounds and collisions
      let valid = true;
      const thermoCells = [];
      for (let i = 0; i < len; i++) {
        const nr = r + d.dr * i;
        const nc = c + d.dc * i;
        
        if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size || this.thermometerIds[nr][nc] !== -1) {
          valid = false;
          break;
        }
        thermoCells.push({ r: nr, c: nc });
      }

      if (valid) {
        const tId = this.thermometers.length;
        this.thermometers.push({
          cells: thermoCells,
          dir: d.dir,
          length: len
        });

        thermoCells.forEach((cell, idx) => {
          this.thermometerIds[cell.r][cell.c] = tId;
          this.thermometerCellIndex[cell.r][cell.c] = idx;
        });
      }
    }
  }

  render(container) {
    container.classList.add('thermometers-board');
    container.style.display = 'grid';
    // We add 1 row and 1 col for the clues
    container.style.gridTemplateColumns = `repeat(${this.size + 1}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${this.size + 1}, 1fr)`;
    
    const boardSize = Math.min(420, container.parentElement.clientWidth - 48);
    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;

    // Render cells including clues
    // Row 0: spacer then column clues
    // Row 1 to N: row clue then playable cells
    for (let r = 0; r <= this.size; r++) {
      for (let c = 0; c <= this.size; c++) {
        const cell = document.createElement('div');
        
        if (r === 0 && c === 0) {
          cell.className = 'thermo-spacer';
        } else if (r === 0) {
          // Column clue
          cell.className = 'thermo-clue col-clue';
          cell.dataset.colIdx = c - 1;
          cell.innerText = this.colClues[c - 1];
        } else if (c === 0) {
          // Row clue
          cell.className = 'thermo-clue row-clue';
          cell.dataset.rowIdx = r - 1;
          cell.innerText = this.rowClues[r - 1];
        } else {
          // Playable cell
          const pr = r - 1;
          const pc = c - 1;
          cell.className = 'cell cell-thermo';
          cell.dataset.row = pr;
          cell.dataset.col = pc;
          
          const tId = this.thermometerIds[pr][pc];
          if (tId !== -1) {
            const thermo = this.thermometers[tId];
            const cellIdx = this.thermometerCellIndex[pr][pc];
            
            // Render thermometer SVG component inside the cell
            const svg = this.createThermometerSvg(thermo, cellIdx);
            cell.appendChild(svg);
          }
          
          // Draw X mark container
          const xMark = document.createElement('div');
          xMark.className = 'thermo-x-mark';
          xMark.innerText = '×';
          cell.appendChild(xMark);

          this.bindCellEvents(cell);
        }
        
        container.appendChild(cell);
      }
    }

    this.updateCellVisuals();
  }

  createThermometerSvg(thermo, idx) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';

    const pathBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathBg.setAttribute('class', 'thermo-tube-bg');
    
    const pathFill = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathFill.setAttribute('class', 'thermo-tube-fill');

    const dir = thermo.dir;
    const isBulb = idx === 0;
    const isEnd = idx === thermo.length - 1;

    let pathStr = '';
    
    if (dir === 'R') {
      if (isBulb) {
        pathStr = 'M 50 36 L 100 36 L 100 64 L 50 64 A 20 20 0 1 1 50 36 Z';
      } else if (isEnd) {
        pathStr = 'M 0 36 L 70 36 A 14 14 0 0 1 70 64 L 0 64 Z';
      } else {
        pathStr = 'M 0 36 L 100 36 L 100 64 L 0 64 Z';
      }
    } else if (dir === 'L') {
      if (isBulb) {
        pathStr = 'M 50 36 L 0 36 L 0 64 L 50 64 A 20 20 0 1 0 50 36 Z';
      } else if (isEnd) {
        pathStr = 'M 100 36 L 30 36 A 14 14 0 0 0 30 64 L 100 64 Z';
      } else {
        pathStr = 'M 0 36 L 100 36 L 100 64 L 0 64 Z';
      }
    } else if (dir === 'D') {
      if (isBulb) {
        pathStr = 'M 36 50 L 36 100 L 64 100 L 64 50 A 20 20 0 1 0 36 50 Z';
      } else if (isEnd) {
        pathStr = 'M 36 0 L 36 70 A 14 14 0 0 0 64 70 L 64 0 Z';
      } else {
        pathStr = 'M 36 0 L 36 100 L 64 100 L 64 0 Z';
      }
    } else if (dir === 'U') {
      if (isBulb) {
        pathStr = 'M 36 50 L 36 0 L 64 0 L 64 50 A 20 20 0 1 1 36 50 Z';
      } else if (isEnd) {
        pathStr = 'M 36 100 L 36 30 A 14 14 0 0 1 64 30 L 64 100 Z';
      } else {
        pathStr = 'M 36 0 L 36 100 L 64 100 L 64 0 Z';
      }
    }

    pathBg.setAttribute('d', pathStr);
    pathFill.setAttribute('d', pathStr);

    svg.appendChild(pathBg);
    svg.appendChild(pathFill);
    return svg;
  }

  bindCellEvents(cell) {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    const tId = this.thermometerIds[r][c];

    if (tId === -1) {
      // Empty grid cell (not a thermometer) - allow toggling X only
      const toggleEmptyCellX = (e) => {
        e.preventDefault();
        this.manager.triggerFirstMove();
        this.grid[r][c] = this.grid[r][c] === 2 ? 0 : 2;
        this.updateCellVisuals();
        this.manager.saveMoveState();
        window.playClickSound();
        this.manager.updateChecklist();
      };
      
      cell.addEventListener('mousedown', toggleEmptyCellX);
      cell.addEventListener('contextmenu', (e) => e.preventDefault());
      cell.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchStart = Date.now(); });
      cell.addEventListener('touchend', (e) => {
        e.preventDefault();
        toggleEmptyCellX(e);
      });
      return;
    }

    const thermo = this.thermometers[tId];
    const cellIdx = this.thermometerCellIndex[r][c];

    const fillThermo = (e) => {
      e.preventDefault();
      this.manager.triggerFirstMove();
      
      // If cell currently has X, just clear the X
      if (this.grid[r][c] === 2) {
        this.grid[r][c] = 0;
        this.updateCellVisuals();
        this.manager.saveMoveState();
        window.playClickSound();
        this.manager.updateChecklist();
        return;
      }

      // Check current fill level of this thermometer
      let currentFill = 0;
      thermo.cells.forEach(cell => {
        if (this.grid[cell.r][cell.c] === 1) currentFill++;
      });

      let newFill = 0;
      if (cellIdx >= currentFill) {
        // Fill up to clicked cell
        newFill = cellIdx + 1;
      } else if (cellIdx === currentFill - 1) {
        // Toggle top cell off
        newFill = cellIdx;
      } else {
        // Clicked inside filled area -> retract to clicked cell
        newFill = cellIdx + 1;
      }

      // Apply new fill
      thermo.cells.forEach((cell, idx) => {
        this.grid[cell.r][cell.c] = idx < newFill ? 1 : 0;
      });

      this.updateCellVisuals();
      this.manager.saveMoveState();
      window.playClickSound();
      this.manager.updateChecklist();
    };

    const toggleX = (e) => {
      e.preventDefault();
      this.manager.triggerFirstMove();
      
      const current = this.grid[r][c];
      if (current === 2) {
        this.grid[r][c] = 0;
      } else {
        // Set to X, and empty this cell and any cells above it in the thermometer
        this.grid[r][c] = 2;
        thermo.cells.forEach((cell, idx) => {
          if (idx >= cellIdx && this.grid[cell.r][cell.c] === 1) {
            this.grid[cell.r][cell.c] = 0;
          }
        });
      }

      this.updateCellVisuals();
      this.manager.saveMoveState();
      window.playClickSound();
      this.manager.updateChecklist();
    };

    cell.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        fillThermo(e);
      } else if (e.button === 2) {
        toggleX(e);
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
        toggleX(e);
      } else {
        fillThermo(e);
      }
    });
  }

  updateCellVisuals() {
    const container = document.getElementById('board-container');
    const cells = container.getElementsByClassName('cell-thermo');

    // Count currently filled row and col values
    const currentRows = Array(this.size).fill(0);
    const currentCols = Array(this.size).fill(0);

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      const val = this.grid[r][c];

      cell.classList.remove('filled', 'marked-x');
      if (val === 1) {
        cell.classList.add('filled');
        currentRows[r]++;
        currentCols[c]++;
      } else if (val === 2) {
        cell.classList.add('marked-x');
      }
    }

    // Highlight row/column clues that match their target
    const rowCluesEl = container.getElementsByClassName('row-clue');
    for (let r = 0; r < this.size; r++) {
      const clueEl = rowCluesEl[r];
      if (clueEl) {
        clueEl.classList.remove('satisfied', 'exceeded');
        if (currentRows[r] === this.rowClues[r]) {
          clueEl.classList.add('satisfied');
        } else if (currentRows[r] > this.rowClues[r]) {
          clueEl.classList.add('exceeded');
        }
      }
    }

    const colCluesEl = container.getElementsByClassName('col-clue');
    for (let c = 0; c < this.size; c++) {
      const clueEl = colCluesEl[c];
      if (clueEl) {
        clueEl.classList.remove('satisfied', 'exceeded');
        if (currentCols[c] === this.colClues[c]) {
          clueEl.classList.add('satisfied');
        } else if (currentCols[c] > this.colClues[c]) {
          clueEl.classList.add('exceeded');
        }
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
    const currentRows = Array(this.size).fill(0);
    const currentCols = Array(this.size).fill(0);

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 1) {
          currentRows[r]++;
          currentCols[c]++;
        }
      }
    }

    let rowsSatisfied = true;
    let colsSatisfied = true;
    for (let r = 0; r < this.size; r++) {
      if (currentRows[r] !== this.rowClues[r]) rowsSatisfied = false;
    }
    for (let c = 0; c < this.size; c++) {
      if (currentCols[c] !== this.colClues[c]) colsSatisfied = false;
    }

    // Verify thermo continuous rule (should always be correct due to click logic, but checked)
    let continuous = true;
    this.thermometers.forEach(thermo => {
      let foundEmpty = false;
      thermo.cells.forEach(cell => {
        const filled = this.grid[cell.r][cell.c] === 1;
        if (filled && foundEmpty) {
          continuous = false; // Filled cell after an empty cell
        }
        if (!filled) {
          foundEmpty = true;
        }
      });
    });

    const totalFilled = currentRows.reduce((a, b) => a + b, 0);

    const checklist = [
      {
        text: 'Thủy ngân dâng liên tục từ bóng chứa',
        status: continuous ? 'valid' : 'invalid'
      },
      {
        text: 'Khớp số gợi ý của mỗi hàng',
        status: totalFilled === 0 ? 'neutral' : (rowsSatisfied ? 'valid' : 'invalid')
      },
      {
        text: 'Khớp số gợi ý của mỗi cột',
        status: totalFilled === 0 ? 'neutral' : (colsSatisfied ? 'valid' : 'invalid')
      }
    ];

    return checklist;
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Illustrate bulb and tube filling direction R (horizontal)
    ctx.strokeStyle = '#4a4560';
    ctx.lineWidth = 1;
    
    // Base tube container (Left side)
    ctx.strokeRect(20, 20, 80, 40);
    ctx.beginPath();
    ctx.moveTo(60, 20); ctx.lineTo(60, 60);
    ctx.stroke();

    // Draw glass bulb and empty tube outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    
    // Draw bulb sphere
    ctx.beginPath();
    ctx.arc(40, 40, 12, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw tube cap
    ctx.beginPath();
    ctx.arc(80, 40, 6, -Math.PI/2, Math.PI/2);
    ctx.lineTo(60, 46);
    ctx.moveTo(80, 34);
    ctx.lineTo(60, 34);
    ctx.stroke();
    
    // Filled representation (Right side)
    ctx.strokeStyle = '#4a4560';
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 20, 80, 40);
    ctx.beginPath();
    ctx.moveTo(160, 20); ctx.lineTo(160, 60);
    ctx.stroke();
    
    // Draw mercury filled bulb and half tube
    ctx.fillStyle = '#ff5722';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff5722';
    
    ctx.beginPath();
    ctx.arc(140, 40, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Fill tube up to first cell boundary
    ctx.fillRect(140, 34, 20, 12);
    
    ctx.shadowBlur = 0; // reset
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(140, 34, 20, 12);

    ctx.fillStyle = '#ff5722';
    ctx.font = 'bold 12px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('Bóng chứa (Bulb)', 60, 85);
    ctx.fillText('Thủy ngân dâng', 160, 85);
  }

  onHint() {
    // Hint: find the first discrepancy between grid and solution, and solve that thermometer cell
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const tId = this.thermometerIds[r][c];
        if (tId !== -1) {
          const thermo = this.thermometers[tId];
          
          // Check if this thermometer matches solution
          let matches = true;
          thermo.cells.forEach(cell => {
            const current = this.grid[cell.r][cell.c] === 1 ? 1 : 0;
            const sol = this.solution[cell.r][cell.c];
            if (current !== sol) matches = false;
          });
          
          if (!matches) {
            // Find solution fill level for this thermometer
            let solFill = 0;
            thermo.cells.forEach(cell => {
              if (this.solution[cell.r][cell.c] === 1) solFill++;
            });
            
            // Apply this solution fill level
            thermo.cells.forEach((cell, idx) => {
              this.grid[cell.r][cell.c] = idx < solFill ? 1 : 0;
            });
            
            this.updateCellVisuals();
            this.manager.saveMoveState();
            window.playChimeSound();
            this.manager.updateChecklist();
            return;
          }
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
window.IQGames.thermometers = ThermometersGame;
