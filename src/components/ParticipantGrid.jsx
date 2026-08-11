import React from 'react';
import { User, CheckCircle2, Clock, Eye } from 'lucide-react';

export default function ParticipantGrid({ participants, currentSocketId, revealed }) {
  const voters = participants.filter(p => !p.isObserver);
  const observers = participants.filter(p => p.isObserver);
  const votedCount = voters.filter(p => p.vote !== null && p.vote !== undefined).length;
  const progressPercent = voters.length > 0 ? Math.round((votedCount / voters.length) * 100) : 0;

  return (
    <div className="space-y-4">
      
      {/* Progress & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            Team Members ({participants.length})
          </h2>
          <span className="text-xs text-slate-400 font-medium bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            {votedCount} of {voters.length} voted
          </span>
        </div>

        {/* Voting progress bar */}
        {!revealed && voters.length > 0 && (
          <div className="w-full sm:w-48 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 font-mono font-medium">{progressPercent}%</span>
          </div>
        )}
      </div>

      {/* Grid of Participants */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {participants.map((p) => {
          const isYou = p.id === currentSocketId;
          const hasVoted = p.vote !== null && p.vote !== undefined;

          return (
            <div
              key={p.id}
              className={`glass-card relative rounded-2xl p-4 flex flex-col items-center justify-between min-h-[120px] transition-all duration-200 ${
                isYou ? 'ring-1 ring-brand-500/50 bg-brand-950/10' : ''
              }`}
            >
              {/* Top row: Name & You Badge */}
              <div className="w-full flex items-center justify-between gap-1 text-xs">
                <span className="font-semibold text-slate-200 truncate flex items-center gap-1.5 max-w-[110px]" title={p.name}>
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {p.name}
                </span>
                {isYou && (
                  <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/30 shrink-0">
                    You
                  </span>
                )}
              </div>

              {/* Center: Card State */}
              <div className="my-2 flex items-center justify-center">
                {p.isObserver ? (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-medium bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Spectator</span>
                  </div>
                ) : revealed ? (
                  /* Revealed Card */
                  <div className="h-14 w-11 rounded-xl bg-gradient-to-b from-brand-500 to-rose-700 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-brand-500/30 border border-brand-300 animate-scale-up">
                    {hasVoted ? p.vote : '—'}
                  </div>
                ) : hasVoted ? (
                  /* Voted (Hidden Card) */
                  <div className="h-14 w-11 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-emerald-500/60 flex flex-col items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10 animate-bounce-short">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-0.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Voted</span>
                  </div>
                ) : (
                  /* Thinking / Waiting */
                  <div className="h-14 w-11 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 flex flex-col items-center justify-center text-slate-500">
                    <Clock className="w-4 h-4 text-slate-600 animate-pulse mb-0.5" />
                    <span className="text-[9px] font-medium text-slate-500">Voting</span>
                  </div>
                )}
              </div>

              {/* Bottom status text */}
              <div className="text-[11px] text-slate-400">
                {p.isObserver
                  ? 'Watching'
                  : revealed
                  ? (hasVoted ? `Voted ${p.vote}` : 'No vote')
                  : (hasVoted ? 'Ready' : 'Thinking...')}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
