/**
 * Bridges (Hashi) Game Implementation
 */
class BridgesGame {
  constructor(manager) {
    this.manager = manager;
    this.size = 6; // Grid size N x N (6, 8, or 10)
    
    this.islands = [];       // Array of { r, c, count, id }
    this.bridges = [];       // 2D symmetric matrix of bridge counts: bridges[i][j] = 0, 1, or 2
    this.completedMarks = []; // Array of booleans: completedMarks[i] = true/false (user helper)
    
    this.selectedIsland = null; // ID of selected island
    
    // Solution state for Hint & Solve
    this.solutionBridges = []; // 2D symmetric matrix of bridge counts
  }

  getTitle() { return 'Bridges'; }
  getTip() { return 'Nhấp Đảo A, chọn tiếp Đảo B kề bên để nối cầu: 0 → 1 → 2 → 0. Chuột phải/chạm giữ để đánh dấu xong.'; }
  
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '6 × 6';
    if (diff === 'medium') return '8 × 8';
    return '10 × 10';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Nối các đảo (vòng tròn chứa số) bằng các cây cầu sao cho:</li>
        <li>Cầu chỉ đi thẳng dọc hoặc ngang, không được cắt chéo nhau hoặc đi xuyên qua đảo khác.</li>
        <li>Số lượng cầu giữa 2 đảo tối đa là 2 cầu (cầu đơn hoặc cầu đôi).</li>
        <li>Số cầu nối vào mỗi đảo phải bằng đúng số gợi ý ghi trên đảo.</li>
        <li>Tất cả các đảo phải được nối liền nhau thành **một mạng lưới liên thông duy nhất** (không có nhóm đảo bị cô lập).</li>
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

