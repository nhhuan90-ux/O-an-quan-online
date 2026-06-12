/**
 * Memory Card Matching (Lật Thẻ Bài) Game Implementation
 */
class MatchingGame {
  constructor(manager) {
    this.manager = manager;
    this.cols = 4;
    this.rows = 4;
    this.cards = [];
    this.selectedCards = [];
    this.isLockBoard = false;
    
    this.emojis = ['🍎', '🍌', '🍇', '🍓', '🍒', '🥑', '🥥', '🍍', '🍉', '🍋', '🍊', '🥕', '🌽', '🍟', '🍕', '🍔', '🍰', '🍩', '🍦', '🍣', '🍤', '🌮', '🎈', '🎨'];
  }

  getTitle() { return 'Lật Thẻ Bài'; }
  getTip() { return 'Nhấp chọn hai thẻ bài bất kỳ để lật. Nếu hai hình giống nhau, chúng sẽ được mở vĩnh viễn!'; }

  getGridSizeLabel(diff) {
    if (diff === 'easy') return '4 × 4 (8 Cặp)';
    if (diff === 'medium') return '6 × 4 (12 Cặp)';
    return '6 × 6 (18 Cặp)';
  }

  getRulesExplanation() {
    return `
      <ul>
        <li>Tìm tất cả các cặp thẻ bài có **hình ảnh giống nhau** trong thời gian ngắn nhất.</li>
        <li>Mỗi lượt bạn chỉ được lật tối đa **2 thẻ bài**.</li>
        <li>Nếu 2 thẻ khớp nhau, chúng sẽ đổi màu xanh và mở ra vĩnh viễn.</li>
        <li>Nếu 2 thẻ khác nhau, chúng sẽ rung đỏ và tự động úp lại sau **800ms**.</li>
      </ul>
    `;
  }

  init(container, difficulty) {
    if (difficulty === 'easy') {
      this.cols = 4;
      this.rows = 4;
    } else if (difficulty === 'medium') {
      this.cols = 6;
      this.rows = 4;
    } else {
      this.cols = 6;
      this.rows = 6;
    }

    this.selectedCards = [];
    this.isLockBoard = false;
    this.generateLevel();
    this.render(container);
  }

  generateLevel() {
    const totalCards = this.cols * this.rows;
    const pairsCount = totalCards / 2;
    
    // Curate active emojis pool
    const activeEmojis = this.emojis.slice(0, pairsCount);
    
    // Duplicate to form pairs
    let cardValues = [...activeEmojis, ...activeEmojis];
    
    // Shuffle values
    cardValues.sort(() => Math.random() - 0.5);
    
    // Create card objects
    this.cards = cardValues.map((value, index) => ({
      id: index,
      value: value,
      isFlipped: false,
      isMatched: false
    }));
  }

