import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import compression from 'compression';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const rooms = {};
const DEFAULT_DECK = [0.5, 1, 2, 3, 4, 5, 6, '?', '☕'];
const HALF_POINTS_DECK = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, '?', '☕'];

function getOrCreateRoom(roomId) {
  const cleanId = (roomId || 'default').toLowerCase().trim();
  if (!rooms[cleanId]) {
    rooms[cleanId] = {
      id: cleanId,
      roomName: '',
      title: '',
      includeHalfPoints: false,
      revealed: false,
      savedThisRound: false, // prevents double-saving if reveal is clicked multiple times
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
      if (!isNaN(num)) numericVotes.push(num);
    }
  });

  if (validVotersCount === 0) {
    return { rawAverage: 0, finalPoints: 0, min: 0, max: 0, consensus: false, totalVotes: 0, dist: {} };
  }

  let finalPoints = 0, rawAverage = 0, min = 0, max = 0, consensus = false;

  if (numericVotes.length > 0) {
    const sum = numericVotes.reduce((a, v) => a + v, 0);
    rawAverage = sum / numericVotes.length;
    finalPoints = Math.ceil(rawAverage * 2) / 2;
    numericVotes.sort((a, b) => a - b);
    min = numericVotes[0];
    max = numericVotes[numericVotes.length - 1];
    consensus = min === max;
  }

  return {
    rawAverage: parseFloat(rawAverage.toFixed(2)),
    finalPoints,
    min,
    max,
    consensus,
    totalVotes: validVotersCount,
    dist
  };
}

function sanitizeRoomState(room) {
  const stats = room.revealed ? calculateStats(room.participants) : null;
  const activeDeck = room.includeHalfPoints ? HALF_POINTS_DECK : DEFAULT_DECK;

  return {
    id: room.id,
    roomName: room.roomName || '',
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

  socket.on('join_room', ({ roomId, name, isObserver, roomName }) => {
    currentRoomId = (roomId || 'default').toLowerCase().trim();
    socket.join(currentRoomId);
    const room = getOrCreateRoom(currentRoomId);

    // Room name is optional and treated as room-level metadata.
    if (!room.roomName && typeof roomName === 'string' && roomName.trim()) {
      room.roomName = roomName.trim();
    }

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
    if (room.revealed) return;
    if (room.participants[socket.id]) {
      room.participants[socket.id].vote =
        room.participants[socket.id].vote === vote ? null : vote;
    }
    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('reveal_votes', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.revealed = true;

    // Save to history on reveal (only once per round)
    if (!room.savedThisRound) {
      const stats = calculateStats(room.participants);
      if (stats.totalVotes > 0) {
        room.history.unshift({
          id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          title: room.title.trim() || `Story #${room.history.length + 1}`,
          finalPoints: stats.finalPoints,
          totalVotes: stats.totalVotes
        });
        room.savedThisRound = true;
      }
    }

    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('reset_round', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    // Reset board — history already saved at reveal time
    room.revealed = false;
    room.savedThisRound = false;
    room.title = '';
    Object.keys(room.participants).forEach(id => {
      room.participants[id].vote = null;
    });
    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('update_title', ({ title }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    rooms[currentRoomId].title = title || '';
    io.to(currentRoomId).emit('room_state', sanitizeRoomState(rooms[currentRoomId]));
  });

  socket.on('toggle_half_points', ({ includeHalfPoints }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    rooms[currentRoomId].includeHalfPoints =
      typeof includeHalfPoints === 'boolean' ? includeHalfPoints : !rooms[currentRoomId].includeHalfPoints;
    io.to(currentRoomId).emit('room_state', sanitizeRoomState(rooms[currentRoomId]));
  });

  socket.on('toggle_observer', ({ isObserver }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    if (room.participants[socket.id]) {
      room.participants[socket.id].isObserver = !!isObserver;
      if (isObserver) room.participants[socket.id].vote = null;
    }
    io.to(currentRoomId).emit('room_state', sanitizeRoomState(room));
  });

  socket.on('clear_history', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    rooms[currentRoomId].history = [];
    io.to(currentRoomId).emit('room_state', sanitizeRoomState(rooms[currentRoomId]));
  });

  socket.on('disconnect', () => {
    if (currentRoomId && rooms[currentRoomId]?.participants[socket.id]) {
      delete rooms[currentRoomId].participants[socket.id];
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

const distPath = path.join(__dirname, '../dist');

const ONE_YEAR = 60 * 60 * 24 * 365;

// Brotli + gzip compression (Brotli is used automatically when the client supports it).
app.use(compression());

app.use(express.static(distPath, {
  maxAge: ONE_YEAR,
  immutable: true,
  setHeaders(res, filePath) {
    const name = path.basename(filePath);
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (name === 'robots.txt' || name === 'sitemap.xml') {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else if (filePath.includes('og-image')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(200).send('Planning Poker Server Running');
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Planning Poker server listening on http://localhost:${PORT}`);
});
