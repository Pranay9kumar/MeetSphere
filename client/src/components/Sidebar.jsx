import React, { useEffect, useState } from 'react';
import { MessageCircle, Send, Users, X } from 'lucide-react';
import { useRoomContext, useParticipants } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

export function RoomSidebar({ open, onClose }) {
  const room = useRoomContext();
  const participants = useParticipants();
  const [tab, setTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [hands, setHands] = useState([]);

  useEffect(() => {
    const onData = (payload, participant) => {
      try {
        const event = JSON.parse(new TextDecoder().decode(payload));
        if (event.type === 'chat-message') setMessages((current) => [...current, { ...event, sender: participant?.name || participant?.identity || 'Participant' }]);
        if (event.type === 'hand-raise') setHands((current) => event.raised ? [...new Set([...current, participant?.identity])] : current.filter((identity) => identity !== participant?.identity));
      } catch { /* Ignore non-JSON LiveKit data packets. */ }
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => room.off(RoomEvent.DataReceived, onData);
  }, [room]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    await room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'chat-message', content: draft.trim(), sentAt: new Date().toISOString() })), { reliable: true });
    setMessages((current) => [...current, { content: draft.trim(), sender: 'You', sentAt: new Date().toISOString() }]);
    setDraft('');
  };

  return <aside className={`fixed right-0 top-0 z-20 flex h-full w-[min(92vw,380px)] flex-col border-l border-outline-variant bg-surface-container-low/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}><header className="flex items-center justify-between border-b border-outline-variant px-5 py-4"><div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /><span className="font-display font-bold">Room panel</span></div><button type="button" title="Close panel" onClick={onClose} className="icon-button"><X /></button></header><div className="flex border-b border-outline-variant px-4"><button type="button" onClick={() => setTab('chat')} className={`flex-1 border-b-2 py-3 text-xs font-bold ${tab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>Chat</button><button type="button" onClick={() => setTab('people')} className={`flex-1 border-b-2 py-3 text-xs font-bold ${tab === 'people' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>People · {participants.length}</button></div>{tab === 'chat' ? <><div className="flex-1 space-y-3 overflow-y-auto p-5">{messages.length === 0 && <p className="py-10 text-center text-xs text-on-surface-variant">No messages yet. Start the thread.</p>}{messages.map((message, index) => <div key={`${message.sentAt}-${index}`} className="rounded-xl bg-surface-container px-3 py-2"><div className="flex justify-between gap-3 text-[10px] font-bold text-primary"><span>{message.sender}</span><span className="text-on-surface-variant">{new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><p className="mt-1 text-xs leading-5 text-on-surface">{message.content}</p></div>)}</div><form onSubmit={sendMessage} className="flex gap-2 border-t border-outline-variant p-4"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-outline-variant bg-surface-container px-3 py-2.5 text-xs outline-none focus:border-primary" /><button type="submit" title="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-on-primary"><Send className="h-4 w-4" /></button></form></> : <div className="flex-1 space-y-2 overflow-y-auto p-5">{participants.map((participant) => <div key={participant.identity} className="flex items-center justify-between rounded-xl bg-surface-container px-3 py-3"><div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary">{(participant.name || participant.identity).slice(0, 2).toUpperCase()}</div><div><p className="text-xs font-bold">{participant.name || participant.identity}</p><p className="text-[10px] text-on-surface-variant">{participant.isMicrophoneEnabled ? 'Mic on' : 'Muted'}{hands.includes(participant.identity) ? ' · Hand raised' : ''}</p></div></div><Users className="h-4 w-4 text-on-surface-variant" /></div>)}</div>}</aside>;
}

function LegacySidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onOpenNewMeeting
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'activity', label: 'Activity', icon: 'notifications', badge: 3 },
    { id: 'channels', label: 'Channels', icon: 'forum' },
    { id: 'documents', label: 'Documents', icon: 'description' },
    { id: 'meetings', label: 'Meetings', icon: 'video_chat', activeIcon: 'video_chat', fill: true },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside
      className={`h-screen fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col py-6 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20 px-2' : 'w-64 px-4'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-surface border border-outline-variant rounded-full p-1 text-on-surface-variant hover:text-primary shadow-md z-50 transition-transform duration-300 hover:scale-110"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
            isCollapsed ? 'rotate-180' : ''
          }`}
        >
          chevron_left
        </span>
      </button>

      {/* Brand Header */}
      <div className={`mb-8 ${isCollapsed ? 'px-1 text-center' : 'px-2'}`}>
        {!isCollapsed ? (
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-lg font-display shadow-glow">
                N
              </div>
              <h1 className="font-display text-2xl font-bold text-primary tracking-tight">
                Nexus Corp
              </h1>
            </div>
            <p className="font-mono text-xs text-on-surface-variant mt-1 tracking-wider uppercase">
              Enterprise Workspace
            </p>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-xl font-display shadow-glow">
            N
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="mb-6 px-1">
        <button
          onClick={onOpenNewMeeting}
          className={`w-full py-3 bg-primary text-on-primary rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md ${
            isCollapsed ? 'px-0' : 'px-4'
          }`}
        >
          <span className="material-symbols-outlined text-xl">add</span>
          {!isCollapsed && <span>New Project</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 py-3 px-3.5 rounded-xl transition-all duration-200 ease-in-out relative group ${
                isActive
                  ? 'text-primary bg-primary-container/20 font-semibold border-r-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <span
                className={`material-symbols-outlined text-2xl ${
                  isActive && item.fill ? 'fill' : ''
                } ${isActive ? 'text-primary' : 'group-hover:scale-110 transition-transform'}`}
              >
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-sm font-medium flex-1 text-left">
                  {item.label}
                </span>
              )}
              {!isCollapsed && item.badge && (
                <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full font-mono font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="mt-auto pt-4 border-t border-outline-variant flex items-center gap-3 px-1">
        <div className="relative">
          <img
            className="w-10 h-10 rounded-full border-2 border-primary-container object-cover"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="Alex Chen Profile"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full"></span>
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">Alex Chen</p>
            <p className="text-xs text-on-surface-variant truncate">Director of Design</p>
          </div>
        )}
        {!isCollapsed && (
          <button
            onClick={() => setActiveTab('settings')}
            className="p-1 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-lg">more_vert</span>
          </button>
        )}
      </div>
    </aside>
  );
}
