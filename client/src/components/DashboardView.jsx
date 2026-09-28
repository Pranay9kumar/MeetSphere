import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserMeetings, deleteMeeting } from '../services/meetingService';
import MeetingDetailsModal from './MeetingDetailsModal';

export default function DashboardView({
  onJoinMeeting,
  onOpenNewMeeting,
  searchQuery: propSearchQuery
}) {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const { user } = useAuth();
  
  const searchQuery = propSearchQuery ?? outletContext.searchQuery ?? '';
  const setSearchQuery = outletContext.setSearchQuery;
  const handleOpenNewMeeting = onOpenNewMeeting ?? outletContext.onOpenNewMeeting;

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [inspectMeeting, setInspectMeeting] = useState(null);
  const [showOnlyLive, setShowOnlyLive] = useState(false);
  const [pastExpanded, setPastExpanded] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  // Activity feed items that have been dismissed (local state only)
  const [dismissedActivityIds, setDismissedActivityIds] = useState(new Set());

  const handleJoinMeetingClick = (meeting) => {
    const targetRoom = meeting?.roomName || meeting?.rawMeeting?.roomName;
    if (!targetRoom) {
      console.error('[DashboardView] Cannot join meeting without a room name:', meeting);
      return;
    }

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
    if (handleOpenNewMeeting) {
      handleOpenNewMeeting();
    } else {
      const randomSlug = 'meet-' + Math.random().toString(36).substring(2, 8);
      navigate(`/lobby/${randomSlug}`);
    }
  };

  const handleDeleteMeeting = async (meeting) => {
    const meetingId = meeting._id || meeting.id;
    if (!meetingId) return;
    if (!window.confirm(`Delete "${meeting.title}"? This cannot be undone.`)) return;
    setDeletingId(meetingId);
    try {
      await deleteMeeting(meetingId);
      setMeetings((prev) => prev.filter((m) => m._id !== meetingId && m._id !== meeting.id));
    } catch (err) {
      console.error('[DashboardView] Failed to delete meeting:', err);
      alert('Failed to delete meeting. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDismissActivity = (activityId) => {
    setDismissedActivityIds((prev) => new Set([...prev, activityId]));
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
  function formatMeetingDate(dateValue) {
    const d = new Date(dateValue);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      dateMonth: months[d.getMonth()],
      dateDay: d.getDate().toString().padStart(2, '0')
    };
  }

  /**
   * Determine whether a meeting is in the past based on:
   * startTime (scheduledAt or createdAt) + durationMinutes.
   */
  function isMeetingPast(m) {
    if (m.status === 'completed') return true;
    const startTime = m.scheduledAt ? new Date(m.scheduledAt) : new Date(m.createdAt);
    const durationMs = (m.durationMinutes || 30) * 60 * 1000;
    return new Date() > new Date(startTime.getTime() + durationMs);
  }

  /**
   * Map a backend meeting document to the display shape used by the UI.
   */
  function mapMeeting(m) {
    // Use scheduledAt as the display date; fall back to createdAt
    const displayDate = m.scheduledAt || m.createdAt;
    const { dateMonth, dateDay } = formatMeetingDate(displayDate);
    const recordingsCount = m.recordings?.length || 0;
    const hasRecordings = recordingsCount > 0;
    const hasChat = (m.chatMessageCount || 0) > 0;
    const past = isMeetingPast(m);

    return {
      id: m._id,
      _id: m._id,
      title: m.title,
      roomName: m.roomName,
      status: m.status,
      dateMonth,
      dateDay,
      time: new Date(displayDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: m.roomName,
      host: m.hostId?.name || 'You',
      participants: m.participants?.slice(0, 4) || [],
      extraCount: Math.max((m.participants?.length || 0) - 4, 0),
      participantRoster: m.participants || [],
      duration: m.duration || 0,
      chatHistory: m.chatHistory || [],
      aiMinutes: m.aiMinutes || null,
      isLiveNow: m.status === 'active',
      isPast: past,
      hasRecordings,
      recordingsCount,
      hasChat,
      rawMeeting: m,
      category: m.teamName || (m.description?.includes('meeting') ? m.description.split(' ')[0] : 'General')
    };
  }

  const displayMeetings = meetings.map(mapMeeting);
  const q = searchQuery.toLowerCase().trim();

  const matchesSearch = (m) => {
    if (!q) return true;
    return (
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.location && m.location.toLowerCase().includes(q)) ||
      (m.host && m.host.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q)) ||
      (m.rawMeeting?.description && m.rawMeeting.description.toLowerCase().includes(q))
    );
  };

  const upcomingMeetings = displayMeetings.filter((m) => {
    return !m.isPast && matchesSearch(m) && (!showOnlyLive || m.isLiveNow);
  });

  const pastMeetings = displayMeetings
    .filter((m) => m.isPast && matchesSearch(m))
    .sort((a, b) => new Date(b.rawMeeting.updatedAt || b.rawMeeting.createdAt) - new Date(a.rawMeeting.updatedAt || a.rawMeeting.createdAt));

  const activeChannels = displayMeetings.filter((meeting) => meeting.isLiveNow);
  const activityItems = [...displayMeetings]
    .sort((a, b) => new Date(b.rawMeeting.updatedAt || b.rawMeeting.createdAt) - new Date(a.rawMeeting.updatedAt || a.rawMeeting.createdAt))
    .slice(0, 10)
    .filter((meeting) => !dismissedActivityIds.has(meeting.id))
    .slice(0, 5)
    .map((meeting) => ({
      id: meeting.id,
      actor: meeting.host,
      title: `${meeting.isLiveNow ? 'started' : meeting.isPast ? 'completed' : 'scheduled'} ${meeting.title}`,
      time: new Date(meeting.rawMeeting.updatedAt || meeting.rawMeeting.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    }));

  const currentDateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const totalRecordings = displayMeetings.reduce((sum, m) => sum + (m.recordingsCount || 0), 0);
  const totalMessages = displayMeetings.reduce((sum, m) => sum + (m.chatHistory?.length || 0), 0);
  const totalParticipants = displayMeetings.reduce((sum, m) => sum + (m.participantRoster?.length || 1), 0);

  /** Renders a meeting card for both upcoming and past sections */
  function MeetingCard({ meeting, isPastSection }) {
    const isDeleting = deletingId === (meeting._id || meeting.id);
    return (
      <div
        className={`bg-surface-container-lowest p-6 rounded-2xl border transition-all duration-300 group hover:shadow-xl ${
          meeting.isLiveNow
            ? 'border-primary/60 ring-1 ring-primary/30'
            : isPastSection
            ? 'border-outline-variant opacity-75 hover:opacity-100'
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
                  : isPastSection
                  ? 'bg-surface-container text-on-surface-variant/60'
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
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-mono">
                  {meeting.category}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-on-surface-variant font-mono">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {meeting.time}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">tag</span>
                  {meeting.location}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Host: {meeting.host}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setInspectMeeting(meeting.rawMeeting || meeting)}
              className="w-full md:w-auto px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant transition-all"
              title="Inspect chat transcript and video recording"
            >
              <span className="material-symbols-outlined text-base text-primary">description</span>
              <span>Logs &amp; Recording</span>
            </button>

            {!isPastSection && (
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
            )}

            {/* Delete button */}
            <button
              onClick={() => handleDeleteMeeting(meeting)}
              disabled={isDeleting}
              title="Delete meeting"
              className="w-full md:w-auto px-3 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-error/10 text-error hover:bg-error/20 border border-error/30 transition-all disabled:opacity-50"
            >
              {isDeleting
                ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-base">delete</span>
              }
              <span className="hidden sm:inline">{isDeleting ? 'Deleting…' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {loadError && (
        <div className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => { setLoading(true); setLoadAttempt((value) => value + 1); }}
            className="flex items-center gap-2 font-bold hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">refresh</span> Retry
          </button>
        </div>
      )}

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
            You have <strong className="text-primary font-semibold">{upcomingMeetings.length} upcoming</strong> and{' '}
            <strong className="text-on-surface-variant font-semibold">{pastMeetings.length} past</strong> meetings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateMeetingClick}
            className="px-5 sm:px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center gap-2.5 hover:opacity-90 active:scale-95 transition-all shadow-glow"
          >
            <span className="material-symbols-outlined text-xl">videocam</span>
            <span>Start Meeting</span>
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
            <p className="text-2xl font-bold font-display text-on-surface">{upcomingMeetings.length}</p>
            <p className="text-xs text-on-surface-variant">Upcoming Meetings</p>
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

          {/* ── UPCOMING MEETINGS ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl font-bold text-on-surface">
                Upcoming Meetings
              </h3>
              <span className="px-2.5 py-0.5 bg-surface-container-high border border-outline-variant text-on-surface-variant rounded-full text-xs font-mono font-medium">
                {upcomingMeetings.length}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowOnlyLive((value) => !value)}
                aria-pressed={showOnlyLive}
                title="Toggle live meetings"
                className={`p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant border border-outline-variant transition-colors ${
                  showOnlyLive ? 'bg-primary/20 text-primary' : 'bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-lg">filter_list</span>
              </button>
              <button
                onClick={() => setLoadAttempt((v) => v + 1)}
                title="Refresh meetings"
                className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border border-outline-variant transition-colors"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} isPastSection={false} />
            ))}

            {upcomingMeetings.length === 0 && (
              <div className="py-8 text-center text-sm text-on-surface-variant bg-surface-container-lowest/50 border border-outline-variant rounded-2xl p-6">
                <span className="material-symbols-outlined text-3xl text-outline mb-2 block">event_busy</span>
                <p className="font-semibold text-on-surface">
                  {q ? `No upcoming meetings match "${searchQuery}"` : 'No upcoming meetings.'}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {q ? 'Try clearing your search keyword.' : 'Schedule a new sync below.'}
                </p>
                {q && setSearchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}

            {/* Schedule Card Prompt */}
            {!q && (
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
            )}
          </div>

          {/* ── PAST MEETINGS ── */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setPastExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors group"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Past Meetings
                </h3>
                <span className="px-2.5 py-0.5 bg-surface-container-highest border border-outline-variant text-on-surface-variant rounded-full text-xs font-mono font-medium">
                  {pastMeetings.length}
                </span>
              </div>
              <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${pastExpanded ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {pastExpanded && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {pastMeetings.length === 0 && (
                  <p className="py-4 text-center text-sm text-on-surface-variant">
                    {q ? `No past meetings match "${searchQuery}"` : 'No past meetings yet.'}
                  </p>
                )}
                {pastMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} isPastSection={true} />
                ))}
              </div>
            )}
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
              {activeChannels.map((meeting) => (
                <button
                  key={meeting.id}
                  type="button"
                  onClick={() => handleJoinMeetingClick(meeting)}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-surface-container-high cursor-pointer transition-colors group"
                >
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
                </button>
              ))}
              {activeChannels.length === 0 && (
                <p className="py-4 text-center text-xs text-on-surface-variant">No active channels right now.</p>
              )}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold text-on-surface">
                Activity Feed
              </h3>
              {dismissedActivityIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => setDismissedActivityIds(new Set())}
                  className="text-[10px] text-on-surface-variant hover:text-primary font-mono transition-colors"
                  title="Restore dismissed items"
                >
                  restore all
                </button>
              )}
            </div>
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant">
              {activityItems.map((item, index) => (
                <div key={item.id} className="flex gap-4 relative group/activity">
                  <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-primary' : 'bg-outline-variant'} ring-4 ring-surface-container-low shrink-0 mt-1`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface">
                      <strong className="font-semibold">{item.actor}</strong> {item.title}
                    </p>
                    <p className="font-mono text-xs text-on-surface-variant mt-1">{item.time}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDismissActivity(item.id)}
                    title="Dismiss this activity item"
                    className="shrink-0 opacity-0 group-hover/activity:opacity-100 transition-opacity p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-error"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              {activityItems.length === 0 && (
                <p className="text-xs text-on-surface-variant">No workspace activity yet.</p>
              )}
            </div>

            <button
              onClick={() => navigate('/activity')}
              className="w-full mt-6 py-2.5 border border-outline-variant rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
            >
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
