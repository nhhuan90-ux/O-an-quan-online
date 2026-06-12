/**
 * Lollipops Game Implementation
 */
class LollipopsGame {
  constructor(manager) {
    this.manager = manager;
    this.width = 5;
    this.height = 5;
    
    // Grid States: 0 (empty), 1 (circle), 2 (horiz line), 3 (vert line), 4 (dot)
    this.clues = []; // Permanent clues (non-modifiable by user)
    this.grid = [];  // User grid state
    
    // Drag placement state
    this.dragStart = null; // {r, c}
  }

  getTitle() { return 'Lollipops'; }
  getTip() { return 'Click vào ô để đặt đầu/que kẹo mút, hoặc kéo từ một ô sang ô bên cạnh để vẽ nhanh một que kẹo. Kẹo mút không được chạm nhau.'; }
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '5 × 5';
    if (diff === 'medium') return '6 × 6';
    return '7 × 7';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Mỗi cây kẹo mút gồm **đúng 1 đầu tròn** và **1 que thẳng** (que ngang hoặc que dọc) ở ô kề cạnh.</li>
        <li>Que kẹo mút phải chỉ thẳng vào đầu tròn của cây kẹo đó.</li>
        <li>Các cây kẹo mút **không được chạm nhau** (không có 2 bộ phận của 2 kẹo mút khác nhau đứng kề cạnh).</li>
        <li>Hai bộ phận cùng loại (đầu tròn, que ngang, que dọc) **không được nằm cùng hàng/cột** trừ khi có bộ phận khác loại ngăn giữa.</li>
      </ul>
    `;
  }

  init(container, difficulty) {
    if (difficulty === 'easy') {
      this.width = 5; this.height = 5;
    } else if (difficulty === 'medium') {
      this.width = 6; this.height = 6;
    } else {
      this.width = 7; this.height = 7;
    }

    this.clues = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
    this.grid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));

    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 1000) {
      attempts++;
      const tempGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
      const targetCount = (this.width === 5) ? 3 : (this.width === 6) ? 4 : 5;
      
      success = this.backtrackLollipops(tempGrid, 0, targetCount);
      
      if (success) {
        // Copy to solution, and carve clues
        this.clues = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
        
        // Find all placed elements
        const elements = [];
        for (let r = 0; r < this.height; r++) {
          for (let c = 0; c < this.width; c++) {
            if (tempGrid[r][c] > 0) {
              elements.push({ r, c, val: tempGrid[r][c] });
            }
          }
        }
        
        // Keep 40-50% as permanent clues
        elements.sort(() => Math.random() - 0.5);
        const clueCount = Math.ceil(elements.length * 0.45);
        for (let i = 0; i < clueCount; i++) {
          const el = elements[i];
          this.clues[el.r][el.c] = el.val;
          this.grid[el.r][el.c] = el.val;
        }
      }
    }

    if (!success) {
      this.loadFallbackLevel();
    }
  }

  backtrackLollipops(grid, count, target) {
    if (count === target) {
      return this.validateSpacing(grid);
    }

    // Try to place next lollipop
    // Search for empty spot for circle
    const emptyCells = [];
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (grid[r][c] === 0) emptyCells.push({r, c});
      }
    }
    
    emptyCells.sort(() => Math.random() - 0.5);

    for (const cell of emptyCells) {
      // Directions for stick: Up, Right, Down, Left
      const dirs = [
        { dr: -1, dc: 0, stickType: 3 }, // Up (vert stick)
        { dr: 0, dc: 1, stickType: 2 },  // Right (horiz stick)
        { dr: 1, dc: 0, stickType: 3 },  // Down (vert stick)
        { dr: 0, dc: -1, stickType: 2 }  // Left (horiz stick)
      ];
      
      dirs.sort(() => Math.random() - 0.5);

      for (const dir of dirs) {
        const sr = cell.r + dir.dr;
        const sc = cell.c + dir.dc;
        
        if (sr >= 0 && sr < this.height && sc >= 0 && sc < this.width) {
          if (grid[sr][sc] === 0) {
            // Check if this lollipop touches any existing lollipops
            const touches = this.checkLollipopContact(grid, cell, {r: sr, c: sc});
            if (!touches) {
              // Apply temporary
              grid[cell.r][cell.c] = 1; // Circle
              grid[sr][sc] = dir.stickType; // Stick
              
              // Validate spacing
              if (this.validateSpacing(grid)) {
                if (this.backtrackLollipops(grid, count + 1, target)) {
                  return true;
                }
              }
              
              // Rollback
              grid[cell.r][cell.c] = 0;
              grid[sr][sc] = 0;
            }
          }
        }
      }
    }
    return false;
  }

  checkLollipopContact(grid, circle, stick) {
    // Check neighbors of circle & stick to see if they touch other lollipops
    const cellsToCheck = [circle, stick];
    const targetSet = new Set([`${circle.r},${circle.c}`, `${stick.r},${stick.c}`]);

    for (const pt of cellsToCheck) {
      const neighbors = [
        {r: pt.r-1, c: pt.c}, {r: pt.r+1, c: pt.c},
        {r: pt.r, c: pt.c-1}, {r: pt.r, c: pt.c+1}
      ];
      for (const nb of neighbors) {
        if (nb.r >= 0 && nb.r < this.height && nb.c >= 0 && nb.c < this.width) {
          if (!targetSet.has(`${nb.r},${nb.c}`) && grid[nb.r][nb.c] > 0) {
            return true; // Touches another lollipop!
          }
        }
      }
    }
    return false;
  }

  validateSpacing(grid) {
    // Check rows
    for (let r = 0; r < this.height; r++) {
      const rowElements = [];
      for (let c = 0; c < this.width; c++) {
        if (grid[r][c] > 0 && grid[r][c] < 4) {
          rowElements.push({ col: c, val: grid[r][c] });
        }
      }
      for (let i = 0; i < rowElements.length - 1; i++) {
        if (rowElements[i].val === rowElements[i+1].val) {
          return false; // two of same type adjacent in row elements -> violation!
        }
      }
    }

    // Check columns
    for (let c = 0; c < this.width; c++) {
      const colElements = [];
      for (let r = 0; r < this.height; r++) {
        if (grid[r][c] > 0 && grid[r][c] < 4) {
          colElements.push({ row: r, val: grid[r][c] });
        }
      }
      for (let i = 0; i < colElements.length - 1; i++) {
        if (colElements[i].val === colElements[i+1].val) {
          return false; // two of same type adjacent in col elements -> violation!
        }
      }
    }

    return true;
  }

  loadFallbackLevel() {
    if (this.width === 5) {
      this.clues = [
        [1, 0, 0, 0, 0],
        [0, 0, 0, 2, 0],
        [0, 0, 0, 0, 0],
        [0, 3, 0, 0, 0],
        [0, 0, 0, 0, 1]
      ];
    } else if (this.width === 6) {
      this.clues = [
        [1, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0],
        [0, 0, 0, 3, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ];
    } else {
      this.clues = [
        [1, 2, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 3, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 2],
        [0, 0, 0, 0, 0, 0, 0]
      ];
    }
    this.grid = JSON.parse(JSON.stringify(this.clues));
  }

  render(container) {
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${this.height}, 1fr)`;
    
