import React, { useState } from 'react';
import { X, Copy, Check, Trash2, FileText, History as HistoryIcon, Printer } from 'lucide-react';

const TICKET_REGEX = /\b([A-Za-z][A-Za-z0-9]+-\d+)\b/;

function getId(title) {
  if (!title) return '';
  const match = TICKET_REGEX.exec(title);
  return match ? match[1].toUpperCase() : title.trim();
}

function buildExportLines(history, roomName) {
  const header = roomName ? `${roomName}\n` : '';
  const lines = [...history].reverse().map((item) => `${getId(item.title)} -> ${item.finalPoints}`);
  return header + lines.join('\n');
}

export default function HistoryDrawer({ isOpen, onClose, history, onClearHistory, roomName }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!history || history.length === 0) return;
    navigator.clipboard.writeText(buildExportLines(history, roomName));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    if (!history || history.length === 0) return;
    const body = buildExportLines(history, roomName);
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Planning Poker — Estimation History</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 32px; color: #111; }
            h1 { font-size: 18px; margin: 0 0 4px 0; }
            h2 { font-size: 12px; font-weight: 500; color: #666; margin: 0 0 24px 0; }
            pre { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 13px; white-space: pre-wrap; line-height: 1.7; }
          </style>
        </head>
        <body>
          <h1>Estimation History</h1>
          <h2>Use your browser's "Save as PDF" option in the print dialog.</h2>
          <pre>${body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          <script>window.onload = function () { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">

        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <HistoryIcon className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white">Estimation History</h2>
              {roomName && (
                <p className="text-xs text-slate-400 truncate">{roomName}</p>
              )}
            </div>
            {history && history.length > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                {history.length} stories
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!history || history.length === 0}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : !history || history.length === 0
                ? 'bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-500/30'
            }`}
            title="Copy all as `id -> story points`"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy All'}</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={!history || history.length === 0}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              !history || history.length === 0
                ? 'bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
            }`}
            title="Open print dialog (Save as PDF)"
          >
            <Printer className="w-4 h-4" />
            <span>Export PDF</span>
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

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {!history || history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600 opacity-60" />
              <p className="text-sm font-medium">No history saved yet.</p>
              <p className="text-xs text-slate-600 mt-1">
                History is saved automatically when you reveal cards.
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
                    <div className="text-sm font-semibold text-slate-100 leading-snug break-words">
                      {item.title}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      {item.totalVotes} votes
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

        {history && history.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60">
            <p className="text-[11px] text-slate-500 text-center">
              Export format: <span className="font-mono text-slate-400">PROJ-101 -&gt; 3.5</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
