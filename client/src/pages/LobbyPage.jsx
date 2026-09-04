import React from 'react';
import { useNavigate } from 'react-router-dom';
import PreJoinScreen from '../components/PreJoinScreen';

export default function LobbyPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-surface px-5 py-8 text-on-surface md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between gap-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-lg font-black text-on-primary">M</div>
            <div><p className="font-display text-lg font-bold tracking-tight">MeetSphere</p><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Private rooms, clear signal</p></div>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant">Secure lobby</span>
        </header>
        <section className="grid items-center gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="max-w-xl"><p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-primary">Your room is ready when you are</p><h1 className="font-display text-5xl font-black leading-[0.96] tracking-tight md:text-7xl">Make space for the conversation.</h1><p className="mt-6 max-w-md text-base leading-7 text-on-surface-variant">Preview your camera, tune your devices, then step into a focused room with crisp video and low-friction controls.</p><div className="mt-8 flex flex-wrap gap-3 text-xs text-on-surface-variant"><span className="rounded-full border border-outline-variant px-3 py-2">LiveKit media</span><span className="rounded-full border border-outline-variant px-3 py-2">Encrypted transport</span><span className="rounded-full border border-outline-variant px-3 py-2">Up to 25+ tiles</span></div></div>
          <PreJoinScreen onJoin={(settings) => navigate(`/room/${encodeURIComponent(settings.roomId)}`, { state: settings })} />
        </section>
        <footer className="flex items-center justify-between border-t border-outline-variant pt-5 text-[11px] text-on-surface-variant"><span>MeetSphere / Lobby</span><span className="font-mono">READY TO CONNECT</span></footer>
      </div>
    </main>
  );
}