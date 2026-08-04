import React from 'react';
import { Trophy, Calculator, BarChart2, Hash, ArrowUpRight, CheckCircle } from 'lucide-react';

export default function ResultsPanel({ stats, storyTitle }) {
  if (!stats || stats.totalVotes === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center border border-slate-800">
        <p className="text-sm text-slate-400">No numeric votes were cast for this story.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-curbiq-500/30 bg-gradient-to-b from-curbiq-950/20 via-slate-900/90 to-slate-900 shadow-2xl animate-fade-in space-y-6">
      
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-curbiq-400 flex items-center gap-1.5 mb-1">
            <Trophy className="w-4 h-4 text-curbiq-400" />
            Story Point Results
          </span>
          <h2 className="text-base font-bold text-white">
            {storyTitle ? storyTitle : 'Untitled Estimation Round'}
          </h2>
        </div>

        {stats.consensus && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold animate-pulse">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>🎉 Consensus Reached!</span>
          </div>
        )}
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Prominent CurbIQ Final Rounded Points */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-curbiq-500 via-curbiq-600 to-rose-700 rounded-2xl p-4 text-white shadow-xl shadow-curbiq-500/30 flex flex-col justify-between border border-curbiq-400/40">
          <span className="text-xs uppercase font-bold text-rose-100/90 flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5" />
            Final Story Points
          </span>
          <div className="my-2">
            <span className="text-4xl font-extrabold tracking-tight">{stats.finalPoints}</span>
            <span className="text-xs text-rose-100 ml-1.5 font-medium">pts</span>
          </div>
          <span className="text-[11px] text-rose-100/90 font-medium">
            (Ceil rounded to nearest 0.5)
          </span>
        </div>

        {/* Raw Average */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs uppercase font-medium text-slate-400 flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            Raw Average
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold text-slate-100">{stats.rawAverage}</span>
          </div>
          <span className="text-[11px] text-slate-500">Unrounded mean</span>
        </div>

        {/* Median */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs uppercase font-medium text-slate-400 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            Median
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold text-slate-100">{stats.median}</span>
          </div>
          <span className="text-[11px] text-slate-500">Middle value</span>
        </div>

        {/* Min / Max Range */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs uppercase font-medium text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            Min / Max
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{stats.min}</span>
            <span className="text-slate-500 font-medium text-sm">to</span>
            <span className="text-2xl font-bold text-slate-100">{stats.max}</span>
          </div>
          <span className="text-[11px] text-slate-500">Vote spread</span>
        </div>

      </div>

      {/* Vote Distribution */}
      {stats.dist && Object.keys(stats.dist).length > 0 && (
        <div className="border-t border-slate-800/80 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-curbiq-400" />
            Vote Breakdown
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(stats.dist).map(([cardValue, count]) => (
              <div
                key={cardValue}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
              >
                <span className="font-bold text-white px-2 py-0.5 rounded bg-curbiq-600/30 text-curbiq-300 border border-curbiq-500/30">
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
