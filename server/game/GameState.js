export const PLAYER_A = 0; // Indexes 1-5 (Bottom)
export const PLAYER_B = 1; // Indexes 7-11 (Top)

export default class GameState {
  constructor(playerAId, playerBId, isBotMatch = false, isLocalMatch = false, mode = 'tactical', names = null, startingTurn = 0) {
    this.isLocalMatch = isLocalMatch;
    this.mode = mode;
    this.turn = startingTurn;
    
    let n1 = isLocalMatch ? 'Người chơi 1' : 'Bạn';
    let n2 = isLocalMatch ? 'Người chơi 2' : (isBotMatch ? 'Máy (AI)' : 'Đối thủ');
    
    if (names && names.length >= 1 && names[0]) n1 = names[0];
    if (names && names.length >= 2 && names[1]) n2 = names[1];

    this.players = [
      {
        id: playerAId,
        score: 0,
        ap: 3,
        inventory: [],
        activeBuffs: { x2Harvest: false },
        isBot: false,
        name: n1
      },
      {
        id: playerBId,
        score: 0,
        ap: 3,
        inventory: [],
        activeBuffs: { x2Harvest: false },
        isBot: isBotMatch,
        name: n2
      }
    ];

    this.board = this.initializeBoard();
    this.bank = 100; // Starting bank stones
    this.status = 'playing'; // 'playing', 'win_a', 'win_b', 'draw'
    this.winner = null;
    this.lastAction = null; // Stores last action for UI
  }

  initializeBoard() {
    const board = new Array(12);

    for (let i = 0; i < 12; i++) {
        board[i] = {
            regularStones: 0,
            redStones: 0,
            quanStone: false,
            isLocked: false,
            type: 'dan'
        };
    }

    // Set Quan pits
    board[0].type = 'quan';
    board[0].quanStone = true;
    
    board[6].type = 'quan';
    board[6].quanStone = true;

    // Set Dan pits
    for (let i = 1; i <= 5; i++) {
      board[i].regularStones = 5;
    }
    for (let i = 7; i <= 11; i++) {
      board[i].regularStones = 5;
    }

    if (this.mode !== 'classic') {
        // Random Red Stones (Player A: 1-5, Player B: 7-11)
        const redAIndex = Math.floor(Math.random() * 5) + 1; // 1 to 5
        const redBIndex = Math.floor(Math.random() * 5) + 7; // 7 to 11

        // Replace 1 regular stone with 1 red stone
        board[redAIndex].regularStones = 4;
        board[redAIndex].redStones = 1;

        board[redBIndex].regularStones = 4;
        board[redBIndex].redStones = 1;
    }

    return board;
  }

  getPitOwner(index) {
    if (index >= 1 && index <= 5) return PLAYER_A;
    if (index >= 7 && index <= 11) return PLAYER_B;
    return null; // Quan pits don't belong to a specific player
  }

  isPitEmpty(index) {
    return this.board[index].regularStones === 0 && 
           this.board[index].redStones === 0 && 
           this.board[index].quanStone === false;
  }

  getSidePits(playerIndex) {
    if (playerIndex === PLAYER_A) {
      return [1, 2, 3, 4, 5];
    } else {
      return [7, 8, 9, 10, 11];
    }
  }

  isPlayersSideEmpty(playerIndex) {
    const pits = this.getSidePits(playerIndex);
    return pits.every(index => this.isPitEmpty(index));
  }

  isEmptyBoard() {
    return this.board.every((_, index) => this.isPitEmpty(index));
  }
  
  areBothQuanEaten() {
     // A Quan is considered "eaten" if its quanStone is false AND it has no stones.
     // Some rules say game ends if both large pits are empty of regular stones, even if one big one remains? 
     // Standard rule: Both big pits empty of everything.
     const q0Empty = !this.board[0].quanStone && this.board[0].regularStones === 0 && this.board[0].redStones === 0;
     const q6Empty = !this.board[6].quanStone && this.board[6].regularStones === 0 && this.board[6].redStones === 0;
     return q0Empty && q6Empty;
  }

  checkGameStatus() {
    if (this.status !== 'playing') return;

    // Condition 1: Hostile Takeover (Board is completely empty)
    if (this.isEmptyBoard()) {
        this.status = this.players[PLAYER_A].score > this.players[PLAYER_B].score ? 'win_a' : 'win_b';
        this.winner = this.players[PLAYER_A].score > this.players[PLAYER_B].score ? PLAYER_A : PLAYER_B;
        return;
    }

    // Condition 2: Bankruptcy (Side empty and score < 5)
    // Checked at the start of a player's turn typically
    const player = this.players[this.turn];
    if (this.isPlayersSideEmpty(this.turn) && player.score < 5) {
       this.status = this.turn === PLAYER_A ? 'win_b' : 'win_a';
       this.winner = this.turn === PLAYER_A ? PLAYER_B : PLAYER_A;
       return;
    }

    // Condition 3: Both Quan eaten
    if (this.areBothQuanEaten()) {
        console.log("Endgame triggered: Both Quan eaten.");
        // Collect remaining stones on sides to scores
        const pitsA = this.getSidePits(PLAYER_A);
        let stonesA = 0;
        pitsA.forEach(idx => {
            stonesA += this.board[idx].regularStones + this.board[idx].redStones;
            this.board[idx].regularStones = 0;
            this.board[idx].redStones = 0;
        });
        
        const pitsB = this.getSidePits(PLAYER_B);
        let stonesB = 0;
        pitsB.forEach(idx => {
            stonesB += this.board[idx].regularStones + this.board[idx].redStones;
            this.board[idx].regularStones = 0;
            this.board[idx].redStones = 0;
        });

        this.players[PLAYER_A].score += stonesA;
        this.players[PLAYER_B].score += stonesB;

        if (this.players[PLAYER_A].score > this.players[PLAYER_B].score) {
            this.status = 'win_a';
            this.winner = PLAYER_A;
        } else if (this.players[PLAYER_B].score > this.players[PLAYER_A].score) {
            this.status = 'win_b';
            this.winner = PLAYER_B;
        } else {
            this.status = 'draw';
            this.winner = null;
        }
    }
  }

  refillSide(playerIndex) {
      const player = this.players[playerIndex];
      const pits = this.getSidePits(playerIndex);
      
      if (player.score >= 5) {
          player.score -= 5;
          pits.forEach(idx => {
             this.board[idx].regularStones = 1;
          });
          return true; // Successfully refilled
      }
      return false; // Cannot refill, should trigger Bankruptcy in checkGameStatus
  }

  nextTurn() {
     this.players[this.turn].ap = 3; // Reset AP for current player before switching
     this.turn = this.turn === PLAYER_A ? PLAYER_B : PLAYER_A;
     // Reset locks
     for(let i=0; i<12; i++) {
        if(this.board[i].isLocked && this.getPitOwner(i) === this.turn) {
            this.board[i].isLocked = false;
        }
     }
  }

  clone() {
      // Basic deep copy for AI purposes
      const clone = new GameState(this.players[0].id, this.players[1].id, this.players[1].isBot, this.isLocalMatch, this.mode);
      clone.players = JSON.parse(JSON.stringify(this.players));
      clone.turn = this.turn;
      clone.board = JSON.parse(JSON.stringify(this.board));
      clone.bank = this.bank;
      clone.status = this.status;
      return clone;
  }
}
