import { SowingEngine } from './SowingEngine.js';

export default class AIPlayer {
    static getBestMove(gameState) {
        const difficulty = gameState.botDifficulty || 'easy';
        
        if (difficulty === 'hard') {
             return this.getHardMove(gameState);
        } else if (difficulty === 'medium') {
             return this.getMediumMove(gameState);
        } else {
             return this.getEasyMove(gameState);
        }
    }

    static getAllValidMoves(gameState, turn) {
        const validPits = gameState.getSidePits(turn).filter(index => {
            return !gameState.isPitEmpty(index) && !gameState.board[index].isLocked;
        });
        const moves = [];
        for (const pit of validPits) {
            moves.push({ type: 'move', startPit: pit, direction: 1 });
            moves.push({ type: 'move', startPit: pit, direction: -1 });
        }
        return moves;
    }

    static getEasyMove(gameState) {
        const turn = gameState.turn;
        const validMoves = this.getAllValidMoves(gameState, turn);
        if (validMoves.length === 0) return null;
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    static getMediumMove(gameState) {
        const turn = gameState.turn;
        const validMoves = this.getAllValidMoves(gameState, turn);
        if (validMoves.length === 0) return null;

        let bestScore = -Infinity;
        let bestMoves = [];

        for (const move of validMoves) {
            const clone = gameState.clone();
            SowingEngine.sow(clone, move.startPit, move.direction);
            
            // Check for game over in clone
            clone.checkGameStatus();
            let score;
            if (clone.status !== 'playing') {
                score = (clone.winner === turn) ? 9999 : -9999;
            } else {
                score = clone.players[turn].score - clone.players[1 - turn].score;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        }

        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    static getHardMove(gameState) {
        const turn = gameState.turn;
        const validMoves = this.getAllValidMoves(gameState, turn);
        if (validMoves.length === 0) return null;

        let bestScore = -Infinity;
        let bestMoves = [];

        for (const move of validMoves) {
            const clone = gameState.clone();
            SowingEngine.sow(clone, move.startPit, move.direction);
            clone.checkGameStatus();
            
            let evalScore = 0;
            if (clone.status !== 'playing') {
                evalScore = (clone.winner === turn) ? 9999 : -9999;
            } else {
                // Minimax: evaluate opponent's best response if it's their turn
                if (clone.turn !== turn) {
                    const oppMoves = this.getAllValidMoves(clone, clone.turn);
                    let worstCaseScore = Infinity;
                    
                    if (oppMoves.length === 0) {
                        evalScore = clone.players[turn].score - clone.players[1 - turn].score;
                    } else {
                        for (const oppMove of oppMoves) {
                            const oppClone = clone.clone();
                            SowingEngine.sow(oppClone, oppMove.startPit, oppMove.direction);
                            oppClone.checkGameStatus();
                            
                            let oppEval;
                            if (oppClone.status !== 'playing') {
                                oppEval = (oppClone.winner === turn) ? 9999 : -9999;
                            } else {
                                oppEval = oppClone.players[turn].score - oppClone.players[1 - turn].score;
                            }
                            if (oppEval < worstCaseScore) worstCaseScore = oppEval;
                        }
                        evalScore = worstCaseScore;
                    }
                } else {
                    // Still AI's turn (e.g. AP remaining in tactical mode), just evaluate state
                    evalScore = clone.players[turn].score - clone.players[1 - turn].score;
                }
            }
            
            if (evalScore > bestScore) {
                bestScore = evalScore;
                bestMoves = [move];
            } else if (evalScore === bestScore) {
                bestMoves.push(move);
            }
        }

        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
}
