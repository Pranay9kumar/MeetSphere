import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMeeting } from '../services/meetingService';

export default function ChannelsView({ onJoinMeeting }) {
  const navigate = useNavigate();
  const [activeChannelId, setActiveChannelId] = useState('design-sync');
  const [messages, setMessages] = useState({
    'design-sync': [
      { id: 1, author: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', time: '10:14 AM', text: 'Hey team, I uploaded the new Deep Slate dark mode color tokens!' },
      { id: 2, author: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', time: '10:18 AM', text: 'Awesome! We are starting the live video sync now in lobby A.' }
    ],
    'engineering': [
      { id: 1, author: 'David Lin', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', time: '9:30 AM', text: 'Vite build target updated for ES2022 compatibility.' }
    ],
    'marketing': [
      { id: 1, author: 'Jordan Taylor', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', time: 'Yesterday', text: 'Q4 Launch deck visuals ready for review.' }
    ]
  });
  const [inputMsg, setInputMsg] = useState('');

  const channels = [
    { id: 'design-sync', name: 'Design Sync', isLive: true, membersCount: 14, unread: 2 },
    { id: 'engineering', name: 'Engineering Architecture', isLive: false, membersCount: 28, unread: 0 },
    { id: 'marketing', name: 'Marketing QA', isLive: true, membersCount: 9, unread: 1 },
    { id: 'general', name: 'General Announcements', isLive: false, membersCount: 45, unread: 0 }
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const msg = {
      id: Date.now(),
      author: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputMsg.trim()
    };
    setMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), msg]
    }));
    setInputMsg('');
  };

  const currentChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const activeMsgs = messages[activeChannelId] || [];
  const joinMeeting = async (meeting) => {
    if (onJoinMeeting) return onJoinMeeting(meeting);
    try {
      const createdMeeting = await createMeeting({ title: meeting.title });
      navigate(`/lobby/${encodeURIComponent(createdMeeting.roomName)}`);
    } catch (error) {
      console.error('[ChannelsView] Failed to create huddle:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl bg-surface-container-low border border-outline-variant overflow-hidden shadow-sm animate-in fade-in duration-300">
      {/* Channels List (Left) */}
      <div className="w-64 border-r border-outline-variant p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-on-surface">Workspace Channels</h3>
            <button className="p-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>

          <div className="space-y-1">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannelId(ch.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                  activeChannelId === ch.id
                    ? 'bg-primary-container/20 text-primary font-bold border-r-2 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">#</span>
                  <span className="text-xs truncate">{ch.name}</span>
                </div>
                {ch.isLive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Start Channel Call */}
        <button
          onClick={() => joinMeeting({ title: `${currentChannel.name} Huddle` })}
          className="w-full py-3 bg-primary/10 border border-primary/30 text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-base">video_call</span>
          <span>Start Channel Huddle</span>
        </button>
      </div>

      {/* Main Channel Message Feed */}
      <div className="flex-1 flex flex-col justify-between bg-surface-container-lowest">
        {/* Channel Header */}
        <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold text-base text-on-surface">
              #{currentChannel.name}
            </h3>
            {currentChannel.isLive && (
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold rounded-full">
                Live Video Call Active
              </span>
            )}
          </div>
          <button
            onClick={() => joinMeeting({ title: currentChannel.name })}
            className="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">play_arrow</span>
            <span>Join Huddle</span>
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {activeMsgs.map((m) => (
            <div key={m.id} className="flex items-start gap-4">
              <img className="w-10 h-10 rounded-full object-cover shrink-0" src={m.avatar} alt={m.author} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs text-on-surface">{m.author}</span>
                  <span className="text-[10px] text-on-surface-variant font-mono">{m.time}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant text-xs text-on-surface leading-relaxed max-w-xl">
                  {m.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-outline-variant flex gap-3 bg-surface-container-low">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={`Message #${currentChannel.name}...`}
            className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs hover:opacity-90 transition-all"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