  render(container) {
    container.innerHTML = '';
    container.className = 'board-container matching-board-wrapper';
    container.style.display = 'block';
    
    // Parent board sizes setup
    const parentWidth = container.parentElement ? container.parentElement.clientWidth : 0;
    const boardSize = Math.min(420, parentWidth - 48);
    container.style.width = `${boardSize}px`;
    container.style.height = `${boardSize}px`;

    const board = document.createElement('div');
    board.className = 'matching-board';
    board.style.width = '100%';
    board.style.height = '100%';
    board.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
    container.appendChild(board);

    this.cards.forEach((card) => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'memory-card';
      cardDiv.dataset.id = card.id;

      if (card.isFlipped) cardDiv.classList.add('flipped');
      if (card.isMatched) cardDiv.classList.add('matched');

      // Adjust emoji font-size dynamically based on board density
      const emojiSize = this.cols === 6 ? '1.5rem' : '2rem';

      cardDiv.innerHTML = `
        <div class="card-inner">
          <div class="card-back">?</div>
          <div class="card-front" style="font-size: ${emojiSize};">${card.value}</div>
        </div>
      `;

      this.bindCardEvents(cardDiv);
      board.appendChild(cardDiv);
    });
  }

  bindCardEvents(cardDiv) {
    const cardId = parseInt(cardDiv.dataset.id);
    const card = this.cards[cardId];

    const handleFlip = () => {
      if (this.isLockBoard) return;
      if (card.isFlipped || card.isMatched) return;

      this.manager.triggerFirstMove();

      // Flip the card
      card.isFlipped = true;
      cardDiv.classList.add('flipped');
      window.playClickSound();

      this.selectedCards.push({ card, element: cardDiv });

      if (this.selectedCards.length === 2) {
        this.isLockBoard = true;
        this.manager.moves++;
        this.manager.updateStatsDisplay();

        const [first, second] = this.selectedCards;

        if (first.card.value === second.card.value) {
          // It's a match!
          first.card.isMatched = true;
          second.card.isMatched = true;
          
          setTimeout(() => {
            first.element.classList.add('matched');
            second.element.classList.add('matched');
            window.playChimeSound();
            
            this.selectedCards = [];
            this.isLockBoard = false;
            this.manager.saveMoveState();
            this.manager.updateChecklist();

            // Check if victory
            if (this.cards.every(c => c.isMatched)) {
              setTimeout(() => {
                this.manager.updateChecklist();
              }, 400);
            }
          }, 200);
        } else {
          // Mismatch: Shake and flip back
          setTimeout(() => {
            first.element.classList.add('incorrect');
            second.element.classList.add('incorrect');
          }, 300);

          setTimeout(() => {
            first.card.isFlipped = false;
            second.card.isFlipped = false;
            first.element.classList.remove('flipped', 'incorrect');
            second.element.classList.remove('flipped', 'incorrect');
            
            this.selectedCards = [];
            this.isLockBoard = false;
            this.manager.saveMoveState();
          }, 1100);
        }
      }
    };

    cardDiv.addEventListener('click', handleFlip);
    cardDiv.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleFlip();
    });
  }

  serialize() {
    return JSON.stringify({
      cards: this.cards,
      selectedCards: this.selectedCards.map(s => s.card.id)
    });
  }

  deserialize(stateString) {
    const state = JSON.parse(stateString);
    this.cards = state.cards;
    
    const container = document.getElementById('board-container');
    this.render(container);

    // Restore selection references
    this.selectedCards = state.selectedCards.map(id => {
      const card = this.cards[id];
      const element = container.querySelector(`.memory-card[data-id="${id}"]`);
      return { card, element };
    });
  }

  getRulesChecklist() {
    const matchedCount = this.cards.filter(c => c.isMatched).length;
    const totalCount = this.cards.length;
    const pairsMatched = matchedCount / 2;
    const totalPairs = totalCount / 2;

    const solvedAll = (matchedCount === totalCount);

    return [
      {
        text: `Số cặp đã tìm thấy: ${pairsMatched} / ${totalPairs}`,
        status: solvedAll ? 'valid' : 'invalid'
      },
      {
        text: 'Hoàn thành lật tất cả thẻ bài',
        status: solvedAll ? 'valid' : 'invalid'
      }
    ];
  }

  drawIllustrations(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw card 1 (Face down)
    ctx.fillStyle = 'rgba(10, 5, 20, 0.95)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(25, 20, 50, 70, 8);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#5A8DF3';
    ctx.font = 'bold 20px Quicksand';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 50, 55);
    
    // Draw card 2 (Face up)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(145, 20, 50, 70, 8);
    ctx.fill();
    ctx.stroke();
    
    ctx.font = '24px Arial';
    ctx.fillText('🍎', 170, 55);
    
    // Draw connecting double arrow
    ctx.strokeStyle = '#4FD1A5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(90, 55);
    ctx.lineTo(130, 55);
    ctx.stroke();
    
    ctx.fillStyle = '#4FD1A5';
    ctx.beginPath();
    ctx.moveTo(130, 55);
    ctx.lineTo(122, 49);
    ctx.lineTo(122, 61);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Quicksand';
    ctx.fillText('Tìm cặp thẻ khớp nhau', 110, 105);
  }

  onHint() {
    if (this.isLockBoard) return;
    
    const unmatched = this.cards.filter(c => !c.isMatched);
    if (unmatched.length === 0) return;

    // Helper to flip elements on board
    const container = document.getElementById('board-container');
    const getCardDiv = (id) => container.querySelector(`.memory-card[data-id="${id}"]`);

    if (this.selectedCards.length === 1) {
      // Find pair of the selected card
      const selected = this.selectedCards[0];
      const match = unmatched.find(c => c.value === selected.card.value && c.id !== selected.card.id);
      if (match) {
        match.isFlipped = true;
        match.isMatched = true;
        selected.card.isMatched = true;

        const matchDiv = getCardDiv(match.id);
        if (matchDiv) matchDiv.classList.add('flipped');

        setTimeout(() => {
          if (matchDiv) matchDiv.classList.add('matched');
          selected.element.classList.add('matched');
          window.playChimeSound();
          
          this.selectedCards = [];
          this.manager.saveMoveState();
          this.manager.updateChecklist();

          // Check if victory
          if (this.cards.every(c => c.isMatched)) {
            setTimeout(() => this.manager.updateChecklist(), 400);
          }
        }, 300);
      }
    } else {
      // Select random unmatched card and its pair, and match them!
      const first = unmatched[Math.floor(Math.random() * unmatched.length)];
      const second = unmatched.find(c => c.value === first.value && c.id !== first.id);

      if (first && second) {
        first.isFlipped = true;
        first.isMatched = true;
        second.isFlipped = true;
        second.isMatched = true;

        const firstDiv = getCardDiv(first.id);
        const secondDiv = getCardDiv(second.id);

        if (firstDiv) firstDiv.classList.add('flipped');
        if (secondDiv) secondDiv.classList.add('flipped');

        setTimeout(() => {
          if (firstDiv) firstDiv.classList.add('matched');
          if (secondDiv) secondDiv.classList.add('matched');
          window.playChimeSound();

          this.manager.saveMoveState();
          this.manager.updateChecklist();

          // Check if victory
          if (this.cards.every(c => c.isMatched)) {
            setTimeout(() => this.manager.updateChecklist(), 400);
          }
        }, 300);
      }
    }
  }

  onSolve() {
    if (this.isLockBoard) return;
    this.isLockBoard = true;

    const unmatched = this.cards.filter(c => !c.isMatched);
    if (unmatched.length === 0) {
      this.isLockBoard = false;
      return;
    }

    // Find all pairs
    const pairs = [];
    const visited = new Set();

    unmatched.forEach(c => {
      if (visited.has(c.id)) return;
      const pair = unmatched.find(o => o.value === c.value && o.id !== c.id);
      if (pair) {
        pairs.push([c, pair]);
        visited.add(c.id);
        visited.add(pair.id);
      }
    });

    const container = document.getElementById('board-container');
    const getCardDiv = (id) => container.querySelector(`.memory-card[data-id="${id}"]`);

    let step = 0;
    const executeStep = () => {
      if (step >= pairs.length) {
        this.isLockBoard = false;
        return;
      }

      const [c1, c2] = pairs[step];
      c1.isFlipped = true;
      c1.isMatched = true;
      c2.isFlipped = true;
      c2.isMatched = true;

      const div1 = getCardDiv(c1.id);
      const div2 = getCardDiv(c2.id);

      if (div1) div1.classList.add('flipped');
      if (div2) div2.classList.add('flipped');

      setTimeout(() => {
        if (div1) div1.classList.add('matched');
        if (div2) div2.classList.add('matched');
        window.playChimeSound();
        this.manager.updateChecklist();

        if (step === pairs.length - 1) {
          this.isLockBoard = false;
          this.manager.saveMoveState();
          setTimeout(() => this.manager.updateChecklist(), 400);
        }

        step++;
        executeStep();
      }, 500);
    };

    executeStep();
  }
}

// Register Game
window.IQGames.matching = MatchingGame;
