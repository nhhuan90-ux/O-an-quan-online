/**
 * Shingoki Game Implementation
 */
class ShingokiGame {
  constructor(manager) {
    this.manager = manager;
    this.width = 5;  // 5x5 dots
    this.height = 5;
    
    // Level Data
    this.clues = [];  // 2D grid: null or {type: 'white'|'black', num: number}
    this.hLines = []; // 2D grid of horizontal edges: W-1 cols, H rows
    this.vLines = []; // 2D grid of vertical edges: W cols, H-1 rows
    
    // Hidden solution for hints
    this.solutionHLines = [];
    this.solutionVLines = [];
  }

  getTitle() { return 'Shingoki'; }
  getTip() { return 'Nhấp chọn cạnh giữa các chấm để vẽ đường đi hoặc click chuột phải/chạm giữ để đánh dấu X. Tạo thành một vòng khép kín đi qua tất cả các hình tròn.'; }
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '5 × 5 (Chấm)';
    if (diff === 'medium') return '7 × 7 (Chấm)';
    return '9 × 9 (Chấm)';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Vẽ một **vòng lặp khép kín duy nhất** nối các chấm giao điểm bằng các đoạn thẳng dọc/ngang.</li>
        <li>Đường đi không được tự cắt, đè hoặc rẽ nhánh.</li>
        <li>Vòng lặp phải **đi qua tất cả các hình tròn**:
          <ul>
            <li><strong>Hình tròn Trắng:</strong> Vòng lặp phải **đi thẳng** qua nó.</li>
            <li><strong>Hình tròn Đen:</strong> Vòng lặp phải **rẽ góc 90 độ** ngay tại nó.</li>
          </ul>
        </li>
        <li>Con số trong hình tròn chỉ **tổng độ dài của hai đoạn thẳng** đi ra từ hình tròn đó trước khi rẽ góc tiếp theo.</li>
      </ul>
    `;
  }

  init(container, difficulty) {
    if (difficulty === 'easy') {
      this.width = 5; this.height = 5;
    } else if (difficulty === 'medium') {
      this.width = 7; this.height = 7;
    } else {
      this.width = 9; this.height = 9;
    }

    this.clues = Array(this.height).fill(null).map(() => Array(this.width).fill(null));
    this.hLines = Array(this.height).fill(null).map(() => Array(this.width - 1).fill(0));
    this.vLines = Array(this.height - 1).fill(null).map(() => Array(this.width).fill(0));
    
    this.solutionHLines = Array(this.height).fill(null).map(() => Array(this.width - 1).fill(0));
    this.solutionVLines = Array(this.height - 1).fill(null).map(() => Array(this.width).fill(0));

    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 500) {
      attempts++;
      success = this.tryGenerateLoop();
    }
    
    if (!success) {
      this.loadFallbackLevel();
    }
  }

  tryGenerateLoop() {
    // Generate a closed Self-Avoiding Walk
    const path = [];
    const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
    
    const startR = Math.floor(Math.random() * this.height);
    const startC = Math.floor(Math.random() * this.width);
    
    const targetLength = (this.width === 5) ? 12 : (this.width === 7) ? 22 : 32;

    const dfs = (r, c) => {
      path.push({ r, c });
      visited[r][c] = true;

      if (path.length >= targetLength) {
        const dist = Math.abs(r - startR) + Math.abs(c - startC);
        if (dist === 1) {
          return true; // Adjacent to start, can close loop!
        }
      }

      const neighbors = [
        { dr: -1, dc: 0 }, { dr: 0, dc: 1 },
        { dr: 1, dc: 0 }, { dr: 0, dc: -1 }
      ].sort(() => Math.random() - 0.5);

      for (const n of neighbors) {
        const nr = r + n.dr;
        const nc = c + n.dc;
        if (nr >= 0 && nr < this.height && nc >= 0 && nc < this.width && !visited[nr][nc]) {
          if (dfs(nr, nc)) return true;
        }
      }

      path.pop();
      visited[r][c] = false;
      return false;
    };

    if (dfs(startR, startC)) {
      // Clear temp solution lines
      this.solutionHLines = Array(this.height).fill(null).map(() => Array(this.width - 1).fill(0));
      this.solutionVLines = Array(this.height - 1).fill(null).map(() => Array(this.width).fill(0));

      // Draw lines in solution grid matching path
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

      // Analyze dot properties along the loop to place clues
      const loopDots = [];
      for (let i = 0; i < len; i++) {
        const curr = path[i];
        const prev = path[(i - 1 + len) % len];
        const next = path[(i + 1) % len];
        
        const inDir = { dr: curr.r - prev.r, dc: curr.c - prev.c };
        const outDir = { dr: next.r - curr.r, dc: next.c - curr.c };
        
        const isStraight = (inDir.dr === outDir.dr && inDir.dc === outDir.dc);
        const type = isStraight ? 'white' : 'black';

        // Calculate lengths in both directions
        const L1 = this.traceSolutionSegmentLength(curr.r, curr.c, inDir.dr, inDir.dc);
        const L2 = this.traceSolutionSegmentLength(curr.r, curr.c, -outDir.dr, -outDir.dc);
        
        loopDots.push({
          r: curr.r,
          c: curr.c,
          type,
          num: L1 + L2
        });
      }

      // Place 35-50% as clues
      loopDots.sort(() => Math.random() - 0.5);
      const clueCount = Math.ceil(this.width === 5 ? 4 : this.width === 7 ? 8 : 12);
      
      this.clues = Array(this.height).fill(null).map(() => Array(this.width).fill(null));
      for (let i = 0; i < clueCount; i++) {
        const dot = loopDots[i];
        this.clues[dot.r][dot.c] = { type: dot.type, num: dot.num };
      }
      
      return true;
    }

    return false;
  }

  // Trace segment length in solution grid
  traceSolutionSegmentLength(r, c, dr, dc) {
    let length = 0;
    let currR = r;
    let currC = c;
    
    while (true) {
      let hasEdge = false;
      if (dr === 0) {
        const edgeC = dc > 0 ? currC : currC - 1;
        if (edgeC >= 0 && edgeC < this.width - 1 && this.solutionHLines[currR][edgeC] === 1) {
          hasEdge = true;
        }
      } else {
        const edgeR = dr > 0 ? currR : currR - 1;
        if (edgeR >= 0 && edgeR < this.height - 1 && this.solutionVLines[edgeR][currC] === 1) {
          hasEdge = true;
        }
      }
      
      if (!hasEdge) break;
      
      currR += dr;
      currC += dc;
      length++;
      
      // Stop if it turns in solution
      let continues = false;
      if (dr === 0) {
        const nextC = dc > 0 ? currC : currC - 1;
        if (nextC >= 0 && nextC < this.width - 1 && this.solutionHLines[currR][nextC] === 1) {
          continues = true;
        }
      } else {
        const nextR = dr > 0 ? currR : currR - 1;
        if (nextR >= 0 && nextR < this.height - 1 && this.solutionVLines[nextR][currC] === 1) {
          continues = true;
        }
      }
      
      if (!continues) break;
    }
    return length;
  }

  loadFallbackLevel() {
    this.clues = Array(this.height).fill(null).map(() => Array(this.width).fill(null));
    this.clues[0][0] = { type: 'black', num: 4 };
    this.clues[0][4] = { type: 'black', num: 4 };
    this.clues[4][4] = { type: 'black', num: 4 };
    this.clues[4][0] = { type: 'black', num: 4 };
    // Simply square around boundaries
    for (let c = 0; c < this.width - 1; c++) {
      this.solutionHLines[0][c] = 1;
      this.solutionHLines[4][c] = 1;
    }
    for (let r = 0; r < this.height - 1; r++) {
      this.solutionVLines[r][0] = 1;
      this.solutionVLines[r][4] = 1;
    }
  }

  render(container) {
    container.style.display = 'block';
    container.classList.add('shingoki-board-container');
    
    const boardSize = Math.min(420, container.parentElement.clientWidth - 48);
    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;
    
    // Draw dots
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const clue = this.clues[r][c];
        
        if (clue) {
          const circle = document.createElement('div');
          circle.className = `shingoki-circle ${clue.type}`;
          circle.dataset.row = r;
          circle.dataset.col = c;
          circle.style.left = `${(c / (this.width - 1)) * 100}%`;
          circle.style.top = `${(r / (this.height - 1)) * 100}%`;
          circle.innerText = clue.num;
          
          container.appendChild(circle);
        } else {
          const dot = document.createElement('div');
          dot.className = 'shingoki-dot';
          dot.style.left = `${(c / (this.width - 1)) * 100}%`;
          dot.style.top = `${(r / (this.height - 1)) * 100}%`;
          container.appendChild(dot);
        }
      }
    }

    // Draw horizontal edge hitboxes
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width - 1; c++) {
        const edge = document.createElement('div');
        edge.className = 'shingoki-edge-hitbox';
        edge.dataset.type = 'h';
        edge.dataset.row = r;
        edge.dataset.col = c;
        
        edge.style.left = `${((c + 0.5) / (this.width - 1)) * 100}%`;
        edge.style.top = `${(r / (this.height - 1)) * 100}%`;
        edge.style.width = `calc(${100 / (this.width - 1)}% - 12px)`;
        edge.style.height = '16px';
        
        const line = document.createElement('div');
        line.className = 'shingoki-edge-visual empty';
        line.style.width = '100%';
        line.style.height = '4px';
        edge.appendChild(line);

        this.bindEdgeEvents(edge);
        container.appendChild(edge);
      }
    }

    // Draw vertical edge hitboxes
    for (let r = 0; r < this.height - 1; r++) {
      for (let c = 0; c < this.width; c++) {
        const edge = document.createElement('div');
        edge.className = 'shingoki-edge-hitbox';
        edge.dataset.type = 'v';
        edge.dataset.row = r;
        edge.dataset.col = c;
        
        edge.style.left = `${(c / (this.width - 1)) * 100}%`;
        edge.style.top = `${((r + 0.5) / (this.height - 1)) * 100}%`;
        edge.style.width = '16px';
        edge.style.height = `calc(${100 / (this.height - 1)}% - 12px)`;
        
        const line = document.createElement('div');
        line.className = 'shingoki-edge-visual empty';
        line.style.width = '4px';
        line.style.height = '100%';
        edge.appendChild(line);

        this.bindEdgeEvents(edge);
        container.appendChild(edge);
      }
    }
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

    // Mobile touch
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
    const edgeDivs = container.getElementsByClassName('shingoki-edge-hitbox');
    const circleDivs = container.getElementsByClassName('shingoki-circle');

    // Run validator subparts to highlight errors in lines/circles
    const circleSatisfied = this.validateCirclesSatisfied();

    for (let i = 0; i < edgeDivs.length; i++) {
      const edge = edgeDivs[i];
      const type = edge.dataset.type;
      const r = parseInt(edge.dataset.row);
      const c = parseInt(edge.dataset.col);
      const state = (type === 'h') ? this.hLines[r][c] : this.vLines[r][c];
      
      const line = edge.querySelector('.shingoki-edge-visual');
      line.className = 'shingoki-edge-visual';
      
      if (state === 1) {
        line.classList.add('line');
      } else if (state === 2) {
        line.classList.add('cross');
      } else {
        line.classList.add('empty');
      }
    }

    // Color circles based on satisfaction
    for (let i = 0; i < circleDivs.length; i++) {
      const circle = circleDivs[i];
      const r = parseInt(circle.dataset.row);
      const c = parseInt(circle.dataset.col);
      
      circle.classList.remove('error', 'satisfied');
      
      const status = circleSatisfied[r][c];
      if (status === 'valid') {
        circle.classList.add('satisfied');
      } else if (status === 'invalid') {
        circle.classList.add('error');
      }
    }
  }

  // Trace segment length in user grid
  traceSegmentLength(r, c, dr, dc) {
    let length = 0;
    let currR = r;
    let currC = c;
    
    while (true) {
      let hasEdge = false;
      if (dr === 0) {
        const edgeC = dc > 0 ? currC : currC - 1;
        if (edgeC >= 0 && edgeC < this.width - 1 && this.hLines[currR][edgeC] === 1) {
          hasEdge = true;
        }
      } else {
        const edgeR = dr > 0 ? currR : currR - 1;
        if (edgeR >= 0 && edgeR < this.height - 1 && this.vLines[edgeR][currC] === 1) {
          hasEdge = true;
        }
      }
      
      if (!hasEdge) break;
      
      currR += dr;
      currC += dc;
      length++;
      
      // Stop if it turns
      let continues = false;
      if (dr === 0) {
        const nextC = dc > 0 ? currC : currC - 1;
        if (nextC >= 0 && nextC < this.width - 1 && this.hLines[currR][nextC] === 1) {
          continues = true;
        }
      } else {
        const nextR = dr > 0 ? currR : currR - 1;
        if (nextR >= 0 && nextR < this.height - 1 && this.vLines[nextR][currC] === 1) {
          continues = true;
        }
      }
      
      if (!continues) break;
    }
    return length;
  }

  validateCirclesSatisfied() {
    const satisfied = Array(this.height).fill(null).map(() => Array(this.width).fill('neutral'));

    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const clue = this.clues[r][c];
        if (clue) {
          // Check connections of this dot
          const conns = []; // List of {dr, dc}
          // Up
          if (r > 0 && this.vLines[r-1][c] === 1) conns.push({ dr: -1, dc: 0 });
          // Right
          if (c < this.width - 1 && this.hLines[r][c] === 1) conns.push({ dr: 0, dc: 1 });
          // Down
          if (r < this.height - 1 && this.vLines[r][c] === 1) conns.push({ dr: 1, dc: 0 });
          // Left
          if (c > 0 && this.hLines[r][c-1] === 1) conns.push({ dr: 0, dc: -1 });

          if (conns.length === 0) {
            satisfied[r][c] = 'neutral';
          } else if (conns.length !== 2) {
            // Must have exactly 2 connections (path passing through)
            satisfied[r][c] = 'invalid';
          } else {
            // Exact 2 connections
            const c1 = conns[0];
            const c2 = conns[1];
            const isStraight = (c1.dr === -c2.dr && c1.dc === -c2.dc);

            let ok = true;
            if (clue.type === 'white' && !isStraight) ok = false;
            if (clue.type === 'black' && isStraight) ok = false;

            // Check length
            const L1 = this.traceSegmentLength(r, c, c1.dr, c1.dc);
            const L2 = this.traceSegmentLength(r, c, c2.dr, c2.dc);
            
            if (L1 + L2 !== clue.num) ok = false;

            satisfied[r][c] = ok ? 'valid' : 'invalid';
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
    // 1. Single closed loop check
    // Count degrees of all dots
    const degrees = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
    let totalLines = 0;

    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        // Horizontal right
        if (c < this.width - 1 && this.hLines[r][c] === 1) {
          degrees[r][c]++;
          degrees[r][c+1]++;
          totalLines++;
        }
        // Vertical down
        if (r < this.height - 1 && this.vLines[r][c] === 1) {
          degrees[r][c]++;
          degrees[r+1][c]++;
          totalLines++;
        }
      }
    }

    // For a single loop, all visited dots must have degree exactly 2, others 0. No dot can have degree > 2.
    let degreeOk = true;
    let hasDrawnLines = totalLines > 0;
    
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (degrees[r][c] > 2 || degrees[r][c] === 1) {
          degreeOk = false;
        }
      }
    }

    // Find loops count (connected components)
    let loopsCount = 0;
    if (hasDrawnLines && degreeOk) {
      const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
      
      for (let r = 0; r < this.height; r++) {
        for (let c = 0; c < this.width; c++) {
          if (degrees[r][c] === 2 && !visited[r][c]) {
            loopsCount++;
            // BFS/DFS path trace
            const queue = [{r, c}];
            visited[r][c] = true;
            
            while (queue.length > 0) {
              const curr = queue.shift();
              
              // Up
              if (curr.r > 0 && this.vLines[curr.r-1][curr.c] === 1 && !visited[curr.r-1][curr.c]) {
                visited[curr.r-1][curr.c] = true; queue.push({r: curr.r-1, c: curr.c});
              }
              // Right
              if (curr.c < this.width - 1 && this.hLines[curr.r][curr.c] === 1 && !visited[curr.r][curr.c+1]) {
                visited[curr.r][curr.c+1] = true; queue.push({r: curr.r, c: curr.c+1});
              }
              // Down
              if (curr.r < this.height - 1 && this.vLines[curr.r][curr.c] === 1 && !visited[curr.r+1][curr.c]) {
                visited[curr.r+1][curr.c] = true; queue.push({r: curr.r+1, c: curr.c});
              }
              // Left
              if (curr.c > 0 && this.hLines[curr.r][curr.c-1] === 1 && !visited[curr.r][curr.c-1]) {
                visited[curr.r][curr.c-1] = true; queue.push({r: curr.r, c: curr.c-1});
              }
            }
          }
        }
      }
    }

    const singleClosedLoop = hasDrawnLines && degreeOk && (loopsCount === 1);

    // 2. Circles satisfaction check
    const circleSatisfied = this.validateCirclesSatisfied();
    let allCirclesVisited = true;
    let allConstraintsOk = true;

    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const clue = this.clues[r][c];
        if (clue) {
          const status = circleSatisfied[r][c];
          if (status !== 'valid') {
            allConstraintsOk = false;
          }
          if (degrees[r][c] !== 2) {
            allCirclesVisited = false;
          }
        }
      }
    }

    const checklist = [
      {
        text: 'Đường đi nối các chấm liên tục',
        status: !hasDrawnLines ? 'neutral' : (degreeOk ? 'valid' : 'invalid')
      },
      {
        text: 'Tạo thành một vòng khép kín duy nhất',
        status: !hasDrawnLines ? 'neutral' : (singleClosedLoop ? 'valid' : 'invalid')
      },
      {
        text: 'Đi qua toàn bộ các vòng tròn đầu mối',
        status: !hasDrawnLines ? 'neutral' : (allCirclesVisited ? 'valid' : 'invalid')
      },
      {
        text: 'Thỏa mãn hướng rẽ và độ dài clue số',
        status: !hasDrawnLines ? 'neutral' : (allConstraintsOk ? 'valid' : 'invalid')
      }
    ];

    return checklist;
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw white circle straight path illustration
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(50, 40, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#070313';
    ctx.font = 'bold 12px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3', 50, 40);

    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(15, 40); ctx.lineTo(85, 40);
    ctx.stroke();

    // Draw black circle corner path illustration
    ctx.fillStyle = '#1a162b';
    ctx.beginPath();
    ctx.arc(160, 40, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a4560';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('3', 160, 40);

    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(160, 15); ctx.lineTo(160, 40); ctx.lineTo(185, 40);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Quicksand';
    ctx.fillText('Đi thẳng (Trắng)', 50, 100);
    ctx.fillText('Rẽ góc (Đen)', 160, 100);
  }

  onHint() {
    // Smart hint: Find an edge in the solution grid that is not yet drawn or is incorrectly crossed out, and draw it!
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width - 1; c++) {
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

    for (let r = 0; r < this.height - 1; r++) {
      for (let c = 0; c < this.width; c++) {
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

// Register game
window.IQGames.shingoki = ShingokiGame;
