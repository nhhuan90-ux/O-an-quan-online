/**
 * Pipes Game Implementation
 */
class PipesGame {
  constructor(manager) {
    this.manager = manager;
    this.width = 5;
    this.height = 5;
    
    // Level Data
    this.grid = []; // 2D array of pipe cells: { type, baseConnections: [u, r, d, l], rot, locked }
    this.powerSource = { r: 0, c: 0 };
  }

  getTitle() { return 'Pipes'; }
  getTip() { return 'Nhấp chuột để xoay các đoạn ống sao cho tất cả được nối liền với nguồn sáng trung tâm. Nhấp chuột phải để Khóa/Mở khóa ống.'; }
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '5 × 5';
    if (diff === 'medium') return '7 × 7';
    return '10 × 10';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Xoay các mảnh ống nước sao cho kết nối tất cả các ô trên bảng thành **một mạng lưới liên thông duy nhất**.</li>
        <li>Nguồn sáng trung tâm (ô phát sáng xanh dương) sẽ truyền ánh sáng qua các đoạn ống được khớp đúng.</li>
        <li><strong>Không được có vòng lặp khép kín</strong> (closed loops) hoặc các đầu ống cụt chĩa vào tường.</li>
      </ul>
    `;
  }

  init(container, difficulty) {
    if (difficulty === 'easy') {
      this.width = 5; this.height = 5;
    } else if (difficulty === 'medium') {
      this.width = 7; this.height = 7;
    } else {
      this.width = 10; this.height = 10;
    }

    this.powerSource = {
      r: Math.floor(this.height / 2),
      c: Math.floor(this.width / 2)
    };

    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    // Kruskal's Algorithm to generate a Spanning Tree
    const N = this.width * this.height;
    const parent = Array(N).fill(0).map((_, i) => i);
    
    const find = (i) => {
      let root = i;
      while (parent[root] !== root) root = parent[root];
      let curr = i;
      while (curr !== root) {
        let nxt = parent[curr];
        parent[curr] = root;
        curr = nxt;
      }
      return root;
    };

    const union = (i, j) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootI] = rootJ;
        return true;
      }
      return false;
    };

    // List of edges
    const edges = [];
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const id = r * this.width + c;
        if (r < this.height - 1) {
          edges.push({ u: id, v: (r + 1) * this.width + c, dir: 'down' });
        }
        if (c < this.width - 1) {
          edges.push({ u: id, v: r * this.width + (c + 1), dir: 'right' });
        }
      }
    }

    // Shuffle edges
    edges.sort(() => Math.random() - 0.5);

    // Grid connections
    const conn = Array(this.height).fill(null).map(() => 
      Array(this.width).fill(null).map(() => [false, false, false, false]) // [up, right, down, left]
    );

    let edgesUsed = 0;
    for (const edge of edges) {
      if (union(edge.u, edge.v)) {
        edgesUsed++;
        const r1 = Math.floor(edge.u / this.width);
        const c1 = edge.u % this.width;
        const r2 = Math.floor(edge.v / this.width);
        const c2 = edge.v % this.width;

        if (edge.dir === 'down') {
          conn[r1][c1][2] = true; // Down for A
          conn[r2][c2][0] = true; // Up for B
        } else {
          conn[r1][c1][1] = true; // Right for A
          conn[r2][c2][3] = true; // Left for B
        }

        if (edgesUsed === N - 1) break;
      }
    }

    // Convert connections to pipe shapes
    this.grid = Array(this.height).fill(null).map((_, r) => 
      Array(this.width).fill(null).map((_, c) => {
        const base = conn[r][c];
        const activeCount = base.filter(Boolean).length;
        
        let type = 'I';
        if (activeCount === 1) type = 'end';
        else if (activeCount === 2) {
          // Check opposite vs adjacent
          if ((base[0] && base[2]) || (base[1] && base[3])) {
            type = 'straight';
          } else {
            type = 'elbow';
          }
        } else if (activeCount === 3) {
          type = 'T';
        } else if (activeCount === 4) {
          type = 'cross';
        }

        // Random rotation: 0, 1, 2, 3
        const rot = Math.floor(Math.random() * 4);

        return {
          type,
          baseConnections: base,
          rot,
          locked: false
        };
      })
    );
  }

  // Get active rotated connections for cell (r, c)
  getConnections(r, c) {
    const cell = this.grid[r][c];
    const base = cell.baseConnections;
    const rot = cell.rot;
    const actual = [false, false, false, false];
    for (let i = 0; i < 4; i++) {
      actual[i] = base[(i - rot + 4) % 4];
    }
    return actual;
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
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell cell-pipe';
        cellDiv.dataset.row = r;
        cellDiv.dataset.col = c;

        // Render SVG pipe drawing
        const svg = this.createPipeSVG(r, c);
        cellDiv.appendChild(svg);

        this.bindCellEvents(cellDiv);
        container.appendChild(cellDiv);
      }
    }

    this.updateFlow();
  }

  createPipeSVG(r, c) {
    const cell = this.grid[r][c];
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', 'pipe-svg');

    // Start center element (glow source)
    if (r === this.powerSource.r && c === this.powerSource.c) {
      const centerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      centerGlow.setAttribute('cx', '50');
      centerGlow.setAttribute('cy', '50');
      centerGlow.setAttribute('r', '15');
      centerGlow.setAttribute('fill', '#00bcd4');
      centerGlow.setAttribute('filter', 'drop-shadow(0 0 6px #00bcd4)');
      svg.appendChild(centerGlow);
    } else {
      const centerNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      centerNode.setAttribute('cx', '50');
      centerNode.setAttribute('cy', '50');
      centerNode.setAttribute('r', '6');
      centerNode.setAttribute('fill', '#453763');
      svg.appendChild(centerNode);
    }

    // Draw lines for each base connection
    const base = cell.baseConnections;
    
    const drawLine = (x1, y1, x2, y2, dirIdx) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      path.setAttribute('x1', x1);
      path.setAttribute('y1', y1);
      path.setAttribute('x2', x2);
      path.setAttribute('y2', y2);
      path.setAttribute('class', 'pipe-line');
      path.dataset.direction = dirIdx; // original index
      svg.appendChild(path);
    };

    if (base[0]) drawLine(50, 50, 50, 0, 0);   // Up
    if (base[1]) drawLine(50, 50, 100, 50, 1); // Right
    if (base[2]) drawLine(50, 50, 50, 100, 2); // Down
    if (base[3]) drawLine(50, 50, 0, 50, 3);   // Left

    // Special cap for dead end
    if (cell.type === 'end') {
      const capIdx = base.indexOf(true);
      const capCoords = [
        { cx: 50, cy: 15 }, // Up
        { cx: 85, cy: 50 }, // Right
        { cx: 50, cy: 85 }, // Down
        { cx: 15, cy: 50 }  // Left
      ][capIdx];
      const cap = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      cap.setAttribute('cx', capCoords.cx);
      cap.setAttribute('cy', capCoords.cy);
      cap.setAttribute('r', '8');
      cap.setAttribute('fill', '#453763');
      cap.setAttribute('class', 'pipe-cap');
      svg.appendChild(cap);
    }

    return svg;
  }

  bindCellEvents(cellDiv) {
    const rotate = (dir) => {
      this.manager.triggerFirstMove();
      const r = parseInt(cellDiv.dataset.row);
      const c = parseInt(cellDiv.dataset.col);
      const cell = this.grid[r][c];

      if (cell.locked) return;

      if (dir === 'cw') {
        cell.rot = (cell.rot + 1) % 4;
      } else {
        cell.rot = (cell.rot + 3) % 4;
      }

      // Rotate DOM element
      const svg = cellDiv.querySelector('.pipe-svg');
      svg.style.transform = `rotate(${cell.rot * 90}deg)`;

      this.updateFlow();
      this.manager.saveMoveState();
      window.playClickSound();
      this.manager.updateChecklist();
    };

    const toggleLock = () => {
      this.manager.triggerFirstMove();
      const r = parseInt(cellDiv.dataset.row);
      const c = parseInt(cellDiv.dataset.col);
      const cell = this.grid[r][c];

      cell.locked = !cell.locked;
      if (cell.locked) {
        cellDiv.classList.add('locked');
      } else {
        cellDiv.classList.remove('locked');
      }
      
      window.playClickSound();
    };

    cellDiv.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        if (e.ctrlKey) {
          rotate('ccw');
        } else {
          rotate('cw');
        }
      } else if (e.button === 2) { // Right click
        toggleLock();
      }
    });

    cellDiv.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mobile touch
    let touchStartTime = 0;
    cellDiv.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
    });

    cellDiv.addEventListener('touchend', (e) => {
      e.preventDefault();
      const duration = Date.now() - touchStartTime;
      if (duration > 400) {
        toggleLock();
      } else {
        rotate('cw');
      }
    });
  }

  updateFlow() {
    // 1. BFS to trace powered flow from source
    const powered = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
    const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
    const queue = [this.powerSource];
    powered[this.powerSource.r][this.powerSource.c] = true;
    visited[this.powerSource.r][this.powerSource.c] = true;

    // Detect loops: trace active edges count
    let connectionsCount = 0;

    while (queue.length > 0) {
      const curr = queue.shift();
      const r = curr.r;
      const c = curr.c;
      const currConns = this.getConnections(r, c);

      // Directions: 0: Up, 1: Right, 2: Down, 3: Left
      const dirs = [
        { dr: -1, dc: 0, opp: 2 }, // Up
        { dr: 0, dc: 1, opp: 3 },  // Right
        { dr: 1, dc: 0, opp: 0 },  // Down
        { dr: 0, dc: -1, opp: 1 }  // Left
      ];

      for (let i = 0; i < 4; i++) {
        if (currConns[i]) {
          const dir = dirs[i];
          const nr = r + dir.dr;
          const nc = c + dir.dc;

          // Check if in bounds
          if (nr >= 0 && nr < this.height && nc >= 0 && nc < this.width) {
            const neighborConns = this.getConnections(nr, nc);
            // Check if neighbor connects back
            if (neighborConns[dir.opp]) {
              connectionsCount++;
              if (!visited[nr][nc]) {
                visited[nr][nc] = true;
                powered[nr][nc] = true;
                queue.push({ r: nr, c: nc });
              }
            }
          }
        }
      }
    }

    // Render coloring
    const container = document.getElementById('board-container');
    const cellDivs = container.getElementsByClassName('cell');

    for (let i = 0; i < cellDivs.length; i++) {
      const el = cellDivs[i];
      const r = parseInt(el.dataset.row);
      const c = parseInt(el.dataset.col);
      const cell = this.grid[r][c];
      
      const isPowered = powered[r][c];
      
      // Update SVG transform for rotation
      const svg = el.querySelector('.pipe-svg');
      svg.style.transform = `rotate(${cell.rot * 90}deg)`;
      svg.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.2)';

      // Set connection colors
      const lines = svg.querySelectorAll('.pipe-line');
      lines.forEach(line => {
        line.classList.remove('connected', 'powered');
        if (isPowered) {
          if (r === this.powerSource.r && c === this.powerSource.c) {
            line.classList.add('powered');
          } else {
            line.classList.add('connected');
          }
        }
      });

      const cap = svg.querySelector('.pipe-cap');
      if (cap) {
        cap.setAttribute('fill', isPowered ? '#00e676' : '#453763');
      }
    }
  }

  serialize() {
    return JSON.stringify({
      grid: this.grid.map(row => row.map(cell => ({ rot: cell.rot, locked: cell.locked })))
    });
  }

  deserialize(stateString) {
    const state = JSON.parse(stateString);
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        this.grid[r][c].rot = state.grid[r][c].rot;
        this.grid[r][c].locked = state.grid[r][c].locked;
        
        // Update locked class
        const cellDiv = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (cellDiv) {
          if (this.grid[r][c].locked) cellDiv.classList.add('locked');
          else cellDiv.classList.remove('locked');
        }
      }
    }
    this.updateFlow();
  }

  getRulesChecklist() {
    // 1. Trace powered flow (already computed)
    const powered = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
    const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
    const queue = [this.powerSource];
    powered[this.powerSource.r][this.powerSource.c] = true;
    visited[this.powerSource.r][this.powerSource.c] = true;

    let totalPowered = 1;
    let connectionsCount = 0;
    let hasLoops = false;

    while (queue.length > 0) {
      const curr = queue.shift();
      const r = curr.r;
      const c = curr.c;
      const currConns = this.getConnections(r, c);

      const dirs = [
        { dr: -1, dc: 0, opp: 2 },
        { dr: 0, dc: 1, opp: 3 },
        { dr: 1, dc: 0, opp: 0 },
        { dr: 0, dc: -1, opp: 1 }
      ];

      for (let i = 0; i < 4; i++) {
        if (currConns[i]) {
          const dir = dirs[i];
          const nr = r + dir.dr;
          const nc = c + dir.dc;

          if (nr >= 0 && nr < this.height && nc >= 0 && nc < this.width) {
            const neighborConns = this.getConnections(nr, nc);
            if (neighborConns[dir.opp]) {
              connectionsCount++;
              if (!visited[nr][nc]) {
                visited[nr][nc] = true;
                powered[nr][nc] = true;
                totalPowered++;
                queue.push({ r: nr, c: nc });
              } else {
                // Already visited neighbor via another path -> closed loop!
                hasLoops = true;
              }
            }
          }
        }
      }
    }

    // Since each edge is counted twice (A->B and B->A), divide by 2
    connectionsCount = connectionsCount / 2;

    const allConnected = totalPowered === this.width * this.height;
    
    // Check if there are any mismatching pipe connections pointing to walls or non-connecting neighbors
    let noOpenEnds = true;
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const conns = this.getConnections(r, c);
        const dirs = [
          { dr: -1, dc: 0, opp: 2 },
          { dr: 0, dc: 1, opp: 3 },
          { dr: 1, dc: 0, opp: 0 },
          { dr: 0, dc: -1, opp: 1 }
        ];

        for (let i = 0; i < 4; i++) {
          if (conns[i]) {
            const dir = dirs[i];
            const nr = r + dir.dr;
            const nc = c + dir.dc;

            if (nr < 0 || nr >= this.height || nc < 0 || nc >= this.width) {
              noOpenEnds = false; // Pointing to grid wall!
            } else {
              const neighborConns = this.getConnections(nr, nc);
              if (!neighborConns[dir.opp]) {
                noOpenEnds = false; // Neighbor does not connect back!
              }
            }
          }
        }
      }
    }

    const checklist = [
      {
        text: 'Nguồn sáng trung tâm hoạt động',
        status: 'valid'
      },
      {
        text: 'Tất cả ống nước được kết nối phát sáng',
        status: allConnected ? 'valid' : 'invalid'
      },
      {
        text: 'Không tạo thành vòng lặp khép kín',
        status: hasLoops ? 'invalid' : 'valid'
      },
      {
        text: 'Không có đầu ống hở (open ends)',
        status: noOpenEnds ? 'valid' : 'invalid'
      }
    ];

    return checklist;
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple straight and elbow pipes glowing
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    // Straight pipe
    ctx.beginPath();
    ctx.moveTo(40, 20); ctx.lineTo(40, 80);
    ctx.stroke();
    
    // Elbow pipe
    ctx.beginPath();
    ctx.moveTo(120, 50); ctx.lineTo(160, 50); ctx.lineTo(160, 80);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('Nối Thẳng', 40, 105);
    ctx.fillText('Góc Cua', 140, 105);
  }

  onHint() {
    // Smart hint: find the first pipe that is not at its correct original orientation (rot !== 0) and rotate it back to 0!
    // Since originalRot is 0 for all generated spanning trees!
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const cell = this.grid[r][c];
        if (cell.rot !== 0) {
          cell.rot = 0; // Set to correct orientation
          
          this.updateFlow();
          this.manager.saveMoveState();
          window.playChimeSound();
          this.manager.updateChecklist();
          return;
        }
      }
    }
  }

  onSolve() {
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        this.grid[r][c].rot = 0;
      }
    }
    this.updateFlow();
    this.manager.saveMoveState();
    window.playChimeSound();
    this.manager.updateChecklist();
  }
}

// Register game
window.IQGames.pipes = PipesGame;
