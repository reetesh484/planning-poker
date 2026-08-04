import React, { useState } from 'react';
import { X, Copy, Check, Trash2, FileText, History as HistoryIcon } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history, onClearHistory }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    if (!history || history.length === 0) return;

    const formattedText = history
      .map((item) => `${item.title}: ${item.finalPoints} SP (Avg: ${item.rawAverage})`)
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
            <HistoryIcon className="w-5 h-5 text-curbiq-400" />
            <h2 className="text-base font-bold text-white">Estimation History</h2>
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
                : 'bg-gradient-to-r from-curbiq-500 to-rose-600 hover:from-curbiq-600 hover:to-rose-700 text-white shadow-lg shadow-curbiq-500/30'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text Export'}</span>
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
                Completed story point estimations will appear here automatically when resetting for the next story.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-100 truncate" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-mono">
                      <span>{item.timestamp}</span>
                      <span>•</span>
                      <span>{item.totalVotes} votes</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="px-2.5 py-1 rounded-lg bg-curbiq-600/20 text-curbiq-300 border border-curbiq-500/30 text-sm font-bold">
                      {item.finalPoints} SP
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Avg: {item.rawAverage}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        {history && history.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 text-center text-xs text-slate-500">
            Export format is ready to paste directly into Slack or Jira.
          </div>
        )}

      </div>
    </div>
  );
}
