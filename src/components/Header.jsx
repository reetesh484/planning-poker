import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, History, Link as LinkIcon, Layers } from 'lucide-react';

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
        
        {/* Left: CurbIQ Logo & Room Link */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            
            {/* CurbIQ Logo Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 text-slate-950 shadow-lg shadow-curbiq-500/20 border border-white">
              <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
                <path d="M30 5C17.3 5 7 15.3 7 28C7 38.5 17.5 48.5 27 54.5C28.8 55.6 31.2 55.6 33 48.5C42.5 48.5 53 38.5 53 28C53 15.3 42.7 5 30 5Z" fill="#FF0055"/>
                <circle cx="30" cy="27" r="12" fill="#FFFFFF"/>
                <circle cx="30" cy="27" r="6" fill="#FF0055"/>
                <path d="M30 33L37 42H30V33Z" fill="#FFFFFF"/>
              </svg>
              <div className="flex items-baseline">
                <span className="font-extrabold text-base tracking-tight text-slate-950">Curb</span>
                <span className="font-extrabold text-base tracking-tight text-curbiq-500">IQ</span>
              </div>
            </div>

            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Planning Poker
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-curbiq-500/10 text-curbiq-400 border border-curbiq-500/20">
                  {participantCount} online
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Room: <span className="text-slate-200 font-semibold uppercase">{roomId}</span>
              </p>
            </div>
          </div>

          {/* Share Link Button */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
            title="Copy room link for 10-15 team members"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5 text-curbiq-500" />}
            <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
          </button>
        </div>

        {/* Center: Story Title Input */}
        <div className="w-full md:max-w-md">
          <div className="relative">
            <input
              type="text"
              value={title || ''}
              onChange={(e) => onUpdateTitle(e.target.value)}
              placeholder="Optional: Enter Story Title or Jira Ticket (e.g. CURB-101 Search UI)..."
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-curbiq-500 focus:ring-1 focus:ring-curbiq-500 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2 transition-all duration-150 outline-none"
            />
          </div>
        </div>

        {/* Right: Controls & History */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Half points toggle */}
          <button
            onClick={onToggleHalfPoints}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
              includeHalfPoints
                ? 'bg-curbiq-500/20 text-curbiq-300 border-curbiq-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Include 1.5, 2.5, 3.5, 4.5, 5.5 story point cards"
          >
            <Layers className="w-3.5 h-3.5 text-curbiq-400" />
            <span>+ Half Points</span>
          </button>

          {/* Observer toggle */}
          <button
            onClick={onToggleObserver}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
              isObserver
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
            title={isObserver ? "You are a spectator" : "Switch to spectator mode"}
          >
            {isObserver ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isObserver ? 'Spectator' : 'Voter'}</span>
          </button>

          {/* History drawer button */}
          <button
            onClick={onOpenHistory}
            className="relative px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <History className="w-3.5 h-3.5 text-curbiq-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-curbiq-600 text-white rounded-full text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
