export default class AIPlayer {
    static getBestMove(gameState) {
        // Very simple AI: Just find all valid moves, pick one that doesn't hit a lock
        // A more advanced min-max could be added, but for now we simulate basic legal moves.
        const turn = gameState.turn;
        const validPits = gameState.getSidePits(turn).filter(index => {
            return !gameState.isPitEmpty(index) && !gameState.board[index].isLocked;
        });

        if (validPits.length === 0) return null; // Bankruptcy or need refill

        // Pick a random valid pit
        const startPit = validPits[Math.floor(Math.random() * validPits.length)];
        // Pick a random direction (1 = CW, -1 = CCW)
        const direction = Math.random() > 0.5 ? 1 : -1;

        return { type: 'move', startPit, direction };
    }
}
