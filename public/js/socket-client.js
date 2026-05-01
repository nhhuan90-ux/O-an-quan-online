export default class SocketClient {
    constructor() {
        let playerId = localStorage.getItem('oanquan_playerId');
        if (!playerId) {
            playerId = 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('oanquan_playerId', playerId);
        }
        
        this.playerId = playerId;
        this.socket = io({
            auth: { playerId: this.playerId }
        });
        
        this.handlers = {};

        // Wire up all registered handlers
        this.socket.onAny((event, ...args) => {
            if (this.handlers[event]) {
                this.handlers[event].forEach(cb => cb(...args));
            }
        });
    }

    on(event, callback) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(callback);
    }

    joinQueue(mode, name) {
        this.socket.emit('join-queue', { mode, name });
    }

    leaveQueue() {
        this.socket.emit('leave-queue');
    }
    
    startBotMatch(mode, difficulty = 'easy') {
        this.socket.emit('start-bot-match', { mode, difficulty });
    }

    startLocalMatch(mode, names = null, startingTurn = 0) {
        this.socket.emit('start-local-match', { mode, names, startingTurn });
    }

    createPrivateRoom(mode, name) {
        this.socket.emit('create-private-room', { mode, name });
    }

    joinPrivateRoom(code, name) {
        this.socket.emit('join-private-room', { code, name });
    }

    requestRematch() {
        this.socket.emit('rematch-request');
    }

    sendAction(actionData) {
        this.socket.emit('game-action', actionData);
    }

    emit(event, data) {
        this.socket.emit(event, data);
    }
    
    getId() {
        return this.playerId;
    }
}
