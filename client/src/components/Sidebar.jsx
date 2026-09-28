import React from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'activity', label: 'Activity', icon: 'notifications', badge: 3 },
  { id: 'channels', label: 'Channels', icon: 'forum' },
  { id: 'documents', label: 'Documents', icon: 'description' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) {
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-outline-variant bg-surface px-4 py-6 transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20 md:px-2' : 'md:w-64'}`}
      >
        {/* Desktop Collapse button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 z-50 rounded-full border border-outline-variant bg-surface p-1 text-on-surface-variant shadow-md transition-transform hover:scale-110 hover:text-primary"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className={`material-symbols-outlined text-[18px] transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
            chevron_left
          </span>
        </button>

        {/* Brand header */}
        <div className={`mb-6 flex items-center justify-between ${isCollapsed ? 'md:px-1 md:text-center' : 'px-2'}`}>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-lg font-bold text-on-primary shadow-glow">
              M
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight text-primary">MeetSphere</h1>
                <p className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">Enterprise Workspace</p>
              </div>
            )}
          </div>

          {/* Close button for mobile view */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 text-on-surface-variant hover:text-on-surface md:hidden"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`group relative flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all ${
                activeTab === item.id
                  ? 'border-r-4 border-primary bg-primary-container/20 font-semibold text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              } ${isCollapsed && !isMobileOpen ? 'md:justify-center md:px-0' : ''}`}
            >
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              {(!isCollapsed || isMobileOpen) && <span className="flex-1 text-sm font-medium">{item.label}</span>}
              {(!isCollapsed || isMobileOpen) && item.badge && (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
