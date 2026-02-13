const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { generateRoomCode } = require('./roomCodes');
const GameRoom = require('./GameRoom');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

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
