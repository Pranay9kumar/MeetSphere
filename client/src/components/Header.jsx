import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Sarah Chen updated Product Roadmap', time: '12 mins ago', unread: true },
    { id: 2, title: 'Team Design added 4 new assets', time: '2 hours ago', unread: true },
    { id: 3, title: 'Weekly system report ready for download', time: '4 hours ago', unread: false },
  ];

  const userInitial = user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U');

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface/80 px-4 md:px-8 backdrop-blur-xl transition-all">
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

        {/* Workspace Search Input */}
        <div className="relative w-full max-w-xs sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspace..."
            className="w-full bg-surface-container-low border border-transparent rounded-xl pl-9 pr-8 py-2 font-body text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Quick Instant Call Action */}
        <button
          onClick={onStartInstantMeeting}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 active:scale-95 transition-all"
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
          title={`Switch theme`}
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
            <span className="absolute top-1.5 right-1.5 w-2 w-2 bg-primary rounded-full border-2 border-surface"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-3">
                <h4 className="font-bold text-xs sm:text-sm text-on-surface">Workspace Activity</h4>
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
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">
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
