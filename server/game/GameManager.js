import GameState, { PLAYER_A, PLAYER_B } from './GameState.js';
import { SowingEngine } from './SowingEngine.js';
import { CardSystem } from './CardSystem.js';
import AIPlayer from './AIPlayer.js';

export default class GameManager {
    constructor(io) {
        this.io = io;
        this.games = new Map(); // roomId -> GameState
        this.playerRooms = new Map(); // playerId -> roomId
        this.timers = new Map(); // roomId -> { type: 'main'|'warning'|'fallback', id: timeoutId }
        this.disconnectTimers = new Map(); // playerId -> timeoutId
    }

    createMatch(playerA_socket, playerB_socket, mode = 'tactical', names = null, startingTurn = 0, matchOptions = {}) {
        const roomId = `room_${Date.now()}`;
        const gs = new GameState(playerA_socket.id, playerB_socket.id, false, false, mode, names, startingTurn);
        gs.isPrivate = matchOptions.isPrivate || false;
        
        gs.turn = startingTurn;
        if (names && names.length >= 2) {
            gs.players[0].name = names[0];
            gs.players[1].name = names[1];
        }

        this.games.set(roomId, gs);
        this.playerRooms.set(playerA_socket.id, roomId);
        this.playerRooms.set(playerB_socket.id, roomId);

        playerA_socket.join(roomId);
        playerB_socket.join(roomId);

        this.io.to(roomId).emit('game-start', { roomId, state: gs });
        this.prepareTurnTimer(roomId);
    }
    
    createBotMatch(playerSocket, mode = 'tactical', difficulty = 'easy') {
        const roomId = `room_bot_${Date.now()}`;
        const botId = `bot_${Date.now()}`;
        const gs = new GameState(playerSocket.id, botId, true, false, mode, null, 0, difficulty);
        
        this.games.set(roomId, gs);
        this.playerRooms.set(playerSocket.id, roomId);
        this.playerRooms.set(botId, roomId); // Fix missing bot assignment
        playerSocket.join(roomId);
        
        this.io.to(roomId).emit('game-start', { roomId, state: gs });
    }

    createLocalMatch(playerSocket, mode = 'tactical', names = null, startingTurn = 0) {
        console.log(`CREATE LOCAL MATCH: mode=${mode}, startingTurn=${startingTurn}`);
        const roomId = `room_local_${Date.now()}`;
        const localOpponentId = `local_opp_${Date.now()}`;
        const gs = new GameState(playerSocket.id, localOpponentId, false, true, mode, names, startingTurn);
        
        // Final override to be absolutely sure
        gs.turn = startingTurn;
        if (names && names.length >= 2) {
            console.log(`Setting local names: ${names[0]} vs ${names[1]}`);
            gs.players[0].name = names[0];
            gs.players[1].name = names[1];
        }

        this.games.set(roomId, gs);
        this.playerRooms.set(playerSocket.id, roomId);
        this.playerRooms.set(localOpponentId, roomId);
        playerSocket.join(roomId);
        
        this.io.to(roomId).emit('game-start', { roomId, state: gs });
        // No timer for local match
    }

    clearTimer(roomId) {
        if (this.timers.has(roomId)) {
            clearTimeout(this.timers.get(roomId).id);
            this.timers.delete(roomId);
        }
    }

    startTurnTimer(roomId) {
        this.clearTimer(roomId);
        const gs = this.games.get(roomId);
        if (!gs || gs.isLocalMatch || gs.players[1].isBot || gs.status !== 'playing') return;

        const timeoutId = setTimeout(() => {
            this.io.to(roomId).emit('timer-warning', { turn: gs.turn });
            
            // 5s warning timer
            this.timers.set(roomId, {
                type: 'warning',
                id: setTimeout(() => {
                    this.forceNextTurn(roomId);
                }, 5000)
            });
        }, 30000);

        this.timers.set(roomId, { type: 'main', id: timeoutId });
        this.io.to(roomId).emit('timer-start', { duration: 30, turn: gs.turn });
    }

