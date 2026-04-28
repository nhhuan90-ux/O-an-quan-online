import BoardRenderer from './board-renderer.js';

const CARDS_DICT = [
    { id: 'doi_chieu', name: 'Đổi Chiều', desc: 'Đổi hướng rải quân giữa lượt.' },
    { id: 'tiep_te', name: 'Tiếp Tế', desc: 'Nhận 3 quân từ Bank vào 1 ô Dân.' },
    { id: 'la_chan', name: 'Lá Chắn', desc: 'Khóa 1 ô (tốn 3 AP).' },
    { id: 'thue_than', name: 'Thuế Thân', desc: 'Trừ 2 điểm đối thủ.' },
    { id: 'x2_thua_thang', name: 'X2 Thừa Thắng', desc: 'Kích hoạt X2 lượt này.' },
    { id: 'lien_hoan', name: 'Liên Hoàn', desc: 'Được rải tiếp 1 lượt sau khi ăn.' },
    { id: 'muon_gio', name: 'Mượn Gió', desc: 'Rải từ ô đối phương.' },
    { id: 'su_gia', name: 'Sứ Giả', desc: 'Biến 1 ô Dân thành Quan.' },
    { id: 'can_quet', name: 'Càn Quét', desc: 'Cứ gặp ô có quân là ăn.' },
    { id: 'hoan_doi', name: 'Hoán Đổi', desc: 'Đổi điểm với đối thủ.' }
];

export default class GameController {
    constructor(socketClient) {
        this.socket = socketClient;
        this.renderer = new BoardRenderer();
        
        window.currentGameController = this;
        
        this.gameState = null;
        this.myPlayerIndex = null;
        this.roomId = null;
        this.isAnimating = false;
        
        this.selectedPit = null;
        this.pendingCardAction = null; // { cardId, needsTarget }

        // UI references
        this.nameA = document.getElementById('name-a');
        this.scoreA = document.getElementById('score-a');
        this.apA = document.getElementById('ap-a');
        this.bankUI = document.getElementById('bank-ui');
        this.myCards = document.getElementById('my-cards');
        
        this.nameB = document.getElementById('name-b');
        this.scoreB = document.getElementById('score-b');
        this.apB = document.getElementById('ap-b');
        this.oppCards = document.getElementById('opp-cards');

        this.dirChooser = document.getElementById('direction-chooser');
        this.btnEndTurnA = document.getElementById('btn-end-turn-a');
        this.btnEndTurnB = document.getElementById('btn-end-turn-b');
        this.btnFreezeA = document.getElementById('btn-freeze-a');
        this.btnFreezeB = document.getElementById('btn-freeze-b');
        this.centralDeck = document.getElementById('central-deck');
        this.targetHint = document.getElementById('target-hint');
        
        this.gameOverModal = document.getElementById('game-over-modal');
        this.toastContainer = document.getElementById('toast-container');
        
        // Timer UI
        this.timerContainer = document.getElementById('turn-timer-container');
        this.timerText = document.getElementById('turn-timer-text');
        this.timerWarningModal = document.getElementById('timer-warning-modal');
        this.warningCountdownText = document.getElementById('warning-countdown');
        this.btnTimerExtend = document.getElementById('btn-timer-extend');
        this.btnTimerSkip = document.getElementById('btn-timer-skip');
        
        this.localTimerInterval = null;
        this.localWarningInterval = null;

        this.setupEventListeners();
        this.setupSocketListeners();
    }

