import React, { useEffect, useState } from 'react';
import { getUserMeetings, getUserDocuments } from '../services/meetingService';

export default function ActivityView() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      try {
        const [meetings, docs] = await Promise.allSettled([
          getUserMeetings(),
          getUserDocuments()
        ]);

        const items = [];

        if (meetings.status === 'fulfilled' && Array.isArray(meetings.value)) {
          meetings.value.forEach((m) => {
            const isLive = m.status === 'active';
            const isScheduled = Boolean(m.scheduledAt && new Date(m.scheduledAt) > new Date());
            items.push({
              id: `meet-${m._id || m.id}`,
              title: `${m.hostId?.name || 'Workspace Member'} ${isLive ? 'started live meeting' : isScheduled ? 'scheduled meeting' : 'created meeting'} "${m.title}"`,
              category: 'Meeting',
              time: new Date(m.updatedAt || m.createdAt || m.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
              rawDate: new Date(m.updatedAt || m.createdAt || m.scheduledAt),
              icon: isLive ? 'podcasts' : 'video_call'
            });
          });
        }

        if (docs.status === 'fulfilled' && Array.isArray(docs.value)) {
          docs.value.forEach((d) => {
            items.push({
              id: `doc-${d._id || d.id}`,
              title: `Uploaded document "${d.title || d.fileName}"`,
              category: 'Document',
              time: new Date(d.createdAt || d.uploadedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
              rawDate: new Date(d.createdAt || d.uploadedAt),
              icon: 'description'
            });
          });
        }

        items.sort((a, b) => b.rawDate - a.rawDate);

        if (!cancelled) {
          setActivities(items);
        }
      } catch (error) {
        console.error('[ActivityView] Failed to load activity:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadActivity();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Workspace Activity Log</h2>
        <p className="text-xs text-on-surface-variant mt-1">Real-time audit trail of meeting events, document uploads, and workspace activity.</p>
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-3">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl animate-spin text-primary mb-2 block">progress_activity</span>
            <p className="text-xs font-mono">Loading workspace activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl opacity-50 block mb-2">history</span>
            <p className="text-sm font-semibold text-on-surface">No workspace activities recorded yet.</p>
            <p className="text-xs text-on-surface-variant mt-1">Meetings you schedule and files you upload will appear here.</p>
          </div>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-surface-container-high transition-colors border border-transparent hover:border-outline-variant/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">{a.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface">{a.title}</p>
                <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">{a.category} • {a.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
