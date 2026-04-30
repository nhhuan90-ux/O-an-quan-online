import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import GameManager from './game/GameManager.js';
import Matchmaker from './matchmaking/Matchmaker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3000;

// Initialize GameManager and Matchmaker
const gameManager = new GameManager(io);
const matchmaker = new Matchmaker(io, gameManager);

io.on('connection', (socket) => {
  const playerId = socket.handshake.auth.playerId || socket.id;
  socket.playerId = playerId;
  socket.join(playerId);
  
  console.log(`User connected: ${socket.id} (PlayerID: ${playerId})`);
  
  // Try to reconnect if they were in a game
  gameManager.handleReconnect(playerId, socket);

  // Matchmaking
  socket.on('join-queue', (options) => {
    matchmaker.addPlayer(socket, options?.mode || 'tactical', options?.name || 'Vô danh');
  });

  socket.on('leave-queue', () => {
    matchmaker.removePlayer(socket.playerId);
  });
  
  socket.on('start-bot-match', (options) => {
     gameManager.createBotMatch(socket, options?.mode || 'tactical', options?.difficulty || 'easy');
  });

  socket.on('start-local-match', (options) => {
    gameManager.createLocalMatch(socket, options?.mode || 'tactical', options?.names, options?.startingTurn || 0);
  });

  socket.on('create-private-room', (options) => {
    matchmaker.createPrivateRoom(socket, options?.mode || 'tactical', options?.name || 'Vô danh');
  });

  socket.on('join-private-room', (options) => {
    matchmaker.joinPrivateRoom(socket, options?.code, options?.name || 'Vô danh');
  });

  socket.on('rematch-request', () => {
    gameManager.handleRematch(socket.playerId);
  });

  // Game actions
  socket.on('game-action', (data) => {
    if (data.type === 'leave-game') {
        gameManager.handlePlayerLeave(socket.playerId);
    } else {
        gameManager.handleAction(socket.playerId, data);
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id} (PlayerID: ${socket.playerId})`);
    matchmaker.removePlayer(socket.playerId);
    gameManager.handleDisconnect(socket.playerId);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