    const boardSize = Math.min(420, container.parentElement.clientWidth - 48);
    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;

    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell cell-lollipop';
        cell.dataset.row = r;
        cell.dataset.col = c;
        
        if (this.clues[r][c] > 0) {
          cell.classList.add('clue');
        }

        this.bindCellEvents(cell);
        container.appendChild(cell);
      }
    }

    this.updateCellVisuals();
  }

  bindCellEvents(cell) {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);

    const toggleCell = () => {
      if (this.clues[r][c] > 0) return; // permanent clue
      this.manager.triggerFirstMove();
      
      const current = this.grid[r][c];
      // Cycle: 0 -> 1 (Circle) -> 2 (Horiz line) -> 3 (Vert line) -> 4 (Dot) -> 0
      this.grid[r][c] = (current + 1) % 5;
      
      this.updateCellVisuals();
      this.manager.saveMoveState();
      window.playClickSound();
      this.manager.updateChecklist();
    };

    const toggleDot = () => {
      if (this.clues[r][c] > 0) return;
      this.manager.triggerFirstMove();
      
      if (this.grid[r][c] === 4) {
        this.grid[r][c] = 0;
      } else {
        this.grid[r][c] = 4;
      }
      
      this.updateCellVisuals();
      this.manager.saveMoveState();
      window.playClickSound();
      this.manager.updateChecklist();
    };

    // Mouse events drag to draw stick
    cell.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.dragStart = { r, c };
        const onGlobalMouseUp = () => {
          this.dragStart = null;
          window.removeEventListener('mouseup', onGlobalMouseUp);
        };
        window.addEventListener('mouseup', onGlobalMouseUp);
      } else if (e.button === 2) {
        toggleDot();
      }
    });

    cell.addEventListener('mouseup', (e) => {
      if (e.button !== 0 || !this.dragStart) return;
      
      const start = this.dragStart;
      this.dragStart = null;
      
      // If same cell, just toggle click
      if (start.r === r && start.c === c) {
        toggleCell();
        return;
      }

      // Check if adjacent drag
      const dr = r - start.r;
      const dc = c - start.c;
      const dist = Math.abs(dr) + Math.abs(dc);
      
      if (dist === 1) {
        // We dragged from start to adjacent (r,c)
        // Let's place a Circle at start, and a Stick at (r,c) pointing to start!
        if (this.clues[start.r][start.c] === 0 && this.clues[r][c] === 0) {
          this.manager.triggerFirstMove();
          this.grid[start.r][start.c] = 1; // Circle
          this.grid[r][c] = (dr !== 0) ? 3 : 2; // Vertical stick if dr, Horizontal stick if dc
          
          this.updateCellVisuals();
          this.manager.saveMoveState();
          window.playChimeSound();
          this.manager.updateChecklist();
        }
      }
    });

    cell.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mobile touch
    let touchStartTime = 0;
    cell.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
      this.dragStart = { r, c };
    });

    cell.addEventListener('touchend', (e) => {
      e.preventDefault();
      const duration = Date.now() - touchStartTime;
      const start = this.dragStart;
      this.dragStart = null;
      
      if (duration > 450) {
        toggleDot();
        return;
      }
      
      // Check if dragged (touchend target is different)
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target) {
        const destCell = target.closest('.cell-lollipop');
        if (destCell) {
          const drr = parseInt(destCell.dataset.row);
          const dcc = parseInt(destCell.dataset.col);
          const dist = Math.abs(drr - r) + Math.abs(dcc - c);
          
          if (dist === 1 && this.clues[r][c] === 0 && this.clues[drr][dcc] === 0) {
            this.manager.triggerFirstMove();
            this.grid[r][c] = 1; // Circle
            this.grid[drr][dcc] = (drr !== r) ? 3 : 2;
            this.updateCellVisuals();
            this.manager.saveMoveState();
            window.playChimeSound();
            this.manager.updateChecklist();
            return;
          }
        }
      }
      
      toggleCell();
    });
  }

  updateCellVisuals() {
    const container = document.getElementById('board-container');
    const cells = container.getElementsByClassName('cell');
    
    // Find contact violations to highlight
    const contactErrors = this.findContactErrors();
    const spacingErrors = this.findSpacingErrors();

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      const state = this.grid[r][c];

      cell.innerHTML = '';
      cell.className = 'cell cell-lollipop';
      
      if (this.clues[r][c] > 0) {
        cell.classList.add('clue');
      }

      if (state === 1) { // Circle
        const circle = document.createElement('div');
        circle.className = 'lollipop-circle';
        if (contactErrors[r][c] || spacingErrors[r][c]) {
          circle.classList.add('error');
        }
        cell.appendChild(circle);
      } else if (state === 2) { // Horizontal Stick
        const stick = document.createElement('div');
        stick.className = 'lollipop-stick-h';
        if (contactErrors[r][c] || spacingErrors[r][c]) {
          stick.style.background = 'var(--color-error)';
        }
        cell.appendChild(stick);
      } else if (state === 3) { // Vertical Stick
        const stick = document.createElement('div');
        stick.className = 'lollipop-stick-v';
        if (contactErrors[r][c] || spacingErrors[r][c]) {
          stick.style.background = 'var(--color-error)';
        }
        cell.appendChild(stick);
      } else if (state === 4) { // Dot
        cell.classList.add('lollipop-dot');
      }
    }
  }

  findContactErrors() {
    const errors = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
    
    // Find lollipops pairs and see if they touch other lollipops
    const lollipops = this.extractLollipops();

    for (let i = 0; i < lollipops.length; i++) {
      for (let j = i + 1; j < lollipops.length; j++) {
        const l1 = lollipops[i];
        const l2 = lollipops[j];
        
        // Check if any element of l1 is orthogonally adjacent to any element of l2
        const pts1 = [l1.circle, l1.stick].filter(p => p !== null && p.r !== -1);
        const pts2 = [l2.circle, l2.stick].filter(p => p !== null && p.r !== -1);
        
        let touch = false;
        pts1.forEach(p1 => {
          pts2.forEach(p2 => {
            const dist = Math.abs(p1.r - p2.r) + Math.abs(p1.c - p2.c);
            if (dist === 1) touch = true;
          });
        });

        if (touch) {
          if (l1.circle && l1.circle.r !== -1) errors[l1.circle.r][l1.circle.c] = true;
          if (l1.stick && l1.stick.r !== -1) errors[l1.stick.r][l1.stick.c] = true;
          if (l2.circle && l2.circle.r !== -1) errors[l2.circle.r][l2.circle.c] = true;
          if (l2.stick && l2.stick.r !== -1) errors[l2.stick.r][l2.stick.c] = true;
        }
      }
    }

    return errors;
  }

  findSpacingErrors() {
    const errors = Array(this.height).fill(null).map(() => Array(this.width).fill(false));

    // Rows spacing error check
    for (let r = 0; r < this.height; r++) {
      const row = [];
      for (let c = 0; c < this.width; c++) {
        const val = this.grid[r][c];
        if (val > 0 && val < 4) row.push({ col: c, val });
      }
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i].val === row[i+1].val) {
          errors[r][row[i].col] = true;
          errors[r][row[i+1].col] = true;
        }
      }
    }

    // Columns spacing error check
    for (let c = 0; c < this.width; c++) {
      const col = [];
      for (let r = 0; r < this.height; r++) {
        const val = this.grid[r][c];
        if (val > 0 && val < 4) col.push({ row: r, val });
      }
      for (let i = 0; i < col.length - 1; i++) {
        if (col[i].val === col[i+1].val) {
          errors[col[i].row][c] = true;
          errors[col[i+1].row][c] = true;
        }
      }
    }

    return errors;
  }

  extractLollipops() {
    const lollipops = [];
    const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false));

    // Find all circles
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.grid[r][c] === 1 && !visited[r][c]) {
          visited[r][c] = true;
          
          // Look for adjacent stick pointing directly to this circle
          const dirs = [
            { dr: -1, dc: 0, stickType: 3 }, // Up (needs vertical stick)
            { dr: 0, dc: 1, stickType: 2 },  // Right (needs horiz stick)
            { dr: 1, dc: 0, stickType: 3 },  // Down (needs vert stick)
            { dr: 0, dc: -1, stickType: 2 }  // Left (needs horiz stick)
          ];
          
          let stickFound = null;
          for (const dir of dirs) {
            const nr = r + dir.dr;
            const nc = c + dir.dc;
            if (nr >= 0 && nr < this.height && nc >= 0 && nc < this.width) {
              if (this.grid[nr][nc] === dir.stickType && !visited[nr][nc]) {
                stickFound = { r: nr, c: nc };
                visited[nr][nc] = true;
                break;
              }
            }
          }

          lollipops.push({
            circle: { r, c },
            stick: stickFound // could be null if unmatched
          });
        }
      }
    }

    // Also collect orphan sticks
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const val = this.grid[r][c];
        if ((val === 2 || val === 3) && !visited[r][c]) {
          lollipops.push({
            circle: { r: -1, c: -1 }, // orphan
            stick: { r, c }
          });
        }
      }
    }

    return lollipops;
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
    const lollipops = this.extractLollipops();
    const totalCount = (this.width === 5) ? 3 : (this.width === 6) ? 4 : 5;
    
    // 1. Every circle and line belongs to a valid lollipop
    let allPaired = lollipops.length > 0;
    lollipops.forEach(l => {
      if (!l.stick || l.circle.r === -1) {
        allPaired = false;
      }
    });

    // 2. Count match target
    const pairedCount = lollipops.filter(l => l.stick && l.circle.r !== -1).length;
    const correctCount = pairedCount === totalCount;

    // 3. No contact between different lollipops
    const contactErrors = this.findContactErrors();
    let noContact = true;
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (contactErrors[r][c]) noContact = false;
      }
    }

    // 4. Spacing rules satisfied
    const spacingOk = this.validateSpacing(this.grid);

    // Let's count elements of type 1, 2, 3
    let activeElements = 0;
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.grid[r][c] > 0 && this.grid[r][c] < 4) activeElements++;
      }
    }

    const checklist = [
      {
        text: `Đạt đủ số kẹo mút mục tiêu (${totalCount})`,
        status: activeElements === 0 ? 'neutral' : (correctCount ? 'valid' : 'invalid')
      },
      {
        text: 'Mọi bộ phận ghép cặp hoàn chỉnh (đầu + que)',
        status: activeElements === 0 ? 'neutral' : (allPaired ? 'valid' : 'invalid')
      },
      {
        text: 'Các cây kẹo mút không chạm nhau',
        status: activeElements === 0 ? 'neutral' : (noContact ? 'valid' : 'invalid')
      },
      {
        text: 'Khoảng cách hàng/cột hợp lệ',
        status: activeElements === 0 ? 'neutral' : (spacingOk ? 'valid' : 'invalid')
      }
    ];

    return checklist;
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw correct lollipop: circle + vertical stick
    ctx.fillStyle = 'linear-gradient(135deg, #ff4081 0%, #d81b60 100%)';
    ctx.beginPath();
    ctx.arc(60, 40, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ff80ab';
    ctx.fillRect(57, 56, 6, 28);

    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('Đầu Kẹo', 60, 100);
    ctx.fillText('Que kẹo', 150, 100);
  }

  onHint() {
    // Smart hint: Place one of the hidden elements from the solution!
    // Since we ran greedily, we need to know what the full valid backtracking solution was.
    // Let's rerun backtracking once on generator start and save the exact solution in solutionGrid!
    // Wait, let's look at init: yes, we generate the level and it creates a valid partition, then hides elements.
    // If we save the full valid backtracking grid in this.solutionGrid, we can just reveal one hidden cell!
    // Let's implement this! It's so clean.
    // Where is the solution grid? In generateLevel(), tempGrid was the full valid grid!
    // Let's store it as this.solutionGrid.
    if (!this.solutionGrid) {
      return;
    }

    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.grid[r][c] !== this.solutionGrid[r][c] && this.clues[r][c] === 0) {
          // Reveal this cell
          this.grid[r][c] = this.solutionGrid[r][c];
          
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
    this.grid = JSON.parse(JSON.stringify(this.solutionGrid));
    this.updateCellVisuals();
    this.manager.saveMoveState();
    window.playChimeSound();
    this.manager.updateChecklist();
  }
}

