import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NewMeetingModal from '../components/NewMeetingModal';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const activeTab = location.pathname.slice(1) || 'dashboard';

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleStartInstantMeeting = () => {
    setIsMeetingModalOpen(true);
  };

  const handleMeetingCreated = (meeting, { scheduled } = {}) => {
    setIsMeetingModalOpen(false);

    // If meeting is scheduled for a future time, keep the user on dashboard / home screen
    if (scheduled && meeting.scheduledAt && new Date(meeting.scheduledAt) > new Date()) {
      const start = new Date(meeting.scheduledAt);
      const end = new Date(start.getTime() + (meeting.durationMinutes || 30) * 60000);
      const calendarUrl = new URL('https://calendar.google.com/calendar/render');
      calendarUrl.searchParams.set('action', 'TEMPLATE');
      calendarUrl.searchParams.set('text', meeting.title);
      calendarUrl.searchParams.set('dates', `${start.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}/${end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`);
      calendarUrl.searchParams.set('details', `MeetSphere meeting room: ${meeting.roomName}`);
      window.open(calendarUrl.toString(), '_blank', 'noopener,noreferrer');
      navigate('/dashboard');
      return;
    }

    // Otherwise, if meeting starts at current time / instant, go to preview / lobby screen
    navigate(`/lobby/${encodeURIComponent(meeting.roomName)}`, {
      state: {
        meetingId: meeting._id || meeting.id,
        title: meeting.title,
        roomId: meeting.roomName
      }
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-on-surface">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => navigate(`/${tab}`)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ml-0 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Header
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          theme={theme}
          setTheme={setTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onStartInstantMeeting={handleStartInstantMeeting}
          onOpenNewMeeting={() => setIsMeetingModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-surface/50 p-4 md:p-8">
          <Outlet context={{ searchQuery, setSearchQuery, onOpenNewMeeting: () => setIsMeetingModalOpen(true) }} />
        </main>
      </div>
      <NewMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onStartMeeting={handleMeetingCreated}
      />
    </div>
  );
}