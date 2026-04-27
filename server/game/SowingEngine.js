export class SowingEngine {
    
    // Returns animation steps: { type: 'sow'|'eat'|'stop', pitIndex: number, stones: number, etc }
    static sow(gameState, startPit, direction, useCanQuet = false, bypassOwnerCheck = false) {
        const steps = [];
        const board = gameState.board;
        const player = gameState.players[gameState.turn];
        
        // Cannot start from empty or locked pit
        if (gameState.isPitEmpty(startPit) || board[startPit].isLocked) {
            return { error: "Invalid start pit." };
        }

        // Must start from own side unless bypassed
        if (!bypassOwnerCheck && gameState.getPitOwner(startPit) !== gameState.turn) {
             return { error: "Not your pit." };
        }

        if (gameState.mode !== 'classic') {
            if (player.ap < 1) {
                return { error: "Not enough AP." };
            }
            player.ap -= 1;
        }
        
        let currentPit = startPit;
        let stonesInHand = 0;
        let redStonesInHand = 0;

        // initial pickup
        stonesInHand = board[currentPit].regularStones;
        redStonesInHand = board[currentPit].redStones;
        board[currentPit].regularStones = 0;
        board[currentPit].redStones = 0;

        steps.push({ type: 'pickup', pitIndex: currentPit, stonesInHand, redStonesInHand });

        let isContinuing = true;

        while (isContinuing) {
            // Sowing Loop
            while (stonesInHand > 0 || redStonesInHand > 0) {
                currentPit = this.getNextPit(currentPit, direction);
                
                // Drop 1 stone
                if (stonesInHand > 0) {
                    board[currentPit].regularStones += 1;
                    stonesInHand -= 1;
                    steps.push({ type: 'drop', pitIndex: currentPit, stoneType: 'regular' });
                } else if (redStonesInHand > 0) {
                    board[currentPit].redStones += 1;
                    redStonesInHand -= 1;
                    steps.push({ type: 'drop', pitIndex: currentPit, stoneType: 'red' });
                }
            }

            // Check stopping conditions at the pit AFTER the last sown pit
            const nextPit = this.getNextPit(currentPit, direction);
            
            // Condition 1: Next is Quan pit (DỪNG lượt)
            if (board[nextPit].type === 'quan') {
                steps.push({ type: 'stop', reason: 'hit_quan', pitIndex: nextPit });
                isContinuing = false;
                break; // End Turn
            }

            // Condition 2: Next has stones, and is not Quan (Bốc lên rải tiếp)
            if (!gameState.isPitEmpty(nextPit) && board[nextPit].type !== 'quan') {
                 // Càn Quét active: just eat if it has stones?
                if (useCanQuet) {
                     // The rule says "Bỏ qua kiểm tra ô trống, cứ gặp ô có quân là ăn"
                     // This means if we land and next pit has stones, eat it instead of pickup.
                     const eaten = this.eatPit(gameState, nextPit, player);
                     steps.push({ type: 'eat', pitIndex: nextPit, ...eaten });
                     isContinuing = false;
                     break;
                }

                currentPit = nextPit;
                stonesInHand = board[currentPit].regularStones;
                redStonesInHand = board[currentPit].redStones;
                board[currentPit].regularStones = 0;
                board[currentPit].redStones = 0;
                steps.push({ type: 'pickup', pitIndex: currentPit, stonesInHand, redStonesInHand });
                continue; // continue sowing loop
            }

            // Condition 3 & 4 & 5: Next is empty
            if (gameState.isPitEmpty(nextPit)) {
                 const pitAfterNext = this.getNextPit(nextPit, direction);
                 
                 // Condition 3: Next empty, pit after next has stones
                 if (!gameState.isPitEmpty(pitAfterNext)) {
                     // Condition 5: The pit after next is Quan pit? 
                     // The rule says: Ô tiếp trống + ô kế là ô Quan -> DỪNG lượt (nếu Quan trống)
                     // But if Quan has stones, can we eat it? Yes, we can eat Quan.
                     // The rule table: "Ô tiếp theo trống + ô kế tiếp nữa có quân -> Ăn quân -> Dừng lượt"
                     // Wait, there's a clarification: "Ô tiếp theo trống + ô kế tiếp nữa là ô Quan: DỪNG lượt" (Wait, only if Quan is empty? If Quan has stones, you eat the Quan). 
                     // Let's implement standard rule: if empty + next has stones = eat. Then stop.
                     
                     const eaten = this.eatPit(gameState, pitAfterNext, player);
                     steps.push({ type: 'eat', pitIndex: pitAfterNext, ...eaten });
                     isContinuing = false; // "Sau khi ăn quân -> DỪNG lượt ngay"
                     
                 } else {
                     // Condition 4: 2 empty pits (Next is empty, pit after next is also empty) -> Stop
                     steps.push({ type: 'stop', reason: 'two_empty', pitIndex: nextPit });
                     isContinuing = false;
                 }
            }
        } // end while(isContinuing)

        // Check if x2Harvest buff should carry over
        if (player.activeBuffs.x2HarvestTriggeredThisTurn) {
             // Will be active next turn
             player.activeBuffs.x2HarvestTriggeredThisTurn = false;
             player.activeBuffs.x2Harvest = true;
        } else {
             // Reset it if it was active and we used it
             player.activeBuffs.x2Harvest = false;
        }

        gameState.lastAction = { type: 'move', startPit, direction };
        
        if (gameState.mode === 'classic') {
             steps.push({ type: 'auto-end-turn' });
        }
        
        return steps;
    }

    static getNextPit(currentPit, direction) {
        if (direction === 1) { // Clockwise
            return (currentPit + 1) % 12;
        } else { // Counter-clockwise
            return (currentPit - 1 + 12) % 12;
        }
    }

    static eatPit(gameState, pitIndex, player) {
        const board = gameState.board;
        let scoreGained = 0;
        let ateRed = false;

        const reg = board[pitIndex].regularStones;
        const red = board[pitIndex].redStones;
        const quan = board[pitIndex].quanStone ? 1 : 0;

        // Base points
        scoreGained += reg + red + (quan * 5); // Assuming a Quan is worth 5 regular stones in score? Or 1? Let's just track total points. The rule says "cộng tổng điểm các quân đã ăn". Let's assume quan=5 or it just adds to count. Let's add 1 for now if rule doesn't specify heavy Quan value. Wait, usually Quan is worth 10 or 5. Let's make it 5.
        // Actually, just keep it simple: 1 stone = 1 score. Quan = 5 points.
        const quanPoints = board[pitIndex].quanStone ? 5 : 0;
        const stonesCount = reg + red + quanPoints;

        let multiplier = player.activeBuffs.x2Harvest ? 2 : 1;
        let finalScore = stonesCount * multiplier;

        // Deduct extra from bank if x2
        if (multiplier > 1) {
            const extra = finalScore - stonesCount;
            if (gameState.bank >= extra) {
                 gameState.bank -= extra;
            } else {
                 finalScore = stonesCount + gameState.bank; // drain bank
                 gameState.bank = 0;
            }
        }

        player.score += finalScore;

        if (red > 0) {
            player.activeBuffs.x2HarvestTriggeredThisTurn = true;
            ateRed = true;
        }

        // Clear pit
        board[pitIndex].regularStones = 0;
        board[pitIndex].redStones = 0;
        board[pitIndex].quanStone = false;

        return { regularStonesEaten: reg, redStonesEaten: red, quanEaten: quan > 0, pointsGranted: finalScore, ateRed };
    }
}