// Modify generateLevel slightly to save solutionGrid
const origGenerate = LollipopsGame.prototype.generateLevel;
LollipopsGame.prototype.generateLevel = function() {
  let success = false;
  let attempts = 0;
  
  while (!success && attempts < 1000) {
    attempts++;
    const tempGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
    const targetCount = (this.width === 5) ? 3 : (this.width === 6) ? 4 : 5;
    
    success = this.backtrackLollipops(tempGrid, 0, targetCount);
    
    if (success) {
      this.solutionGrid = JSON.parse(JSON.stringify(tempGrid));
      this.clues = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
      
      const elements = [];
      for (let r = 0; r < this.height; r++) {
        for (let c = 0; c < this.width; c++) {
          if (tempGrid[r][c] > 0) {
            elements.push({ r, c, val: tempGrid[r][c] });
          }
        }
      }
      
      elements.sort(() => Math.random() - 0.5);
      const clueCount = Math.ceil(elements.length * 0.45);
      for (let i = 0; i < clueCount; i++) {
        const el = elements[i];
        this.clues[el.r][el.c] = el.val;
        this.grid[el.r][el.c] = el.val;
      }
    }
  }

  if (!success) {
    this.loadFallbackLevel();
    this.solutionGrid = JSON.parse(JSON.stringify(this.clues));
  }
};

// Register game
window.IQGames.lollipops = LollipopsGame;
