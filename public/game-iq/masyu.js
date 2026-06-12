/**
 * Masyu Game Implementation
 */
class MasyuGame {
  constructor(manager) {
    this.manager = manager;
    this.size = 6; // Grid size N x N (6, 8, or 10)
    
    // Level Data
    this.clues = [];  // 2D grid: null or 'white' or 'black'
    this.hLines = []; // Horizontal segments: size rows, size-1 cols (0=empty, 1=line, 2=cross)
    this.vLines = []; // Vertical segments: size-1 rows, size cols (0=empty, 1=line, 2=cross)
    
    // Solution data for Hints/Solve
    this.solutionHLines = [];
    this.solutionVLines = [];
  }

  getTitle() { return 'Masyu'; }
  getTip() { return 'Nhấp vào cạnh giữa các ô để vẽ đường đi hoặc click chuột phải/chạm giữ để đánh dấu X. Tạo thành vòng khép kín qua các ngọc.'; }
  
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '6 × 6';
    if (diff === 'medium') return '8 × 8';
    return '10 × 10';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Vẽ một **vòng lặp khép kín duy nhất** chạy qua tâm các ô vuông.</li>
        <li>Đường đi không được tự cắt, đè hoặc rẽ nhánh.</li>
        <li>Đường đi phải thỏa mãn quy tắc của các viên ngọc:</li>
        <li><strong>Ngọc Trắng (⚪):</strong> Đường đi phải đi **thẳng** qua ngọc, và phải **rẽ vuông góc 90 độ** ở ít nhất một trong hai ô liền trước/sau nó.</li>
        <li><strong>Ngọc Đen (⚫):</strong> Đường đi phải **rẽ vuông góc 90 độ** ngay tại ngọc, và phải đi **thẳng** qua ít nhất một ô kề ở cả hai đầu trước khi rẽ tiếp.</li>
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

    this.clues = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
    this.hLines = Array(this.size).fill(null).map(() => Array(this.size - 1).fill(0));
    this.vLines = Array(this.size - 1).fill(null).map(() => Array(this.size).fill(0));
    
