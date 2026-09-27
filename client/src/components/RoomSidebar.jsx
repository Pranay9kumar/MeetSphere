import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useParticipants } from '@livekit/components-react';
import ChatPanel from './ChatPanel';
import ParticipantList from './ParticipantList';
import useParticipantSignals from '../hooks/useParticipantSignals';

export default function RoomSidebar({ open, onClose }) {
  const participants = useParticipants();
  const raisedHands = useParticipantSignals();
  const [tab, setTab] = useState('chat');

  return <aside className={`fixed right-0 top-0 z-20 flex h-full w-[min(92vw,380px)] flex-col border-l border-outline-variant bg-surface-container-low shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!open}>
    <header className="flex items-center justify-between border-b border-outline-variant px-5 py-4"><div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /><span className="font-display font-bold">Room panel</span></div><button type="button" title="Close panel" aria-label="Close panel" onClick={onClose} className="icon-button"><X /></button></header>
    <div className="flex border-b border-outline-variant px-4"><button type="button" onClick={() => setTab('chat')} className={`flex-1 border-b-2 py-3 text-xs font-bold ${tab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>Chat</button><button type="button" onClick={() => setTab('people')} className={`flex-1 border-b-2 py-3 text-xs font-bold ${tab === 'people' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>People · {participants.length}</button></div>
    {tab === 'chat' ? <ChatPanel /> : <ParticipantList raisedHands={raisedHands} />}
  </aside>;
}
