export default class Matchmaker {
    constructor(io, gameManager) {
        this.io = io;
        this.gameManager = gameManager;
        this.queue = [];
    }

    addPlayer(socket, mode) {
        // Prevent duplicate queueing
        if (this.queue.find(p => p.socket.id === socket.id)) return;
        
        console.log(`Player joined queue: ${socket.id} (Mode: ${mode})`);
        this.queue.push({ socket, mode });
        this.checkQueue();
    }

    removePlayer(socketId) {
        this.queue = this.queue.filter(p => p.socket.id !== socketId);
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
                       
                       console.log(`Match found: ${pA.socket.id} vs ${pB.socket.id} (${pA.mode})`);
                       this.gameManager.createMatch(pA.socket, pB.socket, pA.mode);
                       return; // Need to recursively check but usually only 1 match added
                  }
             }
        }
    }
}
