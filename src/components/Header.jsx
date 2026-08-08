import React, { useState, useEffect, useRef } from 'react';
import { Check, Eye, EyeOff, History, Link as LinkIcon, Layers } from 'lucide-react';

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
  participantCount,
  roomName,
}) {
  const [copied, setCopied] = useState(false);
  const [localTitle, setLocalTitle] = useState(title || '');
  const isFocused = useRef(false);

  // Sync local title from roomState only when not actively typing
  useEffect(() => {
    if (!isFocused.current) {
      setLocalTitle(title || '');
    }
  }, [title]);

  const handleTitleChange = (e) => {
    const newVal = e.target.value;
    setLocalTitle(newVal);
    onUpdateTitle(newVal);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand Icon & Room Info */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FF0055] flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <rect x="6" y="4" width="20" height="26" rx="2.5" fill="#FFFFFF" stroke="#FF0055" strokeWidth="1.5"/>
                <text x="10" y="12" fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif" fontSize="7" fontWeight="800" fill="#FF0055">A</text>
                <text x="22" y="27" fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif" fontSize="7" fontWeight="800" fill="#FF0055" textAnchor="end" transform="rotate(180 22 27)">A</text>
                <text x="16" y="23" fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="800" fill="#FF0055" textAnchor="middle">♥</text>
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Planning Poker
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap shrink-0">
                  {participantCount} <span className="hidden sm:inline">online</span><span className="sm:hidden">on</span>
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Room: <span className="text-slate-200 font-semibold uppercase">{roomId}</span>
              </p>
              {roomName && (
                <p className="text-xs text-slate-500 truncate max-w-[240px]">
                  {roomName}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5 text-rose-500" />}
            <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
          </button>
        </div>

        {/* Center: Story Title Input */}
        <div className="w-full md:max-w-md">
          <input
            type="text"
            value={localTitle}
            onFocus={() => { isFocused.current = true; }}
            onBlur={() => {
              isFocused.current = false;
              onUpdateTitle(localTitle);
            }}
            onChange={handleTitleChange}
            placeholder="Optional: Story Title or Ticket ID (e.g. PROJ-101 Search UI)..."
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2 transition-all duration-150 outline-none"
          />
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Half points toggle */}
          <button
            onClick={onToggleHalfPoints}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
              includeHalfPoints
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-rose-400" />
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
          >
            {isObserver ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isObserver ? 'Spectator' : 'Voter'}</span>
          </button>

          {/* History drawer */}
          <button
            onClick={onOpenHistory}
            className="relative px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <History className="w-3.5 h-3.5 text-rose-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
