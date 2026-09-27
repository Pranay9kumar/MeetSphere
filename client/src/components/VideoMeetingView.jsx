import React, { useState, useEffect } from 'react';

export default function VideoMeetingView({ meeting, onLeaveMeeting }) {
  const [layoutMode, setLayoutMode] = useState('spotlight'); // 'spotlight' or 'grid'
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharing, setIsSharing] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null); // 'chat', 'people', 'notes', or null
  const [elapsedSeconds, setElapsedSeconds] = useState(862); // 14 mins 22s
  const [reactions, setReactions] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Marcus Vance', time: '10:04 AM', text: 'Welcome everyone! Let us review the Q4 architecture deck.' },
    { id: 2, sender: 'Elena Rostova', time: '10:06 AM', text: 'The new design tokens look super crisp on dark mode!' },
    { id: 3, sender: 'Jordan Taylor', time: '10:11 AM', text: 'I can take the lead on the micro-frontend integration phase.' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [notes, setNotes] = useState(
    "### Q4 Strategy Action Items\n\n- [x] Finalize Deep Slate design system tokens\n- [ ] Deploy Vite React micro-frontend architecture\n- [ ] Benchmark live video call latency under 50ms\n- [ ] Schedule follow-up sync with London engineering team"
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Timer Count Up
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Add floating reaction
  const triggerReaction = (emoji) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 60) + 20; // 20% to 80% horizontal position
    setReactions(prev => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2200);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: 'You (Alex)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newMessage.trim()
    };
    setChatMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const copyMeetingLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const participants = [
    {
      id: 'marcus',
      name: 'Marcus V.',
      role: 'Product Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      isSpeaking: false,
      isMuted: false,
      isPresenter: true
    },
    {
      id: 'jordan',
      name: 'Jordan T.',
      role: 'Senior Engineer',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
      isSpeaking: true,
      isMuted: false,
      isPresenter: false
    },
    {
      id: 'elena',
      name: 'Elena R.',
      role: 'UX Architect',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      isSpeaking: false,
      isMuted: true,
      isPresenter: false
    },
    {
      id: 'david',
      name: 'David L.',
      role: 'VP Engineering',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      isSpeaking: false,
      isMuted: true,
      isPresenter: false
    },
    {
      id: 'alex',
      name: 'You (Alex)',
      role: 'Director of Design',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      isSpeaking: false,
      isMuted: isMuted,
      isVideoOff: isVideoOff,
      handRaised: handRaised,
      isSelf: true
    }
  ];

  return (
    <div className="fixed inset-0 bg-surface z-50 flex flex-col overflow-hidden select-none font-sans text-on-surface">
      {/* Top Meeting Navigation Bar */}
      <header className="h-16 px-6 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onLeaveMeeting}
            className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Return to Dashboard"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full flex items-center gap-2 text-xs font-mono font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE</span>
            </div>
            <h1 className="font-display font-bold text-base text-on-surface truncate">
              {meeting?.title || 'Q4 Strategy Alignment Workspace'}
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-on-surface-variant font-mono border-l border-outline-variant pl-4">
            <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-sm text-primary">timer</span>
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400" title="End-to-End Encrypted Call">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span className="text-[11px]">E2EE</span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Layout Mode Switcher */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setLayoutMode('spotlight')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                layoutMode === 'spotlight'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">space_dashboard</span>
              <span className="hidden sm:inline">Spotlight</span>
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                layoutMode === 'grid'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
              <span className="hidden sm:inline">Grid (4x4)</span>
            </button>
          </div>

          {/* Share Link */}
          <button
            onClick={copyMeetingLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all"
          >
            <span className="material-symbols-outlined text-sm">
              {copiedLink ? 'check' : 'link'}
            </span>
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>

          {/* End Call */}
          <button
            onClick={onLeaveMeeting}
            className="px-4 py-1.5 bg-error text-white font-bold text-xs rounded-xl hover:bg-error/90 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">call_end</span>
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Stage & Drawers Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Canvas Stage */}
        <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 overflow-hidden relative">
          {/* Reaction Animations Container */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {reactions.map(r => (
              <div
                key={r.id}
                style={{ left: `${r.left}%` }}
                className="absolute bottom-20 text-4xl animate-float-up"
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* SPOTLIGHT LAYOUT */}
          {layoutMode === 'spotlight' && (
            <>
              {/* Presenter Main Deck View */}
              <div className="flex-1 rounded-2xl bg-surface-container-lowest border border-outline-variant relative overflow-hidden flex flex-col group shadow-xl">
                {/* Screen Share Content */}
                <div className="relative w-full h-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=80"
                    alt="Marcus V Screen Presentation Deck"
                  />
                  {/* Presentation Overlay Banner */}
                  <div className="absolute top-4 left-4 flex items-center gap-3 z-20">
                    <div className="bg-slate-900 border border-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">
                        screen_share
                      </span>
                      <span>Marcus V. is presenting Q4 Strategy Roadmap.pdf</span>
                    </div>
                  </div>

                  {/* Speaker Overlay Label */}
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold font-display text-on-primary">
                        MV
                      </div>
                      <div>
                        <p className="text-xs font-bold font-display">Marcus Vance</p>
                        <p className="text-[10px] text-gray-300 font-mono">Product Lead</p>
                      </div>
                      <div className="flex items-center gap-0.5 ml-2 text-emerald-400">
                        <span className="w-1 h-3 bg-emerald-400 rounded-full audio-bar-1"></span>
                        <span className="w-1 h-4 bg-emerald-400 rounded-full audio-bar-2"></span>
                        <span className="w-1 h-2 bg-emerald-400 rounded-full audio-bar-3"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Horizontal Participant Tiles Carousel */}
              <div className="h-40 flex gap-4 overflow-x-auto pb-2 shrink-0">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className={`w-64 h-full rounded-2xl bg-surface-container-low border relative overflow-hidden flex-shrink-0 group transition-all duration-300 ${
                      p.isSpeaking
                        ? 'video-tile-glow border-primary'
                        : 'border-outline-variant hover:border-outline'
                    }`}
                  >
                    {!p.isVideoOff ? (
                      <img
                        className="w-full h-full object-cover"
                        src={p.avatar}
                        alt={p.name}
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg font-display">
                          {p.name.substring(0, 2)}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-2 font-mono">Camera Off</p>
                      </div>
                    )}

                    {/* Speaking Badge */}
                    {p.isSpeaking && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider shadow-sm">
                          Speaking
                        </span>
                      </div>
                    )}

                    {/* Hand Raised Badge */}
                    {p.handRaised && (
                      <div className="absolute top-3 left-3 z-10 animate-bounce">
                        <span className="bg-amber-500 text-white text-lg p-1.5 rounded-full shadow-md">
                          ✋
                        </span>
                      </div>
                    )}

                    {/* Participant Label */}
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-900 border border-slate-800 text-white px-2.5 py-1 rounded-xl text-xs flex items-center justify-between font-mono">
                      <span className="truncate">{p.name}</span>
                      <span className="material-symbols-outlined text-sm">
                        {p.isMuted ? 'mic_off' : 'mic'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* GRID LAYOUT (Equal Tiles) */}
          {layoutMode === 'grid' && (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`relative rounded-2xl bg-surface-container-low border overflow-hidden flex flex-col justify-end p-4 min-h-[220px] transition-all duration-300 ${
                    p.isSpeaking
                      ? 'video-tile-glow border-primary'
                      : 'border-outline-variant'
                  }`}
                >
                  {!p.isVideoOff ? (
                    <img
                      className="absolute inset-0 w-full h-full object-cover"
                      src={p.avatar}
                      alt={p.name}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-container flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl font-display">
                        {p.name.substring(0, 2)}
                      </div>
                      <p className="text-sm text-on-surface-variant mt-2 font-mono">Camera Off</p>
                    </div>
                  )}

                  {p.isSpeaking && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-primary text-on-primary text-xs px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                        Speaking
                      </span>
                    </div>
                  )}

                  {p.handRaised && (
                    <div className="absolute top-3 left-3 z-10 animate-bounce">
                      <span className="bg-amber-500 text-white text-xl p-2 rounded-full shadow-lg">
                        ✋
                      </span>
                    </div>
                  )}

                  <div className="relative z-10 bg-slate-900 border border-slate-800 text-white p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="text-[10px] text-gray-300 font-mono">{p.role}</p>
                    </div>
                    <span className="material-symbols-outlined text-lg">
                      {p.isMuted ? 'mic_off' : 'mic'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BOTTOM FLOATING CONTROL TOOLBAR */}
          <div className="py-2 flex justify-center z-40">
            <div className="bg-slate-900 border border-slate-700 px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl">
              {/* Mic Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="flex flex-col items-center gap-1 group"
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isMuted
                      ? 'bg-error text-white shadow-md'
                      : 'bg-surface-container hover:bg-primary/20 text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isMuted ? 'mic_off' : 'mic'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">
                  {isMuted ? 'Unmute' : 'Mute'}
                </span>
              </button>

              {/* Camera Button */}
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className="flex flex-col items-center gap-1 group"
                title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isVideoOff
                      ? 'bg-error text-white shadow-md'
                      : 'bg-surface-container hover:bg-primary/20 text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isVideoOff ? 'videocam_off' : 'videocam'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">
                  {isVideoOff ? 'Start Video' : 'Video'}
                </span>
              </button>

              {/* Share Screen */}
              <button
                onClick={() => setIsSharing(!isSharing)}
                className="flex flex-col items-center gap-1 group"
                title="Toggle Screen Share"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isSharing
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-surface-container hover:bg-primary/20 text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">screen_share</span>
                </div>
                <span className="text-[10px] font-mono text-primary font-semibold">
                  {isSharing ? 'Sharing' : 'Share'}
                </span>
              </button>

              <div className="h-8 w-[1px] bg-outline-variant"></div>

              {/* Raise Hand */}
              <button
                onClick={() => setHandRaised(!handRaised)}
                className="flex flex-col items-center gap-1 group"
                title="Raise or lower hand"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    handRaised
                      ? 'bg-amber-500 text-white font-bold shadow-md'
                      : 'bg-surface-container hover:bg-primary/20 text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">backhand</span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">Hand</span>
              </button>

              {/* Reaction Emojis Floating Picker */}
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant">
                {['👍', '👏', '❤️', '🚀', '🔥'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => triggerReaction(emoji)}
                    className="w-8 h-8 rounded-full hover:bg-surface-container-high hover:scale-125 transition-all text-base flex items-center justify-center"
                    title={`Send ${emoji} reaction`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="h-8 w-[1px] bg-outline-variant"></div>

              {/* Drawers: Chat / People / Notes */}
              <button
                onClick={() => setActiveDrawer(activeDrawer === 'chat' ? null : 'chat')}
                className="flex flex-col items-center gap-1 group relative"
                title="Toggle In-Meeting Chat"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    activeDrawer === 'chat'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container hover:bg-primary/20 text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">chat_bubble</span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">Chat</span>
                <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                  {chatMessages.length}
                </span>
              </button>

              <button
                onClick={() => setActiveDrawer(activeDrawer === 'people' ? null : 'people')}
                className="flex flex-col items-center gap-1 group"
                title="Toggle Roster & Participants"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    activeDrawer === 'people'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container hover:bg-primary/20 text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">group</span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">
                  People ({participants.length})
                </span>
              </button>

              <button
                onClick={() => setActiveDrawer(activeDrawer === 'notes' ? null : 'notes')}
                className="flex flex-col items-center gap-1 group"
                title="Collaborative Meeting Notes"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    activeDrawer === 'notes'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container hover:bg-primary/20 text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">edit_note</span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">Notes</span>
              </button>
            </div>
          </div>
        </div>

        {/* SIDE DRAWER (Chat, People, Notes) */}
        {activeDrawer && (
          <aside className="w-80 md:w-96 bg-surface-container-lowest border-l border-outline-variant flex flex-col h-full z-30 animate-in slide-in-from-right duration-300 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {activeDrawer === 'chat' && 'chat_bubble'}
                  {activeDrawer === 'people' && 'group'}
                  {activeDrawer === 'notes' && 'edit_note'}
                </span>
                <span className="capitalize">{activeDrawer}</span>
              </h3>
              <button
                onClick={() => setActiveDrawer(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* DRAWER CONTENT: CHAT */}
            {activeDrawer === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                        <span className="font-bold text-primary">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface leading-relaxed border border-outline-variant">
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input box */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send a message to meeting..."
                    className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* DRAWER CONTENT: PEOPLE */}
            {activeDrawer === 'people' && (
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant text-xs text-on-surface-variant font-mono">
                  <span>{participants.length} Participants</span>
                  <button
                    onClick={() => alert("Mute all request sent")}
                    className="text-primary hover:underline font-bold"
                  >
                    Mute All
                  </button>
                </div>

                <div className="space-y-3">
                  {participants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-3">
                        <img className="w-8 h-8 rounded-full object-cover" src={p.avatar} alt={p.name} />
                        <div>
                          <p className="text-xs font-bold text-on-surface">{p.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-mono">{p.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-on-surface-variant">
                        {p.handRaised && <span className="text-amber-400">✋</span>}
                        <span className="material-symbols-outlined text-sm">
                          {p.isMuted ? 'mic_off' : 'mic'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DRAWER CONTENT: NOTES */}
            {activeDrawer === 'notes' && (
              <div className="flex-1 p-4 flex flex-col">
                <p className="text-xs text-on-surface-variant mb-2 font-mono">
                  Shared Meeting Notes (Markdown Supported)
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex-1 w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs font-mono text-on-surface focus:outline-none focus:border-primary resize-none leading-relaxed"
                />
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
