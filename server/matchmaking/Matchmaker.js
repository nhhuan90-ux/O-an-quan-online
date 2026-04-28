export default class Matchmaker {
    constructor(io, gameManager) {
        this.io = io;
        this.gameManager = gameManager;
        this.queue = [];
        this.privateRooms = new Map(); // code -> { socket, mode, name }
    }

    addPlayer(socket, mode, name) {
        // Prevent duplicate queueing
        if (this.queue.find(p => p.socket.id === socket.id)) return;
        
        console.log(`Player joined queue: ${socket.id} (Mode: ${mode}, Name: ${name})`);
        this.queue.push({ socket, mode, name });
        this.checkQueue();
    }

    removePlayer(socketId) {
        this.queue = this.queue.filter(p => p.socket.id !== socketId);
        
        // Remove from private rooms if waiting
        for (const [code, roomInfo] of this.privateRooms.entries()) {
             if (roomInfo.socket.id === socketId) {
                  this.privateRooms.delete(code);
                  console.log(`Private room ${code} deleted because host disconnected.`);
             }
        }
    }

    createPrivateRoom(socket, mode, name) {
        let code;
        do {
            code = Math.floor(10000 + Math.random() * 90000).toString();
        } while (this.privateRooms.has(code));

        this.privateRooms.set(code, { socket, mode, name });
        console.log(`Private room created: ${code} by ${name} (${mode})`);
        
        socket.emit('private-room-created', { code });
        return code;
    }

    joinPrivateRoom(socket, code, name) {
        if (!this.privateRooms.has(code)) {
             socket.emit('action-error', 'Mã phòng không hợp lệ hoặc phòng đã bị hủy.');
             return false;
        }

        const host = this.privateRooms.get(code);
        this.privateRooms.delete(code);

        console.log(`Private room match: ${host.name} vs ${name} (${code})`);
        const goesFirst = Math.random() < 0.5 ? 0 : 1;
        this.gameManager.createMatch(host.socket, socket, host.mode, [host.name, name], goesFirst, { isPrivate: true, roomCode: code });
        return true;
    }

    checkQueue() {
        // Find pairs of same mode
        for (let i = 0; i < this.queue.length; i++) {
             for (let j = i + 1; j < this.queue.length; j++) {
                  if (this.queue[i].mode === this.queue[j].mode) {
                       const pA = this.queue[i];
                       const pB = this.queue[j]; // get matched pairs

                       // remove from queue
                       this.queue.splice(j, 1);
                       this.queue.splice(i, 1);
                       
                       const goesFirst = Math.random() < 0.5 ? 0 : 1;
                       console.log(`Match found: ${pA.name} vs ${pB.name} (${pA.mode})`);
                       this.gameManager.createMatch(pA.socket, pB.socket, pA.mode, [pA.name, pB.name], goesFirst);
                       return; // Need to recursively check but usually only 1 match added
                  }
             }
        }
    }
}
