import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserMeetings, getUserDocuments } from '../services/meetingService';

export default function Header({
  isMobileOpen,
  setIsMobileOpen,
  theme,
  setTheme,
  searchQuery,
  setSearchQuery,
  onStartInstantMeeting,
  onOpenNewMeeting
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activities, setActivities] = useState([]);
  const [rawMeetings, setRawMeetings] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('meetsphere_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  const userInitial = user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U');

  // Fetch real activities on mount and whenever notification menu opens
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
          setRawMeetings(meetings.value);
          meetings.value.slice(0, 10).forEach((m) => {
            const isLive = m.status === 'active';
            const isScheduled = Boolean(m.scheduledAt && new Date(m.scheduledAt) > new Date());
            items.push({
              id: `meet-${m._id || m.id}`,
              type: 'meeting',
              title: `${m.hostId?.name || user?.name || 'You'} ${isLive ? 'started live room' : isScheduled ? 'scheduled' : 'created'} "${m.title}"`,
              time: m.updatedAt || m.createdAt || m.scheduledAt,
              icon: isLive ? 'podcasts' : 'video_call',
              meetingId: m._id || m.id,
              roomName: m.roomName
            });
          });
        }

        if (docs.status === 'fulfilled' && Array.isArray(docs.value)) {
          docs.value.slice(0, 5).forEach((d) => {
            items.push({
              id: `doc-${d._id || d.id}`,
              type: 'document',
              title: `Document "${d.title || d.fileName}" uploaded`,
              time: d.createdAt || d.uploadedAt,
              icon: 'description',
              targetTab: 'documents'
            });
          });
        }

        // Sort latest first
        items.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

        if (!cancelled) {
          setActivities(items);
        }
      } catch (err) {
        console.error('[Header] Failed to load notifications:', err);
      }
    }

    loadActivity();
    return () => { cancelled = true; };
  }, []);

  const unreadCount = activities.filter((a) => !readIds.includes(a.id)).length;

  const handleMarkAllRead = () => {
    const allIds = activities.map((a) => a.id);
    setReadIds(allIds);
    localStorage.setItem('meetsphere_read_notifications', JSON.stringify(allIds));
  };

  const handleNotificationClick = (item) => {
    if (!readIds.includes(item.id)) {
      const updated = [...readIds, item.id];
      setReadIds(updated);
      localStorage.setItem('meetsphere_read_notifications', JSON.stringify(updated));
    }
    setShowNotifications(false);
    if (item.type === 'meeting' && item.meetingId) {
      navigate(`/meeting/${encodeURIComponent(item.meetingId)}`);
    } else if (item.type === 'document') {
      navigate('/documents');
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const q = (searchQuery || '').trim().toLowerCase();
  const searchResults = q
    ? rawMeetings.filter((m) => {
        return (
          (m.title && m.title.toLowerCase().includes(q)) ||
          (m.roomName && m.roomName.toLowerCase().includes(q)) ||
          (m.teamName && m.teamName.toLowerCase().includes(q)) ||
          (m.hostId?.name && m.hostId.name.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSelectSearchResult = (meeting) => {
    setIsSearchFocused(false);
    navigate(`/meeting/${encodeURIComponent(meeting._id || meeting.id)}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface/90 px-4 md:px-8 backdrop-blur-xl transition-colors">
      {/* Left: Mobile hamburger menu & Search Bar */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile menu toggle button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high md:hidden"
          title="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        {/* Workspace Search Input with Live Dropdown & Match Badge */}
        <div className="relative w-full max-w-xs sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings by title, team, host..."
            className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl pl-9 pr-20 py-2 font-body text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />

          {/* Badge & Clear in Search Input */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {q && (
              <span className="rounded-md bg-primary/15 text-primary px-1.5 py-0.5 text-[10px] font-bold font-mono">
                {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
              </span>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-outline hover:text-on-surface p-0.5"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Live Search Results Dropdown Under Search Box */}
          {q && isSearchFocused && (
            <div
              className="absolute left-0 top-full mt-2 w-full max-w-md sm:max-w-lg bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[380px] flex flex-col"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
            >
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant mb-2">
                <span className="text-xs font-bold text-on-surface font-mono">
                  Search Results ({searchResults.length})
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-2xl opacity-40 block mb-1">search_off</span>
                    <p className="text-xs">No meetings matching "{searchQuery}"</p>
                  </div>
                ) : (
                  searchResults.slice(0, 8).map((meeting) => {
                    const isLive = meeting.status === 'active';
                    const isScheduled = Boolean(meeting.scheduledAt && new Date(meeting.scheduledAt) > new Date());
                    return (
                      <div
                        key={meeting._id || meeting.id}
                        onClick={() => handleSelectSearchResult(meeting)}
                        className="p-2.5 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-between gap-3 group border border-transparent hover:border-outline-variant/60"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                              {meeting.title}
                            </p>
                            {isLive && (
                              <span className="px-1.5 py-0.2 bg-error-container text-on-error-container text-[9px] font-bold rounded uppercase">
                                Live
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 bg-surface-container-highest text-on-surface-variant text-[9px] rounded font-mono">
                              {meeting.teamName || 'General'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono">
                            <span>Host: {meeting.hostId?.name || user?.name || 'You'}</span>
                            <span>•</span>
                            <span>{new Date(meeting.scheduledAt || meeting.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-on-primary transition-all shrink-0"
                        >
                          {isLive ? 'Join Live' : 'Open'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Quick Instant Call Action */}
        <button
          onClick={onStartInstantMeeting}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 active:scale-95 transition-all"
          title="Start Instant Meeting"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Start Call Now</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          <span className="material-symbols-outlined text-xl">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all relative"
            title="Activity Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[420px] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-on-surface">Workspace Activity</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold font-mono">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {activities.length === 0 ? (
                  <div className="py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl opacity-50 block mb-1">notifications_off</span>
                    <p className="text-xs">No recent activity</p>
                  </div>
                ) : (
                  activities.map((n) => {
                    const isUnread = !readIds.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                          isUnread
                            ? 'bg-primary-container/15 border-l-2 border-primary'
                            : 'hover:bg-surface-container-high opacity-80'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-base mt-0.5 ${isUnread ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {n.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-on-surface line-clamp-2">{n.title}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">{formatTimeAgo(n.time)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t border-outline-variant mt-2 text-center shrink-0">
                <button
                  onClick={() => { setShowNotifications(false); navigate('/activity'); }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View full activity log →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-[1px] bg-outline-variant mx-0.5 sm:mx-1"></div>

        {/* Schedule Call Button */}
        <button
          onClick={onOpenNewMeeting}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-base">video_call</span>
          <span className="hidden sm:inline">Schedule</span>
        </button>

        {/* User profile dropdown menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="grid h-8 w-8 place-items-center rounded-full border border-primary/40 bg-primary/20 text-xs font-bold text-primary hover:scale-105 transition-all"
            title="User Profile"
          >
            {userInitial}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-outline-variant/60 mb-2">
                <p className="text-xs font-bold text-on-surface truncate">{user?.name || 'Workspace User'}</p>
                <p className="text-[10px] text-on-surface-variant truncate">{user?.email || 'authenticated'}</p>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); logout(); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-error hover:bg-error/10 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
