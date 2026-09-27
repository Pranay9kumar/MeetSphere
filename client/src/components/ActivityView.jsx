import React, { useEffect, useState } from 'react';
import { getUserMeetings } from '../services/meetingService';

export default function ActivityView() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    getUserMeetings().then((meetings) => setActivities(meetings.map((meeting) => ({
      id: meeting._id,
      title: `${meeting.hostId?.name || 'You'} ${meeting.status === 'active' ? 'started' : 'scheduled'} ${meeting.title}`,
      category: 'Meeting',
      time: new Date(meeting.updatedAt || meeting.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      icon: 'video_chat'
    })))).catch((error) => console.error('[ActivityView] Failed to load activity:', error));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Workspace Activity Log</h2>
        <p className="text-xs text-on-surface-variant mt-1">Real-time audit trail of meeting events, document edits, and channel huddles.</p>
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
        {activities.map((a) => (
          <div key={a.id} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-surface-container-high transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">{a.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface">{a.title}</p>
              <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">{a.category} • {a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
