import express from 'express';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import GameManager from './game/GameManager.js';
import Matchmaker from './matchmaking/Matchmaker.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(compression());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the public directory with caching
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1d',
  setHeaders: (res, filepath) => {
    // Check if file is inside the assets directory
    if (filepath.replace(/\\/g, '/').includes('be-ca-thuy-sinh/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filepath.endsWith('.js') || filepath.endsWith('.css')) {
      if (process.env.NODE_ENV === 'production') {
        // Cache JS and CSS for 1 day in production to optimize bandwidth
        res.setHeader('Cache-Control', 'public, max-age=86400');
      } else {
        // Prevent caching of JS and CSS scripts/styles in development to ensure updates are served immediately
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }
}));

// Database file path for aquarium saves
const DB_FILE = path.join(__dirname, 'aquariums.json');

async function readAquariums() {
  try {
    if (!existsSync(DB_FILE)) {
      return {};
    }
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error("Error reading aquariums db:", err);
    return {};
  }
}

async function writeAquariums(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing aquariums db:", err);
  }
}

function generateCode(existingCodes) {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (existingCodes.has(code));
  return code;
}

// Save aquarium state
app.post('/api/aquarium/save', async (req, res) => {
  try {
    let { code, state } = req.body;
    const db = await readAquariums();
    
    if (!code || !db[code]) {
      // Generate a new 6-digit code
      code = generateCode(new Set(Object.keys(db)));
    }
    
    db[code] = {
      state,
      updatedAt: new Date().toISOString()
    };
    
    await writeAquariums(db);
    res.json({ success: true, code, state });
  } catch (err) {
    console.error("Error saving aquarium:", err);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi lưu bể cá" });
  }
});

// Load aquarium state
app.get('/api/aquarium/load/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const db = await readAquariums();
    
    if (db[code]) {
      res.json({ success: true, code, state: db[code].state });
    } else {
      res.status(404).json({ success: false, message: "Không tìm thấy bể cá với mã này" });
    }
  } catch (err) {
    console.error("Error loading aquarium:", err);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi tải bể cá" });
  }
});

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
  
  socket.on('chat-message', (data) => {
    const roomId = gameManager.playerRooms.get(socket.playerId);
    if (roomId) {
      io.to(roomId).emit('chat-message', {
        playerId: socket.playerId,
        text: data.text,
        type: data.type || 'text'
      });
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