    showToast(msg) {
        if (!this.toastContainer) return;
        const div = document.createElement('div');
        div.className = 'toast-msg';
        div.innerText = msg;
        this.toastContainer.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    showGiantCardToast(card) {
        const div = document.createElement('div');
        div.className = 'giant-card-toast';
        div.innerHTML = `<div style="font-size:1.5rem">🎇 ${card.name} 🎇</div><div style="font-size:1.1rem; margin-top:5px; font-weight:normal;">${card.desc}</div>`;
        document.getElementById('game-view').appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    setupEventListeners() {
        // Pit clicking
        for(let i=0; i<12; i++) {
             document.getElementById(`pit-${i}`).addEventListener('click', (e) => {
                 this.handlePitClick(i);
             });
        }

        // Direction choosing
        document.getElementById('btn-dir-ccw').addEventListener('click', () => {
             const isPlayerB = this.selectedPit >= 7 && this.selectedPit <= 11;
             const invert = this.gameState.isLocalMatch && isPlayerB;
             const dir = invert ? 1 : -1;
             this.sendMove(this.selectedPit, dir);
             this.dirChooser.classList.add('hidden');
             this.renderer.clearHighlights();
             this.selectedPit = null;
        });

        document.getElementById('btn-dir-cw').addEventListener('click', () => {
             const isPlayerB = this.selectedPit >= 7 && this.selectedPit <= 11;
             const invert = this.gameState.isLocalMatch && isPlayerB;
             const dir = invert ? -1 : 1;
             this.sendMove(this.selectedPit, dir);
             this.dirChooser.classList.add('hidden');
             this.renderer.clearHighlights();
             this.selectedPit = null;
        });

        // Other actions
        this.btnEndTurnA.addEventListener('click', () => {
            if (this.isMyTurn()) {
                this.socket.sendAction({ type: 'end-turn' });
            }
        });

        this.btnEndTurnB.addEventListener('click', () => {
            if (this.gameState.isLocalMatch && this.gameState.turn === 1 && this.isMyTurn()) {
                this.socket.sendAction({ type: 'end-turn' });
            }
        });
        
        const triggerFreeze = () => {
            if (this.isMyTurn()) {
               this.pendingAction = 'freeze';
               this.showToast("Chọn 1 ô Dân để đóng băng");
               this.targetHint.classList.remove('hidden');
            }
        };

        this.btnFreezeA.addEventListener('click', () => {
            if (this.isMyTurn()) triggerFreeze();
        });

        this.btnFreezeB.addEventListener('click', () => {
            if (this.gameState.isLocalMatch && this.gameState.turn === 1 && this.isMyTurn()) triggerFreeze();
        });

        this.centralDeck.addEventListener('click', () => {
            if (this.isMyTurn()) {
                this.socket.sendAction({ type: 'buy-card' });
            }
        });
        
        document.getElementById('btn-home').addEventListener('click', () => {
            location.reload();
        });

        document.getElementById('btn-rematch').addEventListener('click', () => {
            this.socket.requestRematch();
            document.getElementById('btn-rematch').disabled = true;
            document.getElementById('rematch-status').classList.remove('hidden');
            document.getElementById('rematch-status').innerText = "Đang chờ đối thủ xác nhận...";
        });

        document.getElementById('history-title').addEventListener('click', () => {
            const list = document.getElementById('history-list');
            const panel = document.getElementById('history-panel');
            const icon = document.getElementById('history-toggle-icon');
            
            if (panel.classList.contains('collapsed')) {
                panel.classList.remove('collapsed');
                list.classList.remove('hidden');
                icon.className = 'fas fa-chevron-up';
            } else {
                panel.classList.add('collapsed');
                list.classList.add('hidden');
                icon.className = 'fas fa-chevron-down';
            }
        });

        if (this.btnTimerExtend) {
            this.btnTimerExtend.addEventListener('click', () => {
                this.socket.sendAction({ type: 'timer-extend' });
                this.hideTimerWarning();
            });
        }

        if (this.btnTimerSkip) {
            this.btnTimerSkip.addEventListener('click', () => {
                this.socket.sendAction({ type: 'timer-skip' });
                this.hideTimerWarning();
            });
        }
    }

    hideTimerWarning() {
        if (this.timerWarningModal) {
            this.timerWarningModal.classList.add('hidden');
        }
        if (this.localWarningInterval) {
            clearInterval(this.localWarningInterval);
            this.localWarningInterval = null;
        }
    }

    setupSocketListeners() {
        this.socket.on('state-update', async (data) => {
            // If it's a move action, play animation
            if (data.actionData && data.actionData.type === 'move' && data.steps) {
                this.isAnimating = true;
                const prevStateForAnimation = this.gameState;
                this.gameState = data.state; // Update reference immediately
                
                await this.renderer.playAnimations(data.steps, data.state, prevStateForAnimation, () => {
                    this.isAnimating = false;
                    
                    // Track eating for history AFTER animation completes
                    const eatSteps = data.steps.filter(s => s.type === 'eat');
                    if (eatSteps.length > 0) {
                        const totalPoints = eatSteps.reduce((acc, s) => acc + (s.pointsGranted || 0), 0);
                        this.addHistory(data.state.turn, `Vừa ăn được ${eatSteps.length} ô.`, totalPoints);
                    }

                    // Pass the state from before the animation started to handle collection animations if game ended
                    this.updateState(this.gameState, prevStateForAnimation);
                });
            } else if (data.actionData && data.actionData.type === 'play-card') {
                const card = CARDS_DICT.find(c => c.id === data.actionData.cardId);
                if (card) {
                    this.showGiantCardToast(card);
                    this.addHistory(data.state.turn, `Sử dụng thẻ: ${card.name}`);
                }
                this.updateState(data.state);
            } else {
                this.updateState(data.state);
            }
        });
        
        this.socket.on('action-error', (msg) => {
             alert(msg);
             this.pendingCardAction = null;
             this.pendingAction = null;
             this.targetHint.classList.add('hidden');
        });

        this.socket.on('rematch-requested', (data) => {
            const statusEl = document.getElementById('rematch-status');
            statusEl.classList.remove('hidden');
            statusEl.innerText = "Đối thủ muốn chơi lại! Nhấn 'Ván Mới' để đồng ý.";
        });
        
        this.socket.on('timer-start', (data) => {
            if (!this.timerContainer) return;
            this.hideTimerWarning();
            
            // Only show timer if it's my turn
            const myTurnIndex = this.gameState && this.gameState.isLocalMatch ? 0 : this.myPlayerIndex;
            if (data.turn === myTurnIndex) {
                this.timerContainer.classList.remove('hidden');
                this.timerContainer.classList.remove('warning');
                
                let timeLeft = data.duration;
                this.timerText.innerText = timeLeft;
                
                if (this.localTimerInterval) clearInterval(this.localTimerInterval);
                this.localTimerInterval = setInterval(() => {
                    timeLeft--;
                    if (timeLeft >= 0) {
                        this.timerText.innerText = timeLeft;
                        if (timeLeft <= 5) {
                            this.timerContainer.classList.add('warning');
                        }
                    } else {
                        clearInterval(this.localTimerInterval);
                    }
                }, 1000);
            } else {
                this.timerContainer.classList.add('hidden');
                if (this.localTimerInterval) clearInterval(this.localTimerInterval);
            }
        });
        
        this.socket.on('timer-warning', (data) => {
            const myTurnIndex = this.gameState && this.gameState.isLocalMatch ? 0 : this.myPlayerIndex;
            if (data.turn === myTurnIndex && this.timerWarningModal) {
                this.timerWarningModal.classList.remove('hidden');
                let warningTime = 5;
                this.warningCountdownText.innerText = warningTime;
                
                if (this.localWarningInterval) clearInterval(this.localWarningInterval);
                this.localWarningInterval = setInterval(() => {
                    warningTime--;
                    if (warningTime >= 0) {
                        this.warningCountdownText.innerText = warningTime;
                    } else {
                        clearInterval(this.localWarningInterval);
                        this.hideTimerWarning();
                    }
                }, 1000);
            }
        });
    }

    addHistory(playerIndex, msg, points = null) {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isMe = playerIndex === this.myPlayerIndex;
        const uiColorClass = (this.gameState && this.gameState.isLocalMatch ? playerIndex === 0 : isMe) ? 'friendly-history' : 'enemy-history';
        const div = document.createElement('div');
        div.className = `history-item ${uiColorClass}`;
        
        const playerName = this.gameState ? this.gameState.players[playerIndex].name : `Người chơi ${playerIndex + 1}`;
        let pointHtml = points ? `<span class="points">+${points} pts</span>` : '';
        div.innerHTML = `
            <div class="time">${time} - ${playerName}</div>
            <div class="msg">${msg} ${pointHtml}</div>
        `;

        historyList.prepend(div);
        if (historyList.children.length > 50) historyList.lastChild.remove();
    }

    initGame(gameState, roomId, localNames = null) {
        this.gameState = gameState;
        this.roomId = roomId;
        this.lastTurn = undefined;
        this.statsSaved = false;

        // Fallback for names in local match if server sent defaults
        if (gameState.isLocalMatch && localNames) {
             if (gameState.players[0].name === 'Người chơi 1' || !gameState.players[0].name) {
                 gameState.players[0].name = localNames[0] || 'Người chơi 1';
             }
             if (gameState.players[1].name === 'Người chơi 2' || !gameState.players[1].name) {
                 gameState.players[1].name = localNames[1] || 'Người chơi 2';
             }
        }

        this.myPlayerIndex = gameState.players[0].id === this.socket.getId() ? 0 : 1;
        
        if (gameState.mode === 'classic') {
             document.querySelector('.game-layout').classList.add('classic-mode');
        } else {
             document.querySelector('.game-layout').classList.remove('classic-mode');
        }
        
        // Clear history on new game
        const hl = document.getElementById('history-list');
        if (hl) hl.innerHTML = '';
        this.addHistory(0, "Trận đấu bắt đầu!");

        // Hide game over modal and reset rematch state if it was open
        this.gameOverModal.classList.add('hidden');
        document.getElementById('btn-rematch').disabled = false;
        document.getElementById('rematch-status').classList.add('hidden');

        this.updateState(gameState);
        
        // Force multiple re-renders to ensure visibility across different browsers/latencies
        [100, 500, 1000].forEach(delay => {
            setTimeout(() => {
                if (this.gameState) {
                    this.renderer.render(this.gameState);
                    
                    const p1 = this.gameState.isLocalMatch ? this.gameState.players[0] : this.gameState.players[this.myPlayerIndex];
                    const p2 = this.gameState.isLocalMatch ? this.gameState.players[1] : this.gameState.players[this.myPlayerIndex === 0 ? 1 : 0];
                    
                    this.renderAP(this.apA, p1.ap);
                    this.renderAP(this.apB, p2.ap);
                }
            }, delay);
        });
    }
    
    isMyTurn() {
        if (!this.gameState || this.isAnimating) return false;
        if (this.gameState.isLocalMatch) return true;
        return this.gameState.turn === this.myPlayerIndex;
    }

    updateState(gameState, explicitPrevState = null) {
        const prevState = explicitPrevState || this.gameState;
        this.gameState = gameState;
        this.dirChooser.classList.add('hidden');
        this.renderer.clearHighlights();
        
        // Handle player mapping
        let myData, oppData;
        if (gameState.isLocalMatch) {
             // Let UI flow as Player 0 = A, Player 1 = B
             myData = gameState.players[0];
             oppData = gameState.players[1];
        } else {
             myData = gameState.players[this.myPlayerIndex];
             oppData = gameState.players[this.myPlayerIndex === 0 ? 1 : 0];
        }

        // Update basic info
        document.getElementById('name-a').innerText = myData.name || "P1";
        document.getElementById('name-b').innerText = oppData.name || "P2";
        
        this.scoreA.innerText = myData.score;
        this.scoreB.innerText = oppData.score;
        this.bankUI.innerText = `Kho: ${gameState.bank}`;

        const isMyTurnNow = gameState.isLocalMatch ? true : gameState.turn === this.myPlayerIndex;
        
        if (this.lastTurn !== undefined && this.lastTurn !== gameState.turn) {
             const activePlayerName = gameState.players[gameState.turn].name;
             if (gameState.isLocalMatch) {
                 this.showToast(`Lượt của ${activePlayerName}`);
             } else {
                 if (isMyTurnNow) {
                     this.showToast(`Đến Lượt Bạn (${activePlayerName})!`);
                 } else {
                     this.showToast(`Đến Lượt ${activePlayerName}...`);
                 }
             }
        }
        this.lastTurn = gameState.turn;
        
        // AP
        this.renderAP(this.apA, myData.ap);
        this.renderAP(this.apB, oppData.ap);
        
        // Turn indicator
        const myTurnIndex = gameState.isLocalMatch ? 0 : this.myPlayerIndex;
        const oppTurnIndex = gameState.isLocalMatch ? 1 : (this.myPlayerIndex === 0 ? 1 : 0);
        
        document.getElementById('player-a-panel').classList.toggle('my-turn', gameState.turn === myTurnIndex);
        document.getElementById('player-b-panel').classList.toggle('my-turn', gameState.turn === oppTurnIndex);
        
        if (gameState.turn === myTurnIndex) {
            this.btnEndTurnA.classList.remove('hidden');
            this.btnFreezeA.classList.remove('hidden');
            this.btnEndTurnB.classList.add('hidden');
            this.btnFreezeB.classList.add('hidden');
        } else {
            this.btnEndTurnA.classList.add('hidden');
            this.btnFreezeA.classList.add('hidden');
            this.btnEndTurnB.classList.remove('hidden');
            this.btnFreezeB.classList.remove('hidden');
        }

        // Apply Board Rotation if Player 2 Online
        const boardEl = document.getElementById('board');
        if (!gameState.isLocalMatch && this.myPlayerIndex === 1) {
            boardEl.classList.add('rotated');
        } else {
            boardEl.classList.remove('rotated');
        }

        // Buff effects
        this.scoreA.classList.toggle('x2-active', myData.activeBuffs.x2Harvest);
        this.scoreB.classList.toggle('x2-active', oppData.activeBuffs.x2Harvest);

        // Cards
        this.renderCards(this.myCards, myData.inventory, true); 
        this.renderCards(this.oppCards, oppData.inventory, gameState.isLocalMatch); 
        
        // Board
        if (!this.isAnimating) {
             this.renderer.render(gameState);
        }
        
        // End Game check
        if (gameState.status !== 'playing') {
             this.showGameOver(gameState, prevState);
        } else {
             // Refill check if it's my turn
             if (this.isMyTurn()) {
                  const turnPlayerIndex = this.gameState.isLocalMatch ? this.gameState.turn : this.myPlayerIndex;
                  const activeData = this.gameState.players[turnPlayerIndex];
                  const pits = turnPlayerIndex === 0 ? [1,2,3,4,5] : [7,8,9,10,11];
                  
                  const isSideEmpty = pits.every(index => {
                      const p = gameState.board[index];
                      return p.regularStones === 0 && p.redStones === 0;
                  });

                  if (isSideEmpty && activeData.score >= 5) {
                       // Trigger automatic refill
                       console.log(`Auto-refilling side for player ${turnPlayerIndex}`);
                       this.socket.sendAction({ type: 'refill' });
                  }
             }
        }
    }

    renderAP(container, ap) {
        if (!container) return;
        const dots = container.querySelectorAll('.ap-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index < ap);
        });
    }

    renderCards(container, inventory, faceUp) {
        if (!container) return;
        container.innerHTML = '';
        inventory.forEach((card) => {
            const el = document.createElement('div');
            el.className = faceUp ? 'card-slot' : 'card-slot face-down';
            if (faceUp) {
                el.innerHTML = `
                    <div class="kese-card" data-rarity="${card.rarity}">
                        <div class="card-name">${card.name}</div>
                    </div>
                    <div class="card-tooltip">
                        <h4>${card.name}</h4>
                        <p>${card.desc}</p>
                    </div>
                `;
                el.addEventListener('click', () => this.handleCardClick(card));
            }
            container.appendChild(el);
        });
    }

    handleCardClick(card) {
        if (!this.isMyTurn()) return;
        
        // In local match, ensure we act for the current turn player
        const activePlayerIndex = this.gameState.isLocalMatch ? this.gameState.turn : this.myPlayerIndex;

        // Some cards need targets: Tiếp Tế, Lá Chắn, Sứ Giả
        const needsTarget = ['tiep_te', 'la_chan', 'su_gia'].includes(card.id);
        
        if (needsTarget) {
            this.pendingCardAction = { cardId: card.id, needsTarget: true };
            this.targetHint.classList.remove('hidden');
        } else {
            this.socket.sendAction({ type: 'play-card', cardId: card.id, targetPit: null });
        }
    }

    handlePitClick(pitIndex) {
        if (!this.isMyTurn() || this.isAnimating) return;

        // 1. Pending Card Action
        if (this.pendingCardAction && this.pendingCardAction.needsTarget) {
            this.socket.sendAction({ 
                type: 'play-card', 
                cardId: this.pendingCardAction.cardId, 
                targetPit: pitIndex 
            });
            this.pendingCardAction = null;
            this.targetHint.classList.add('hidden');
            return;
        }
        
        // 1b. Pending Freeze Action
        if (this.pendingAction === 'freeze') {
            this.socket.sendAction({ type: 'freeze-pit', targetPit: pitIndex });
            this.pendingAction = null;
            this.targetHint.classList.add('hidden');
            return;
        }

        // 2. Normal Move
        const board = this.gameState.board;
        
        let activePlayerIndex = this.myPlayerIndex;
        if (this.gameState.isLocalMatch) {
            activePlayerIndex = this.gameState.turn;
        }
        
        const activeData = this.gameState.players[activePlayerIndex];
        
        // Check ownership
        const isMyPit = (activePlayerIndex === 0 && pitIndex >= 1 && pitIndex <= 5) || 
                        (activePlayerIndex === 1 && pitIndex >= 7 && pitIndex <= 11);
                        
        // Allow opponent pit if Mượn Gió active
        const canPick = isMyPit || activeData.activeBuffs.muonGioActive;

        if (canPick && (board[pitIndex].regularStones > 0 || board[pitIndex].redStones > 0) && !board[pitIndex].isLocked) {
             this.selectedPit = pitIndex;
             this.renderer.clearHighlights();
             this.renderer.highlightPits([pitIndex]);
             this.dirChooser.classList.remove('hidden');
        } else if (!isMyPit) {
             this.showToast("Không phải ô của bạn!");
        }
    }

    sendMove(pitIndex, direction) {
        this.socket.sendAction({ type: 'move', startPit: pitIndex, direction });
    }
    
    async showGameOver(gameState, prevState) {
        // Find pits with leftover stones from the PREVIOUS state 
        // (since the server might have already cleared them in the final state)
        const stateToUse = (prevState && prevState.status === 'playing') ? prevState : gameState;
        
        const leftovers = stateToUse.board.map((p, i) => ({ 
            index: i, 
            count: p.regularStones + p.redStones 
        })).filter(p => p.count > 0);

        if (leftovers.length > 0) {
            this.showToast("Kết thúc! Đang thu quân...");
            for (const item of leftovers) {
                const owner = (item.index >= 1 && item.index <= 5) ? 0 : (item.index >= 7 && item.index <= 11 ? 1 : null);
                if (owner !== null) {
                    this.renderer.flyStones(item.index, owner, item.count);
                    await this.renderer.sleep(200);
                }
            }
            await this.renderer.sleep(1000);
        }

        this.gameOverModal.classList.remove('hidden');
        const title = document.getElementById('go-title');
        const desc = document.getElementById('go-desc');
        
        let winnerText = "";
        if (gameState.status === 'draw') {
             winnerText = "Hòa!";
        } else {
             const winnerIndex = gameState.winner;
             if (gameState.isLocalMatch) {
                 winnerText = winnerIndex === 0 ? "Người chơi 1 thắng! 🎉" : "Người chơi 2 thắng! 🎉";
             } else {
                 winnerText = winnerIndex === this.myPlayerIndex ? "Chiến Thắng! 🎉" : "Thất Bại 💀";
             }
        }
        
        if (!this.statsSaved) {
            this.statsSaved = true;
            // Only record stats for actual PvP matches
            if (!gameState.isLocalMatch && !gameState.players[1].isBot) {
                 const stats = JSON.parse(localStorage.getItem('oanquan_stats')) || { played: 0, won: 0, streak: 0 };
                 stats.played += 1;
                 if (gameState.status !== 'draw' && gameState.winner === this.myPlayerIndex) {
                     stats.won += 1;
                     stats.streak += 1;
                 } else if (gameState.status !== 'draw' && gameState.winner !== this.myPlayerIndex) {
                     stats.streak = 0;
                 }
                 localStorage.setItem('oanquan_stats', JSON.stringify(stats));
            }
        }
        
        if (gameState.isPrivate || gameState.isLocalMatch) {
            document.getElementById('btn-rematch').classList.remove('hidden');
        } else {
            document.getElementById('btn-rematch').classList.add('hidden');
        }
        
        title.innerText = winnerText;
        desc.innerText = `Điểm cuối cùng:\n${gameState.players[0].name}: ${gameState.players[0].score}\n${gameState.players[1].name}: ${gameState.players[1].score}`;
    }
}
