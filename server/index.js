import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory Room State Store
// rooms[roomId] = { id, title, includeHalfPoints, revealed, participants, history }
const rooms = {};

const DEFAULT_DECK = [0.5, 1, 2, 3, 4, 5, 6, '?', '☕'];
const HALF_POINTS_DECK = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, '?', '☕'];

function getOrCreateRoom(roomId) {
  const cleanId = (roomId || 'default').toLowerCase().trim();
  if (!rooms[cleanId]) {
    rooms[cleanId] = {
      id: cleanId,
      title: '',
      includeHalfPoints: false,
      revealed: false,
      participants: {},
      history: []
    };
  }
  return rooms[cleanId];
}

function calculateStats(participants) {
  const numericVotes = [];
  const dist = {};
  let validVotersCount = 0;

  Object.values(participants).forEach(p => {
    if (!p.isObserver && p.vote !== null && p.vote !== undefined && p.isConnected) {
      validVotersCount++;
      dist[p.vote] = (dist[p.vote] || 0) + 1;
      const num = parseFloat(p.vote);
      if (!isNaN(num)) {
        numericVotes.push(num);
      }
    }
  });

  if (numericVotes.length === 0) {
    return {
      rawAverage: 0,
      finalPoints: 0,
      min: 0,
      max: 0,
      median: 0,
      consensus: false,
      totalVotes: validVotersCount,
      dist
    };
  }

  const sum = numericVotes.reduce((acc, v) => acc + v, 0);
  const rawAverage = sum / numericVotes.length;
  // User spec: Round up to nearest 0.5 (e.g. 3.2 -> 3.5, 3.8 -> 4.0)
  const finalPoints = Math.ceil(rawAverage * 2) / 2;

  numericVotes.sort((a, b) => a - b);
  const min = numericVotes[0];
  const max = numericVotes[numericVotes.length - 1];
  const mid = Math.floor(numericVotes.length / 2);
  const median = numericVotes.length % 2 !== 0 
    ? numericVotes[mid] 
    : Math.ceil(((numericVotes[mid - 1] + numericVotes[mid]) / 2) * 2) / 2;
  const consensus = min === max;

  return {
    rawAverage: parseFloat(rawAverage.toFixed(2)),
    finalPoints,
    min,
    max,
    median,
    consensus,
    totalVotes: numericVotes.length,
    dist
  };
}

function sanitizeRoomState(room) {
  const stats = room.revealed ? calculateStats(room.participants) : null;
  const activeDeck = room.includeHalfPoints ? HALF_POINTS_DECK : DEFAULT_DECK;

  return {
    id: room.id,
    title: room.title,
    includeHalfPoints: room.includeHalfPoints,
    deck: activeDeck,
    revealed: room.revealed,
    participants: Object.values(room.participants).map(p => ({
      id: p.id,
      name: p.name,
      vote: room.revealed ? p.vote : (p.vote !== null && p.vote !== undefined ? true : null),
      isObserver: p.isObserver,
      isConnected: p.isConnected
    })),
    stats,
    history: room.history
  };
}

io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentUserId = null;

  socket.on('join_room', ({ roomId, name, isObserver }) => {
    currentRoomId = (roomId || 'default').toLowerCase().trim();
    currentUserId = socket.id;

    socket.join(currentRoomId);
    const room = getOrCreateRoom(currentRoomId);

    room.participants[socket.id] = {
      id: socket.id,
      name: name || 'Anonymous',
      vote: null,
      isObserver: !!isObserver,
      isConnected: true
    };

    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('cast_vote', ({ vote }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    if (room.revealed) return; // Prevent voting if already revealed

    if (room.participants[socket.id]) {
      // Toggle vote if clicking the same card again
      if (room.participants[socket.id].vote === vote) {
        room.participants[socket.id].vote = null;
      } else {
        room.participants[socket.id].vote = vote;
      }
    }

    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('reveal_votes', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.revealed = true;

    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('reset_round', ({ saveToHistory = true } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];

    if (saveToHistory && room.revealed) {
      const stats = calculateStats(room.participants);
      if (stats.totalVotes > 0) {
        const historyItem = {
          id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          title: room.title.trim() || `Item #${room.history.length + 1}`,
          rawAverage: stats.rawAverage,
          finalPoints: stats.finalPoints,
          totalVotes: stats.totalVotes,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        room.history.unshift(historyItem);
      }
    }

    // Reset votes & title for next story
    room.revealed = false;
    room.title = '';
    Object.keys(room.participants).forEach(id => {
      room.participants[id].vote = null;
    });

    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('update_title', ({ title }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.title = title || '';
    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('toggle_half_points', ({ includeHalfPoints }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.includeHalfPoints = typeof includeHalfPoints === 'boolean' ? includeHalfPoints : !room.includeHalfPoints;
    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('toggle_observer', ({ isObserver }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    if (room.participants[socket.id]) {
      room.participants[socket.id].isObserver = !!isObserver;
      if (isObserver) {
        room.participants[socket.id].vote = null;
      }
    }
    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('clear_history', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.history = [];
    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('disconnect', () => {
    if (currentRoomId && rooms[currentRoomId] && rooms[currentRoomId].participants[socket.id]) {
      delete rooms[currentRoomId].participants[socket.id];
      // Clean up empty rooms after 1 hour of inactivity
      if (Object.keys(rooms[currentRoomId].participants).length === 0) {
        setTimeout(() => {
          if (rooms[currentRoomId] && Object.keys(rooms[currentRoomId].participants).length === 0) {
            delete rooms[currentRoomId];
          }
        }, 3600000);
      } else {
        io.to(currentRoomId).emit('room_state', sanitizeRoomState(rooms[currentRoomId]));
      }
    }
  });
});

// Serve production static assets if built
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Planning Poker Server Running');
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Planning Poker server listening on http://localhost:${PORT}`);
});
