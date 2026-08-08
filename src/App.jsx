import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header.jsx';
import CardDeck from './components/CardDeck.jsx';
import ParticipantGrid from './components/ParticipantGrid.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import HistoryDrawer from './components/HistoryDrawer.jsx';
import { RotateCcw, Play, ArrowRight } from 'lucide-react';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const [name, setName] = useState(() => localStorage.getItem('poker_user_name') || '');
  const [localRoomName, setLocalRoomName] = useState(() => localStorage.getItem('poker_room_name') || '');
  const [hasEnteredName, setHasEnteredName] = useState(false);

  const [roomId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramRoom = urlParams.get('room');
    if (paramRoom) return paramRoom.toLowerCase();
    const pathRoom = window.location.pathname.replace('/', '').trim();
    if (pathRoom && pathRoom.length > 2) return pathRoom.toLowerCase();
    return 'room-' + Math.random().toString(36).substring(2, 7);
  });

  const [roomState, setRoomState] = useState({
    id: roomId,
    roomName: '',
    title: '',
    includeHalfPoints: false,
    deck: [0.5, 1, 2, 3, 4, 5, 6, '?', '☕'],
    revealed: false,
    participants: [],
    stats: null,
    history: []
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.get('room') !== roomId) {
      currentUrl.searchParams.set('room', roomId);
      window.history.replaceState({}, '', currentUrl.toString());
    }
  }, [roomId]);

  useEffect(() => {
    if (!hasEnteredName) return;

    const newSocket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join_room', {
        roomId,
        name: name.trim(),
        isObserver: false,
        roomName: localRoomName.trim()
      });
    });

    newSocket.on('disconnect', () => setConnected(false));
    newSocket.on('room_state', (state) => {
      setRoomState(state);
      if (state.roomName && !localRoomName.trim()) {
        setLocalRoomName(state.roomName);
      }
    });

    return () => newSocket.disconnect();
  }, [hasEnteredName, name, roomId]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('poker_user_name', name.trim());
    if (localRoomName.trim()) {
      localStorage.setItem('poker_room_name', localRoomName.trim());
    } else {
      localStorage.removeItem('poker_room_name');
    }
    setHasEnteredName(true);
  };

  const handleCastVote = (voteVal) => socket?.emit('cast_vote', { vote: voteVal });
  const handleRevealCards = () => socket?.emit('reveal_votes');
  const handleResetRound = () => socket?.emit('reset_round');
  const handleUpdateTitle = (newTitle) => socket?.emit('update_title', { title: newTitle });
  const handleToggleHalfPoints = () =>
    socket?.emit('toggle_half_points', { includeHalfPoints: !roomState.includeHalfPoints });

  const currentUser = roomState.participants.find(p => p.id === socket?.id);
  const isObserver = currentUser?.isObserver || false;
  const currentVote = currentUser?.vote;

  const voters = roomState.participants.filter(p => !p.isObserver);
  const votersCount = voters.length;
  const votedCount = voters.filter(p => p.vote !== null && p.vote !== undefined).length;

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">

      {/* Entrance Modal */}
      {!hasEnteredName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080b11]/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl space-y-6 animate-scale-up">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 mx-auto rounded-2xl bg-[#FF0055] flex items-center justify-center shadow-lg shadow-rose-500/30">
                <svg width="28" height="28" viewBox="0 0 60 60" fill="none">
                  <path d="M30 5C17.3 5 7 15.3 7 28C7 38.5 17.5 48.5 27 54.5C28.8 55.6 31.2 55.6 33 48.5C42.5 48.5 53 38.5 53 28C53 15.3 42.7 5 30 5Z" fill="#FFFFFF"/>
                  <circle cx="30" cy="27" r="10" fill="#FF0055"/>
                  <circle cx="30" cy="27" r="5" fill="#FFFFFF"/>
                  <path d="M30 32L36 40H30V32Z" fill="#FF0055"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Planning Poker</h2>
              <p className="text-xs text-slate-400">
                Room: <strong className="text-rose-400 font-mono">{roomId}</strong>
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-4">
              {/* Your Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Your Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex, Sarah (Frontend)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 outline-none transition"
                />
              </div>

              {/* Room Name (optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Room Name <span className="text-slate-600 font-normal normal-case">(optional — shared in room and export)</span>
                </label>
                <input
                  type="text"
                  value={localRoomName}
                  onChange={(e) => setLocalRoomName(e.target.value)}
                  placeholder="e.g. Sprint 43 Planning, Q3 Backlog Grooming"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <span>Enter Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main App */}
      {hasEnteredName && (
        <>
          <Header
            roomId={roomState.id}
            title={roomState.title}
            onUpdateTitle={handleUpdateTitle}
            isObserver={isObserver}
            onToggleObserver={() => socket?.emit('toggle_observer', { isObserver: !isObserver })}
            includeHalfPoints={roomState.includeHalfPoints}
            onToggleHalfPoints={handleToggleHalfPoints}
            historyCount={roomState.history ? roomState.history.length : 0}
            onOpenHistory={() => setIsHistoryOpen(true)}
            participantCount={roomState.participants.length}
            roomName={roomState.roomName}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

            {/* Control Bar */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800/80">
              <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                <div className={`h-3 w-3 rounded-full ${connected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 animate-pulse'}`} />
                <span className="text-xs text-slate-300 font-medium truncate">
                  {connected
                    ? <>{name}{roomState.roomName && <span className="text-slate-500 ml-1">· {roomState.roomName}</span>}</>
                    : 'Connecting to server...'}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {!roomState.revealed ? (
                  <button
                    onClick={handleRevealCards}
                    disabled={votedCount === 0}
                    className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                      votedCount === 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 border border-emerald-400/30 transform active:scale-95'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Reveal Cards ({votedCount}/{votersCount})</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResetRound}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-500/30 border border-rose-400/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Next Story / Reset</span>
                  </button>
                )}
              </div>
            </div>

            {roomState.revealed && (
              <ResultsPanel stats={roomState.stats} storyTitle={roomState.title} />
            )}

            <CardDeck
              deck={roomState.deck}
              selectedVote={currentVote}
              onCastVote={handleCastVote}
              isObserver={isObserver}
              revealed={roomState.revealed}
            />

            <ParticipantGrid
              participants={roomState.participants}
              currentSocketId={socket?.id}
              revealed={roomState.revealed}
            />
          </main>

          <HistoryDrawer
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            history={roomState.history}
            onClearHistory={() => socket?.emit('clear_history')}
            roomName={roomState.roomName}
          />
        </>
      )}
    </div>
  );
}
