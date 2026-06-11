/**
 * Tower of Hanoi Game Implementation
 */
class HanoiGame {
  constructor(manager) {
    this.manager = manager;
    this.discCount = 3;
    this.pegs = [[], [], []]; // Array of 3 pegs, each containing disc sizes
    this.selectedPegIdx = null;
  }

  getTitle() { return 'Tháp Hà Nội'; }
  getTip() { return 'Nhấp chọn cọc chứa đĩa và nhấp tiếp cọc đích để di chuyển đĩa. Đĩa nhỏ phải nằm trên đĩa to.'; }
  getGridSizeLabel(diff) {
    if (diff === 'easy') return '3 đĩa (Dễ)';
    if (diff === 'medium') return '4 đĩa (Vừa)';
    return '5 đĩa (Khó)';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Di chuyển toàn bộ chồng đĩa từ **cọc bên trái (cọc 1)** sang **cọc bên phải (cọc 3)**.</li>
        <li>Mỗi lần chỉ được di chuyển **một đĩa trên cùng** của một cọc.</li>
        <li>Không được đặt đĩa có kích thước lớn **lên trên** đĩa có kích thước nhỏ hơn.</li>
      </ul>
    `;
  }

  init(container, difficulty) {
    if (difficulty === 'easy') {
      this.discCount = 3;
    } else if (difficulty === 'medium') {
      this.discCount = 4;
    } else {
      this.discCount = 5;
    }

    this.selectedPegIdx = null;
    
    // Stack discs on peg 0: [size_max, ..., size_min]
    this.pegs = [[], [], []];
    for (let i = this.discCount; i >= 1; i--) {
      this.pegs[0].push(i);
    }

    this.render(container);
  }

  render(container) {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.position = 'relative';
    
    const boardSize = Math.min(420, container.parentElement.clientWidth - 48);
    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;

    // Create the pegs area
    const pegsArea = document.createElement('div');
    pegsArea.style.display = 'flex';
    pegsArea.style.width = '100%';
    pegsArea.style.height = 'calc(100% - 30px)';
    pegsArea.style.justifyContent = 'space-around';
    pegsArea.style.alignItems = 'flex-end';
    pegsArea.style.position = 'relative';

    const discColors = [
      '',
      'linear-gradient(135deg, #ff4081, #ff1744)', // 1 (smallest) - Pink
      'linear-gradient(135deg, #ff9100, #ff3d00)', // 2 - Orange
      'linear-gradient(135deg, #ffea00, #ffd600)', // 3 - Yellow
      'linear-gradient(135deg, #00e676, #00c853)', // 4 - Green
      'linear-gradient(135deg, #00b0ff, #0091ea)'  // 5 (largest) - Blue
    ];

    this.pegs.forEach((peg, pegIdx) => {
      const pegCol = document.createElement('div');
      pegCol.className = 'hanoi-peg-col';
      pegCol.dataset.index = pegIdx;
      pegCol.style.flexGrow = '1';
      pegCol.style.display = 'flex';
      pegCol.style.flexDirection = 'column-reverse';
      pegCol.style.alignItems = 'center';
      pegCol.style.cursor = 'pointer';
      pegCol.style.position = 'relative';
      pegCol.style.height = '100%';
      pegCol.style.justifyContent = 'flex-start';
      pegCol.style.paddingBottom = '10px';

      // Draw the vertical wooden shaft
      const shaft = document.createElement('div');
      shaft.className = 'hanoi-peg-shaft';
      shaft.style.position = 'absolute';
      shaft.style.width = '10px';
      shaft.style.height = '180px';
      shaft.style.background = '#8B5A2B';
      shaft.style.borderRadius = '5px';
      shaft.style.bottom = '10px';
      shaft.style.zIndex = '1';
      shaft.style.boxShadow = 'inset 2px 2px 5px rgba(0,0,0,0.5)';
      shaft.style.transition = 'background-color 0.25s, box-shadow 0.25s';

      if (pegIdx === this.selectedPegIdx) {
        shaft.style.background = 'var(--color-primary)';
        shaft.style.boxShadow = '0 0 15px var(--color-primary-glow)';
      }
      pegCol.appendChild(shaft);

      // Stack discs
      peg.forEach((discSize, discIdx) => {
        const disc = document.createElement('div');
        disc.className = 'hanoi-disc';
        disc.style.height = '24px';
        disc.style.borderRadius = '12px';
        disc.style.zIndex = '2';
        disc.style.marginBottom = '2px';
        disc.style.textAlign = 'center';
        disc.style.color = '#ffffff';
        disc.style.fontWeight = 'bold';
        disc.style.fontSize = '0.85rem';
        disc.style.lineHeight = '24px';
        disc.style.boxShadow = '0 3px 6px rgba(0,0,0,0.4)';
        
        // Proportional width: Size 1 is smallest, Size 5 is largest
        const pctWidth = 35 + (discSize / this.discCount) * 55;
        disc.style.width = `${pctWidth}%`;
        disc.style.background = discColors[discSize];
        disc.innerText = discSize;

        // If this disc is selected (top disc of selected peg)
        if (pegIdx === this.selectedPegIdx && discIdx === peg.length - 1) {
          disc.style.transform = 'translateY(-15px)';
          disc.style.boxShadow = '0 10px 18px rgba(0,0,0,0.6)';
        }

        pegCol.appendChild(disc);
      });

      this.bindPegEvents(pegCol);
      pegsArea.appendChild(pegCol);
    });

    container.appendChild(pegsArea);

    // Draw base plate
    const base = document.createElement('div');
    base.className = 'hanoi-base';
    base.style.width = '100%';
    base.style.height = '20px';
    base.style.background = 'linear-gradient(180deg, #5c3a21, #2d1c10)';
    base.style.borderRadius = '6px';
    base.style.zIndex = '0';
    base.style.boxShadow = '0 5px 12px rgba(0,0,0,0.6)';
    container.appendChild(base);
  }

  bindPegEvents(pegCol) {
    const clickHandler = () => {
      this.manager.triggerFirstMove();
      const idx = parseInt(pegCol.dataset.index);

      if (this.selectedPegIdx === null) {
        // Select source peg if it has discs
        if (this.pegs[idx].length > 0) {
          this.selectedPegIdx = idx;
          window.playClickSound();
          this.render(document.getElementById('board-container'));
        }
      } else {
        const srcIdx = this.selectedPegIdx;
        this.selectedPegIdx = null;

        if (srcIdx === idx) {
          // Deselect
          window.playClickSound();
          this.render(document.getElementById('board-container'));
          return;
        }

        // Try moving
        if (this.canMove(srcIdx, idx)) {
          this.move(srcIdx, idx);
          window.playChimeSound();
        } else {
          window.playClickSound();
          this.render(document.getElementById('board-container'));
        }
      }
    };

    pegCol.addEventListener('click', clickHandler);
    pegCol.addEventListener('touchend', (e) => {
      e.preventDefault();
      clickHandler();
    });
  }

  canMove(srcIdx, destIdx) {
    const src = this.pegs[srcIdx];
    const dest = this.pegs[destIdx];

    if (src.length === 0) return false;
    if (dest.length === 0) return true;

    const topSrc = src[src.length - 1];
    const topDest = dest[dest.length - 1];

    return topSrc < topDest; // Smaller disc can sit on top of larger
  }

  move(srcIdx, destIdx) {
    const disc = this.pegs[srcIdx].pop();
    this.pegs[destIdx].push(disc);

    this.render(document.getElementById('board-container'));
    this.manager.saveMoveState();
    this.manager.updateChecklist();
  }

  solveBFS(startPegs) {
    const getHash = (pegsState) => {
      return pegsState.map(p => p.join(',')).join('|');
    };

    const isSolved = (pegsState) => {
      return pegsState[2].length === this.discCount;
    };

    const startHash = getHash(startPegs);
    const queue = [{ state: startPegs, path: [] }];
    const visited = new Set([startHash]);

    let maxSteps = 1000;
    while (queue.length > 0 && maxSteps > 0) {
      maxSteps--;
      const curr = queue.shift();

      if (isSolved(curr.state)) {
        return curr.path;
      }

      // Generate transitions
      for (let i = 0; i < 3; i++) {
        const src = curr.state[i];
        if (src.length === 0) continue;

        const disc = src[src.length - 1];

        for (let j = 0; j < 3; j++) {
          if (i === j) continue;

          const dest = curr.state[j];
          if (dest.length > 0 && dest[dest.length - 1] < disc) continue;

          // Valid move
          const newState = curr.state.map((peg, idx) => {
            if (idx === i) return peg.slice(0, peg.length - 1);
            if (idx === j) return [...peg, disc];
            return peg;
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
    return null;
  }

  serialize() {
    return JSON.stringify({
      pegs: this.pegs
    });
  }

  deserialize(stateString) {
    const state = JSON.parse(stateString);
    this.pegs = state.pegs;
    this.render(document.getElementById('board-container'));
  }

  getRulesChecklist() {
    // Peg 2 has all discs
    const correctCount = this.pegs[2].length;
    const isSolved = correctCount === this.discCount;

    // Check if any rule violated (should be impossible due to move locks, but good for validation)
    let sizeRulesOk = true;
    this.pegs.forEach(peg => {
      for (let i = 0; i < peg.length - 1; i++) {
        if (peg[i] < peg[i+1]) {
          sizeRulesOk = false; // Larger disc on top of smaller!
        }
      }
    });

    const checklist = [
      {
        text: `Số đĩa xếp hoàn chỉnh ở cọc đích: ${correctCount} / ${this.discCount}`,
        status: isSolved ? 'valid' : 'invalid'
      },
      {
        text: 'Đảm bảo đĩa nhỏ hơn nằm trên đĩa to',
        status: sizeRulesOk ? 'valid' : 'invalid'
      }
    ];

    return checklist;
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw wood base
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(10, 85, 200, 10);

    // Draw 3 pegs
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(45, 30, 6, 55);
    ctx.fillRect(105, 30, 6, 55);
    ctx.fillRect(165, 30, 6, 55);

    // Draw stacked discs on peg 1
    const colors = [
      'linear-gradient(135deg, #ff4081, #ff1744)', // Pink
      'linear-gradient(135deg, #ff9100, #ff3d00)', // Orange
      'linear-gradient(135deg, #ffea00, #ffd600)'  // Yellow
    ];

    ctx.fillStyle = '#ff1744';
    ctx.fillRect(35, 75, 26, 10);
    ctx.fillStyle = '#ff3d00';
    ctx.fillRect(28, 65, 40, 10);
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(20, 55, 56, 10);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('Cọc 1 (Gốc)', 48, 110);
    ctx.fillText('Cọc 3 (Đích)', 168, 110);
  }

  onHint() {
    // Solve BFS from current pegs state
    const path = this.solveBFS(this.pegs);
    if (path && path.length > 0) {
      const nextMove = path[0];
      this.selectedPegIdx = nextMove.from;
      this.render(document.getElementById('board-container'));

      setTimeout(() => {
        this.selectedPegIdx = null;
        this.move(nextMove.from, nextMove.to);
        window.playChimeSound();
      }, 500);
    }
  }

  onSolve() {
    const path = this.solveBFS(this.pegs);
    if (!path || path.length === 0) return;

    let step = 0;
    const executeStep = () => {
      if (step >= path.length) return;
      const move = path[step];

      this.move(move.from, move.to);
      window.playChimeSound();

      step++;
      setTimeout(executeStep, 500);
    };
    executeStep();
  }
}

// Register game
window.IQGames.hanoi = HanoiGame;
