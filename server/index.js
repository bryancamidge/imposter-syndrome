const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { generateRoomCode } = require('./roomCodes');
const GameRoom = require('./GameRoom');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingInterval: 25000,
  pingTimeout: 180000,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// In-memory store of active rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on('room:create', ({ playerName }) => {
    const roomCode = generateRoomCode(rooms);
    const room = new GameRoom(roomCode, io);
    rooms.set(roomCode, room);
    room.addPlayer(socket, playerName, true);
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    const code = roomCode.toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) {
      socket.emit('room:error', { message: 'Room not found' });
      return;
    }
    room.addPlayer(socket, playerName, false);
  });

  socket.on('room:rejoin', ({ roomCode, playerName }) => {
    const code = roomCode.toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) {
      socket.emit('room:error', { message: 'Room not found' });
      return;
    }
    const disconnected = room.players.findDisconnectedByName(playerName);
    if (!disconnected) {
      socket.emit('room:error', { message: 'No disconnected player found with that name' });
      return;
    }
    room.reconnectPlayer(disconnected.id, socket);
  });

  socket.on('room:leave', () => {
    for (const [code, room] of rooms) {
      if (room.hasPlayer(socket.id)) {
        room.leavePlayer(socket.id);
        socket.leave(code);
        if (room.isEmpty()) {
          rooms.delete(code);
          console.log(`Room ${code} deleted (empty after leave)`);
        }
        break;
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    for (const [code, room] of rooms) {
      if (room.hasPlayer(socket.id)) {
        room.handleDisconnect(socket.id);
        if (room.isEmpty()) {
          rooms.delete(code);
          console.log(`Room ${code} deleted (empty)`);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
