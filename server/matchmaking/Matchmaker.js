export default class Matchmaker {
    constructor(io, gameManager) {
        this.io = io;
        this.gameManager = gameManager;
        this.queue = [];
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