    prepareTurnTimer(roomId) {
        this.clearTimer(roomId);
        const gs = this.games.get(roomId);
        if (!gs || gs.isLocalMatch || gs.players[1].isBot || gs.status !== 'playing') return;

        // Fallback timer (60s) in case client doesn't send 'timer-ready'
        const fallbackId = setTimeout(() => {
            console.log(`Timer fallback triggered for room ${roomId}`);
            this.startTurnTimer(roomId);
        }, 60000);

        this.timers.set(roomId, { type: 'fallback', id: fallbackId });
    }

    forceNextTurn(roomId) {
        const gs = this.games.get(roomId);
        if (!gs || gs.status !== 'playing') return;
        
        gs.nextTurn();
        this.io.to(roomId).emit('state-update', { state: gs, reason: 'timeout' });
        gs.checkGameStatus();
        if (gs.status === 'playing') {
            this.startTurnTimer(roomId);
        }
    }

    handleAction(playerId, actionData) {
        const roomId = this.playerRooms.get(playerId);
        if (!roomId) {
            this.io.to(playerId).emit('action-error', 'Lỗi: Mất kết nối hoặc phiên chơi đã kết thúc. Vui lòng tải lại trang (F5).');
            return;
        }

        const gs = this.games.get(roomId);
        if (!gs || gs.status !== 'playing') {
            this.io.to(playerId).emit('action-error', 'Lỗi: Trò chơi không tồn tại hoặc đã kết thúc.');
            return;
        }

        // Verify turn
        let playerIndex = gs.players[0].id === playerId ? PLAYER_A : PLAYER_B;
        if (gs.isLocalMatch) {
             playerIndex = gs.turn; // Trust local client to act on behalf of both
        } else if (gs.turn !== playerIndex && actionData.type !== 'timer-extend') {
             this.io.to(playerId).emit('action-error', 'Chưa đến lượt của bạn hoặc lượt đã qua do hết thời gian!');
             return;
        }

        // Handle timer events
        if (actionData.type === 'timer-extend') {
            const timer = this.timers.get(roomId);
            if (timer && timer.type === 'warning') {
                this.startTurnTimer(roomId);
            }
            return;
        }
        if (actionData.type === 'timer-skip') {
            const timer = this.timers.get(roomId);
            if (timer && timer.type === 'warning') {
                this.forceNextTurn(roomId);
            }
            return;
        }
        if (actionData.type === 'timer-ready') {
            const timer = this.timers.get(roomId);
            if (timer && (timer.type === 'fallback' || !timer)) {
                // Verify it's actually the active player's signal
                if (gs.turn === playerIndex) {
                    this.startTurnTimer(roomId);
                }
            }
            return;
        }

        let steps = null;

        try {
            if (actionData.type === 'move') {
                const { startPit, direction } = actionData;
                
                // Modifier check 
                const useCanQuet = gs.players[playerIndex].activeBuffs.canQuetActive || false;
                let actualStartPit = startPit;
                
                // Mượn Gió check (allowing start pit from opponent's side)
                const bypassOwnerCheck = gs.players[playerIndex].activeBuffs.muonGioActive || false;

                steps = SowingEngine.sow(gs, actualStartPit, direction, useCanQuet, bypassOwnerCheck);
                if (steps.error) {
                    this.io.to(playerId).emit('action-error', steps.error);
                    return;
                }

                // Used buffs? Remove them
                gs.players[playerIndex].activeBuffs.canQuetActive = false;
                gs.players[playerIndex].activeBuffs.doiChieuActive = false;
                gs.players[playerIndex].activeBuffs.muonGioActive = false;

                // Do NOT enforce gs.nextTurn() right away unless AP is 0 
                // OR player must press "Kết thúc lượt"
                if (gs.players[playerIndex].activeBuffs.lienHoanActive) {
                    gs.players[playerIndex].activeBuffs.lienHoanActive = false; // consume it
                    this.prepareTurnTimer(roomId); // Wait for bonus turn animation
                } else if (gs.players[playerIndex].ap <= 0 || gs.mode === 'classic') {
                    gs.nextTurn();
                    this.prepareTurnTimer(roomId);
                } else {
                    this.prepareTurnTimer(roomId); // Reset timer after an action
                }
            } else if (actionData.type === 'buy-card') {
                const res = CardSystem.buyCard(gs, playerIndex);
                if (!res.success) {
                    this.io.to(playerId).emit('action-error', res.reason);
                    return;
                }
            } else if (actionData.type === 'play-card') {
                const res = CardSystem.useCard(gs, playerIndex, actionData.cardId, actionData.targetPit);
                if (!res.success) {
                    this.io.to(playerId).emit('action-error', res.reason);
                    return;
                }
                
                this.io.to(roomId).emit('state-update', { 
                    actionData: actionData, 
                    state: gs 
                });
                
                gs.checkGameStatus();
                this.prepareTurnTimer(roomId);
            } else if (actionData.type === 'freeze-pit') {
                const player = gs.players[playerIndex];
                if (player.ap < 2) {
                    this.io.to(playerId).emit('action-error', "Không đủ 2 AP để đóng băng (Freeze requires 2 AP)!");
                    return;
                }
                if (actionData.targetPit === null || actionData.targetPit === 0 || actionData.targetPit === 6) {
                    this.io.to(playerId).emit('action-error', "Chỉ có thể đóng băng ô Dân.");
                    return;
                }
                if (gs.board[actionData.targetPit].isLocked) {
                    this.io.to(playerId).emit('action-error', "Ô này đã bị đóng băng rồi.");
                    return;
                }
                
                player.ap -= 2;
                gs.board[actionData.targetPit].isLocked = true;
                
                this.io.to(roomId).emit('state-update', { state: gs });
            } else if (actionData.type === 'end-turn') {
                gs.nextTurn();
                this.startTurnTimer(roomId);
            } else if (actionData.type === 'refill') {
                // Front end requests a refill
                if (!gs.refillSide(playerIndex)) {
                     this.io.to(playerId).emit('action-error', 'Cannot refill (score < 5)');
                }
            }

            gs.checkGameStatus();
            if (gs.status !== 'playing') {
                this.clearTimer(roomId);
            }
            
            // Broadcast state update
            this.io.to(roomId).emit('state-update', { state: gs, steps, actionData });
            
            // Automatically play bot turn if it's bot's turn
            if (gs.status === 'playing' && gs.players[gs.turn].isBot) {
                let delay = 1500;
                if (steps) {
                    delay = steps.length * 1000 + 1000;
                }
                setTimeout(() => this.playBotTurn(roomId), delay);
            }

        } catch (e) {
            console.error("Game error:", e);
            this.io.to(playerId).emit('action-error', 'Đã xảy ra lỗi xử lý logic game. Vui lòng thử lại hoặc tải lại trang.');
        }
    }
    
