import React, { useState } from 'react';
import { X, Copy, Check, Trash2, FileText, History as HistoryIcon, ExternalLink } from 'lucide-react';

// Matches Jira-style IDs: PROJ-101, curb-42, ABC-1234
const JIRA_REGEX = /\b([A-Za-z][A-Za-z0-9]+-\d+)\b/g;
const URL_REGEX = /\bhttps?:\/\/[^\s)]+/gi;

function extractFirstUrl(value) {
  if (!value) return null;
  URL_REGEX.lastIndex = 0;
  const match = URL_REGEX.exec(value);
  return match ? match[0] : null;
}

function extractTicketFromText(value) {
  if (!value) return null;
  JIRA_REGEX.lastIndex = 0;
  const match = JIRA_REGEX.exec(value);
  return match ? match[1].toUpperCase() : null;
}

function buildTicketUrl(ticketId, jiraBaseUrl) {
  if (!ticketId || !jiraBaseUrl) return null;

  // If user provided a sample Jira ticket URL, replace only that ticket segment.
  const sampleTicket = extractTicketFromText(jiraBaseUrl);
  if (sampleTicket) {
    return jiraBaseUrl.replace(new RegExp(sampleTicket, 'i'), ticketId.toUpperCase());
  }

  // Fallback for a plain Jira base host/path.
  const normalizedBase = jiraBaseUrl.replace(/\/+$/, '');
  return `${normalizedBase}/browse/${ticketId.toUpperCase()}`;
}

function buildStoryUrl(title, jiraBaseUrl) {
  const explicitUrl = extractFirstUrl(title);
  if (explicitUrl) return explicitUrl;

  const ticket = extractTicketFromText(title);
  return ticket ? buildTicketUrl(ticket, jiraBaseUrl) : null;
}

function renderTitleWithLinks(title, jiraBaseUrl) {
  if (!title) return <span>{title}</span>;

  const parts = [];
  let lastIndex = 0;
  let match;
  const regex = /(https?:\/\/[^\s)]+)|\b([A-Za-z][A-Za-z0-9]+-\d+)\b/gi;

  while ((match = regex.exec(title)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`txt-${lastIndex}`}>{title.slice(lastIndex, match.index)}</span>);
    }

    const matchedUrl = match[1];
    const matchedTicketId = match[2];

    if (matchedUrl) {
      parts.push(
        <a
          key={`url-${match.index}`}
          href={matchedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 underline decoration-dotted font-mono font-semibold transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {matchedUrl}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    } else if (matchedTicketId) {
      const url = buildTicketUrl(matchedTicketId, jiraBaseUrl);
      if (url) {
        parts.push(
          <a
            key={`ticket-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 underline decoration-dotted font-mono font-semibold transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {matchedTicketId}
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      } else {
        parts.push(<span key={`raw-${match.index}`}>{match[0]}</span>);
      }
    } else {
      parts.push(<span key={`raw-${match.index}`}>{match[0]}</span>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < title.length) {
    parts.push(<span key="txt-end">{title.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? <>{parts}</> : <span>{title}</span>;
}

export default function HistoryDrawer({ isOpen, onClose, history, onClearHistory, jiraBaseUrl, roomName }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    if (!history || history.length === 0) return;

    const lines = [...history].reverse().map((item) => {
      const storyUrl = buildStoryUrl(item.title, jiraBaseUrl);
      if (storyUrl) {
        return `${item.title} [${storyUrl}] -> ${item.finalPoints}`;
      }
      return `${item.title} -> ${item.finalPoints}`;
    });

    const header = roomName ? `${roomName}\n` : '';
    navigator.clipboard.writeText(header + lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {jiraBaseUrl && (
          <div className="px-5 py-2 bg-blue-500/5 border-b border-blue-500/20 flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <p className="text-[11px] text-blue-300 truncate">
              Links are derived from sample Jira URL: <span className="font-mono">{jiraBaseUrl}</span>
            </p>
          </div>
        )}

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
            history.map((item) => {
              const storyUrl = buildStoryUrl(item.title, jiraBaseUrl);
              const cardContent = (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-100 leading-snug flex flex-wrap items-center gap-x-1">
                        {renderTitleWithLinks(item.title, jiraBaseUrl)}
                      </div>
                      {storyUrl && (
                        <p className="inline-flex items-center gap-1 text-xs text-blue-400 mt-1 break-all">
                          [{storyUrl}]
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        {item.totalVotes} votes
                      </p>
                    </div>
                    <div className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 text-sm font-bold">
                      {item.finalPoints} SP
                    </div>
                  </div>
                </>
              );

              if (storyUrl) {
                return (
                  <a
                    key={item.id}
                    href={storyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block glass-card rounded-xl p-4 border border-blue-500/30 hover:border-blue-400/60 hover:bg-blue-500/5 transition cursor-pointer"
                  >
                    {cardContent}
                  </a>
                );
              }

              return (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition"
                >
                  {cardContent}
                </div>
              );
            })
          )}
        </div>

        {history && history.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60">
            <p className="text-[11px] text-slate-500 text-center">
              Export: <span className="font-mono text-slate-400">
                {jiraBaseUrl
                  ? 'PROJ-101 Title [https://jira.example.com/browse/PROJ-101] -> 3.5'
                  : 'Story Title -> 3.5'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
