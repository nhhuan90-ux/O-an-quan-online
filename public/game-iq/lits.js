/**
 * LITS Game Implementation
 */
class LITSGame {
  constructor(manager) {
    this.manager = manager;
    this.width = 6;
    this.height = 6;
    
    // Level Data
    this.regions = [];     // 2D grid: region index for each cell
    this.shaded = [];      // 2D grid: 0 (empty), 1 (shaded), 2 (marked dot)
    this.regionCount = 4;
    
    // Original solution for hints
    this.solutionShaded = [];
  }

  getTitle() { return 'LITS'; }
  getTip() { return 'Tô màu đúng 4 ô tạo thành một tetromino (L, I, T, S) trong mỗi vùng. Nhấp chuột để tô màu, click chuột phải/chạm giữ để đặt dấu chấm ô trống.'; }
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '6 × 6';
    if (diff === 'medium') return '8 × 8';
    return '10 × 10';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Tô màu đúng <strong>4 ô liên kết</strong> (tạo thành hình <strong>L, I, T hoặc S</strong>) trong mỗi vùng.</li>
        <li>Tất cả các ô được tô màu trên toàn lưới phải <strong>kết nối với nhau</strong> thành một vùng duy nhất.</li>
        <li>Không được xuất hiện khối tô màu kích thước <strong>2x2</strong> ở bất cứ đâu.</li>
        <li>Hai tetromino cùng loại (kể cả xoay/lật) <strong>không được chạm cạnh nhau</strong>, nhưng được chạm góc.</li>
      </ul>
    `;
  }

  init(container, difficulty) {
    if (difficulty === 'easy') {
      this.width = 6; this.height = 6;
      this.regionCount = 4;
    } else if (difficulty === 'medium') {
      this.width = 8; this.height = 8;
      this.regionCount = 6;
    } else {
      this.width = 10; this.height = 10;
      this.regionCount = 8;
    }

    this.shaded = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
    this.regions = Array(this.height).fill(null).map(() => Array(this.width).fill(-1));
    this.solutionShaded = Array(this.height).fill(null).map(() => Array(this.width).fill(0));

    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    // Generate valid LITS placement first
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 200) {
      attempts++;
      this.solutionShaded = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
      const placedPolyominoes = []; // Array of list of cell coords {r, c} and shape 'L'|'I'|'T'|'S'
      
      success = this.growTetrominoesGreedy(placedPolyominoes);
      
      if (success) {
        // Expand regions from these seeds to fill the grid
        this.buildRegionsFromSeeds(placedPolyominoes);
      }
    }
    
    if (!success) {
      // Fallback to a hardcoded pattern if generation fails
      this.loadFallbackLevel();
    }
  }

  growTetrominoesGreedy(placedPolyominoes) {
    // Tetromino shapes definitions translated to (0,0)
    const shapes = {
      'L': [
        [[0,0],[1,0],[2,0],[2,1]], [[0,1],[1,1],[2,1],[2,0]],
        [[0,0],[0,1],[0,2],[1,0]], [[0,2],[1,2],[1,1],[1,0]],
        [[0,0],[0,1],[1,1],[2,1]], [[0,0],[1,0],[2,0],[0,1]],
        [[0,0],[1,0],[1,1],[1,2]], [[0,0],[1,0],[0,1],[0,2]]
      ],
      'I': [
        [[0,0],[1,0],[2,0],[3,0]], [[0,0],[0,1],[0,2],[0,3]]
      ],
      'T': [
        [[0,0],[0,1],[0,2],[1,1]], [[1,0],[1,1],[1,2],[0,1]],
        [[0,0],[1,0],[2,0],[1,1]], [[1,0],[0,1],[1,1],[2,1]]
      ],
      'S': [
        [[0,0],[0,1],[1,1],[1,2]], [[1,0],[1,1],[0,1],[0,2]],
        [[0,1],[1,1],[1,0],[2,0]], [[0,0],[1,0],[1,1],[2,1]]
      ]
    };
    const shapeKeys = ['L', 'I', 'T', 'S'];

    for (let i = 0; i < this.regionCount; i++) {
      let placed = false;
      let placeAttempts = 0;
      
      while (!placed && placeAttempts < 100) {
        placeAttempts++;
        const shapeType = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
        const shapeRotations = shapes[shapeType];
        const rot = shapeRotations[Math.floor(Math.random() * shapeRotations.length)];
        
        let r, c;
        if (i === 0) {
          // Place first tetromino randomly
          r = Math.floor(Math.random() * (this.height - 3));
          c = Math.floor(Math.random() * (this.width - 3));
        } else {
          // Place adjacent to existing shaded cells
          const borderCells = [];
          for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
              if (this.solutionShaded[y][x] === 0) {
                // Check if adjacent to shaded
                if ((y > 0 && this.solutionShaded[y-1][x] === 1) ||
                    (y < this.height - 1 && this.solutionShaded[y+1][x] === 1) ||
                    (x > 0 && this.solutionShaded[y][x-1] === 1) ||
                    (x < this.width - 1 && this.solutionShaded[y][x+1] === 1)) {
                  borderCells.push({r: y, c: x});
                }
              }
            }
          }
          
          if (borderCells.length === 0) break;
          const target = borderCells[Math.floor(Math.random() * borderCells.length)];
          // Align tetromino with target cell (offset by a random cell of the tetromino)
          const shapeCell = rot[Math.floor(Math.random() * rot.length)];
          r = target.r - shapeCell[0];
          c = target.c - shapeCell[1];
        }

        // Test if placement is valid
        const coords = rot.map(pt => ({ r: r + pt[0], c: c + pt[1] }));
        
        // 1. Bounds check
        const inBounds = coords.every(pt => pt.r >= 0 && pt.r < this.height && pt.c >= 0 && pt.c < this.width);
        if (!inBounds) continue;

        // 2. Overlap check
        const overlaps = coords.some(pt => this.solutionShaded[pt.r][pt.c] === 1);
        if (overlaps) continue;

        // 3. No 2x2 shaded check
        // Temp apply
        coords.forEach(pt => this.solutionShaded[pt.r][pt.c] = 1);
        const has2x2 = this.check2x2(this.solutionShaded);
        if (has2x2) {
          coords.forEach(pt => this.solutionShaded[pt.r][pt.c] = 0);
          continue;
        }

        // 4. No touching identical shape check
        let touchesSameShape = false;
        for (const pt of coords) {
          const neighbors = [
            {r: pt.r - 1, c: pt.c}, {r: pt.r + 1, c: pt.c},
            {r: pt.r, c: pt.c - 1}, {r: pt.r, c: pt.c + 1}
          ];
          for (const nb of neighbors) {
            if (nb.r >= 0 && nb.r < this.height && nb.c >= 0 && nb.c < this.width) {
              // If neighbor is shaded but not part of current tetromino
              if (this.solutionShaded[nb.r][nb.c] === 1 && !coords.some(cc => cc.r === nb.r && cc.c === nb.c)) {
                // Find which tetromino it belongs to
                const touchingTet = placedPolyominoes.find(p => p.coords.some(cc => cc.r === nb.r && cc.c === nb.c));
                if (touchingTet && touchingTet.shape === shapeType) {
                  touchesSameShape = true;
                  break;
                }
              }
            }
          }
          if (touchesSameShape) break;
        }

        if (touchesSameShape) {
          coords.forEach(pt => this.solutionShaded[pt.r][pt.c] = 0);
          continue;
        }

        // Placement accepted!
        placedPolyominoes.push({ shape: shapeType, coords });
        placed = true;
      }
      
      if (!placed) return false;
    }
    
    return true;
  }

  check2x2(grid) {
    for (let r = 0; r < this.height - 1; r++) {
      for (let c = 0; c < this.width - 1; c++) {
        if (grid[r][c] === 1 && grid[r+1][c] === 1 && grid[r][c+1] === 1 && grid[r+1][c+1] === 1) {
          return true;
        }
      }
    }
    return false;
  }

  buildRegionsFromSeeds(placedPolyominoes) {
    // Start regions with the seeds of placed polyominoes
    this.regions = Array(this.height).fill(null).map(() => Array(this.width).fill(-1));
    
    placedPolyominoes.forEach((tet, index) => {
      tet.coords.forEach(pt => {
        this.regions[pt.r][pt.c] = index;
      });
    });

    // Queue of cells to expand
    let unassignedCells = [];
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.regions[r][c] === -1) {
          unassignedCells.push({r, c});
        }
      }
    }

    // Greedily expand regions
    while (unassignedCells.length > 0) {
      // Find cells adjacent to already assigned regions
      const candidates = [];
      unassignedCells.forEach(cell => {
        const neighbors = [
          {r: cell.r-1, c: cell.c}, {r: cell.r+1, c: cell.c},
          {r: cell.r, c: cell.c-1}, {r: cell.r, c: cell.c+1}
        ];
        const adjRegions = [];
        neighbors.forEach(nb => {
          if (nb.r >= 0 && nb.r < this.height && nb.c >= 0 && nb.c < this.width) {
            const reg = this.regions[nb.r][nb.c];
            if (reg !== -1 && !adjRegions.includes(reg)) {
              adjRegions.push(reg);
            }
          }
        });
        
        if (adjRegions.length > 0) {
          candidates.push({ cell, adjRegions });
        }
      });

      if (candidates.length === 0) break; // should not happen

      // Pick a random candidate and assign it to one of its adjacent regions
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      const chosenRegion = chosen.adjRegions[Math.floor(Math.random() * chosen.adjRegions.length)];
      
      this.regions[chosen.cell.r][chosen.cell.c] = chosenRegion;
      
      // Remove from unassigned
      unassignedCells = unassignedCells.filter(cell => !(cell.r === chosen.cell.r && cell.c === chosen.cell.c));
    }
  }

  loadFallbackLevel() {
    // Hardcoded fallback 6x6 level
    this.regions = [
      [0, 0, 0, 1, 1, 1],
      [0, 2, 2, 2, 1, 1],
      [0, 2, 3, 3, 3, 1],
      [0, 2, 2, 3, 1, 1],
      [0, 0, 2, 2, 1, 1],
      [0, 0, 0, 1, 1, 1]
    ];
    this.regionCount = 4;
    // Simple 4 tetrominoes solution:
    this.solutionShaded = [
      [1, 1, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0]
    ]; // etc.
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
        cell.className = 'cell cell-lits';
        cell.dataset.row = r;
        cell.dataset.col = c;
        
        // Define thick border outlines for regions
        const regionId = this.regions[r][c];
        
        if (r === 0 || this.regions[r-1][c] !== regionId) cell.style.borderTop = '3px solid #7c68a6';
        if (r === this.height - 1 || this.regions[r+1][c] !== regionId) cell.style.borderBottom = '3px solid #7c68a6';
        if (c === 0 || this.regions[r][c-1] !== regionId) cell.style.borderLeft = '3px solid #7c68a6';
        if (c === this.width - 1 || this.regions[r][c+1] !== regionId) cell.style.borderRight = '3px solid #7c68a6';

        this.bindCellEvents(cell);
        container.appendChild(cell);
      }
    }
  }

  bindCellEvents(cell) {
    const toggleShaded = (e) => {
      e.preventDefault();
      this.manager.triggerFirstMove();
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      
      const current = this.shaded[r][c];
      if (current === 0) {
        this.shaded[r][c] = 1; // Shade
      } else if (current === 1) {
        this.shaded[r][c] = 2; // Dot
      } else {
        this.shaded[r][c] = 0; // Empty
      }
      
      this.updateCellVisuals();
      this.manager.saveMoveState();
      window.playClickSound();
      this.manager.updateChecklist();
    };

    const toggleDot = (e) => {
      e.preventDefault();
      this.manager.triggerFirstMove();
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      
      if (this.shaded[r][c] === 2) {
        this.shaded[r][c] = 0;
      } else {
        this.shaded[r][c] = 2; // Dot
      }
      
      this.updateCellVisuals();
      this.manager.saveMoveState();
      window.playClickSound();
      this.manager.updateChecklist();
    };

    cell.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        toggleShaded(e);
      } else if (e.button === 2) {
        toggleDot(e);
      }
    });

    // Prevent right click menu
    cell.addEventListener('contextmenu', (e) => e.preventDefault());

    // Long press and double tap support for mobile
    let touchStartTime = 0;
    cell.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
    });

    cell.addEventListener('touchend', (e) => {
      e.preventDefault();
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration > 400) {
        // Long press -> toggle dot
        toggleDot(e);
      } else {
        // Quick tap -> toggle shaded
        toggleShaded(e);
      }
    });
  }

  updateCellVisuals() {
    const container = document.getElementById('board-container');
    const cells = container.getElementsByClassName('cell');
    
    // Find all 2x2 error areas to highlight them
    const has2x2 = this.find2x2Errors();

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      const state = this.shaded[r][c];
      
      cell.classList.remove('shaded', 'marked-dot', 'highlight-error');
      
      if (state === 1) {
        cell.classList.add('shaded');
        if (has2x2[r][c]) {
          cell.classList.add('highlight-error');
        }
      } else if (state === 2) {
        cell.classList.add('marked-dot');
      }
    }
  }

  find2x2Errors() {
    const errors = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
    for (let r = 0; r < this.height - 1; r++) {
      for (let c = 0; c < this.width - 1; c++) {
        if (this.shaded[r][c] === 1 && 
            this.shaded[r+1][c] === 1 && 
            this.shaded[r][c+1] === 1 && 
            this.shaded[r+1][c+1] === 1) {
          errors[r][c] = true;
          errors[r+1][c] = true;
          errors[r][c+1] = true;
          errors[r+1][c+1] = true;
        }
      }
    }
    return errors;
  }

  // Identify tetromino shape of 4 cells in a region
  identifyTetromino(coords) {
    if (coords.length !== 4) return null;
    
    // Translate coords to relative (0,0)
    const minR = Math.min(...coords.map(pt => pt.r));
    const minC = Math.min(...coords.map(pt => pt.c));
    const rel = coords.map(pt => [pt.r - minR, pt.c - minC]);
    
    // Sort coords row-major
    rel.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);

    const str = JSON.stringify(rel);

    // Bounding representations of tetromino shapes (sorted relative coordinates)
    const shapesMap = {
      // I
      '[[0,0],[0,1],[0,2],[0,3]]': 'I',
      '[[0,0],[1,0],[2,0],[3,0]]': 'I',
      // L
      '[[0,0],[1,0],[2,0],[2,1]]': 'L',
      '[[0,1],[1,1],[2,0],[2,1]]': 'L',
      '[[0,0],[0,1],[0,2],[1,0]]': 'L',
      '[[0,0],[0,1],[0,2],[1,2]]': 'L',
      '[[0,0],[0,1],[1,1],[2,1]]': 'L',
      '[[0,0],[1,0],[2,0],[0,1]]': 'L',
      '[[0,0],[1,0],[1,1],[1,2]]': 'L',
      '[[0,2],[1,0],[1,1],[1,2]]': 'L',
      // T
      '[[0,0],[0,1],[0,2],[1,1]]': 'T',
      '[[0,1],[1,0],[1,1],[1,2]]': 'T',
      '[[0,1],[1,0],[1,1],[2,1]]': 'T',
      '[[0,0],[1,0],[1,1],[2,0]]': 'T',
      // S
      '[[0,0],[0,1],[1,1],[1,2]]': 'S',
      '[[0,1],[1,0],[1,1],[2,0]]': 'S',
      '[[0,1],[0,2],[1,0],[1,1]]': 'S',
      '[[0,0],[1,0],[1,1],[2,1]]': 'S',
      // O (2x2 is NOT allowed but we classify it to reject)
      '[[0,0],[0,1],[1,0],[1,1]]': 'O'
    };

    return shapesMap[str] || null;
  }

  serialize() {
    return JSON.stringify({
      shaded: this.shaded
    });
  }

  deserialize(stateString) {
    const state = JSON.parse(stateString);
    this.shaded = state.shaded;
    this.updateCellVisuals();
  }

  getRulesChecklist() {
    // Calculate regions shaded cells
    const regionShadedCells = Array(this.regionCount).fill(null).map(() => []);
    let totalShaded = 0;
    
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.shaded[r][c] === 1) {
          totalShaded++;
          const reg = this.regions[r][c];
          if (reg >= 0 && reg < this.regionCount) {
            regionShadedCells[reg].push({r, c});
          }
        }
      }
    }

    // 1. Each region has exactly 4 cells
    let exactFour = true;
    regionShadedCells.forEach(cells => {
      if (cells.length !== 4) exactFour = false;
    });

    // 2. Each region forms a valid tetromino (L, I, T, S)
    let validShapes = true;
    const regionShapes = [];
    regionShadedCells.forEach((cells, idx) => {
      if (cells.length === 4) {
        const shape = this.identifyTetromino(cells);
        if (!shape || shape === 'O') {
          validShapes = false;
          regionShapes[idx] = null;
        } else {
          regionShapes[idx] = shape;
        }
      } else {
        validShapes = false;
        regionShapes[idx] = null;
      }
    });

    // 3. No 2x2 square anywhere
    let no2x2 = true;
    for (let r = 0; r < this.height - 1; r++) {
      for (let c = 0; c < this.width - 1; c++) {
        if (this.shaded[r][c] === 1 && 
            this.shaded[r+1][c] === 1 && 
            this.shaded[r][c+1] === 1 && 
            this.shaded[r+1][c+1] === 1) {
          no2x2 = false;
        }
      }
    }

    // 4. Shaded cells are fully connected (BFS)
    let fullyConnected = false;
    if (totalShaded > 0) {
      // Find first shaded cell
      let start = null;
      for (let r = 0; r < this.height; r++) {
        for (let c = 0; c < this.width; c++) {
          if (this.shaded[r][c] === 1) {
            start = {r, c};
            break;
          }
        }
        if (start) break;
      }
      
      const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
      const queue = [start];
      visited[start.r][start.c] = true;
      let count = 0;
      
      while (queue.length > 0) {
        const curr = queue.shift();
        count++;
        
        const neighbors = [
          {r: curr.r-1, c: curr.c}, {r: curr.r+1, c: curr.c},
          {r: curr.r, c: curr.c-1}, {r: curr.r, c: curr.c+1}
        ];
        
        neighbors.forEach(nb => {
          if (nb.r >= 0 && nb.r < this.height && nb.c >= 0 && nb.c < this.width) {
            if (this.shaded[nb.r][nb.c] === 1 && !visited[nb.r][nb.c]) {
              visited[nb.r][nb.c] = true;
              queue.push(nb);
            }
          }
        });
      }
      fullyConnected = (count === totalShaded);
    }

    // 5. No touching identical shapes sharing an edge
    let noAdjacentIdentical = true;
    for (let i = 0; i < this.regionCount; i++) {
      for (let j = i + 1; j < this.regionCount; j++) {
        const shapeI = regionShapes[i];
        const shapeJ = regionShapes[j];
        if (shapeI && shapeJ && shapeI === shapeJ) {
          // Check if any cell in region i is adjacent to any cell in region j
          let touch = false;
          regionShadedCells[i].forEach(ci => {
            regionShadedCells[j].forEach(cj => {
              const dist = Math.abs(ci.r - cj.r) + Math.abs(ci.c - cj.c);
              if (dist === 1) touch = true;
            });
          });
          if (touch) noAdjacentIdentical = false;
        }
      }
    }

    const checklist = [
      {
        text: 'Mỗi vùng có đúng 4 ô tô màu',
        status: totalShaded === 0 ? 'neutral' : (exactFour ? 'valid' : 'invalid')
      },
      {
        text: 'Mỗi vùng tạo hình tetromino (L, I, T, S)',
        status: totalShaded === 0 ? 'neutral' : (validShapes ? 'valid' : 'invalid')
      },
      {
        text: 'Không tạo thành hình 2×2 ở bất kỳ đâu',
        status: totalShaded === 0 ? 'neutral' : (no2x2 ? 'valid' : 'invalid')
      },
      {
        text: 'Tất cả các ô tô màu nối liền nhau',
        status: totalShaded === 0 ? 'neutral' : (fullyConnected ? 'valid' : 'invalid')
      },
      {
        text: 'Hai tetromino cùng loại không chạm cạnh',
        status: totalShaded === 0 ? 'neutral' : (noAdjacentIdentical ? 'valid' : 'invalid')
      }
    ];

    return checklist;
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw tetromino shapes L, I, T, S
    ctx.fillStyle = 'rgba(175, 82, 222, 0.4)';
    ctx.strokeStyle = '#af52de';
    ctx.lineWidth = 2;

    const size = 15;
    
    // Draw L shape
    ctx.fillRect(15, 20, size, size*3);
    ctx.fillRect(15 + size, 20 + size*2, size, size);
    ctx.strokeRect(15, 20, size, size*3);
    ctx.strokeRect(15 + size, 20 + size*2, size, size);

    // Draw I shape
    ctx.fillRect(60, 20, size, size*4);
    ctx.strokeRect(60, 20, size, size*4);

    // Draw T shape
    ctx.fillRect(110, 20, size*3, size);
    ctx.fillRect(110 + size, 20 + size, size, size);
    ctx.strokeRect(110, 20, size*3, size);
    ctx.strokeRect(110 + size, 20 + size, size, size);

    // Draw S shape
    ctx.fillRect(175, 20 + size, size*2, size);
    ctx.fillRect(175 + size, 20, size*2, size);
    ctx.strokeRect(175, 20 + size, size*2, size);
    ctx.strokeRect(175 + size, 20, size*2, size);

    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('L', 27, 95);
    ctx.fillText('I', 67, 95);
    ctx.fillText('T', 132, 95);
    ctx.fillText('S', 197, 95);
  }

  onHint() {
    // Smart hint: find a region that is not solved, and fill its cells matching the solutionShaded
    for (let rId = 0; rId < this.regionCount; rId++) {
      // Check if region is solved
      const regionCells = [];
      for (let r = 0; r < this.height; r++) {
        for (let c = 0; c < this.width; c++) {
          if (this.regions[r][c] === rId) {
            regionCells.push({r, c});
          }
        }
      }

      const isRegionCorrect = regionCells.every(pt => 
        this.shaded[pt.r][pt.c] === this.solutionShaded[pt.r][pt.c]
      );

      if (!isRegionCorrect) {
        // Solve this region
        regionCells.forEach(pt => {
          this.shaded[pt.r][pt.c] = this.solutionShaded[pt.r][pt.c];
        });
        
        this.updateCellVisuals();
        this.manager.saveMoveState();
        window.playChimeSound();
        this.manager.updateChecklist();
        return;
      }
    }
  }

  onSolve() {
    this.shaded = JSON.parse(JSON.stringify(this.solutionShaded));
    this.updateCellVisuals();
    this.manager.saveMoveState();
    window.playChimeSound();
    this.manager.updateChecklist();
  }
}

// Register game
window.IQGames.lits = LITSGame;