    playBotTurn(roomId) {
        const gs = this.games.get(roomId);
        if (!gs || gs.status !== 'playing' || !gs.players[gs.turn].isBot) return;

        // 1. First check if side is empty and needs refill or results in bankruptcy
        if (gs.isPlayersSideEmpty(gs.turn)) {
            if (!gs.refillSide(gs.turn)) {
                // Bankruptcy!
                gs.checkGameStatus();
                this.io.to(roomId).emit('state-update', { state: gs, actionData: { type: 'bankruptcy' } });
                return;
            } else {
                // Refilled successfully
                this.io.to(roomId).emit('state-update', { state: gs, actionData: { type: 'refill' } });
            }
        }
        
        // 2. Perform AI move
        if (gs.players[gs.turn].ap > 0 || gs.mode === 'classic') {
            const action = AIPlayer.getBestMove(gs);
            if (action) {
                this.handleAction(gs.players[gs.turn].id, action);
            } else {
                this.handleAction(gs.players[gs.turn].id, { type: 'end-turn' });
            }
        } else {
            this.handleAction(gs.players[gs.turn].id, { type: 'end-turn' });
        }
    }

    handleRematch(playerId) {
        const roomId = this.playerRooms.get(playerId);
        if (!roomId) return;

        const gs = this.games.get(roomId);
        if (!gs) return;

        if (gs.isLocalMatch) {
            // Local match: Just restart immediately
            const p1 = gs.players[0].name;
            const p2 = gs.players[1].name;
            const mode = gs.mode;
            const goesFirst = Math.random() < 0.5 ? 0 : 1;
            
            const newGs = new GameState(gs.players[0].id, gs.players[1].id, false, true, mode, [p1, p2], goesFirst);
            this.games.set(roomId, newGs);
            this.io.to(roomId).emit('game-start', { roomId, state: newGs });
            return;
        }

        if (gs.players[1].isBot) {
            // Bot match
            const mode = gs.mode;
            const newGs = new GameState(gs.players[0].id, gs.players[1].id, true, false, mode);
            this.games.set(roomId, newGs);
            this.io.to(roomId).emit('game-start', { roomId, state: newGs });
            return;
        }

        if (!gs.rematchRequests) {
            gs.rematchRequests = new Set();
        }
        
        gs.rematchRequests.add(playerId);

        if (gs.rematchRequests.size === 2) {
            // Both requested, restart!
            const pA = gs.players[0];
            const pB = gs.players[1];
            const goesFirst = Math.random() < 0.5 ? 0 : 1;
            const newGs = new GameState(pA.id, pB.id, false, false, gs.mode, [pA.name, pB.name], goesFirst);
            newGs.isPrivate = gs.isPrivate;
            this.games.set(roomId, newGs);
            this.io.to(roomId).emit('game-start', { roomId, state: newGs });
            this.prepareTurnTimer(roomId);
        } else {
            // Notify the other player
            this.io.to(roomId).emit('rematch-requested', { by: playerId });
        }
    }

