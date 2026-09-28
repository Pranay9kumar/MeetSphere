import React, { useState } from 'react';
import { ArrowLeft, Grid3X3, Signal, Sparkles, Users } from 'lucide-react';
import { useParticipants, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import ControlBar from './ControlBar';
import MeetingGrid from './MeetingGrid';
import RoomSidebar from './RoomSidebar';
import useParticipantSignals from '../hooks/useParticipantSignals';
import CatchUpModal from './CatchUpModal';

export default function MeetingRoom({ roomId, onLeave }) {
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });
  const [panelOpen, setPanelOpen] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(false);
  const [localHandRaised, setLocalHandRaised] = useState(false);
  const [catchUpOpen, setCatchUpOpen] = useState(false);
  const raisedHands = useParticipantSignals();
  const visibleTracks = tracks.filter((track) => track.participant);
  const localParticipant = participants.find((participant) => participant.isLocal);
  const allRaisedHands = new Set(raisedHands);
  if (localHandRaised && localParticipant) allRaisedHands.add(localParticipant.identity);

  return <main className="min-h-screen bg-surface text-on-surface">
    <header className="flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" title="Leave room" onClick={onLeave} className="icon-button"><ArrowLeft /></button>
        <div className="min-w-0"><p className="truncate font-display text-sm font-bold">{roomId}</p><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">Live · {participants.length} connected</p></div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-outline-variant px-3 py-1.5 text-[10px] text-on-surface-variant sm:flex"><Signal className="h-3.5 w-3.5 text-emerald-400" /> Stable connection</span>
        <button type="button" title="Catch me up" onClick={() => setCatchUpOpen(true)} className="flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-300/20"><Sparkles className="h-3.5 w-3.5" /><span className="hidden sm:inline">Catch me up</span></button>
        <button type="button" title="Open participants and chat" onClick={() => setPanelOpen(true)} className="icon-button"><Users /></button>
      </div>
    </header>
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1800px] flex-col px-4 pb-28 pt-4 md:px-6">
      <div className="mb-4 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Active meeting</p><h1 className="mt-1 font-display text-2xl font-black tracking-tight">The room is yours.</h1></div><div className="hidden items-center gap-2 text-xs text-on-surface-variant sm:flex"><Grid3X3 className="h-4 w-4" /> Auto grid</div></div>
      <MeetingGrid tracks={visibleTracks} raisedHands={allRaisedHands} />
    </section>
    <ControlBar onChat={() => setPanelOpen(true)} onLeave={onLeave} onHandChange={setLocalHandRaised} noiseSuppression={noiseSuppression} setNoiseSuppression={setNoiseSuppression} />
    <RoomSidebar open={panelOpen} onClose={() => setPanelOpen(false)} roomId={roomId} />
    <CatchUpModal roomId={roomId} open={catchUpOpen} onClose={() => setCatchUpOpen(false)} />
  </main>;
}
