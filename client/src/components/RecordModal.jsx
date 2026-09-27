import React, { useState } from 'react';
import { X, Video, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RecordModal({ isOpen, onClose, onStartRecording, isStarting }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [layout, setLayout] = useState('grid');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please provide a valid Gmail/email address to receive the recording.');
      return;
    }
    setError('');
    onStartRecording({ targetEmail: trimmed, layout });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-high p-6 shadow-2xl text-on-surface">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-error/15 text-error">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">Start Cloud Recording</h2>
            <p className="text-xs text-on-surface-variant">LiveKit RoomComposite recording delivered to your inbox</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              Destination Gmail / Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-on-surface-variant" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full rounded-xl border border-outline-variant bg-surface py-2.5 pl-10 pr-4 text-xs text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <p className="mt-1 text-[11px] text-on-surface-variant/70">
              When recording stops, a direct MP4 playback link will be sent to this email.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              Recording Composite Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLayout('grid')}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                  layout === 'grid'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-outline-variant bg-surface text-on-surface-variant hover:border-outline'
                }`}
              >
                <span>Tile Grid Layout</span>
              </button>
              <button
                type="button"
                onClick={() => setLayout('speaker')}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                  layout === 'speaker'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-outline-variant bg-surface text-on-surface-variant hover:border-outline'
                }`}
              >
                <span>Active Speaker</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-error/10 border border-error/20 p-3 text-xs text-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isStarting}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isStarting}
              className="flex items-center gap-2 rounded-xl bg-error px-5 py-2.5 text-xs font-bold text-on-error hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-error/25 disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Starting Egress...</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span>Start Recording</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