    handlePlayerLeave(playerId) {
        const roomId = this.playerRooms.get(playerId);
        if (roomId) {
            this.io.to(roomId).emit('opponent-disconnected', { reconnecting: false });
            this.clearTimer(roomId);
            this.games.delete(roomId);
            for (let [pId, rId] of this.playerRooms.entries()) {
                if (rId === roomId) this.playerRooms.delete(pId);
            }
        }
    }

    handleReconnect(playerId, socket) {
        if (this.disconnectTimers.has(playerId)) {
            clearTimeout(this.disconnectTimers.get(playerId));
            this.disconnectTimers.delete(playerId);
        }
        
        const roomId = this.playerRooms.get(playerId);
        if (roomId) {
            socket.join(roomId);
            const gs = this.games.get(roomId);
            if (gs) {
                // Ensure socket is joined to the room
                this.io.to(roomId).emit('opponent-reconnected');
                socket.emit('game-start', { roomId, state: gs });
            }
        }
    }

    handleDisconnect(playerId) {
        const roomId = this.playerRooms.get(playerId);
        if (roomId) {
            const gs = this.games.get(roomId);
            
            // If local or bot match, just end immediately
            if (!gs || gs.isLocalMatch || gs.players[1].isBot) {
                this.handlePlayerLeave(playerId);
                return;
            }

            this.io.to(roomId).emit('opponent-disconnected', { reconnecting: true });
            
            const timeoutId = setTimeout(() => {
                this.handlePlayerLeave(playerId);
                this.disconnectTimers.delete(playerId);
            }, 60000); // 60 seconds to reconnect
            
            this.disconnectTimers.set(playerId, timeoutId);
        }
    }
}
