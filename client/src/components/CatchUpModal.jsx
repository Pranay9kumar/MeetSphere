import React, { useEffect, useState } from 'react';
import { CheckSquare, CircleAlert, Download, Lightbulb, Loader2, Sparkles, X } from 'lucide-react';

function requestId() {
  return `catch-up-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function downloadMinutes(roomId, summary) {
  const points = (summary.keyPoints || []).map((point) => `- ${point}`).join('\n') || '- None captured';
  const actions = (summary.actionItems || []).map((item) => `- [ ] ${item.text} (${item.assignee || 'Unassigned'})`).join('\n') || '- None identified';
  const markdown = `# Meeting Minutes: ${roomId}\n\n## Quick Summary\n${summary.summary}\n\n## Key Discussion Points\n${points}\n\n## Action Items\n${actions}\n\n_Generated ${new Date(summary.generatedAt || Date.now()).toLocaleString()}_\n`;
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${roomId.replace(/[^a-z0-9-_]/gi, '-')}-minutes.md`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function CatchUpModal({ roomId, open, onClose }) {
  const [status, setStatus] = useState('idle');
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;

    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('error');
      setError('Sign in again to request meeting intelligence.');
      return undefined;
    }

    const socketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    const socket = new WebSocket(`${socketUrl.replace(/\/$/, '')}/signaling?token=${encodeURIComponent(token)}`);
    const request = requestId();
    let joined = false;
    setStatus('loading');
    setSummary(null);
    setError('');

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ type: 'join-room', room: roomId, requestId: request }));
    });

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'error' && message.requestId === request) {
        setStatus('error');
        setError(message.error || 'The meeting intelligence request failed.');
        return;
      }
      if (message.type === 'room-joined' && !joined) {
        joined = true;
        socket.send(JSON.stringify({
          type: 'request-catch-up-summary',
          room: roomId,
          limit: 100,
          requestId: request
        }));
        return;
      }
      if (message.type === 'catch-up-summary' && message.requestId === request) {
        setSummary(message.summary);
        setStatus('ready');
        socket.close();
      }
    });

    socket.addEventListener('error', () => {
      setStatus('error');
      setError('The meeting intelligence service is unavailable.');
    });

    return () => socket.close();
  }, [open, roomId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4" role="presentation">
      <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 text-slate-100 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="catch-up-title">
        <header className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/15 text-cyan-200"><Sparkles className="h-4 w-4" /></div>
            <div><h2 id="catch-up-title" className="font-display text-lg font-bold">Meeting catch-up</h2><p className="text-xs text-slate-400">AI-generated from recent room activity</p></div>
          </div>
          <button type="button" onClick={onClose} title="Close catch-up" aria-label="Close catch-up" className="icon-button"><X /></button>
        </header>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          {status === 'loading' && <div className="space-y-4 py-8"><div className="flex items-center justify-center gap-3 text-sm text-cyan-200"><Loader2 className="h-5 w-5 animate-spin" /> Listening for the latest meeting intelligence...</div><div className="h-2 animate-pulse rounded-full bg-slate-800" /><div className="h-2 w-5/6 animate-pulse rounded-full bg-slate-800" /><div className="h-2 w-2/3 animate-pulse rounded-full bg-slate-800" /></div>}
          {status === 'error' && <div className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><p>{error}</p></div>}
          {status === 'ready' && summary && <>
            <div className="flex justify-end"><button type="button" onClick={() => downloadMinutes(roomId, summary)} className="flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-300/20"><Download className="h-3.5 w-3.5" /> Export minutes & action items</button></div>
            <section><h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200"><Lightbulb className="h-4 w-4" /> Quick summary</h3><p className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-sm leading-6 text-slate-200">{summary.summary}</p></section>
            <section><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Key discussion points</h3><ul className="space-y-2">{(summary.keyPoints || []).length ? summary.keyPoints.map((point, index) => <li key={`${point}-${index}`} className="rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3 text-sm text-slate-200">{point}</li>) : <li className="text-sm text-slate-400">No discussion points were captured yet.</li>}</ul></section>
            <section><h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400"><CheckSquare className="h-4 w-4" /> Action items</h3><ul className="space-y-2">{(summary.actionItems || []).length ? summary.actionItems.map((item, index) => <li key={`${item.text}-${index}`} className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3 text-sm"><input type="checkbox" className="mt-0.5 accent-cyan-300" /><span className="flex-1 text-slate-200">{item.text}<span className="ml-2 text-xs text-cyan-200">{item.assignee || 'Unassigned'}</span></span></li>) : <li className="text-sm text-slate-400">No action items were identified.</li>}</ul></section>
          </>}
        </div>
      </section>
    </div>
  );
}