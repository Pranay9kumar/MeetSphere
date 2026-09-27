import React, { useEffect, useRef, useState } from 'react';
import { Camera, ChevronDown, Mic, MicOff, MonitorSpeaker, Settings2, Video, VideoOff } from 'lucide-react';
import useAudioLevel from '../hooks/useAudioLevel';
import useMediaDevices from '../hooks/useMediaDevices';

export default function PreJoinScreen({ onJoin }) {
  const videoRef = useRef(null);
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const { devices, selected, streamRef, stream, error: mediaError, replaceInput } = useMediaDevices(videoRef);
  const audioLevel = useAudioLevel(stream, micEnabled);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => { track.enabled = micEnabled; });
      streamRef.current.getVideoTracks().forEach((track) => { track.enabled = cameraEnabled; });
    }
  }, [micEnabled, cameraEnabled]);

  const join = (event) => { event.preventDefault(); if (name.trim() && roomId.trim()) onJoin({ name: name.trim(), roomId: roomId.trim(), selected, micEnabled, cameraEnabled }); };
  const deviceSelect = (kind, label, icon) => <label className="block text-left"><span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">{icon}{label}</span><span className="relative block"><select value={selected[kind]} onChange={(event) => replaceInput(kind, event.target.value, { mic: micEnabled, camera: cameraEnabled })} className="w-full appearance-none rounded-xl border border-outline-variant bg-surface-container px-3 py-3 pr-9 text-xs text-on-surface outline-none focus:border-primary"><option value="">Default {label}</option>{devices[kind].map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Default ${label}`}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-on-surface-variant" /></span></label>;

  return (
    <form onSubmit={join} className="rounded-[2rem] border border-outline-variant bg-surface-container-low p-4 shadow-xl md:p-6">
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
        <div className="relative aspect-video overflow-hidden bg-[#0a0d12]"><video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${cameraEnabled ? '' : 'hidden'}`} />{!cameraEnabled && <div className="grid h-full place-items-center text-on-surface-variant"><VideoOff className="h-8 w-8" /></div>}<div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-3 py-1.5 text-[11px] text-white"><span className="h-2 w-2 rounded-full bg-emerald-400" /> {name || 'You'} · preview</div><div className="absolute bottom-3 right-3 flex items-end gap-0.5 rounded-lg bg-slate-900 border border-slate-800 px-2 py-2">{[1, 2, 3, 4, 5].map((bar) => <span key={bar} className="w-1 rounded-full bg-primary transition-all" style={{ height: `${Math.max(4, Math.min(20, audioLevel / (bar * 1.4)))}px` }} />)}</div></div>
        <div className="flex items-center justify-center gap-3 border-t border-outline-variant p-3"><button type="button" onClick={() => setMicEnabled((value) => !value)} title="Toggle microphone" className={`grid h-10 w-10 place-items-center rounded-full ${micEnabled ? 'bg-surface-container-high text-on-surface' : 'bg-error text-white'}`}>{micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}</button><button type="button" onClick={() => setCameraEnabled((value) => !value)} title="Toggle camera" className={`grid h-10 w-10 place-items-center rounded-full ${cameraEnabled ? 'bg-surface-container-high text-on-surface' : 'bg-error text-white'}`}>{cameraEnabled ? <Camera className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}</button></div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2"><label className="block text-left"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">Your name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Maya Chen" className="w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-3 text-sm outline-none placeholder:text-on-surface-variant/60 focus:border-primary" /></label><label className="block text-left"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">Room ID</span><input value={roomId} onChange={(event) => setRoomId(event.target.value)} placeholder="e.g. product-sync" className="w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-3 text-sm outline-none placeholder:text-on-surface-variant/60 focus:border-primary" /></label></div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">{deviceSelect('audioinput', 'Microphone', <Mic className="h-3.5 w-3.5" />)}{deviceSelect('videoinput', 'Camera', <Video className="h-3.5 w-3.5" />)}{deviceSelect('audiooutput', 'Speaker', <MonitorSpeaker className="h-3.5 w-3.5" />)}</div>
      {mediaError && <p className="mt-4 text-xs text-amber-300">{mediaError}</p>}
      <button type="submit" disabled={!name.trim() || !roomId.trim()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-black text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><Settings2 className="h-4 w-4" /> Enter room</button>
    </form>
  );
}