import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, Sparkles, History, Link as LinkIcon, Layers } from 'lucide-react';

export default function Header({
  roomId,
  title,
  onUpdateTitle,
  isObserver,
  onToggleObserver,
  includeHalfPoints,
  onToggleHalfPoints,
  historyCount,
  onOpenHistory,
  participantCount
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Logo & Room Link */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg">
              ♠
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Planning Poker
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {participantCount} online
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">Room: <span className="text-slate-200 font-semibold uppercase">{roomId}</span></p>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600'
            }`}
            title="Copy share link for 10-15 members"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
          </button>
        </div>

        {/* Center: Story Title Input (Optional) */}
        <div className="w-full md:max-w-md">
          <div className="relative">
            <input
              type="text"
              value={title || ''}
              onChange={(e) => onUpdateTitle(e.target.value)}
              placeholder="Optional: Enter Story Title or Jira Ticket (e.g. PROJ-101 Search Bar UI)..."
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2 transition-all duration-150 outline-none"
            />
          </div>
        </div>

        {/* Right: Controls & History Toggle */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Half points toggle */}
          <button
            onClick={onToggleHalfPoints}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
              includeHalfPoints
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Include 1.5, 2.5, 3.5, 4.5, 5.5 story point cards"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Half Points</span>
          </button>

          {/* Observer toggle */}
          <button
            onClick={onToggleObserver}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
              isObserver
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
            title={isObserver ? "You are an spectator (cannot vote)" : "Switch to spectator mode"}
          >
            {isObserver ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isObserver ? 'Spectator' : 'Voter'}</span>
          </button>

          {/* History drawer button */}
          <button
            onClick={onOpenHistory}
            className="relative px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
