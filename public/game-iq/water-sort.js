/**
 * Water Sort Game Implementation
 */
class WaterSortGame {
  constructor(manager) {
    this.manager = manager;
    this.width = 5; // Tube count
    this.height = 4; // Tube capacity
    
    // Level Data
    this.tubes = []; // Array of arrays containing color numbers 1 to C
    this.colorCount = 3;
    
    this.selectedTubeIdx = null;
    this.solutionPath = []; // Cached solution from BFS
    this.initialTubes = []; // Copy for restarts
  }

  getTitle() { return 'Phân Loại Nước'; }
  getTip() { return 'Chọn một ống nghiệm chứa nước, sau đó chọn ống nghiệm đích để rót. Ống đích phải trống hoặc có màu trên cùng trùng khớp.'; }
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '5 ống (3 màu)';
    if (diff === 'medium') return '7 ống (5 màu)';
    return '9 ống (7 màu)';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Phân loại toàn bộ chất lỏng sao cho mỗi ống nghiệm chỉ chứa đúng **1 màu nước** hoặc **bỏ trống**.</li>
        <li>Bạn chỉ có thể rót nước sang ống khác khi:
          <ul>
            <li>Ống đích **chưa đầy** (tối đa 4 lớp nước).</li>
            <li>Ống đích đang **trống**, hoặc màu nước trên cùng của ống đích **trùng với màu trên cùng** của ống nguồn.</li>
          </ul>
        </li>
      </ul>
    `;
  }

  init(container, difficulty) {
    if (difficulty === 'easy') {
      this.colorCount = 3;
      this.width = 5; // 3 colored, 2 empty
    } else if (difficulty === 'medium') {
      this.colorCount = 5;
      this.width = 7; // 5 colored, 2 empty
    } else {
      this.colorCount = 7;
      this.width = 9; // 7 colored, 2 empty
    }

    this.selectedTubeIdx = null;
    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 200) {
      attempts++;
      
      // 1. Generate a random color distribution
      const colors = [];
      for (let i = 1; i <= this.colorCount; i++) {
        for (let j = 0; j < 4; j++) {
          colors.push(i);
        }
      }
      
      // Shuffle colors
      colors.sort(() => Math.random() - 0.5);
      
      const tempTubes = [];
      for (let i = 0; i < this.colorCount; i++) {
        tempTubes.push(colors.slice(i * 4, (i + 1) * 4));
      }
      
      // Add 2 empty tubes
      for (let i = 0; i < 2; i++) {
        tempTubes.push([]);
      }

      // 2. Run BFS solver to check if solvable and cache path
      const path = this.solveBFS(tempTubes);
      if (path && path.length > 3) { // Require at least 4 moves to solve for fun
        this.tubes = tempTubes;
        this.initialTubes = JSON.parse(JSON.stringify(tempTubes));
        this.solutionPath = path;
        success = true;
      }
    }

    if (!success) {
      // Fallback 3 colors
      this.tubes = [
        [1, 2, 3, 1],
        [2, 3, 1, 2],
        [3, 1, 2, 3],
        [],
        []
      ];
      this.initialTubes = JSON.parse(JSON.stringify(this.tubes));
      this.solutionPath = this.solveBFS(this.tubes) || [];
    }
  }

  render(container) {
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.gap = '20px';
    
    const boardSize = Math.min(420, container.parentElement.clientWidth - 48);
    container.style.width = '100%';
    container.style.height = `${boardSize}px`;

    this.renderTubes(container);
  }

  renderTubes(container) {
    container.innerHTML = '';
    
    const colorGradients = [
      '', // 0 empty
      'linear-gradient(180deg, #ff4d4d, #b30000)', // 1: Red
      'linear-gradient(180deg, #3399ff, #004080)', // 2: Blue
      'linear-gradient(180deg, #47d147, #1f7a1f)', // 3: Green
      'linear-gradient(180deg, #ffff33, #b3b300)', // 4: Yellow
      'linear-gradient(180deg, #b366ff, #5500b3)', // 5: Purple
      'linear-gradient(180deg, #ff9933, #994c00)', // 6: Orange
      'linear-gradient(180deg, #33ffff, #009999)'  // 7: Cyan
    ];

    this.tubes.forEach((tube, idx) => {
      const tubeDiv = document.createElement('div');
      tubeDiv.className = 'tube';
      tubeDiv.dataset.index = idx;
      
      // Inline styles for glass tube look
      tubeDiv.style.width = '48px';
      tubeDiv.style.height = '150px';
      tubeDiv.style.border = '3px solid rgba(255, 255, 255, 0.2)';
      tubeDiv.style.borderRadius = '0 0 24px 24px';
      tubeDiv.style.position = 'relative';
      tubeDiv.style.display = 'flex';
      tubeDiv.style.flexDirection = 'column-reverse';
      tubeDiv.style.padding = '4px 3px';
      tubeDiv.style.gap = '3px';
      tubeDiv.style.cursor = 'pointer';
      tubeDiv.style.transition = 'transform 0.25s, border-color 0.25s, box-shadow 0.25s';
      tubeDiv.style.background = 'rgba(255, 255, 255, 0.04)';
      tubeDiv.style.boxShadow = 'inset 0 0 10px rgba(255, 255, 255, 0.05)';

      if (idx === this.selectedTubeIdx) {
        tubeDiv.style.transform = 'translateY(-18px)';
        tubeDiv.style.borderColor = 'var(--color-primary)';
        tubeDiv.style.boxShadow = '0 10px 20px rgba(175, 82, 222, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.1)';
      }

      // Render liquid segments
      tube.forEach(colorVal => {
        const seg = document.createElement('div');
        seg.className = 'liquid-segment';
        seg.style.width = '100%';
        seg.style.height = '31px';
        seg.style.borderRadius = '6px';
        seg.style.background = colorGradients[colorVal];
        seg.style.boxShadow = 'inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 2px 5px rgba(0, 0, 0, 0.3)';
        
        // Add subtle water bubble texture
        const bubble = document.createElement('div');
        bubble.style.position = 'absolute';
        bubble.style.width = '4px';
        bubble.style.height = '4px';
        bubble.style.borderRadius = '50%';
        bubble.style.background = 'rgba(255, 255, 255, 0.3)';
        bubble.style.left = `${Math.random() * 30 + 5}px`;
        bubble.style.top = `${Math.random() * 20 + 5}px`;
        seg.appendChild(bubble);

        tubeDiv.appendChild(seg);
      });

      this.bindTubeEvents(tubeDiv);
      container.appendChild(tubeDiv);
    });
  }

  bindTubeEvents(tubeDiv) {
    const clickHandler = () => {
      this.manager.triggerFirstMove();
      const idx = parseInt(tubeDiv.dataset.index);
      
      if (this.selectedTubeIdx === null) {
        // Select source tube if not empty
        if (this.tubes[idx].length > 0) {
          this.selectedTubeIdx = idx;
          window.playClickSound();
          this.renderTubes(document.getElementById('board-container'));
        }
      } else {
        const srcIdx = this.selectedTubeIdx;
        this.selectedTubeIdx = null;
        
        if (srcIdx === idx) {
          // Deselect
          window.playClickSound();
          this.renderTubes(document.getElementById('board-container'));
          return;
        }

        // Try pouring
        if (this.canPour(srcIdx, idx)) {
          this.pour(srcIdx, idx);
          window.playChimeSound();
        } else {
          window.playClickSound();
          this.renderTubes(document.getElementById('board-container'));
        }
      }
    };

    tubeDiv.addEventListener('click', clickHandler);
    
    // Mobile touch
    tubeDiv.addEventListener('touchend', (e) => {
      e.preventDefault();
      clickHandler();
    });
  }

  canPour(srcIdx, destIdx) {
    const src = this.tubes[srcIdx];
    const dest = this.tubes[destIdx];
    
    if (src.length === 0) return false;
    if (dest.length === 4) return false;
    
    const srcColor = src[src.length - 1];
    
    if (dest.length > 0) {
      const destColor = dest[dest.length - 1];
      return srcColor === destColor;
    }
    
    return true; // Dest is empty
  }

  pour(srcIdx, destIdx) {
    const src = this.tubes[srcIdx];
    const dest = this.tubes[destIdx];
    
    const colorVal = src[src.length - 1];
    
    // Count how many consecutive same-color layers at the top of src
    let count = 0;
    for (let i = src.length - 1; i >= 0; i--) {
      if (src[i] === colorVal) count++;
      else break;
    }

    // Limit by destination capacity
    const space = 4 - dest.length;
    const pourAmount = Math.min(count, space);

    // Pop from src, push to dest
    for (let i = 0; i < pourAmount; i++) {
      src.pop();
      dest.push(colorVal);
    }

    this.renderTubes(document.getElementById('board-container'));
    this.manager.saveMoveState();
    this.manager.updateChecklist();
  }

  solveBFS(startTubes) {
    const getHash = (tubesState) => {
      return tubesState.map(t => t.join(',')).join('|');
    };

    const isSolved = (tubesState) => {
      return tubesState.every(t => {
        if (t.length === 0) return true;
        if (t.length !== 4) return false;
        const color = t[0];
        return t.every(c => c === color);
      });
    };

    const startHash = getHash(startTubes);
    const queue = [{ state: startTubes, path: [] }];
    const visited = new Set([startHash]);
    
    let maxSteps = 1500; // Cap to keep search fast
    
    while (queue.length > 0 && maxSteps > 0) {
      maxSteps--;
      const curr = queue.shift();
      
      if (isSolved(curr.state)) {
        return curr.path;
      }

      // Generate moves
      for (let i = 0; i < curr.state.length; i++) {
        const src = curr.state[i];
        if (src.length === 0) continue;
        
        const cColor = src[src.length - 1];
        let srcCount = 0;
        for (let k = src.length - 1; k >= 0; k--) {
          if (src[k] === cColor) srcCount++;
          else break;
        }

        // Avoid moving a homogeneous stack to another empty tube redundantly
        const isHomogeneous = src.every(c => c === cColor);

        for (let j = 0; j < curr.state.length; j++) {
          if (i === j) continue;
          
          const dest = curr.state[j];
          if (dest.length === 4) continue;
          
          const destEmpty = dest.length === 0;
          if (!destEmpty && dest[dest.length - 1] !== cColor) continue;
          
          if (destEmpty && isHomogeneous) continue; // Skip moving already sorted block to empty

          const pourAmt = Math.min(srcCount, 4 - dest.length);
          
          // Generate new state
          const newState = curr.state.map((t, idx) => {
            if (idx === i) return t.slice(0, t.length - pourAmt);
            if (idx === j) return [...t, ...Array(pourAmt).fill(cColor)];
            return t;
          });

          const hash = getHash(newState);
          if (!visited.has(hash)) {
            visited.add(hash);
            queue.push({
              state: newState,
              path: [...curr.path, { from: i, to: j }]
            });
          }
        }
      }
    }
    return null; // Unsolvable
  }

  serialize() {
    return JSON.stringify({
      tubes: this.tubes
    });
  }

  deserialize(stateString) {
    const state = JSON.parse(stateString);
    this.tubes = state.tubes;
    this.renderTubes(document.getElementById('board-container'));
  }

  getRulesChecklist() {
    let solvedCount = 0;
    let emptyCount = 0;
    let wrongTubes = 0;

    this.tubes.forEach(t => {
      if (t.length === 0) {
        emptyCount++;
      } else if (t.length === 4) {
        const first = t[0];
        const same = t.every(c => c === first);
        if (same) solvedCount++;
        else wrongTubes++;
      } else {
        wrongTubes++;
      }
    });

    const solvedAll = (solvedCount === this.colorCount);

    const checklist = [
      {
        text: `Số màu xếp hoàn chỉnh: ${solvedCount} / ${this.colorCount}`,
        status: solvedAll ? 'valid' : 'invalid'
      },
      {
        text: 'Không có ống nghiệm rỗng chứa màu lai tạp',
        status: wrongTubes > 0 ? 'invalid' : 'valid'
      }
    ];

    return checklist;
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sorted tube (4 units same color)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    
    // Glass tube shape
    const drawTubeShape = (x, y, w, h) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + h - 12);
      ctx.arc(x + w/2, y + h - 12, w/2, Math.PI, 0, true);
      ctx.lineTo(x + w, y);
      ctx.stroke();
    };

    // Tube 1: Sorted
    drawTubeShape(40, 15, 30, 80);
    // Fill liquid
    ctx.fillStyle = '#007aff';
    ctx.beginPath();
    ctx.moveTo(43, 40);
    ctx.lineTo(43, 83);
    ctx.arc(55, 83, 12, Math.PI, 0, true);
    ctx.lineTo(67, 40);
    ctx.closePath();
    ctx.fill();

    // Tube 2: Unsorted
    drawTubeShape(130, 15, 30, 80);
    
    // Fill layers
    const colors = ['#4cd964', '#ffff33', '#ff3b30', '#ff3b30'];
    colors.forEach((c, idx) => {
      ctx.fillStyle = c;
      if (idx === 0) { // Bottom layer needs rounded arc
        ctx.beginPath();
        ctx.moveTo(133, 75);
        ctx.lineTo(133, 83);
        ctx.arc(145, 83, 12, Math.PI, 0, true);
        ctx.lineTo(157, 75);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(133, 75 - idx * 16, 24, 15);
      }
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('Đã Xong', 55, 110);
    ctx.fillText('Chưa Xong', 145, 110);
  }

  onHint() {
    // Reveal the next move from the cached solution path
    // BFS solves the INITIAL tubes state.
    // If the user's current board matches a state along the solution path, we can find it.
    // If they wandered off, let's recalculate BFS from the CURRENT state!
    const path = this.solveBFS(this.tubes);
    if (path && path.length > 0) {
      const nextMove = path[0];
      this.selectedTubeIdx = nextMove.from;
      this.renderTubes(document.getElementById('board-container'));
      
      // Auto-pour after a short delay for smooth visual feedback
      setTimeout(() => {
        this.selectedTubeIdx = null;
        this.pour(nextMove.from, nextMove.to);
        window.playChimeSound();
      }, 500);
    }
  }

  onSolve() {
    // Solve the remaining steps sequentially with a small delay for visualization
    const path = this.solveBFS(this.tubes);
    if (!path || path.length === 0) return;
    
    let step = 0;
    const executeStep = () => {
      if (step >= path.length) return;
      const move = path[step];
      
      this.pour(move.from, move.to);
      window.playChimeSound();
      
      step++;
      setTimeout(executeStep, 400);
    };
    executeStep();
  }
}

// Register game
window.IQGames.watersort = WaterSortGame;
