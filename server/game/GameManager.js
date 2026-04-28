import GameState, { PLAYER_A, PLAYER_B } from './GameState.js';
import { SowingEngine } from './SowingEngine.js';
import { CardSystem } from './CardSystem.js';
import AIPlayer from './AIPlayer.js';

export default class GameManager {
    constructor(io) {
        this.io = io;
        this.games = new Map(); // roomId -> GameState
        this.playerRooms = new Map(); // socketId -> roomId
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
    }
    
    createBotMatch(playerSocket, mode = 'tactical') {
        const roomId = `room_bot_${Date.now()}`;
        const botId = `bot_${Date.now()}`;
        const gs = new GameState(playerSocket.id, botId, true, false, mode);
        
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
    }

    handleAction(socketId, actionData) {
        const roomId = this.playerRooms.get(socketId);
        if (!roomId) return;

        const gs = this.games.get(roomId);
        if (!gs || gs.status !== 'playing') return;

        // Verify turn
        let playerIndex = gs.players[0].id === socketId ? PLAYER_A : PLAYER_B;
        if (gs.isLocalMatch) {
             playerIndex = gs.turn; // Trust local client to act on behalf of both
        } else if (gs.turn !== playerIndex) {
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
                    this.io.to(socketId).emit('action-error', steps.error);
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
                } else if (gs.players[playerIndex].ap <= 0) {
                    gs.nextTurn();
                }
            } else if (actionData.type === 'buy-card') {
                const res = CardSystem.buyCard(gs, playerIndex);
                if (!res.success) {
                    this.io.to(socketId).emit('action-error', res.reason);
                    return;
                }
            } else if (actionData.type === 'play-card') {
                const res = CardSystem.useCard(gs, playerIndex, actionData.cardId, actionData.targetPit);
                if (!res.success) {
                    this.io.to(socketId).emit('action-error', res.reason);
                    return;
                }
                
                this.io.to(roomId).emit('state-update', { 
                    actionData: actionData, 
                    state: gs 
                });
                
                gs.checkGameStatus();
            } else if (actionData.type === 'freeze-pit') {
                const player = gs.players[playerIndex];
                if (player.ap < 3) {
                    this.io.to(socketId).emit('action-error', "Không đủ 3 AP để đóng băng (Freeze requires 3 AP)!");
                    return;
                }
                if (actionData.targetPit === null || actionData.targetPit === 0 || actionData.targetPit === 6) {
                    this.io.to(socketId).emit('action-error', "Chỉ có thể đóng băng ô Dân.");
                    return;
                }
                if (gs.board[actionData.targetPit].isLocked) {
                    this.io.to(socketId).emit('action-error', "Ô này đã bị đóng băng rồi.");
                    return;
                }
                
                player.ap -= 3;
                gs.board[actionData.targetPit].isLocked = true;
                
                this.io.to(roomId).emit('state-update', { state: gs });
            } else if (actionData.type === 'end-turn') {
                gs.nextTurn();
            } else if (actionData.type === 'refill') {
                // Front end requests a refill
                if (!gs.refillSide(playerIndex)) {
                     this.io.to(socketId).emit('action-error', 'Cannot refill (score < 5)');
                }
            }

            gs.checkGameStatus();
            
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
        }
    }
    
    playBotTurn(roomId) {
        const gs = this.games.get(roomId);
        if (!gs || gs.status !== 'playing' || !gs.players[gs.turn].isBot) return;
        
        if (gs.players[gs.turn].ap > 0) {
            const action = AIPlayer.getBestMove(gs);
            if (action) {
                if (action.type === 'move') {
                     // Might need to refill first if empty
                     if (gs.isPlayersSideEmpty(gs.turn)) {
                         if (gs.refillSide(gs.turn)) {
                             this.io.to(roomId).emit('state-update', { state: gs, actionData: { type: 'refill' } });
                         } else {
                             // Bankruptcy
                             gs.checkGameStatus();
                             this.io.to(roomId).emit('state-update', { state: gs });
                             return;
                         }
                     }
                     this.handleAction(gs.players[gs.turn].id, action);
                }
            } else {
                this.handleAction(gs.players[gs.turn].id, { type: 'end-turn' });
            }
        } else {
            this.handleAction(gs.players[gs.turn].id, { type: 'end-turn' });
        }
    }

    handleRematch(socketId) {
        const roomId = this.playerRooms.get(socketId);
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
        
        gs.rematchRequests.add(socketId);

        if (gs.rematchRequests.size === 2) {
            // Both requested, restart!
            const pA = gs.players[0];
            const pB = gs.players[1];
            const goesFirst = Math.random() < 0.5 ? 0 : 1;
            const newGs = new GameState(pA.id, pB.id, false, false, gs.mode, [pA.name, pB.name], goesFirst);
            newGs.isPrivate = gs.isPrivate;
            this.games.set(roomId, newGs);
            this.io.to(roomId).emit('game-start', { roomId, state: newGs });
        } else {
            // Notify the other player
            this.io.to(roomId).emit('rematch-requested', { by: socketId });
        }
    }

    handleDisconnect(socketId) {
        const roomId = this.playerRooms.get(socketId);
        if (roomId) {
            this.io.to(roomId).emit('opponent-disconnected');
            this.games.delete(roomId);
            this.playerRooms.delete(socketId);
        }
    }
}