    this.solutionHLines = Array(this.size).fill(null).map(() => Array(this.size - 1).fill(0));
    this.solutionVLines = Array(this.size - 1).fill(null).map(() => Array(this.size).fill(0));

    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 400) {
      attempts++;
      success = this.tryGenerateMasyu();
    }
    
    if (!success) {
      this.loadFallbackLevel();
    }
  }

  tryGenerateMasyu() {
    const size = this.size;
    
    // Generate a closed self-avoiding loop on the cell center grid
    const path = [];
    const visited = Array(size).fill(null).map(() => Array(size).fill(false));
    
    const startR = Math.floor(Math.random() * size);
    const startC = Math.floor(Math.random() * size);
    
    // Loop length targets
    const targetLength = (size === 6) ? 14 : (size === 8) ? 26 : 42;
    
    const dfs = (r, c) => {
      path.push({ r, c });
      visited[r][c] = true;
      
      if (path.length >= targetLength) {
        const dist = Math.abs(r - startR) + Math.abs(c - startC);
        if (dist === 1) {
          return true; // Adjacent to start, can close loop
        }
      }
      
      const neighbors = [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
      ].sort(() => Math.random() - 0.5);
      
      for (const n of neighbors) {
        const nr = r + n.dr;
        const nc = c + n.dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
          if (dfs(nr, nc)) return true;
        }
      }
      
      path.pop();
      visited[r][c] = false;
      return false;
    };
    
    if (dfs(startR, startC)) {
      // Draw lines in solution grid matching path
      this.solutionHLines = Array(size).fill(null).map(() => Array(size - 1).fill(0));
      this.solutionVLines = Array(size - 1).fill(null).map(() => Array(size).fill(0));
      
      const len = path.length;
      for (let i = 0; i < len; i++) {
        const p1 = path[i];
        const p2 = path[(i + 1) % len];
        if (p1.r === p2.r) {
          this.solutionHLines[p1.r][Math.min(p1.c, p2.c)] = 1;
        } else {
          this.solutionVLines[Math.min(p1.r, p2.r)][p1.c] = 1;
        }
      }
      
      // Analyze nodes to find clue candidates
      const whiteCandidates = [];
      const blackCandidates = [];
      
      for (let i = 0; i < len; i++) {
        const curr = path[i];
        const prev = path[(i - 1 + len) % len];
        const next = path[(i + 1) % len];
        
        const inDir = { dr: curr.r - prev.r, dc: curr.c - prev.c };
        const outDir = { dr: next.r - curr.r, dc: next.c - curr.c };
        const isStraight = (inDir.dr === outDir.dr && inDir.dc === outDir.dc);
        
        if (isStraight) {
          // White clue candidate:
          // Must turn at prev or turn at next
          const prevPrev = path[(i - 2 + len) % len];
          const nextNext = path[(i + 2) % len];
          
          const prevDir = { dr: prev.r - prevPrev.r, dc: prev.c - prevPrev.c };
          const nextDir = { dr: nextNext.r - next.r, dc: nextNext.c - next.c };
          
          const prevTurned = (prevDir.dr !== inDir.dr || prevDir.dc !== inDir.dc);
          const nextTurned = (nextDir.dr !== outDir.dr || nextDir.dc !== outDir.dc);
          
          if (prevTurned || nextTurned) {
            whiteCandidates.push(curr);
          }
        } else {
          // Black clue candidate:
          // Must go straight for at least 1 cell in both directions of the turn
          const prevPrev = path[(i - 2 + len) % len];
          const nextNext = path[(i + 2) % len];
          
          const prevDir = { dr: curr.r - prev.r, dc: curr.c - prev.c }; // enters curr
          const prevPrevDir = { dr: prev.r - prevPrev.r, dc: prev.c - prevPrev.c }; // enters prev
          const nextDir = { dr: next.r - curr.r, dc: next.c - curr.c }; // leaves curr
          const nextNextDir = { dr: nextNext.r - next.r, dc: nextNext.c - next.c }; // leaves next
          
          const prevStraight = (prevDir.dr === prevPrevDir.dr && prevDir.dc === prevPrevDir.dc);
          const nextStraight = (nextDir.dr === nextNextDir.dr && nextDir.dc === nextNextDir.dc);
          
          if (prevStraight && nextStraight) {
            blackCandidates.push(curr);
          }
        }
      }
      
      // Target counts
      let wCount = 4;
      let bCount = 2;
      if (size === 8) { wCount = 7; bCount = 3; }
      if (size === 10) { wCount = 11; bCount = 5; }
      
      if (whiteCandidates.length < wCount || blackCandidates.length < bCount) {
        return false;
      }
      
      // Select subset
      whiteCandidates.sort(() => Math.random() - 0.5);
      blackCandidates.sort(() => Math.random() - 0.5);
      
      this.clues = Array(size).fill(null).map(() => Array(size).fill(null));
      for (let i = 0; i < wCount; i++) {
        const c = whiteCandidates[i];
        this.clues[c.r][c.c] = 'white';
      }
      for (let i = 0; i < bCount; i++) {
        const c = blackCandidates[i];
        this.clues[c.r][c.c] = 'black';
      }
      
      return true;
    }
    
    return false;
  }

  loadFallbackLevel() {
    const size = this.size;
    this.clues = Array(size).fill(null).map(() => Array(size).fill(null));
    
    // Static layout for 6x6
    this.clues[1][1] = 'white';
    this.clues[1][4] = 'white';
    this.clues[4][1] = 'white';
    this.clues[4][4] = 'white';
    this.clues[2][2] = 'black';
    this.clues[3][3] = 'black';
    
    // Solution is a simple rectangle loop around borders, turning at corners
    // and loops in center:
    this.solutionHLines = Array(size).fill(null).map(() => Array(size - 1).fill(0));
    this.solutionVLines = Array(size - 1).fill(null).map(() => Array(size).fill(0));
    
    // Simple 6x6 outer border loop
    for (let c = 0; c < size - 1; c++) {
      this.solutionHLines[0][c] = 1;
      this.solutionHLines[5][c] = 1;
    }
    for (let r = 0; r < size - 1; r++) {
      this.solutionVLines[r][0] = 1;
      this.solutionVLines[r][5] = 1;
    }
    
    // Adjust clues to match outer border loop
    this.clues = Array(size).fill(null).map(() => Array(size).fill(null));
    this.clues[0][2] = 'white';
    this.clues[5][2] = 'white';
    this.clues[0][0] = 'black';
    this.clues[5][5] = 'black';
  }

  render(container) {
    container.innerHTML = '';
    container.className = 'board-container masyu-board-container';
    container.style.display = 'block';
    
    const parentWidth = container.parentElement ? container.parentElement.clientWidth : 0;
    const boardSize = Math.min(420, parentWidth - 48);
    console.log('Masyu Render - parentWidth:', parentWidth, 'boardSize:', boardSize);
    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;
    container.style.position = 'relative';
    
    // 1. Render cells background grid
    const cellsGrid = document.createElement('div');
    cellsGrid.className = 'masyu-cells-grid';
    cellsGrid.style.display = 'grid';
    cellsGrid.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    cellsGrid.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
    cellsGrid.style.position = 'absolute';
    cellsGrid.style.width = '100%';
    cellsGrid.style.height = '100%';
    cellsGrid.style.top = '0';
    cellsGrid.style.left = '0';
    cellsGrid.style.zIndex = '1';
    
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = document.createElement('div');
        cell.className = 'masyu-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        
        // Add White or Black circle
        const clue = this.clues[r][c];
        if (clue) {
          const circle = document.createElement('div');
          circle.className = `masyu-circle ${clue}`;
          cell.appendChild(circle);
        }
        
        cellsGrid.appendChild(cell);
      }
    }
    container.appendChild(cellsGrid);
    
    // 2. Render lines & hitboxes overlay
    // Left & Top align exactly with cell centers
    const boardLines = document.createElement('div');
    boardLines.className = 'masyu-board';
    boardLines.style.position = 'absolute';
    boardLines.style.left = `${(0.5 / this.size) * 100}%`;
    boardLines.style.top = `${(0.5 / this.size) * 100}%`;
    boardLines.style.width = `${((this.size - 1) / this.size) * 100}%`;
    boardLines.style.height = `${((this.size - 1) / this.size) * 100}%`;
    boardLines.style.pointerEvents = 'none';
    boardLines.style.zIndex = '2';
    container.appendChild(boardLines);
    
    // Horizontal edge hitboxes
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size - 1; c++) {
        const edge = document.createElement('div');
        edge.className = 'masyu-edge-hitbox';
        edge.dataset.type = 'h';
        edge.dataset.row = r;
        edge.dataset.col = c;
        edge.style.pointerEvents = 'auto';
        
        edge.style.position = 'absolute';
        edge.style.left = `${((c + 0.5) / (this.size - 1)) * 100}%`;
        edge.style.top = `${(r / (this.size - 1)) * 100}%`;
        edge.style.width = `calc(${100 / (this.size - 1)}% - 10px)`;
        edge.style.height = '16px';
        edge.style.transform = 'translate(-50%, -50%)';
        
        const line = document.createElement('div');
        line.className = 'masyu-edge-visual empty';
        line.style.width = '100%';
        line.style.height = '4px';
        edge.appendChild(line);
        
        this.bindEdgeEvents(edge);
        boardLines.appendChild(edge);
      }
    }
    
    // Vertical edge hitboxes
    for (let r = 0; r < this.size - 1; r++) {
      for (let c = 0; c < this.size; c++) {
        const edge = document.createElement('div');
        edge.className = 'masyu-edge-hitbox';
        edge.dataset.type = 'v';
        edge.dataset.row = r;
        edge.dataset.col = c;
        edge.style.pointerEvents = 'auto';
        
        edge.style.position = 'absolute';
        edge.style.left = `${(c / (this.size - 1)) * 100}%`;
        edge.style.top = `${((r + 0.5) / (this.size - 1)) * 100}%`;
        edge.style.width = '16px';
        edge.style.height = `calc(${100 / (this.size - 1)}% - 10px)`;
        edge.style.transform = 'translate(-50%, -50%)';
        
        const line = document.createElement('div');
        line.className = 'masyu-edge-visual empty';
        line.style.width = '4px';
        line.style.height = '100%';
        edge.appendChild(line);
        
        this.bindEdgeEvents(edge);
        boardLines.appendChild(edge);
      }
    }
    
    this.updateVisuals();
  }

  bindEdgeEvents(edge) {
    const type = edge.dataset.type;
    const r = parseInt(edge.dataset.row);
    const c = parseInt(edge.dataset.col);
    
    const toggleEdge = () => {
      this.manager.triggerFirstMove();
      const current = (type === 'h') ? this.hLines[r][c] : this.vLines[r][c];
      
      // Cycle: 0 (empty) -> 1 (line) -> 2 (cross) -> 0
      const next = (current + 1) % 3;
      
      if (type === 'h') this.hLines[r][c] = next;
      else this.vLines[r][c] = next;
      
      this.updateVisuals();
      this.manager.saveMoveState();
      window.playClickSound();
      this.manager.updateChecklist();
    };
    
    const toggleCross = () => {
      this.manager.triggerFirstMove();
      const current = (type === 'h') ? this.hLines[r][c] : this.vLines[r][c];
      const next = (current === 2) ? 0 : 2;
      
      if (type === 'h') this.hLines[r][c] = next;
      else this.vLines[r][c] = next;
      
      this.updateVisuals();
      this.manager.saveMoveState();
      window.playClickSound();
      this.manager.updateChecklist();
    };
    
    edge.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        toggleEdge();
      } else if (e.button === 2) {
        toggleCross();
      }
    });
    
    edge.addEventListener('contextmenu', (e) => e.preventDefault());
    
    let touchStartTime = 0;
    edge.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
    });
    
    edge.addEventListener('touchend', (e) => {
      e.preventDefault();
      const duration = Date.now() - touchStartTime;
      if (duration > 400) {
        toggleCross();
      } else {
        toggleEdge();
      }
    });
  }

  updateVisuals() {
    const container = document.getElementById('board-container');
    if (!container) return;
    
    const edgeDivs = container.getElementsByClassName('masyu-edge-hitbox');
    const circles = container.getElementsByClassName('masyu-circle');
    
    // Check validation of individual circles to add visual classes
    const circleValidation = this.validateCirclesSatisfied();
    
    for (let i = 0; i < edgeDivs.length; i++) {
      const edge = edgeDivs[i];
      const type = edge.dataset.type;
      const r = parseInt(edge.dataset.row);
      const c = parseInt(edge.dataset.col);
      const state = (type === 'h') ? this.hLines[r][c] : this.vLines[r][c];
      
      const line = edge.querySelector('.masyu-edge-visual');
      line.className = 'masyu-edge-visual';
      
      if (state === 1) {
        line.classList.add('line');
      } else if (state === 2) {
        line.classList.add('cross');
      } else {
        line.classList.add('empty');
      }
    }
    
    // Update circles' class based on satisfaction
    for (let i = 0; i < circles.length; i++) {
      const circleEl = circles[i];
      const cell = circleEl.parentElement;
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      
      circleEl.classList.remove('satisfied', 'error');
      
      const status = circleValidation[r][c];
      if (status === 'valid') {
        circleEl.classList.add('satisfied');
      } else if (status === 'invalid') {
        circleEl.classList.add('error');
      }
    }
  }

  validateCirclesSatisfied() {
    const satisfied = Array(this.size).fill(null).map(() => Array(this.size).fill('neutral'));
    
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const clue = this.clues[r][c];
        if (!clue) continue;
        
        // Count connections at cell (r, c)
        const conns = [];
        if (r > 0 && this.vLines[r-1][c] === 1) conns.push({ dr: -1, dc: 0 });
        if (c < this.size - 1 && this.hLines[r][c] === 1) conns.push({ dr: 0, dc: 1 });
        if (r < this.size - 1 && this.vLines[r][c] === 1) conns.push({ dr: 1, dc: 0 });
        if (c > 0 && this.hLines[r][c-1] === 1) conns.push({ dr: 0, dc: -1 });
        
        if (conns.length === 0) {
          satisfied[r][c] = 'neutral';
        } else if (conns.length !== 2) {
          satisfied[r][c] = 'invalid';
        } else {
          // Exactly 2 connections
          const c1 = conns[0];
          const c2 = conns[1];
          const isStraight = (c1.dr === -c2.dr && c1.dc === -c2.dc);
          
          if (clue === 'white') {
            if (!isStraight) {
              satisfied[r][c] = 'invalid';
            } else {
              // White pearl straight rule:
              // Must turn at (r + c1.dr, c + c1.dc) OR turn at (r + c2.dr, c + c2.dc)
              // Let's verify turns at adjacent cells.
              const turnAtCell = (tr, tc, dr, dc) => {
                // If out of bounds, cannot turn
                if (tr < 0 || tr >= this.size || tc < 0 || tc >= this.size) return false;
                
                // Count degree of that cell
                const dConns = [];
                if (tr > 0 && this.vLines[tr-1][tc] === 1) dConns.push({ dr: -1, dc: 0 });
                if (tc < this.size - 1 && this.hLines[tr][tc] === 1) dConns.push({ dr: 0, dc: 1 });
                if (tr < this.size - 1 && this.vLines[tr][tc] === 1) dConns.push({ dr: 1, dc: 0 });
                if (tc > 0 && this.hLines[tr][tc-1] === 1) dConns.push({ dr: 0, dc: -1 });
                
                if (dConns.length !== 2) return false; // Not a path passing through
                
                const dc1 = dConns[0];
                const dc2 = dConns[1];
                const isCellStraight = (dc1.dr === -dc2.dr && dc1.dc === -dc2.dc);
                return !isCellStraight; // If not straight, it's a turn!
              };
              
              const turn1 = turnAtCell(r + c1.dr, c + c1.dc, c1.dr, c1.dc);
              const turn2 = turnAtCell(r + c2.dr, c + c2.dc, c2.dr, c2.dc);
              
              satisfied[r][c] = (turn1 || turn2) ? 'valid' : 'invalid';
            }
          } else if (clue === 'black') {
            if (isStraight) {
              satisfied[r][c] = 'invalid';
            } else {
              // Black pearl corner rule:
              // Must go straight for at least 1 cell in BOTH directions.
              // That means for each connection c1, c2, the segment continues straight.
              const goesStraight = (tr, tc, dr, dc) => {
                // We are moving from (r, c) to (tr, tc) in direction (dr, dc)
                // The next cell in this direction is (tr + dr, tc + dc)
                // The edge connecting (tr, tc) to (tr + dr, tc + dc) must be active
                if (dr === 0) {
                  // Horizontal edge
                  const edgeC = dc > 0 ? tc : tc - 1;
                  if (edgeC >= 0 && edgeC < this.size - 1 && this.hLines[tr][edgeC] === 1) {
                    return true;
                  }
                } else {
                  // Vertical edge
                  const edgeR = dr > 0 ? tr : tr - 1;
                  if (edgeR >= 0 && edgeR < this.size - 1 && this.vLines[edgeR][tc] === 1) {
                    return true;
                  }
                }
                return false;
              };
              
              const straight1 = goesStraight(r + c1.dr, c + c1.dc, c1.dr, c1.dc);
              const straight2 = goesStraight(r + c2.dr, c + c2.dc, c2.dr, c2.dc);
              
              satisfied[r][c] = (straight1 && straight2) ? 'valid' : 'invalid';
            }
          }
        }
      }
    }
    
    return satisfied;
  }

  serialize() {
    return JSON.stringify({
      hLines: this.hLines,
      vLines: this.vLines
    });
  }

  deserialize(stateString) {
    const state = JSON.parse(stateString);
    this.hLines = state.hLines;
    this.vLines = state.vLines;
    this.updateVisuals();
  }

  getRulesChecklist() {
    // Check degrees of all nodes in cell centers
    const degrees = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    let totalLines = 0;
    
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (c < this.size - 1 && this.hLines[r][c] === 1) {
          degrees[r][c]++;
          degrees[r][c+1]++;
          totalLines++;
        }
        if (r < this.size - 1 && this.vLines[r][c] === 1) {
          degrees[r][c]++;
          degrees[r+1][c]++;
          totalLines++;
        }
      }
    }
    
    let degreeOk = true;
    let hasDrawnLines = totalLines > 0;
    
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (degrees[r][c] > 2 || degrees[r][c] === 1) {
          degreeOk = false;
        }
      }
    }
    
    let loopsCount = 0;
    if (hasDrawnLines && degreeOk) {
      const visited = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
      
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (degrees[r][c] === 2 && !visited[r][c]) {
            loopsCount++;
            
            // BFS/DFS trace
            const queue = [{ r, c }];
            visited[r][c] = true;
            
            while (queue.length > 0) {
              const curr = queue.shift();
              
              // Up
              if (curr.r > 0 && this.vLines[curr.r-1][curr.c] === 1 && !visited[curr.r-1][curr.c]) {
                visited[curr.r-1][curr.c] = true; queue.push({ r: curr.r-1, c: curr.c });
              }
              // Right
              if (curr.c < this.size - 1 && this.hLines[curr.r][curr.c] === 1 && !visited[curr.r][curr.c+1]) {
                visited[curr.r][curr.c+1] = true; queue.push({ r: curr.r, c: curr.c+1 });
              }
              // Down
              if (curr.r < this.size - 1 && this.vLines[curr.r][curr.c] === 1 && !visited[curr.r+1][curr.c]) {
                visited[curr.r+1][curr.c] = true; queue.push({ r: curr.r+1, c: curr.c });
              }
              // Left
              if (curr.c > 0 && this.hLines[curr.r][curr.c-1] === 1 && !visited[curr.r][curr.c-1]) {
                visited[curr.r][curr.c-1] = true; queue.push({ r: curr.r, c: curr.c-1 });
              }
            }
          }
        }
      }
    }
    
    const singleClosedLoop = hasDrawnLines && degreeOk && (loopsCount === 1);
    
    // Check constraint validation
    const satisfied = this.validateCirclesSatisfied();
    let allCluesVisited = true;
    let allConstraintsOk = true;
    
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const clue = this.clues[r][c];
        if (clue) {
          if (degrees[r][c] !== 2) {
            allCluesVisited = false;
          }
          if (satisfied[r][c] !== 'valid') {
            allConstraintsOk = false;
          }
        }
      }
    }
    
    return [
      {
        text: 'Đường đi nối các ô liên tục',
        status: !hasDrawnLines ? 'neutral' : (degreeOk ? 'valid' : 'invalid')
      },
      {
        text: 'Tạo thành một vòng lặp kín duy nhất',
        status: !hasDrawnLines ? 'neutral' : (singleClosedLoop ? 'valid' : 'invalid')
      },
      {
        text: 'Đi qua và thỏa mãn quy tắc ngọc',
        status: !hasDrawnLines ? 'neutral' : ((allCluesVisited && allConstraintsOk) ? 'valid' : 'invalid')
      }
    ];
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. White pearl illustration (Straight path through pearl)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(50, 40, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#cccccc'; ctx.lineWidth = 1.5; ctx.stroke();
    
    ctx.strokeStyle = '#a82cff'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, 40); ctx.lineTo(80, 40); // straight
    ctx.stroke();
    
    // 2. Black pearl illustration (Corner path through pearl)
    ctx.fillStyle = '#1a162b';
    ctx.beginPath(); ctx.arc(170, 40, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4a4560'; ctx.stroke();
    
    ctx.strokeStyle = '#a82cff'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(170, 15); ctx.lineTo(170, 40); ctx.lineTo(195, 40); // 90-degree corner
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('Ngọc Trắng: đi thẳng', 50, 100);
    ctx.fillText('Ngọc Đen: rẽ góc', 170, 100);
  }

  onHint() {
    // Hint: Find an edge in solution that is not yet drawn
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size - 1; c++) {
        if (this.solutionHLines[r][c] === 1 && this.hLines[r][c] !== 1) {
          this.hLines[r][c] = 1;
          this.updateVisuals();
          this.manager.saveMoveState();
          window.playChimeSound();
          this.manager.updateChecklist();
          return;
        }
      }
    }
    
    for (let r = 0; r < this.size - 1; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.solutionVLines[r][c] === 1 && this.vLines[r][c] !== 1) {
          this.vLines[r][c] = 1;
          this.updateVisuals();
          this.manager.saveMoveState();
          window.playChimeSound();
          this.manager.updateChecklist();
          return;
        }
      }
    }
  }

  onSolve() {
    this.hLines = JSON.parse(JSON.stringify(this.solutionHLines));
    this.vLines = JSON.parse(JSON.stringify(this.solutionVLines));
    this.updateVisuals();
    this.manager.saveMoveState();
    window.playChimeSound();
    this.manager.updateChecklist();
  }
}

// Register Game
window.IQGames.masyu = MasyuGame;
