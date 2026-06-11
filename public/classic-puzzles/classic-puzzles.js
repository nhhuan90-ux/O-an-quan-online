/**
 * Classic Puzzles Suite - Coordinator
 * Manages UI, Audio, Timer, Undo/Redo History, and Victory modal.
 */

// Global registry for games
window.IQGames = {};

class IQAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playChime() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    // Chord: E5, G#5, B5, E6
    const notes = [659.25, 830.61, 987.77, 1318.51];
    
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.03);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + i * 0.03 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.03);
      
      osc.start(now + i * 0.03);
      osc.stop(now + 0.6 + i * 0.03);
    });
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    // Brass melody: C4 -> E4 -> G4 -> C5 -> E5 -> G5 -> C6
    const notes = [
      { f: 261.63, d: 0.1 },
      { f: 329.63, d: 0.1 },
      { f: 392.00, d: 0.1 },
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.15 },
      { f: 1046.50, d: 0.5 }
    ];
    
    let timeOffset = 0;
    notes.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + timeOffset);
      
      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.08, now + timeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + note.d);
      
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + note.d);
      
      timeOffset += note.d - 0.02;
    });
  }
}

const audio = new IQAudio();

class GameManager {
  constructor() {
    this.activeGameId = 'watersort'; // Default
    this.difficulty = 'easy';
    this.gameInstance = null;
    
    this.timerInterval = null;
    this.timeElapsed = 0;
    this.moves = 0;
    this.timerStarted = false;
    
    this.undoStack = [];
    this.redoStack = [];
    
    this.victoryCanvas = document.getElementById('victory-canvas');
    this.victoryCtx = this.victoryCanvas.getContext('2d');
    this.fireworks = [];
    this.fireworksAnimationId = null;
  }

  init() {
    this.bindEvents();
    this.loadGame(this.activeGameId);
  }

