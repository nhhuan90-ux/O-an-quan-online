/**
 * Shikaku Game Implementation
 */
class ShikakuGame {
  constructor(manager) {
    this.manager = manager;
    this.width = 5;
    this.height = 5;
    
    // Level Data
    this.clues = [];      // 2D grid of numbers (clues)
    this.rectangles = [];  // User drawn rectangles: {id, x, y, w, h}
    
    // UI drawing state
    this.isDrawing = false;
    this.drawStart = null; // {r, c}
    this.drawEnd = null;   // {r, c}
    
    // Smart suggestions cycle state
    this.cycleClue = null;     // {r, c, val}
    this.cycleCandidates = []; // List of valid rects
    this.cycleIndex = 0;
  }

  getTitle() { return 'Shikaku'; }
  getTip() { return 'Nhấp và kéo để vẽ hình chữ nhật bao quanh đúng một chữ số sao cho diện tích của nó bằng chữ số đó. Nhấp đúp để xóa.'; }
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '5 × 5';
    if (diff === 'medium') return '7 × 7';
    return '10 × 10';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Chia lưới thành các khối hình chữ nhật hoặc hình vuông không đè lên nhau.</li>
        <li>Mỗi khối phải chứa <strong>đúng một số</strong> nằm trong nó.</li>
        <li>Diện tích của khối (số ô vuông) phải bằng giá trị của số đó.</li>
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

    this.rectangles = [];
    this.clues = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
    
    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    const minSize = 2;
    const maxArea = (this.width === 5) ? 6 : (this.width === 7) ? 9 : 12;

    // Helper function to partition a rectangle (x, y, w, h) recursively
    const partition = (x, y, w, h) => {
      const area = w * h;
      const canSplitV = w >= 2;
      const canSplitH = h >= 2;
      
      // Stop split criteria
      if (area <= minSize) return [[x, y, w, h]];
      if (area <= maxArea && Math.random() < 0.4) {
        return [[x, y, w, h]];
      }

      let splitVert = false;
      if (canSplitV && canSplitH) {
        splitVert = Math.random() < 0.5;
      } else {
        splitVert = canSplitV;
      }

      if (splitVert) {
        // Split vertically: choose a split point where subareas are >= 2 or at least 1
        const minSplit = 1;
        const maxSplit = w - 1;
        if (maxSplit < minSplit) return [[x, y, w, h]];
        const splitX = minSplit + Math.floor(Math.random() * (maxSplit - minSplit + 1));
        return [
          ...partition(x, y, splitX, h),
          ...partition(x + splitX, y, w - splitX, h)
        ];
      } else {
        // Split horizontally
        const minSplit = 1;
        const maxSplit = h - 1;
        if (maxSplit < minSplit) return [[x, y, w, h]];
        const splitY = minSplit + Math.floor(Math.random() * (maxSplit - minSplit + 1));
        return [
          ...partition(x, y, w, splitY),
          ...partition(x, y + splitY, w, h - splitY)
        ];
      }
    };

    const rects = partition(0, 0, this.width, this.height);
    
    this.solutionRectangles = rects.map(([rx, ry, rw, rh]) => ({
      id: Math.random().toString(),
      x: rx, y: ry, w: rw, h: rh,
      status: 'valid'
    }));
    
