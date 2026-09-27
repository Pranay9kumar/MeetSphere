import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserMeetings } from '../services/meetingService';
import MeetingDetailsModal from './MeetingDetailsModal';

export default function DashboardView({
  onJoinMeeting,
  onOpenNewMeeting,
  searchQuery
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [inspectMeeting, setInspectMeeting] = useState(null);
  const [showOnlyLive, setShowOnlyLive] = useState(false);

  const handleJoinMeetingClick = (meeting) => {
    const targetRoom = meeting?.roomName || meeting?.rawMeeting?.roomName;
    if (!targetRoom) {
      console.error('[DashboardView] Cannot join meeting without a room name:', meeting);
      return;
    }

    // A dashboard meeting is already persisted and authorized by the API.
    // Enter the room directly; scheduled meetings must not go through the lobby.
    if (onJoinMeeting) {
      onJoinMeeting({ ...meeting, roomName: targetRoom });
      return;
    }

    const meetingId = meeting?._id || meeting?.id || meeting?.rawMeeting?._id;
    if (!meetingId) {
      console.error('[DashboardView] Cannot join meeting without a meeting ID:', meeting);
      return;
    }

    navigate(`/meeting/${encodeURIComponent(meetingId)}`, {
      replace: false,
      state: {
        name: user?.name || user?.email || 'Workspace Member',
        roomId: targetRoom,
        meetingId,
        micEnabled: true,
        cameraEnabled: true
      }
    });
  };

  const handleCreateMeetingClick = () => {
    if (onOpenNewMeeting) {
      onOpenNewMeeting();
    } else {
      const randomSlug = 'meet-' + Math.random().toString(36).substring(2, 8);
      navigate(`/lobby/${randomSlug}`);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchMeetings() {
      try {
        setLoadError('');
        const data = await getUserMeetings();
        if (!cancelled) {
          setMeetings(data);
        }
      } catch (err) {
        if (!cancelled) setLoadError('Could not load meeting records.');
        console.error('[DashboardView] Failed to fetch meetings:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchMeetings();

    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  /**
   * Format a date object into a display-friendly format.
   */
  function formatMeetingDate(createdAt) {
    const d = new Date(createdAt);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      dateMonth: months[d.getMonth()],
      dateDay: d.getDate().toString().padStart(2, '0')
    };
  }

  /**
   * Map a backend meeting document to the display shape used by the UI.
   */
  function mapMeeting(m) {
    const { dateMonth, dateDay } = formatMeetingDate(m.createdAt);
    const recordingsCount = m.recordings?.length || 0;
    const hasRecordings = recordingsCount > 0;
    const hasChat = (m.chatMessageCount || 0) > 0;

    return {
      id: m._id,
      _id: m._id,
      title: m.title,
      roomName: m.roomName,
      status: m.status,
      dateMonth,
      dateDay,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: m.roomName,
      host: m.hostId?.name || 'You',
      participants: m.participants?.slice(0, 4) || [],
      extraCount: Math.max((m.participants?.length || 0) - 4, 0),
      participantRoster: m.participants || [],
      duration: m.duration || 0,
      chatHistory: m.chatHistory || [],
      aiMinutes: m.aiMinutes || null,
      isLiveNow: m.status === 'active',
      hasRecordings,
      recordingsCount,
      hasChat,
      rawMeeting: m,
      category: 'General'
    };
  }

  const displayMeetings = meetings.map(mapMeeting);

  const filteredMeetings = displayMeetings.filter((meeting) => {
    const matchesSearch = !searchQuery
      || meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
      || meeting.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (!showOnlyLive || meeting.isLiveNow);
  });

  const activeChannels = displayMeetings.filter((meeting) => meeting.isLiveNow);
  const activityItems = [...displayMeetings]
    .sort((a, b) => new Date(b.rawMeeting.updatedAt || b.rawMeeting.createdAt) - new Date(a.rawMeeting.updatedAt || a.rawMeeting.createdAt))
    .slice(0, 5)
    .map((meeting) => ({
      id: meeting.id,
      actor: meeting.host,
      title: `${meeting.isLiveNow ? 'started' : 'scheduled'} ${meeting.title}`,
      time: new Date(meeting.rawMeeting.updatedAt || meeting.rawMeeting.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    }));

  const currentDateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const totalRecordings = displayMeetings.reduce((sum, m) => sum + (m.recordingsCount || 0), 0);
  const totalMessages = displayMeetings.reduce((sum, m) => sum + (m.chatHistory?.length || 0), 0);
  const totalParticipants = displayMeetings.reduce((sum, m) => sum + (m.participantRoster?.length || 1), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {loadError && <div className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200"><span>{loadError}</span><button type="button" onClick={() => { setLoading(true); setLoadAttempt((value) => value + 1); }} className="flex items-center gap-2 font-bold hover:text-white"><span className="material-symbols-outlined text-sm">refresh</span> Retry</button></div>}
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-primary-container/30 via-surface-container-low to-surface-container border border-outline-variant p-6 md:p-8 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-primary/20 text-primary font-mono text-xs font-semibold rounded-full uppercase tracking-wider">
              Workspace Dashboard
            </span>
            <span className="text-xs text-on-surface-variant font-mono">{currentDateStr}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'Workspace Member'} 👋
          </h2>
          <p className="text-on-surface-variant text-sm sm:text-base mt-1 max-w-xl">
            You have <strong className="text-primary font-semibold">{displayMeetings.length} meetings</strong> available in your workspace.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <img src={user?.avatar} alt={user?.name || 'Workspace member'} className="h-9 w-9 rounded-full border border-primary/40 object-cover" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-on-surface">{user?.email || 'Authenticated workspace member'}</p>
              <p className="text-[11px] text-on-surface-variant">{user?.role || 'Workspace Member'} · {user?.status || 'Online'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCreateMeetingClick()}
            className="px-5 sm:px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center gap-2.5 hover:opacity-90 active:scale-95 transition-all shadow-glow"
          >
            <span className="material-symbols-outlined text-xl">videocam</span>
            <span>New Meeting</span>
          </button>
          <button
            onClick={handleCreateMeetingClick}
            className="px-4 py-3 bg-surface-container-high border border-outline-variant text-on-surface rounded-xl font-semibold text-sm hover:bg-surface-container-highest transition-all"
          >
            + Schedule
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">video_chat</span>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-on-surface">{displayMeetings.length}</p>
            <p className="text-xs text-on-surface-variant">Scheduled Calls</p>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-on-surface">{totalParticipants}</p>
            <p className="text-xs text-on-surface-variant">Active Teammates</p>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">forum</span>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-on-surface">{totalMessages}</p>
            <p className="text-xs text-on-surface-variant">Saved Messages</p>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">videocam</span>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-on-surface">{totalRecordings}</p>
            <p className="text-xs text-on-surface-variant">Cloud Recordings</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Meetings (Left 8 Cols) & Activity (Right 4 Cols) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Meetings */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl font-bold text-on-surface">
                Upcoming Scheduled Meetings
              </h3>
              <span className="px-2.5 py-0.5 bg-surface-container-high border border-outline-variant text-on-surface-variant rounded-full text-xs font-mono font-medium">
                {filteredMeetings.length} Today
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowOnlyLive((value) => !value)} aria-pressed={showOnlyLive} title="Toggle live meetings" className={`p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant border border-outline-variant transition-colors ${showOnlyLive ? 'bg-primary/20 text-primary' : 'bg-surface-container-low'}`}>
                <span className="material-symbols-outlined text-lg">filter_list</span>
              </button>
              <button onClick={() => navigate('/dashboard')} title="Refresh meetings" className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border border-outline-variant transition-colors">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className={`bg-surface-container-lowest p-6 rounded-2xl border transition-all duration-300 group hover:shadow-xl ${
                  meeting.isLiveNow
                    ? 'border-primary/60 ring-1 ring-primary/30'
                    : 'border-outline-variant hover:border-outline'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-start gap-5">
                    {/* Date Badge */}
                    <div
                      className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 font-mono shadow-inner ${
                        meeting.isLiveNow
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {meeting.dateMonth}
                      </span>
                      <span className="text-2xl font-bold font-display leading-tight">
                        {meeting.dateDay}
                      </span>
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                          {meeting.title}
                        </h4>
                        {meeting.isLiveNow && (
                          <span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                            Live Now
                          </span>
                        )}
                        {meeting.hasRecordings && (
                          <span className="px-2 py-0.5 bg-primary/15 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 border border-primary/25">
                            <span className="material-symbols-outlined text-xs">videocam</span>
                            Recording ({meeting.recordingsCount})
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-primary">
                            schedule
                          </span>
                          <span className="font-mono">{meeting.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-primary">
                            meeting_room
                          </span>
                          <span>{meeting.location}</span>
                        </div>
                        <span>{meeting.participantRoster.length} participants</span>
                        <span>{meeting.duration ? `${Math.floor(meeting.duration / 60)}m ${meeting.duration % 60}s` : 'Duration pending'}</span>
                        <span>{meeting.chatHistory.length} saved messages</span>
                      </div>

                      {/* Participant Avatars */}
                      <div className="flex items-center -space-x-2 mt-4">
                        {meeting.participants.map((p, idx) => (
                          <img
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-surface object-cover shadow-sm"
                            src={p.avatar}
                            alt={p.name}
                            title={p.name}
                          />
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container font-mono shadow-sm">
                          +{meeting.extraCount}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => setInspectMeeting(meeting.rawMeeting || meeting)}
                      className="w-full md:w-auto px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant transition-all"
                      title="Inspect chat transcript and video recording"
                    >
                      <span className="material-symbols-outlined text-base text-primary">description</span>
                      <span>Logs & Recording</span>
                    </button>

                    <button
                      onClick={() => handleJoinMeetingClick(meeting)}
                      className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        meeting.isLiveNow
                          ? 'bg-primary text-on-primary hover:opacity-90 shadow-glow'
                          : 'bg-surface-container-high text-on-surface hover:bg-primary/20 hover:text-primary border border-outline-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">play_arrow</span>
                      <span>Join Meeting</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Schedule Card Prompt */}
            <div
              onClick={handleCreateMeetingClick}
              className="bg-surface-container-lowest/50 p-6 rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center py-10 hover:border-primary/50 cursor-pointer transition-all group opacity-80 hover:opacity-100"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:text-primary group-hover:scale-110 transition-all mb-3">
                <span className="material-symbols-outlined text-3xl">add_circle</span>
              </div>
              <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">
                Schedule a new sync with your team
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                Create a recurring meeting or invite external clients
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed & Live Channels */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Live Channels Box */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-on-surface">
                Active Channels
              </h3>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {activeChannels.length} Live
              </span>
            </div>

            <div className="space-y-2">
              {activeChannels.map((meeting) => <button key={meeting.id} type="button" onClick={() => handleJoinMeetingClick(meeting)} className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-surface-container-high cursor-pointer transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary fill text-xl">
                    radio_button_checked
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {meeting.title}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">Active call in progress</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-mono font-medium rounded-md">
                  {meeting.participantRoster.length || 1} online
                </span>
              </button>)}
              {activeChannels.length === 0 && <p className="py-4 text-center text-xs text-on-surface-variant">No active channels right now.</p>}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant shadow-sm">
            <h3 className="font-display text-lg font-bold text-on-surface mb-6">
              Activity Feed
            </h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant">
              {activityItems.map((item, index) => <div key={item.id} className="flex gap-4 relative">
                <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-primary' : 'bg-outline-variant'} ring-4 ring-surface-container-low shrink-0 mt-1`}></div>
                <div className="flex-1"><p className="text-sm text-on-surface"><strong className="font-semibold">{item.actor}</strong> {item.title}</p><p className="font-mono text-xs text-on-surface-variant mt-1">{item.time}</p></div>
              </div>)}
              {activityItems.length === 0 && <p className="text-xs text-on-surface-variant">No workspace activity yet.</p>}
            </div>

            <button onClick={() => navigate('/activity')} className="w-full mt-6 py-2.5 border border-outline-variant rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors">
              View All Workspace Activity
            </button>
          </div>
        </div>
      </div>

      {/* Meeting Details & Recording Inspector Modal */}
      <MeetingDetailsModal
        isOpen={Boolean(inspectMeeting)}
        onClose={() => setInspectMeeting(null)}
        initialMeeting={inspectMeeting}
        roomName={inspectMeeting?.roomName}
      />
    </div>
  );
}
