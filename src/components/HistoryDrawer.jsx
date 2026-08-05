import React, { useState } from 'react';
import { X, Copy, Check, Trash2, FileText, History as HistoryIcon } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history, onClearHistory }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    if (!history || history.length === 0) return;

    // Clean format: "Title - X SP" only
    const formattedText = [...history]
      .reverse()
      .map((item) => `${item.title} - ${item.finalPoints} SP`)
      .join('\n');

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">Estimation History</h2>
            {history && history.length > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {history.length} stories
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyText}
            disabled={!history || history.length === 0}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : !history || history.length === 0
                ? 'bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-500/30'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy All Results'}</span>
          </button>

          {history && history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
              title="Clear Session History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {!history || history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600 opacity-60" />
              <p className="text-sm font-medium">No history saved yet.</p>
              <p className="text-xs text-slate-600 mt-1">
                Completed rounds will appear here when you click "Next Story / Reset".
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-100 truncate" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      {item.timestamp} · {item.totalVotes} votes
                    </p>
                  </div>
                  <div className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 text-sm font-bold">
                    {item.finalPoints} SP
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Preview of copy format */}
        {history && history.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60">
            <p className="text-[11px] text-slate-500 text-center">
              Copies as: <span className="text-slate-400 font-mono">Story Title - 3.5 SP</span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
