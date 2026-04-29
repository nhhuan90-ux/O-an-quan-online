export default class BoardRenderer {
    constructor() {
        this.pits = {};
        for(let i=0; i<12; i++) {
            this.pits[i] = document.getElementById(`pit-${i}`);
        }
        this.hand = document.getElementById('animated-hand');
    }

    moveHandTo(pitIndex, isGrabbing) {
        if (!this.hand) return;
        this.hand.classList.remove('hidden');
        if (isGrabbing) this.hand.classList.add('grabbing');
        else this.hand.classList.remove('grabbing');
        
        const pitEl = this.pits[pitIndex];
        const rect = pitEl.getBoundingClientRect();
        const container = document.querySelector('.board-container').getBoundingClientRect();
        
        this.hand.style.left = (rect.left - container.left + rect.width / 2 - 20) + 'px';
        this.hand.style.top = (rect.top - container.top + rect.height / 2 - 20) + 'px';
    }

    hideHand() {
        if (this.hand) this.hand.classList.add('hidden');
        const countTag = document.getElementById('hand-count');
        if (countTag) countTag.classList.add('hidden');
    }

    render(gameState) {
        // Render stones for each pit
        for(let i=0; i<12; i++) {
            this.renderPit(i, gameState.board[i]);
        }
    }

    renderPit(index, pitData) {
        const pitEl = this.pits[index];
        pitEl.innerHTML = ''; // clear 

        // Locked state
        if (pitData.isLocked) {
             pitEl.classList.add('locked');
        } else {
             pitEl.classList.remove('locked');
        }

        const stones = [];
        
        // Add Quan
        if (pitData.quanStone) {
             const qs = document.createElement('div');
             qs.className = 'stone quan';
             stones.push(qs);
        }

        // Add Red stones
        for (let i=0; i<pitData.redStones; i++) {
            const rs = document.createElement('div');
            rs.className = 'stone red';
            stones.push(rs);
        }

        // Add regular stones
        // To prevent massive lag when a pit has too many stones (e.g. 50+), we cap visual stones and use the number.
        const maxVisual = pitData.quanStone ? 15 : 20; 
        const visualRegular = Math.min(pitData.regularStones, maxVisual);
        
        for (let i=0; i<visualRegular; i++) {
            const rs = document.createElement('div');
            rs.className = 'stone';
            stones.push(rs);
        }

        // Cache random coordinates so unaffected pits do not jitter
        const totalVisualCount = stones.length;
        if (!this.pitCache) this.pitCache = {};
        
        if (!this.pitCache[index] || this.pitCache[index].count !== totalVisualCount) {
             // Re-scramble completely if count changes
             this.pitCache[index] = {
                 count: totalVisualCount,
                 coords: Array.from({length: totalVisualCount}, () => ({x: Math.random(), y: Math.random()}))
             };
        }
        
        stones.forEach((stoneEl, i) => {
             const isQuan = stoneEl.classList.contains('quan');
             const range = isQuan ? 10 : (pitData.type === 'quan' ? 40 : 25);
             
             const offset = this.pitCache[index].coords[i];
             let x = (offset.x * range * 2) - range;
             let y = (offset.y * range * 2) - range;
             
             if (isQuan) {
                 x = 0; y = 0;
             }
             
             stoneEl.style.transform = `translate(${x}px, ${y}px)`;
             pitEl.appendChild(stoneEl);
        });

        // Add text counter if stones > 0
        const totalCount = pitData.regularStones + pitData.redStones + (pitData.quanStone ? 1 : 0);
        if (totalCount > 0) {
            const countEl = document.createElement('div');
            countEl.className = 'stone-count';
            countEl.innerText = totalCount;
            pitEl.appendChild(countEl);
        }
    }

    highlightPits(indices) {
        for(let i=0; i<12; i++) {
            if (indices.includes(i)) {
                this.pits[i].classList.add('highlight');
            } else {
                 this.pits[i].classList.remove('highlight');
            }
        }
    }
    
    clearHighlights() {
        for(let i=0; i<12; i++) {
            this.pits[i].classList.remove('highlight');
        }
    }

    // A simple animation player for the steps array
    async playAnimations(steps, finalState, initialState, onComplete) {
         if (!steps || steps.length === 0) {
             this.render(finalState);
             if (onComplete) onComplete();
             return;
         }

         // Temporary state to mutate for visuals - MUST start from the state BEFORE the move
         const tempState = JSON.parse(JSON.stringify(initialState || window.currentGameController.gameState));
         
         // Ensure visuals match the start state
         this.render(tempState);

         let stonesInHandAmount = 0;
         const countTag = document.getElementById('hand-count');

         for (const step of steps) {
             if (step.type === 'pickup') {
                 stonesInHandAmount = step.stonesInHand + step.redStonesInHand;
                 if (countTag) {
                      countTag.innerText = stonesInHandAmount;
                      countTag.classList.remove('hidden');
                 }
                 
                 this.moveHandTo(step.pitIndex, true);
                 await this.sleep(400); // let hand travel

                 // Clear pit visually
                 tempState.board[step.pitIndex].regularStones = 0;
                 tempState.board[step.pitIndex].redStones = 0;
                 this.pits[step.pitIndex].classList.add('highlight');
                 setTimeout(() => this.pits[step.pitIndex].classList.remove('highlight'), 300);
                 this.renderPit(step.pitIndex, tempState.board[step.pitIndex]); // Faster update
                 await this.sleep(300);
             } 
             else if (step.type === 'drop') {
                 stonesInHandAmount--;
                 if (countTag) {
                      countTag.innerText = stonesInHandAmount;
                      if (stonesInHandAmount <= 0) countTag.classList.add('hidden');
                 }
                 
                 this.moveHandTo(step.pitIndex, false);
                 await this.sleep(400); // let hand travel
                 
                 if (step.stoneType === 'red') {
                     tempState.board[step.pitIndex].redStones += 1;
                 } else {
                     tempState.board[step.pitIndex].regularStones += 1;
                 }
                 this.pits[step.pitIndex].classList.add('highlight');
                 setTimeout(() => this.pits[step.pitIndex].classList.remove('highlight'), 300);
                 this.renderPit(step.pitIndex, tempState.board[step.pitIndex]); // Local update
                 this.moveHandTo(step.pitIndex, true); // grab again
                 await this.sleep(400); // wait for sow
             }
             else if (step.type === 'eat') {
                 // Green highlight for eating
                 this.pits[step.pitIndex].classList.add('eat-highlight');
                 if (window.currentGameController) window.currentGameController.showToast("Ăn Quân! 🎉");
                 
                 // Fireworks!
                 if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                 }

                 // Animate stones flying to score area
                 const pitData = tempState.board[step.pitIndex];
                 const totalEaten = pitData.regularStones + pitData.redStones + (pitData.quanStone ? 1 : 0);
                 
                 // Clear pit IMMEDIATELY for local state so stones are gone
                 tempState.board[step.pitIndex].regularStones = 0;
                 tempState.board[step.pitIndex].redStones = 0;
                 tempState.board[step.pitIndex].quanStone = false;
                 this.renderPit(step.pitIndex, tempState.board[step.pitIndex]);

                 // Visual flying stones
                 const turn = (window.currentGameController && window.currentGameController.gameState) ? window.currentGameController.gameState.turn : 0;
                 this.flyStones(step.pitIndex, turn, totalEaten);
                 
                 await this.sleep(1200);
                 this.pits[step.pitIndex].classList.remove('eat-highlight');
             }
             else if (step.type === 'stop') {
                 // Red highlight + shake for stop
                 this.pits[step.pitIndex].classList.add('stop-highlight');
                 if (window.currentGameController) window.currentGameController.showToast("Dừng lượt 😢");
                 setTimeout(() => this.pits[step.pitIndex].classList.remove('stop-highlight'), 1000);
                 await this.sleep(1000);
             }
             else if (step.type === 'auto-end-turn') {
                 if (window.currentGameController) {
                     const gc = window.currentGameController;
                     if (gc.gameState.isLocalMatch || gc.myPlayerIndex === step.actingPlayer) {
                         gc.socket.sendAction({ type: 'end-turn' });
                     }
                 }
                 await this.sleep(500);
             }
         }

         // Ensure final state matches server exactly
         this.hideHand();
         this.render(finalState);
         if (onComplete) onComplete();
    }

    flyStones(pitIndex, playerIndex, count) {
        const pitEl = this.pits[pitIndex];
        const pitRect = pitEl.getBoundingClientRect();
        
        const scoreTarget = document.getElementById(playerIndex === 0 ? 'score-a' : 'score-b');
        const targetRect = scoreTarget.getBoundingClientRect();

        const maxVisual = Math.min(count, 15); // Don't fly 100 stones lol
        
        for (let i = 0; i < maxVisual; i++) {
            setTimeout(() => {
                const stone = document.createElement('div');
                stone.className = 'flying-stone';
                
                // Random position within pit
                const offsetX = (Math.random() * 40) - 20;
                const offsetY = (Math.random() * 40) - 20;
                
                stone.style.left = (pitRect.left + pitRect.width/2 + offsetX) + 'px';
                stone.style.top = (pitRect.top + pitRect.height/2 + offsetY) + 'px';
                
                document.body.appendChild(stone);

                // Trigger transform to target
                setTimeout(() => {
                    stone.style.transform = `translate(${targetRect.left - pitRect.left}px, ${targetRect.top - pitRect.top}px) scale(0.5)`;
                    stone.style.opacity = '0';
                    setTimeout(() => stone.remove(), 800);
                }, 50);
            }, i * 50);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
