import React, { useState } from 'react';
import { ArrowLeft, Grid3X3, Signal, Users } from 'lucide-react';
import { ParticipantTile, useParticipants, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import ControlBar from './ControlBar';
import { RoomSidebar } from './Sidebar';

function qualityLabel(participant) {
  const quality = participant.connectionQuality;
  if (quality === 'excellent' || quality === 3) return 'Strong';
  if (quality === 'good' || quality === 2) return 'Good';
  return 'Weak';
}

function ParticipantCard({ trackRef, participant }) {
  const isSpeaking = participant.isSpeaking;
  return <div className={`relative min-h-0 overflow-hidden rounded-2xl border bg-surface-container-lowest ${isSpeaking ? 'speaker-ring' : 'border-outline-variant'}`}><ParticipantTile trackRef={trackRef} className="h-full min-h-[180px]" /><div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2"><span className="rounded-lg bg-black/65 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur">{participant.name || participant.identity}{participant.isLocal && ' · You'}</span><div className="flex items-center gap-1.5 rounded-lg bg-black/65 px-2 py-1.5 text-[10px] text-white backdrop-blur"><span className={`h-1.5 w-1.5 rounded-full ${participant.isMicrophoneEnabled ? 'bg-emerald-400' : 'bg-error'}`} />{participant.isMicrophoneEnabled ? 'Live' : 'Muted'}<span className="ml-1 text-primary">{qualityLabel(participant)}</span></div></div>{isSpeaking && <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-1 text-[9px] font-black uppercase tracking-widest text-on-primary">Speaking</span>}{!participant.isMicrophoneEnabled && <span className="absolute right-3 top-3 rounded-full bg-error px-2 py-1 text-white"><span className="material-symbols-outlined text-sm">mic_off</span></span>}</div>;
}

export default function MeetingRoom({ roomId, onLeave }) {
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });
  const [panelOpen, setPanelOpen] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(false);
  const visibleTracks = tracks.filter((track) => track.participant);

  return <main className="min-h-screen bg-surface text-on-surface"><header className="flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest/90 px-4 backdrop-blur-xl md:px-6"><div className="flex min-w-0 items-center gap-3"><button type="button" title="Leave room" onClick={onLeave} className="icon-button"><ArrowLeft /></button><div className="min-w-0"><p className="truncate font-display text-sm font-bold">{roomId}</p><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">Live · {participants.length} connected</p></div></div><div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 rounded-full border border-outline-variant px-3 py-1.5 text-[10px] text-on-surface-variant sm:flex"><Signal className="h-3.5 w-3.5 text-emerald-400" /> Stable connection</span><button type="button" title="Open participants and chat" onClick={() => setPanelOpen(true)} className="icon-button"><Users /></button></div></header><section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1800px] flex-col px-4 pb-28 pt-4 md:px-6"><div className="mb-4 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Active meeting</p><h1 className="mt-1 font-display text-2xl font-black tracking-tight">The room is yours.</h1></div><div className="hidden items-center gap-2 text-xs text-on-surface-variant sm:flex"><Grid3X3 className="h-4 w-4" /> Auto grid</div></div><div className={`meeting-grid grid flex-1 gap-3 ${visibleTracks.length <= 1 ? 'grid-cols-1' : visibleTracks.length <= 4 ? 'grid-cols-2' : visibleTracks.length <= 9 ? 'grid-cols-3' : visibleTracks.length <= 16 ? 'grid-cols-4' : 'grid-cols-5'}`}>{visibleTracks.map((trackRef) => <ParticipantCard key={`${trackRef.participant.identity}-${trackRef.source}`} trackRef={trackRef} participant={trackRef.participant} />)}{visibleTracks.length === 0 && <div className="col-span-full grid min-h-[50vh] place-items-center rounded-2xl border border-dashed border-outline-variant text-center"><div><Users className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 font-display font-bold">Waiting for video</p><p className="mt-1 text-xs text-on-surface-variant">Your room will fill in as participants connect.</p></div></div>}</div></section><ControlBar onChat={() => setPanelOpen(true)} onLeave={onLeave} noiseSuppression={noiseSuppression} setNoiseSuppression={setNoiseSuppression} /><RoomSidebar open={panelOpen} onClose={() => setPanelOpen(false)} /></main>;
}