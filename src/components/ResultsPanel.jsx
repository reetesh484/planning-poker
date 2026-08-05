import React from 'react';
import { Trophy, Calculator, BarChart2, ArrowUpRight, CheckCircle } from 'lucide-react';

export default function ResultsPanel({ stats, storyTitle }) {
  if (!stats || stats.totalVotes === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center border border-slate-800">
        <p className="text-sm text-slate-400">No numeric votes were cast for this story.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-slate-900/90 to-slate-900 shadow-2xl animate-fade-in space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5 mb-1">
            <Trophy className="w-4 h-4 text-rose-400" />
            Story Point Results
          </span>
          <h2 className="text-base font-bold text-white">
            {storyTitle ? storyTitle : 'Untitled Estimation Round'}
          </h2>
        </div>

        {stats.consensus && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>🎉 Consensus Reached!</span>
          </div>
        )}
      </div>

      {/* Main Stats: Final Story Points + Min/Max only */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Final Rounded Points — most prominent */}
        <div className="bg-gradient-to-br from-rose-600 via-rose-600 to-rose-700 rounded-2xl p-5 text-white shadow-xl shadow-rose-500/30 flex flex-col justify-between border border-rose-400/40">
          <span className="text-xs uppercase font-bold text-rose-100/80 flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5" />
            Final Story Points
          </span>
          <div className="my-2">
            <span className="text-5xl font-extrabold tracking-tight">{stats.finalPoints}</span>
            <span className="text-sm text-rose-200 ml-2 font-medium">SP</span>
          </div>
          <span className="text-[11px] text-rose-100/80 font-medium">Rounded to nearest 0.5</span>
        </div>

        {/* Min / Max */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs uppercase font-medium text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            Vote Range
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100">{stats.min}</span>
            <span className="text-slate-500 font-medium text-base">→</span>
            <span className="text-3xl font-bold text-slate-100">{stats.max}</span>
          </div>
          <span className="text-[11px] text-slate-500">Min → Max spread</span>
        </div>

      </div>

      {/* Vote Distribution */}
      {stats.dist && Object.keys(stats.dist).length > 0 && (
        <div className="border-t border-slate-800/80 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-rose-400" />
            Vote Breakdown
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(stats.dist).map(([cardValue, count]) => (
              <div
                key={cardValue}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
              >
                <span className="font-bold text-white px-2 py-0.5 rounded bg-rose-600/30 text-rose-300 border border-rose-500/30">
                  {cardValue} pts
                </span>
                <span className="text-slate-400 font-medium">
                  {count} {count === 1 ? 'vote' : 'votes'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