  bindEvents() {
    // Game tabs
    document.querySelectorAll('.game-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const gameId = tab.dataset.game;
        if (gameId !== this.activeGameId) {
          audio.playClick();
          document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.loadGame(gameId);
        }
      });
    });

    // Difficulty buttons
    document.querySelectorAll('.btn-diff').forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.dataset.difficulty;
        if (diff !== this.difficulty) {
          audio.playClick();
          document.querySelectorAll('.btn-diff').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.difficulty = diff;
          this.newGame();
        }
      });
    });

    // Action buttons
    document.getElementById('btn-new-game').addEventListener('click', () => {
      audio.playClick();
      this.newGame();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      audio.playClick();
      this.restartGame();
    });

    document.getElementById('btn-undo').addEventListener('click', () => {
      this.undo();
    });

    document.getElementById('btn-redo').addEventListener('click', () => {
      this.redo();
    });

    document.getElementById('btn-hint').addEventListener('click', () => {
      audio.playClick();
      this.giveHint();
    });

    document.getElementById('btn-solve').addEventListener('click', () => {
      audio.playClick();
      this.solveGame();
    });

    document.getElementById('btn-sound').addEventListener('click', () => {
      audio.muted = !audio.muted;
      audio.playClick();
      document.getElementById('sound-icon').innerText = audio.muted ? '🔇' : '🔊';
    });

    // Victory modal buttons
    document.getElementById('btn-next-level').addEventListener('click', () => {
      audio.playClick();
      this.closeVictoryModal();
      this.newGame();
    });

    document.getElementById('btn-close-victory').addEventListener('click', () => {
      audio.playClick();
      this.closeVictoryModal();
    });
  }

  loadGame(gameId) {
    this.activeGameId = gameId;
    
    this.stopTimer();
    this.timeElapsed = 0;
    this.moves = 0;
    this.timerStarted = false;
    this.updateStatsDisplay();
    
    this.undoStack = [];
    this.redoStack = [];
    this.updateUndoRedoButtons();
    
    const GameClass = window.IQGames[gameId];
    if (!GameClass) {
      console.error(`Game class for ${gameId} not found.`);
      return;
    }
    
    this.gameInstance = new GameClass(this);
    
    document.getElementById('current-game-title').innerText = this.gameInstance.getTitle();
    document.getElementById('grid-size-indicator').innerText = this.gameInstance.getGridSizeLabel(this.difficulty);
    document.getElementById('board-tip').innerText = this.gameInstance.getTip();
    document.getElementById('game-rules-text').innerHTML = this.gameInstance.getRulesExplanation();
    
    const container = document.getElementById('board-container');
    container.innerHTML = '';
    
    this.gameInstance.init(container, this.difficulty);
    this.updateChecklist();
    this.drawIllustration();
  }

  newGame() {
    this.loadGame(this.activeGameId);
  }

  restartGame() {
    if (this.undoStack.length > 0) {
      const initialState = this.undoStack[0];
      this.gameInstance.deserialize(initialState);
      
      this.timeElapsed = 0;
      this.moves = 0;
      this.timerStarted = false;
      this.stopTimer();
      this.updateStatsDisplay();
      
      this.undoStack = [];
      this.redoStack = [];
      this.saveMoveState();
      
      this.updateChecklist();
    }
  }

  saveMoveState() {
    const state = this.gameInstance.serialize();
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === state) {
      return;
    }
    this.undoStack.push(state);
    this.redoStack = [];
    this.updateUndoRedoButtons();
    
    if (this.timerStarted) {
      this.moves++;
      this.updateStatsDisplay();
    }
  }

  triggerFirstMove() {
    if (!this.timerStarted) {
      this.timerStarted = true;
      this.startTimer();
      if (this.undoStack.length === 0) {
        this.saveMoveState();
      }
    }
  }

  undo() {
    if (this.undoStack.length > 1) {
      audio.playClick();
      const curr = this.undoStack.pop();
      this.redoStack.push(curr);
      
      const prev = this.undoStack[this.undoStack.length - 1];
      this.gameInstance.deserialize(prev);
      
      this.moves++;
      this.updateStatsDisplay();
      this.updateUndoRedoButtons();
      this.updateChecklist();
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      audio.playClick();
      const next = this.redoStack.pop();
      this.undoStack.push(next);
      
      this.gameInstance.deserialize(next);
      
      this.moves++;
      this.updateStatsDisplay();
      this.updateUndoRedoButtons();
      this.updateChecklist();
    }
  }

  giveHint() {
    if (this.gameInstance && typeof this.gameInstance.onHint === 'function') {
      this.gameInstance.onHint();
    }
  }

  solveGame() {
    if (this.gameInstance && typeof this.gameInstance.onSolve === 'function') {
      this.triggerFirstMove();
      this.gameInstance.onSolve();
    }
  }

  updateUndoRedoButtons() {
    document.getElementById('btn-undo').disabled = this.undoStack.length <= 1;
    document.getElementById('btn-redo').disabled = this.redoStack.length === 0;
  }

  updateChecklist() {
    const listContainer = document.getElementById('rules-checklist');
    listContainer.innerHTML = '';
    
    if (!this.gameInstance) return;
    
    const items = this.gameInstance.getRulesChecklist();
    let allValid = true;
    
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = `check-item ${item.status}`;
      
      const icon = document.createElement('span');
      icon.className = 'check-icon';
      if (item.status === 'valid') {
        icon.innerText = '✓';
      } else if (item.status === 'invalid') {
        icon.innerText = '✗';
        allValid = false;
      } else {
        icon.innerText = '•';
        allValid = false;
      }
      
      const text = document.createElement('span');
      text.innerText = item.text;
      
      el.appendChild(icon);
      el.appendChild(text);
      listContainer.appendChild(el);
    });
    
    if (allValid && this.timerStarted) {
      this.triggerVictory();
    }
  }

  drawIllustration() {
    const canvas = document.getElementById('rule-illustrator');
    if (canvas && this.gameInstance) {
      this.gameInstance.drawIllustrations(canvas);
    }
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timeElapsed++;
      this.updateStatsDisplay();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateStatsDisplay() {
    const min = String(Math.floor(this.timeElapsed / 60)).padStart(2, '0');
    const sec = String(this.timeElapsed % 60).padStart(2, '0');
    document.getElementById('timer').innerText = `${min}:${sec}`;
    document.getElementById('move-count').innerText = this.moves;
  }

  triggerVictory() {
    this.stopTimer();
    audio.playVictory();
    
    document.getElementById('victory-game-name').innerText = this.gameInstance.getTitle();
    
    let diffName = 'Dễ';
    if (this.difficulty === 'medium') diffName = 'Vừa';
    else if (this.difficulty === 'hard') diffName = 'Khó';
    document.getElementById('victory-game-diff').innerText = diffName;
    
    const min = String(Math.floor(this.timeElapsed / 60)).padStart(2, '0');
    const sec = String(this.timeElapsed % 60).padStart(2, '0');
    document.getElementById('victory-time').innerText = `${min}:${sec}`;
    document.getElementById('victory-moves').innerText = this.moves;
    
    const modal = document.getElementById('victory-modal');
    modal.classList.add('show');
    
    this.startFireworks();
  }

  closeVictoryModal() {
    const modal = document.getElementById('victory-modal');
    modal.classList.remove('show');
    this.stopFireworks();
  }

  startFireworks() {
    this.stopFireworks();
    this.victoryCanvas.width = this.victoryCanvas.parentElement.clientWidth;
    this.victoryCanvas.height = this.victoryCanvas.parentElement.clientHeight;
    
    window.addEventListener('resize', this.resizeVictoryCanvas.bind(this));
    
    this.fireworks = [];
    const colors = ['#FF4081', '#E040FB', '#00E676', '#00BCD4', '#FFEB3B', '#FF5722'];
    
    for (let i = 0; i < 120; i++) {
      this.fireworks.push({
        x: this.victoryCanvas.width / 2,
        y: this.victoryCanvas.height / 2 + 100,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.6) * 15 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 3,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.005,
        gravity: 0.2
      });
    }

    const animate = () => {
      this.victoryCtx.clearRect(0, 0, this.victoryCanvas.width, this.victoryCanvas.height);
      
      if (Math.random() < 0.1) {
        const sx = Math.random() * this.victoryCanvas.width;
        const sy = this.victoryCanvas.height;
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 30; i++) {
          this.fireworks.push({
            x: sx,
            y: sy - 50,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 12 - 6,
            color: color,
            size: Math.random() * 3 + 2,
            alpha: 1,
            decay: Math.random() * 0.02 + 0.01,
            gravity: 0.15
          });
        }
      }

      for (let i = this.fireworks.length - 1; i >= 0; i--) {
        const p = this.fireworks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        
        if (p.alpha <= 0) {
          this.fireworks.splice(i, 1);
          continue;
        }
        
        this.victoryCtx.save();
        this.victoryCtx.globalAlpha = p.alpha;
        this.victoryCtx.fillStyle = p.color;
        this.victoryCtx.beginPath();
        this.victoryCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.victoryCtx.fill();
        this.victoryCtx.restore();
      }
      
      this.fireworksAnimationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  resizeVictoryCanvas() {
    if (this.victoryCanvas) {
      this.victoryCanvas.width = this.victoryCanvas.parentElement.clientWidth;
      this.victoryCanvas.height = this.victoryCanvas.parentElement.clientHeight;
    }
  }

  stopFireworks() {
    if (this.fireworksAnimationId) {
      cancelAnimationFrame(this.fireworksAnimationId);
      this.fireworksAnimationId = null;
    }
    window.removeEventListener('resize', this.resizeVictoryCanvas.bind(this));
    this.victoryCtx.clearRect(0, 0, this.victoryCanvas.width, this.victoryCanvas.height);
  }
}

window.playClickSound = () => { audio.playClick(); };
window.playChimeSound = () => { audio.playChime(); };

window.addEventListener('DOMContentLoaded', () => {
  const manager = new GameManager();
  manager.init();
});