    // For each rectangle, pick a random cell inside it to place the clue
    rects.forEach(([rx, ry, rw, rh]) => {
      const cx = rx + Math.floor(Math.random() * rw);
      const cy = ry + Math.floor(Math.random() * rh);
      this.clues[cy][cx] = rw * rh;
    });
  }

  render(container) {
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${this.height}, 1fr)`;
    
    const boardSize = Math.min(420, container.parentElement.clientWidth - 48);
    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;

    // Create cells
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        
        const val = this.clues[r][c];
        if (val > 0) {
          const numberSpan = document.createElement('span');
          numberSpan.className = 'cell-number';
          numberSpan.innerText = val;
          cell.appendChild(numberSpan);
        }

        this.bindCellEvents(cell);
        container.appendChild(cell);
      }
    }

    // Overlay container for drawing rectangles
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'shikaku-overlay';
    overlayContainer.style.position = 'absolute';
    overlayContainer.style.top = '0';
    overlayContainer.style.left = '0';
    overlayContainer.style.width = '100%';
    overlayContainer.style.height = '100%';
    overlayContainer.style.pointerEvents = 'none';
    container.appendChild(overlayContainer);

    this.renderRectangles();
  }

  bindCellEvents(cell) {
    const getCoords = (e) => {
      let target = e.target;
      while (target && !target.classList.contains('cell')) {
        target = target.parentElement;
      }
      if (!target) return null;
      return {
        r: parseInt(target.dataset.row),
        c: parseInt(target.dataset.col)
      };
    };

    // Touch events support
    const handleTouchStart = (e) => {
      e.preventDefault();
      const coords = getCoords(e);
      if (coords) this.startDraw(coords.r, coords.c);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target) {
        const cell = target.closest('.cell');
        if (cell && cell.parentElement === document.getElementById('board-container')) {
          const r = parseInt(cell.dataset.row);
          const c = parseInt(cell.dataset.col);
          this.moveDraw(r, c);
        }
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      this.endDraw();
    };

    cell.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        this.startDraw(r, c);
      }
    });

    cell.addEventListener('mouseenter', () => {
      if (this.isDrawing) {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        this.moveDraw(r, c);
      }
    });

    // Handle double click on cells containing numbers (smart cycling)
    cell.addEventListener('dblclick', (e) => {
      e.preventDefault();
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      
      const clue = this.clues[r][c];
      if (clue > 0) {
        this.cycleSuggestions(r, c, clue);
      } else {
        // Double click empty cell to remove any rect containing it
        this.removeRectAt(r, c);
      }
    });

    cell.addEventListener('touchstart', handleTouchStart, { passive: false });
    cell.addEventListener('touchmove', handleTouchMove, { passive: false });
    cell.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  startDraw(r, c) {
    this.manager.triggerFirstMove();
    this.isDrawing = true;
    this.drawStart = { r, c };
    this.drawEnd = { r, c };
    this.updatePreview();
  }

  moveDraw(r, c) {
    if (!this.isDrawing) return;
    this.drawEnd = { r, c };
    this.updatePreview();
  }

  endDraw() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    
    // Create new rect
    const x = Math.min(this.drawStart.c, this.drawEnd.c);
    const y = Math.min(this.drawStart.r, this.drawEnd.r);
    const w = Math.max(this.drawStart.c, this.drawEnd.c) - x + 1;
    const h = Math.max(this.drawStart.r, this.drawEnd.r) - y + 1;

    // Remove preview
    const preview = document.getElementById('shikaku-preview');
    if (preview) preview.remove();

    // Conflict Resolution: Delete any existing rectangles overlapping with the new one
    this.rectangles = this.rectangles.filter(r => !this.rectsOverlap(r, {x, y, w, h}));

    // Add new rect
    const status = this.validateRect({x, y, w, h});
    this.rectangles.push({
      id: Date.now() + Math.random().toString(),
      x, y, w, h,
      status
    });

    this.renderRectangles();
    this.manager.saveMoveState();
    
    if (status === 'valid') {
      window.playChimeSound();
    } else {
      window.playClickSound();
    }
    
    this.manager.updateChecklist();
  }

  removeRectAt(r, c) {
    const before = this.rectangles.length;
    this.rectangles = this.rectangles.filter(rect => {
      const inside = (c >= rect.x && c < rect.x + rect.w && r >= rect.y && r < rect.y + rect.h);
      return !inside;
    });
    
    if (this.rectangles.length !== before) {
      window.playClickSound();
      this.renderRectangles();
      this.manager.saveMoveState();
      this.manager.updateChecklist();
    }
  }

  rectsOverlap(r1, r2) {
    return !(r2.x >= r1.x + r1.w || 
             r2.x + r2.w <= r1.x || 
             r2.y >= r1.y + r1.h || 
             r2.y + r2.h <= r1.y);
  }

  // Double-click suggestions cycling
  cycleSuggestions(r, c, val) {
    // If double clicking a new clue, calculate all candidates
    if (!this.cycleClue || this.cycleClue.r !== r || this.cycleClue.c !== c) {
      this.cycleClue = { r, c, val };
      this.cycleCandidates = this.calculateCandidates(r, c, val);
      this.cycleIndex = 0;
    }

    if (this.cycleCandidates.length === 0) {
      return; // No candidates possible
    }

    const rect = this.cycleCandidates[this.cycleIndex];
    this.cycleIndex = (this.cycleIndex + 1) % this.cycleCandidates.length;

    // Apply the suggested rect
    this.rectangles = this.rectangles.filter(r => !this.rectsOverlap(r, rect));
    this.rectangles.push({
      id: Date.now() + Math.random().toString(),
      x: rect.x, y: rect.y, w: rect.w, h: rect.h,
      status: 'valid'
    });

    this.renderRectangles();
    this.manager.saveMoveState();
    window.playChimeSound();
    this.manager.updateChecklist();
  }

  calculateCandidates(r, c, val) {
    const candidates = [];
    
    // Find all pairs of (w, h) where w * h = val
    for (let w = 1; w <= val; w++) {
      if (val % w === 0) {
        const h = val / w;
        
        // Loop through all relative positions of cell (r, c) inside a rect of size (w, h)
        // dx, dy are offsets from top-left of the rect
        for (let dx = 0; dx < w; dx++) {
          for (let dy = 0; dy < h; dy++) {
            const rx = c - dx;
            const ry = r - dy;
            
            // Validate bounds
            if (rx >= 0 && rx + w <= this.width && ry >= 0 && ry + h <= this.height) {
              const candidate = { x: rx, y: ry, w, h };
              
              // Validate that the rect contains EXACTLY one clue, and it is the target clue at (r,c)
              let clueCount = 0;
              let hasOtherClue = false;
              for (let y = ry; y < ry + h; y++) {
                for (let x = rx; x < rx + w; x++) {
                  if (this.clues[y][x] > 0) {
                    clueCount++;
                    if (y !== r || x !== c) {
                      hasOtherClue = true;
                    }
                  }
                }
              }
              
              if (clueCount === 1 && !hasOtherClue) {
                candidates.push(candidate);
              }
            }
          }
        }
      }
    }
    
    return candidates;
  }

  validateRect(rect) {
    // Count clues in rect
    let cluesInRect = [];
    for (let y = rect.y; y < rect.y + rect.h; y++) {
      for (let x = rect.x; x < rect.x + rect.w; x++) {
        if (this.clues[y][x] > 0) {
          cluesInRect.push(this.clues[y][x]);
        }
      }
    }

    if (cluesInRect.length === 0) return 'invalid-empty';
    if (cluesInRect.length > 1) return 'invalid-numbers';
    
    const clueValue = cluesInRect[0];
    const area = rect.w * rect.h;
    
    if (area !== clueValue) return 'invalid-size';
    return 'valid';
  }

  updatePreview() {
    const overlay = document.getElementById('shikaku-overlay');
    if (!overlay) return;

    let preview = document.getElementById('shikaku-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'shikaku-preview';
      preview.className = 'shikaku-rect-overlay preview';
      overlay.appendChild(preview);
    }

    const x = Math.min(this.drawStart.c, this.drawEnd.c);
    const y = Math.min(this.drawStart.r, this.drawEnd.r);
    const w = Math.max(this.drawStart.c, this.drawEnd.c) - x + 1;
    const h = Math.max(this.drawStart.r, this.drawEnd.r) - y + 1;

    this.positionRectElement(preview, x, y, w, h);
    preview.innerHTML = `<span class="shikaku-rect-label">${w}×${h}=${w*h}</span>`;
  }

  renderRectangles() {
    const overlay = document.getElementById('shikaku-overlay');
    if (!overlay) return;

    // Clear existing
    overlay.innerHTML = '';

    // Re-render all
    this.rectangles.forEach(rect => {
      // Re-validate in case board state changed
      rect.status = this.validateRect(rect);
      
      const el = document.createElement('div');
      el.className = `shikaku-rect-overlay ${rect.status}`;
      this.positionRectElement(el, rect.x, rect.y, rect.w, rect.h);
      
      // Label size
      el.innerHTML = `<span class="shikaku-rect-label">${rect.w}×${rect.h}</span>`;
      overlay.appendChild(el);
    });
  }

  positionRectElement(el, x, y, w, h) {
    const cellWidth = 100 / this.width;
    const cellHeight = 100 / this.height;

    el.style.left = `${x * cellWidth}%`;
    el.style.top = `${y * cellHeight}%`;
    el.style.width = `${w * cellWidth}%`;
    el.style.height = `${h * cellHeight}%`;
  }

  // Undo/Redo serialization
  serialize() {
    return JSON.stringify({
      rectangles: this.rectangles
    });
  }

  deserialize(stateString) {
    const state = JSON.parse(stateString);
    this.rectangles = state.rectangles;
    this.renderRectangles();
  }

  getRulesChecklist() {
    // Rule 1: Every cell covered exactly once
    const coverage = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
    let overlaps = false;
    
    this.rectangles.forEach(rect => {
      for (let y = rect.y; y < rect.y + rect.h; y++) {
        for (let x = rect.x; x < rect.x + rect.w; x++) {
          if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            coverage[y][x]++;
            if (coverage[y][x] > 1) overlaps = true;
          }
        }
      }
    });

    let coveredCount = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (coverage[y][x] > 0) coveredCount++;
      }
    }
    const fullyCovered = coveredCount === this.width * this.height;

    // Rule 2: Rectangles validity
    let allRectsValid = this.rectangles.length > 0;
    let hasEmpty = false;
    let hasWrongSize = false;
    let hasMultipleNumbers = false;

    this.rectangles.forEach(rect => {
      if (rect.status === 'invalid-empty') hasEmpty = true;
      if (rect.status === 'invalid-size') hasWrongSize = true;
      if (rect.status === 'invalid-numbers') hasMultipleNumbers = true;
      if (rect.status !== 'valid') allRectsValid = false;
    });

    const checklist = [
      {
        text: 'Mỗi ô thuộc đúng 1 hình khối (không chồng đè)',
        status: this.rectangles.length === 0 ? 'neutral' : (overlaps ? 'invalid' : 'valid')
      },
      {
        text: 'Lấp đầy toàn bộ bảng ô vuông',
        status: this.rectangles.length === 0 ? 'neutral' : (fullyCovered ? 'valid' : 'invalid')
      },
      {
        text: 'Mỗi khối chứa đúng 1 chữ số duy nhất',
        status: this.rectangles.length === 0 ? 'neutral' : (hasMultipleNumbers || hasEmpty ? 'invalid' : 'valid')
      },
      {
        text: 'Diện tích khối khớp với giá trị số bên trong',
        status: this.rectangles.length === 0 ? 'neutral' : (hasWrongSize ? 'invalid' : 'valid')
      }
    ];

    return checklist;
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw two simple 2x2 grids
    ctx.strokeStyle = '#4a4560';
    ctx.lineWidth = 1;
    
    // Left Grid (Correct Example)
    ctx.strokeRect(20, 20, 80, 80);
    ctx.beginPath();
    ctx.moveTo(60, 20); ctx.lineTo(60, 100);
    ctx.moveTo(20, 60); ctx.lineTo(100, 60);
    ctx.stroke();

    // Draw correct rect around 4
    ctx.strokeStyle = '#34c759';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 80, 80);
    ctx.fillStyle = 'rgba(52, 199, 89, 0.1)';
    ctx.fillRect(20, 20, 80, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('4', 40, 40);
    
    ctx.fillStyle = '#34c759';
    ctx.font = 'bold 12px Quicksand';
    ctx.fillText('Hợp lệ (4 ô)', 60, 112);

    // Right Grid (Incorrect Example)
    ctx.strokeStyle = '#4a4560';
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 20, 80, 80);
    ctx.beginPath();
    ctx.moveTo(160, 20); ctx.lineTo(160, 100);
    ctx.moveTo(120, 60); ctx.lineTo(200, 60);
    ctx.stroke();

    // Draw wrong rect of size 2 around 4
    ctx.strokeStyle = '#ff3b30';
    ctx.lineWidth = 3;
    ctx.strokeRect(120, 20, 40, 80); // 1x2 rect
    ctx.fillStyle = 'rgba(255, 59, 48, 0.1)';
    ctx.fillRect(120, 20, 40, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Outfit';
    ctx.fillText('4', 140, 40);
    
    ctx.fillStyle = '#ff3b30';
    ctx.font = 'bold 12px Quicksand';
    ctx.fillText('Sai diện tích', 160, 112);
  }

  onHint() {
    // Smart hint: Find the first unsolved clue number and draw one of its correct rectangles
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        const clue = this.clues[r][c];
        if (clue > 0) {
          // Check if this clue is already covered by a valid rectangle
          const isSolved = this.rectangles.some(rect => 
            rect.status === 'valid' && 
            c >= rect.x && c < rect.x + rect.w && 
            r >= rect.y && r < rect.y + rect.h
          );
          
          if (!isSolved) {
            // Found unsolved clue, solve it using first candidate
            const candidates = this.calculateCandidates(r, c, clue);
            if (candidates.length > 0) {
              const rect = candidates[0];
              this.rectangles = this.rectangles.filter(r => !this.rectsOverlap(r, rect));
              this.rectangles.push({
                id: Date.now() + Math.random().toString(),
                x: rect.x, y: rect.y, w: rect.w, h: rect.h,
                status: 'valid'
              });
              
              this.renderRectangles();
              this.manager.saveMoveState();
              window.playChimeSound();
              this.manager.updateChecklist();
              return;
            }
          }
        }
      }
    }
  }

  onSolve() {
    this.rectangles = JSON.parse(JSON.stringify(this.solutionRectangles));
    this.renderRectangles();
    this.manager.saveMoveState();
    window.playChimeSound();
    this.manager.updateChecklist();
  }
}

// Register game
window.IQGames.shikaku = ShikakuGame;
