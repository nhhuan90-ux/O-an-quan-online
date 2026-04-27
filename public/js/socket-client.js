export default class SocketClient {
    constructor() {
        this.socket = io();
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

    joinQueue(mode) {
        this.socket.emit('join-queue', { mode });
    }

    leaveQueue() {
        this.socket.emit('leave-queue');
    }
    
    startBotMatch(mode) {
        this.socket.emit('start-bot-match', { mode });
    }

    startLocalMatch(mode, names = null, startingTurn = 0) {
        this.socket.emit('start-local-match', { mode, names, startingTurn });
    }

    sendAction(actionData) {
        this.socket.emit('game-action', actionData);
    }
    
    getId() {
        return this.socket.id;
    }
}
