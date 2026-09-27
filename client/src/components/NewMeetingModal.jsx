import React, { useState } from 'react';
import { createMeeting } from '../services/meetingService';

export default function NewMeetingModal({ isOpen, onClose, onStartMeeting }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Strategy');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    try {
      const meeting = await createMeeting({
        title: title.trim(),
        description: `${category} meeting`,
        scheduledAt: scheduledAt || undefined,
        durationMinutes: Number(durationMinutes)
      });
      onStartMeeting(meeting, { scheduled: Boolean(scheduledAt) });
      setTitle('');
      setScheduledAt('');
      onClose();
    } catch (err) {
      console.error('[NewMeetingModal] Failed to create meeting:', err);
      setError(err.response?.data?.error || 'Unable to create the meeting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <h3 className="font-display font-bold text-lg text-on-surface">Schedule or Start Meeting</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-on-surface block mb-1 font-mono">Meeting Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Platform Micro-Frontend Sync"
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="font-bold text-on-surface block font-mono">
              Date and time (optional)
              <input
                type="datetime-local"
                value={scheduledAt}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1 w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface font-body"
              />
            </label>
            <label className="font-bold text-on-surface block font-mono">
              Duration
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="mt-1 w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface font-body"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">90 minutes</option>
              </select>
            </label>
          </div>

          {error && <p className="rounded-xl border border-error/30 bg-error-container/20 px-3 py-2 text-xs text-on-error-container">{error}</p>}

          <div>
            <label className="font-bold text-on-surface block mb-1 font-mono">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface"
            >
              <option value="Strategy">Strategy & Product</option>
              <option value="Engineering">Engineering & Architecture</option>
              <option value="Design">Design & UX Review</option>
              <option value="Marketing">Marketing & Launch</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <button type="button" onClick={onClose} className="px-4 py-2 text-on-surface-variant hover:text-on-surface">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  Creating...
                </>
              ) : (
                scheduledAt ? 'Schedule & Add to Calendar' : 'Start Call Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
