import React, { useState } from 'react';

export default function Header({
  isCollapsed,
  theme,
  setTheme,
  searchQuery,
  setSearchQuery,
  onStartInstantMeeting,
  onOpenNewMeeting
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = [
    { id: 1, title: 'Sarah Chen updated Product Roadmap', time: '12 mins ago', unread: true },
    { id: 2, title: 'Team Design added 4 new assets', time: '2 hours ago', unread: true },
    { id: 3, title: 'Weekly system report ready for download', time: '4 hours ago', unread: false },
  ];

  return (
    <header
      className={`fixed top-0 right-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center h-16 px-8 transition-all duration-300 ${
        isCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'
      }`}
    >
      {/* Left Search Bar */}
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspace (meetings, docs, channels)..."
            className="w-full bg-surface-container-low border border-transparent rounded-xl pl-10 pr-4 py-2 font-body text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Quick Instant Call Action */}
        <button
          onClick={onStartInstantMeeting}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 active:scale-95 transition-all"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Start Call Now</span>
        </button>

        {/* Theme Mode Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
          title={`Switch to ${theme === 'dark' ? 'Clean Slate (Light)' : 'Deep Space (Dark)'} theme`}
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
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-3">
                <h4 className="font-bold text-sm text-on-surface">Workspace Activity</h4>
                <span className="text-xs text-primary cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                      n.unread ? 'bg-primary-container/10 border-l-2 border-primary' : 'hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                      mark_chat_unread
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-on-surface">{n.title}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Icon */}
        <button
          onClick={() => alert("Nexus Enterprise Workspace v2.4\nDocs: https://nexus-collab.internal\nSupport: support@nexus.io")}
          className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
          title="Help & Support"
        >
          <span className="material-symbols-outlined text-xl">help</span>
        </button>

        <div className="h-6 w-[1px] bg-outline-variant mx-1"></div>

        {/* User Quick Badge */}
        <button
          onClick={onOpenNewMeeting}
          className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">video_call</span>
          <span>Schedule</span>
        </button>
      </div>
    </header>
  );
}
