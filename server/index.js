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
  console.log(`User connected: ${socket.id}`);

  // Matchmaking
  socket.on('join-queue', (options) => {
    matchmaker.addPlayer(socket, options?.mode || 'tactical', options?.name || 'Vô danh');
  });

  socket.on('leave-queue', () => {
    matchmaker.removePlayer(socket.id);
  });
  
  socket.on('start-bot-match', (options) => {
     gameManager.createBotMatch(socket, options?.mode || 'tactical');
  });

  socket.on('start-local-match', (options) => {
    gameManager.createLocalMatch(socket, options?.mode || 'tactical', options?.names, options?.startingTurn || 0);
  });

  // Game actions
  socket.on('game-action', (data) => {
    gameManager.handleAction(socket.id, data);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    matchmaker.removePlayer(socket.id);
    gameManager.handleDisconnect(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