    this.selectedIsland = null;
    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 200) {
      attempts++;
      success = this.tryGenerateBoard();
    }
    
    if (!success) {
      this.loadFallbackLevel();
    }
  }

  tryGenerateBoard() {
    this.islands = [];
    const size = this.size;
    const occupied = Array(size).fill(null).map(() => Array(size).fill(false));
    
    // Target islands count based on size
    let targetIslands = 7;
    if (size === 8) targetIslands = 12;
    if (size === 10) targetIslands = 19;
    
    // 1. Place first island
    const r0 = Math.floor(Math.random() * (size - 2)) + 1;
    const c0 = Math.floor(Math.random() * (size - 2)) + 1;
    
    this.islands.push({ r: r0, c: c0, count: 0, id: 0 });
    occupied[r0][c0] = true;
    
    // Temporary structure to hold solution bridges during generation
    let solBridges = [];
    const initSolBridges = (n) => {
      solBridges = Array(n).fill(null).map(() => Array(n).fill(0));
    };
    initSolBridges(1);

    // Grow the spanning tree
    let growAttempts = 0;
    while (this.islands.length < targetIslands && growAttempts < 500) {
      growAttempts++;
      
      // Select random existing island to branch from
      const parentIdx = Math.floor(Math.random() * this.islands.length);
      const parent = this.islands[parentIdx];
      
      const dir = [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
      ][Math.floor(Math.random() * 4)];
      
      const dist = Math.floor(Math.random() * 3) + 2; // distance between 2 and 4
      const targetR = parent.r + dir.dr * dist;
      const targetC = parent.c + dir.dc * dist;
      
      // Validate bounds
      if (targetR < 0 || targetR >= size || targetC < 0 || targetC >= size) continue;
      
      // Verify path cells (and target cell) are completely empty
      let pathClear = true;
      for (let k = 1; k <= dist; k++) {
        const nr = parent.r + dir.dr * k;
        const nc = parent.c + dir.dc * k;
        if (occupied[nr][nc]) {
          pathClear = false;
          break;
        }
      }
      
      // Check surrounding cells of the new island target to avoid overlapping clusters
      // (ensures islands are separated visually)
      if (pathClear) {
        const neighbors = [
          { r: targetR - 1, c: targetC }, { r: targetR + 1, c: targetC },
          { r: targetR, c: targetC - 1 }, { r: targetR, c: targetC + 1 }
        ];
        for (const n of neighbors) {
          if (n.r >= 0 && n.r < size && n.c >= 0 && n.c < size) {
            // If there's an island adjacent to the new island, we skip it
            // (but path cells are okay if they just have bridge lines)
            // A simple way is to check if it has an island
            const hasIsland = this.islands.some(isl => isl.r === n.r && isl.c === n.c);
            if (hasIsland) {
              pathClear = false;
              break;
            }
          }
        }
      }
      
      if (pathClear) {
        // Place new island
        const newId = this.islands.length;
        const newIsland = { r: targetR, c: targetC, count: 0, id: newId };
        this.islands.push(newIsland);
        
        // Mark path cells as occupied
        for (let k = 1; k <= dist; k++) {
          occupied[parent.r + dir.dr * k][parent.c + dir.dc * k] = true;
        }
        
        // Resize solBridges matrix
        const oldSolBridges = solBridges;
        initSolBridges(newId + 1);
        for (let i = 0; i < oldSolBridges.length; i++) {
          for (let j = 0; j < oldSolBridges.length; j++) {
            solBridges[i][j] = oldSolBridges[i][j];
          }
        }
        
        // Create bridge of 1 or 2
        const bCount = Math.random() < 0.4 ? 2 : 1;
        solBridges[parentIdx][newId] = bCount;
        solBridges[newId][parentIdx] = bCount;
      }
    }
    
    if (this.islands.length < targetIslands - 2) {
      // Failed to generate enough islands, retry
      return false;
    }
    
    // 2. Add some extra random bridges to form cycles
    const nIslands = this.islands.length;
    for (let i = 0; i < nIslands; i++) {
      for (let j = i + 1; j < nIslands; j++) {
        // Only with some probability
        if (Math.random() > 0.25) continue;
        
        const A = this.islands[i];
        const B = this.islands[j];
        
        if (solBridges[i][j] > 0) continue; // Already connected
        
        // Check if collinear
        if (A.r === B.r || A.c === B.c) {
          const isH = (A.r === B.r);
          const minVal = isH ? Math.min(A.c, B.c) : Math.min(A.r, B.r);
          const maxVal = isH ? Math.max(A.c, B.c) : Math.max(A.r, B.r);
          const fixedVal = isH ? A.r : A.c;
          
          // Check if path is clear of islands and bridge lines
          let clear = true;
          for (let k = minVal + 1; k < maxVal; k++) {
            const r = isH ? fixedVal : k;
            const c = isH ? k : fixedVal;
            if (occupied[r][c]) {
              clear = false;
              break;
            }
          }
          
          if (clear) {
            // Also check that adding this bridge doesn't cross any existing bridges in solution
            // (We will write a helper to check crossing for solution bridges)
            let crosses = false;
            for (let x = 0; x < nIslands; x++) {
              for (let y = x + 1; y < nIslands; y++) {
                if (solBridges[x][y] > 0) {
                  if (this.doesBridgeCross(A, B, this.islands[x], this.islands[y])) {
                    crosses = true;
                    break;
                  }
                }
              }
              if (crosses) break;
            }
            
            if (!crosses) {
              const bCount = Math.random() < 0.4 ? 2 : 1;
              solBridges[i][j] = bCount;
              solBridges[j][i] = bCount;
              
              // Mark path as occupied
              for (let k = minVal + 1; k < maxVal; k++) {
                const r = isH ? fixedVal : k;
                const c = isH ? k : fixedVal;
                occupied[r][c] = true;
              }
            }
          }
        }
      }
    }
    
    // 3. Compute final clue counts
    for (let i = 0; i < nIslands; i++) {
      let sum = 0;
      for (let j = 0; j < nIslands; j++) {
        sum += solBridges[i][j];
      }
      this.islands[i].count = sum;
      
      // Ensure no island has 0 bridges (spanning tree ensures >=1, but let's double check)
      if (sum === 0) return false;
    }
    
    // Set solutions and initial states
    this.solutionBridges = solBridges;
    this.bridges = Array(nIslands).fill(null).map(() => Array(nIslands).fill(0));
    this.completedMarks = Array(nIslands).fill(false);
    
    return true;
  }

  loadFallbackLevel() {
    this.islands = [
      { r: 1, c: 1, count: 3, id: 0 },
      { r: 1, c: 4, count: 4, id: 1 },
      { r: 4, c: 1, count: 3, id: 2 },
      { r: 4, c: 4, count: 4, id: 3 },
      { r: 1, c: 2, count: 2, id: 4 }
    ];
    const n = this.islands.length;
    this.bridges = Array(n).fill(null).map(() => Array(n).fill(0));
    this.completedMarks = Array(n).fill(false);
    
    this.solutionBridges = Array(n).fill(null).map(() => Array(n).fill(0));
    // 0-4: 1, 4-1: 1, 1-3: 2, 0-2: 2, 2-3: 1, 3-1: 1
    this.solutionBridges[0][4] = 1; this.solutionBridges[4][0] = 1;
    this.solutionBridges[4][1] = 1; this.solutionBridges[1][4] = 1;
    this.solutionBridges[1][3] = 2; this.solutionBridges[3][1] = 2;
    this.solutionBridges[0][2] = 2; this.solutionBridges[2][0] = 2;
    this.solutionBridges[2][3] = 1; this.solutionBridges[3][2] = 1;
    this.solutionBridges[3][1] = 1; this.solutionBridges[1][3] = 1; // Wait, 1-3 has 2 + 1 = 3? No, let's keep simple values
    
    // Clear and fix fallback
    this.solutionBridges = Array(n).fill(null).map(() => Array(n).fill(0));
    this.solutionBridges[0][4] = 1; this.solutionBridges[4][0] = 1;
    this.solutionBridges[4][1] = 1; this.solutionBridges[1][4] = 1;
    this.solutionBridges[0][2] = 2; this.solutionBridges[2][0] = 2;
    this.solutionBridges[1][3] = 3; // wait, max is 2 between any two islands!
    // Correct fallback with max 2 bridges:
    // 0(3) -[1]- 4(2) -[1]- 1(3)
    //  |                     |
    // [2]                   [2]
    //  |                     |
    // 2(3) ------[1]------- 3(3)
    this.solutionBridges = Array(n).fill(null).map(() => Array(n).fill(0));
    this.solutionBridges[0][4] = 1; this.solutionBridges[4][0] = 1;
    this.solutionBridges[4][1] = 1; this.solutionBridges[1][4] = 1;
    this.solutionBridges[0][2] = 2; this.solutionBridges[2][0] = 2;
    this.solutionBridges[1][3] = 2; this.solutionBridges[3][1] = 2;
    this.solutionBridges[2][3] = 1; this.solutionBridges[3][2] = 1;
    
    // Recalculate clues
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) sum += this.solutionBridges[i][j];
      this.islands[i].count = sum;
    }
  }

  doesBridgeCross(A, B, X, Y) {
    // A-B is one segment, X-Y is another segment.
    // Order coordinates so A is left/top of B, and X is left/top of Y
    const sortSegment = (p1, p2) => {
      if (p1.r === p2.r) {
        return p1.c < p2.c ? [p1, p2] : [p2, p1];
      } else {
        return p1.r < p2.r ? [p1, p2] : [p2, p1];
      }
    };
    
    const [a, b] = sortSegment(A, B);
    const [x, y] = sortSegment(X, Y);
    
    const abH = (a.r === b.r);
    const xyH = (x.r === y.r);
    
    if (abH && !xyH) {
      // a-b is horizontal, x-y is vertical
      // They cross if vertical column is strictly between horizontal columns,
      // and horizontal row is strictly between vertical rows.
      return (x.c > a.c && x.c < b.c && a.r > x.r && a.r < y.r);
    }
    
    if (!abH && xyH) {
      // a-b is vertical, x-y is horizontal
      return (a.c > x.c && a.c < y.c && x.r > a.r && x.r < b.r);
    }
    
    return false; // Parallel segments cannot cross (collinear overlap is prevented by island blocking rules)
  }

  render(container) {
    container.innerHTML = '';
    container.className = 'board-container bridges-board-wrapper';
    container.style.display = 'block';
    
    const parentWidth = container.parentElement ? container.parentElement.clientWidth : 0;
    const boardSize = Math.min(420, parentWidth - 48);
    console.log('Bridges Render - parentWidth:', parentWidth, 'boardSize:', boardSize);
    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;
    
    const board = document.createElement('div');
    board.className = 'bridges-board';
    board.style.width = '100%';
    board.style.height = '100%';
    board.style.position = 'relative';
    container.appendChild(board);
    
    // Draw background grid dots/cells for high quality look
    const gridBackground = document.createElement('div');
    gridBackground.className = 'bridges-grid-bg';
    gridBackground.style.display = 'grid';
    gridBackground.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    gridBackground.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
    gridBackground.style.position = 'absolute';
    gridBackground.style.width = '100%';
    gridBackground.style.height = '100%';
    gridBackground.style.top = '0';
    gridBackground.style.left = '0';
    gridBackground.style.pointerEvents = 'none';
    
    for (let i = 0; i < this.size * this.size; i++) {
      const cellBg = document.createElement('div');
      cellBg.className = 'bridges-grid-cell';
      gridBackground.appendChild(cellBg);
    }
    board.appendChild(gridBackground);
    
    // Draw SVG overlay for bridges
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'bridges-svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.position = 'absolute';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '1';
    board.appendChild(svg);
    
    // Render islands
    this.islands.forEach((island) => {
      const circle = document.createElement('div');
      circle.className = 'bridges-island';
      circle.dataset.id = island.id;
      circle.style.position = 'absolute';
      circle.style.left = `${(island.c / (this.size - 1)) * 100}%`;
      circle.style.top = `${(island.r / (this.size - 1)) * 100}%`;
      circle.style.transform = 'translate(-50%, -50%)';
      circle.style.zIndex = '2';
      
      const numSpan = document.createElement('span');
      numSpan.className = 'island-number';
      numSpan.innerText = island.count;
      circle.appendChild(numSpan);
      
      this.bindIslandEvents(circle);
      board.appendChild(circle);
    });
    
    this.updateVisuals();
  }

  bindIslandEvents(element) {
    const id = parseInt(element.dataset.id);
    
    const handleClick = () => {
      this.manager.triggerFirstMove();
      
      if (this.selectedIsland === null) {
        // Select
        this.selectedIsland = id;
        window.playClickSound();
        this.updateVisuals();
      } else if (this.selectedIsland === id) {
        // Deselect
        this.selectedIsland = null;
        window.playClickSound();
        this.updateVisuals();
      } else {
        // Try to build/cycle bridge to another island
        const pId = this.selectedIsland;
        const A = this.islands[pId];
        const B = this.islands[id];
        
        if (A.r === B.r || A.c === B.c) {
          const isH = (A.r === B.r);
          const minVal = isH ? Math.min(A.c, B.c) : Math.min(A.r, B.r);
          const maxVal = isH ? Math.max(A.c, B.c) : Math.max(A.r, B.r);
          const fixedVal = isH ? A.r : A.c;
          
          // Check if any other island lies strictly between A and B
          let blockedByIsland = false;
          this.islands.forEach((isl) => {
            if (isl.id === pId || isl.id === id) return;
            if (isH) {
              if (isl.r === fixedVal && isl.c > minVal && isl.c < maxVal) {
                blockedByIsland = true;
              }
            } else {
              if (isl.c === fixedVal && isl.r > minVal && isl.r < maxVal) {
                blockedByIsland = true;
              }
            }
          });
          
          if (blockedByIsland) {
            // Invalid target: select instead
            this.selectedIsland = id;
            window.playClickSound();
            this.updateVisuals();
            return;
          }
          
          // Check if cycling from 0 to 1 crosses any existing bridges
          const isNewBridge = (this.bridges[pId][id] === 0);
          let blockedByCross = false;
          
          if (isNewBridge) {
            const nIslands = this.islands.length;
            for (let x = 0; x < nIslands; x++) {
              for (let y = x + 1; y < nIslands; y++) {
                if (this.bridges[x][y] > 0) {
                  if (this.doesBridgeCross(A, B, this.islands[x], this.islands[y])) {
                    blockedByCross = true;
                    break;
                  }
                }
              }
              if (blockedByCross) break;
            }
          }
          
          if (blockedByCross) {
            // Invalid target: select instead
            this.selectedIsland = id;
            window.playClickSound();
            this.updateVisuals();
            return;
          }
          
          // Valid connection! Cycle: 0 -> 1 -> 2 -> 0
          const current = this.bridges[pId][id];
          const next = (current + 1) % 3;
          
          this.bridges[pId][id] = next;
          this.bridges[id][pId] = next;
          
          this.selectedIsland = null; // Deselect
          window.playClickSound();
          this.updateVisuals();
          this.manager.saveMoveState();
          this.manager.updateChecklist();
        } else {
          // Non-collinear island clicked: select instead
          this.selectedIsland = id;
          window.playClickSound();
          this.updateVisuals();
        }
      }
    };
    
    const handleRightClick = () => {
      this.manager.triggerFirstMove();
      this.completedMarks[id] = !this.completedMarks[id];
      window.playClickSound();
      this.updateVisuals();
      this.manager.saveMoveState();
      this.manager.updateChecklist();
    };

    element.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        handleClick();
      } else if (e.button === 2) {
        handleRightClick();
      }
    });
    
    element.addEventListener('contextmenu', (e) => e.preventDefault());
    
    let touchStartTime = 0;
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
    });
    
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      const duration = Date.now() - touchStartTime;
      if (duration > 400) {
        handleRightClick();
      } else {
        handleClick();
      }
    });
  }

  updateVisuals() {
    const container = document.getElementById('board-container');
    if (!container) return;
    
    const svg = container.querySelector('.bridges-svg');
    if (!svg) return;
    
    // Clear SVG
    svg.innerHTML = '';
    
    const nIslands = this.islands.length;
    
    // 1. Draw Bridges
    for (let i = 0; i < nIslands; i++) {
      for (let j = i + 1; j < nIslands; j++) {
        const bCount = this.bridges[i][j];
        if (bCount > 0) {
          const A = this.islands[i];
          const B = this.islands[j];
          
          const ax = (A.c / (this.size - 1)) * 100;
          const ay = (A.r / (this.size - 1)) * 100;
          const bx = (B.c / (this.size - 1)) * 100;
          const by = (B.r / (this.size - 1)) * 100;
          
          if (bCount === 1) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', ax);
            line.setAttribute('y1', ay);
            line.setAttribute('x2', bx);
            line.setAttribute('y2', by);
            line.setAttribute('class', 'bridge-line single');
            svg.appendChild(line);
          } else if (bCount === 2) {
            // Draw double parallel lines
            const isH = (A.r === B.r);
            const d = Math.max(1.2, 10 / (this.size - 1) * 0.16); // Gap distance
            
            const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            
            if (isH) {
              line1.setAttribute('x1', ax); line1.setAttribute('y1', ay - d);
              line1.setAttribute('x2', bx); line1.setAttribute('y2', by - d);
              
              line2.setAttribute('x1', ax); line2.setAttribute('y1', ay + d);
              line2.setAttribute('x2', bx); line2.setAttribute('y2', by + d);
            } else {
              line1.setAttribute('x1', ax - d); line1.setAttribute('y1', ay);
              line1.setAttribute('x2', bx - d); line1.setAttribute('y2', by);
              
              line2.setAttribute('x1', ax + d); line2.setAttribute('y1', ay);
              line2.setAttribute('x2', bx + d); line2.setAttribute('y2', by);
            }
            
            line1.setAttribute('class', 'bridge-line double');
            line2.setAttribute('class', 'bridge-line double');
            svg.appendChild(line1);
            svg.appendChild(line2);
          }
        }
      }
    }
    
    // 2. Highlight Island styles
    const islandElements = container.getElementsByClassName('bridges-island');
    for (let i = 0; i < islandElements.length; i++) {
      const element = islandElements[i];
      const id = parseInt(element.dataset.id);
      const island = this.islands[id];
      
      // Calculate current bridge connections
      let sum = 0;
      for (let j = 0; j < nIslands; j++) {
        sum += this.bridges[id][j];
      }
      
      element.className = 'bridges-island';
      
      if (this.selectedIsland === id) {
        element.classList.add('selected');
      }
      
      if (sum === island.count) {
        element.classList.add('satisfied');
      } else if (sum > island.count) {
        element.classList.add('exceeded');
      }
      
      if (this.completedMarks[id]) {
        element.classList.add('marked-completed');
      }
    }
  }

  serialize() {
    return JSON.stringify({
      bridges: this.bridges,
      completedMarks: this.completedMarks
    });
  }

  deserialize(stateString) {
    const state = JSON.parse(stateString);
    this.bridges = state.bridges;
    this.completedMarks = state.completedMarks;
    this.selectedIsland = null;
    this.updateVisuals();
  }

  getRulesChecklist() {
    const nIslands = this.islands.length;
    let allSatisfied = true;
    
    // Calculate current bridge connections
    const currentSums = Array(nIslands).fill(0);
    for (let i = 0; i < nIslands; i++) {
      for (let j = 0; j < nIslands; j++) {
        currentSums[i] += this.bridges[i][j];
      }
      if (currentSums[i] !== this.islands[i].count) {
        allSatisfied = false;
      }
    }
    
    // Connectivity check: BFS starting from island 0
    let connected = false;
    let totalBridgesDrawn = 0;
    for (let i = 0; i < nIslands; i++) {
      for (let j = i + 1; j < nIslands; j++) {
        totalBridgesDrawn += this.bridges[i][j];
      }
    }
    
    if (totalBridgesDrawn > 0) {
      const visited = Array(nIslands).fill(false);
      const queue = [0];
      visited[0] = true;
      let visitedCount = 0;
      
      while (queue.length > 0) {
        const curr = queue.shift();
        visitedCount++;
        
        for (let j = 0; j < nIslands; j++) {
          if (this.bridges[curr][j] > 0 && !visited[j]) {
            visited[j] = true;
            queue.push(j);
          }
        }
      }
      connected = (visitedCount === nIslands);
    }
    
    const hasMoves = totalBridgesDrawn > 0;
    
    return [
      {
        text: 'Mỗi đảo kết nối đúng số cầu',
        status: !hasMoves ? 'neutral' : (allSatisfied ? 'valid' : 'invalid')
      },
      {
        text: 'Mạng lưới cầu liên thông toàn bộ',
        status: !hasMoves ? 'neutral' : (connected ? 'valid' : 'invalid')
      }
    ];
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Island A (Count 3)
    ctx.fillStyle = 'rgba(18, 9, 36, 0.8)';
    ctx.beginPath(); ctx.arc(40, 60, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#34c759'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#34c759'; ctx.font = 'bold 15px Outfit';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('3', 40, 60);
    
    // Island B (Count 3)
    ctx.fillStyle = 'rgba(18, 9, 36, 0.8)';
    ctx.beginPath(); ctx.arc(180, 60, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#34c759'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#34c759'; ctx.fillText('3', 180, 60);
    
    // Island C (Count 1)
    ctx.fillStyle = 'rgba(18, 9, 36, 0.8)';
    ctx.beginPath(); ctx.arc(110, 20, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#34c759'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#34c759'; ctx.font = 'bold 13px Outfit';
    ctx.fillText('1', 110, 20);

    // Double bridge between A and B
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 4; ctx.shadowColor = '#00f3ff';
    ctx.beginPath();
    ctx.moveTo(56, 56); ctx.lineTo(164, 56);
    ctx.moveTo(56, 64); ctx.lineTo(164, 64);
    ctx.stroke();
    
    // Single bridge between A and C
    ctx.beginPath();
    ctx.moveTo(48, 46); ctx.lineTo(96, 26); // approximate angled bridge for illust only
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Quicksand';
    ctx.fillText('Cầu đơn & Cầu đôi hợp lệ', 110, 105);
  }

  onHint() {
    const nIslands = this.islands.length;
    for (let i = 0; i < nIslands; i++) {
      for (let j = i + 1; j < nIslands; j++) {
        if (this.bridges[i][j] !== this.solutionBridges[i][j]) {
          this.bridges[i][j] = this.solutionBridges[i][j];
          this.bridges[j][i] = this.solutionBridges[i][j];
          this.selectedIsland = null;
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
    this.bridges = JSON.parse(JSON.stringify(this.solutionBridges));
    this.selectedIsland = null;
    this.updateVisuals();
    this.manager.saveMoveState();
    window.playChimeSound();
    this.manager.updateChecklist();
  }
}

// Register Game
window.IQGames.bridges = BridgesGame;
