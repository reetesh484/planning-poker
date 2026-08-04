import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

export default function CardDeck({ deck, selectedVote, onCastVote, isObserver, revealed }) {
  if (isObserver) {
    return (
      <div className="glass-panel rounded-2xl p-4 text-center border border-amber-500/20 bg-amber-500/5">
        <p className="text-xs text-amber-300 font-medium flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          You are currently in spectator mode. Click "Spectator" in the header to start voting.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-curbiq-400" />
          Select Story Points <span className="text-slate-500 text-[11px] font-normal lowercase">(1-click vote)</span>
        </h3>
        {selectedVote !== null && selectedVote !== undefined && !revealed && (
          <span className="text-xs text-curbiq-400 font-medium animate-fade-in">
            Selected: <strong className="text-white text-sm bg-curbiq-600/30 px-2 py-0.5 rounded border border-curbiq-500/40">{selectedVote}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-14 gap-2 sm:gap-3">
        {deck.map((val) => {
          const isSelected = selectedVote === val;
          const isDisabled = revealed;

          return (
            <button
              key={val}
              disabled={isDisabled}
              onClick={() => onCastVote(val)}
              className={`group relative flex flex-col items-center justify-center h-16 sm:h-20 rounded-xl font-bold text-base sm:text-lg transition-all duration-150 transform active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-b from-curbiq-500 to-rose-700 text-white border-2 border-curbiq-300 shadow-lg shadow-curbiq-500/40 -translate-y-1.5'
                  : isDisabled
                  ? 'bg-slate-900/50 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-60'
                  : 'bg-slate-900 hover:bg-slate-800/90 text-slate-200 border border-slate-800 hover:border-slate-700 hover:-translate-y-1'
              }`}
            >
              <span className={`transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                {val}
              </span>
              
              {/* Bottom indicator dot */}
              {isSelected && (
                <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
