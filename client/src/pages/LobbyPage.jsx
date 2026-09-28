import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  ClipboardCopy,
  Mic,
  MicOff,
  MonitorSpeaker,
  RefreshCw,
  Shield,
  Sparkles,
  Video,
  VideoOff,
  Wifi,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useAudioLevel from '../hooks/useAudioLevel';
import useMediaDevices from '../hooks/useMediaDevices';
import { createProcessedAudioTrack } from '../audio/createProcessedAudioTrack';

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const slug = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `meet-${slug}`;
}

/**
 * AudioRings — three concentric pulsing rings driven by audioLevel (0-100).
 * Rendered around the mic avatar when camera is off or always visible as mic ring.
 */
function AudioRings({ level, active }) {
  const intensity = active ? Math.min(1, level / 60) : 0;
  const rings = [
    { scale: 1 + intensity * 0.18, opacity: 0.55 - intensity * 0.1, delay: '0ms' },
    { scale: 1 + intensity * 0.34, opacity: 0.30 - intensity * 0.08, delay: '80ms' },
    { scale: 1 + intensity * 0.52, opacity: 0.12 - intensity * 0.04, delay: '160ms' },
  ];

  return (
    <>
      {rings.map((ring, i) => (
        <span
          key={i}
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary"
          style={{
            transform: `scale(${ring.scale})`,
            opacity: ring.opacity,
            transition: `transform 80ms ease-out ${ring.delay}, opacity 80ms ease-out ${ring.delay}`,
          }}
        />
      ))}
    </>
  );
}

/**
 * EqBars — compact vertical EQ bar visualizer.
 */
function EqBars({ level }) {
  return (
    <div className="flex items-end gap-[2px]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((bar) => (
        <span
          key={bar}
          className="w-[3px] rounded-full bg-primary transition-all duration-75"
          style={{ height: `${Math.max(3, Math.min(18, level / (bar * 1.3)))}px` }}
        />
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LobbyPage() {
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams();
  const { user } = useAuth();
  const videoRef = useRef(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [name, setName]     = useState(() => user?.name || user?.email || '');
  const [roomId, setRoomId] = useState(() => urlRoomId ? decodeURIComponent(urlRoomId) : generateRoomId());
  const [copied, setCopied] = useState(false);

  // ── Media state ─────────────────────────────────────────────────────────────
  const [micEnabled, setMicEnabled]       = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(false);
  const [nsError, setNsError]             = useState('');
  const processedAudioRef                 = useRef(null);

  const {
    devices,
    selected,
    streamRef,
    stream,
    error: mediaError,
    replaceInput,
  } = useMediaDevices(videoRef);

  const audioLevel = useAudioLevel(stream, micEnabled);

  // ── Sync track enabled state when toggles change ────────────────────────────
  useEffect(() => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach((t) => { t.enabled = micEnabled; });
    streamRef.current.getVideoTracks().forEach((t) => { t.enabled = cameraEnabled; });
  }, [micEnabled, cameraEnabled, streamRef]);

  // ── Noise suppression toggle ────────────────────────────────────────────────
  const toggleNoiseSuppression = useCallback(async () => {
    if (noiseSuppression) {
      // Turn off — stop the processed track and restore original
      processedAudioRef.current?.stop();
      processedAudioRef.current = null;
      setNoiseSuppression(false);
      setNsError('');
      return;
    }
    if (!streamRef.current) return;
    setNsLoading(true);
    setNsError('');
    try {
      const result = await createProcessedAudioTrack(streamRef.current);
      processedAudioRef.current = result;
      setNoiseSuppression(true);
    } catch (err) {
      setNsError(err.message || 'Noise suppression unavailable in this browser.');
    } finally {
      setNsLoading(false);
    }
  }, [noiseSuppression, streamRef]);

  // ── Cleanup processed audio on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => { processedAudioRef.current?.stop(); };
  }, []);

  // ── Copy room ID ─────────────────────────────────────────────────────────────
  const copyRoomId = useCallback(() => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [roomId]);

  // ── Join handler ─────────────────────────────────────────────────────────────
  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !roomId.trim()) return;
    navigate(`/room/${encodeURIComponent(roomId.trim())}`, {
      state: {
        name: name.trim(),
        roomId: roomId.trim(),
        selected,
        micEnabled,
        cameraEnabled,
        noiseSuppression,
        processedAudioTrack: processedAudioRef.current?.track ?? null,
      },
    });
  };

  // ── Avatar initials ─────────────────────────────────────────────────────────
  const initials = name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'M';

  // ── Device select helper ────────────────────────────────────────────────────
  const DeviceSelect = ({ kind, label, icon: Icon }) => (
    <label className="block text-left">
      <span className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span className="relative block">
        <select
          value={selected[kind]}
          onChange={(e) => replaceInput(kind, e.target.value, { mic: micEnabled, camera: cameraEnabled })}
          className="w-full appearance-none rounded-xl border border-outline-variant bg-surface-container px-3 py-2.5 pr-8 text-xs text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        >
          <option value="">Default {label}</option>
          {devices[kind].map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Default ${label}`}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-on-surface-variant" />
      </span>
    </label>
  );

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      {/* ── Ambient background glows ─────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full bg-tertiary/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 md:px-10">

        {/* ── Top nav ──────────────────────────────────────────── */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              title="Return to workspace dashboard"
              className="flex items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-container/60 px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <div className="h-5 w-px bg-outline-variant" />
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-sm font-black text-on-primary shadow-glow">
                M
              </div>
              <div>
                <p className="font-display text-sm font-bold tracking-tight">MeetSphere</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-on-surface-variant">
                  Private rooms, clear signal
                </p>
              </div>
            </div>
          </div>
        </header>


        {/* ── Main two-column layout ───────────────────────────── */}
        <section className="mt-10 grid flex-1 items-center gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">

          {/* ── Left: hero copy ──────────────────────────────── */}
          <div className="max-w-lg">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-primary">
              Your room is ready when you are
            </p>
            <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">
              Make space<br />for the<br />
              <span className="text-primary">conversation.</span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-on-surface-variant">
              Preview your camera, tune your devices, then step into a focused room with crisp video and low-friction controls.
            </p>

            {/* Feature badges */}
            <div className="mt-8 flex flex-col gap-2.5 text-xs text-on-surface-variant">
              {[
                { icon: Zap, label: 'LiveKit SFU media engine' },
                { icon: Shield, label: 'End-to-end encrypted transport' },
                { icon: Wifi, label: 'Up to 25+ participant tiles' },
                { icon: Sparkles, label: 'AI noise suppression (RNNoise)' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="grid h-6 w-6 place-items-center rounded-lg bg-surface-container-high text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: pre-join card ─────────────────────────── */}
          <form
            id="lobby-join-form"
            onSubmit={handleJoin}
            className="w-full rounded-[2rem] border border-outline-variant bg-surface-container-low p-5 shadow-2xl md:p-7"
          >
            {/* ── Camera preview ─────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
              <div className="relative aspect-video bg-[#090c11]">
                {/* Live video */}
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`h-full w-full object-cover ${cameraEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}
                />

                {/* Camera-off avatar with audio rings */}
                {!cameraEnabled && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="relative flex h-24 w-24 items-center justify-center">
                      {/* Pulsing audio rings */}
                      <AudioRings level={audioLevel} active={micEnabled} />
                      {/* Avatar circle */}
                      <div className="relative z-10 grid h-20 w-20 place-items-center rounded-full border-2 border-primary/40 bg-primary/20 text-2xl font-black text-primary">
                        {initials}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant">Camera is off</p>
                  </div>
                )}

                {/* Name + preview badge (bottom-left) */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-3 py-1.5 text-[11px] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {name || 'You'} · preview
                </div>

                {/* Audio level EQ bars (bottom-right) */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-2">
                  {micEnabled ? (
                    <EqBars level={audioLevel} />
                  ) : (
                    <MicOff className="h-3.5 w-3.5 text-rose-400" />
                  )}
                </div>
              </div>

              {/* ── Media control bar ──────────────────────────── */}
              <div className="flex items-center justify-center gap-3 border-t border-outline-variant bg-surface-container px-4 py-3">
                {/* Mic toggle */}
                <button
                  type="button"
                  id="lobby-toggle-mic"
                  onClick={() => setMicEnabled((v) => !v)}
                  title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
                  className={`grid h-10 w-10 place-items-center rounded-full transition-all ${
                    micEnabled
                      ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                      : 'bg-error/20 text-error ring-1 ring-error/40'
                  }`}
                >
                  {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </button>

                {/* Camera toggle */}
                <button
                  type="button"
                  id="lobby-toggle-camera"
                  onClick={() => setCameraEnabled((v) => !v)}
                  title={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
                  className={`grid h-10 w-10 place-items-center rounded-full transition-all ${
                    cameraEnabled
                      ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                      : 'bg-error/20 text-error ring-1 ring-error/40'
                  }`}
                >
                  {cameraEnabled ? <Camera className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </button>

                {/* Divider */}
                <div className="mx-1 h-6 w-px bg-outline-variant" />

                {/* Noise suppression toggle */}
                <button
                  type="button"
                  id="lobby-toggle-noise"
                  onClick={toggleNoiseSuppression}
                  disabled={nsLoading}
                  title={noiseSuppression ? 'Disable noise suppression' : 'Enable AI noise suppression'}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    noiseSuppression
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/40'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  } disabled:animate-pulse disabled:cursor-wait`}
                >
                  <Sparkles className={`h-3.5 w-3.5 ${nsLoading ? 'animate-spin' : ''}`} />
                  {nsLoading ? 'Loading…' : noiseSuppression ? 'NS On' : 'NS Off'}
                </button>
              </div>
            </div>

            {/* NS error */}
            {nsError && (
              <p className="mt-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] text-amber-300">
                {nsError}
              </p>
            )}

            {/* ── Name + Room ID inputs ──────────────────────── */}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-left">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Your name
                </span>
                <input
                  id="lobby-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  autoComplete="name"
                  className="w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-3 text-sm outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </label>

              <label className="block text-left">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Room code
                </span>
                <div className="flex gap-2">
                  <input
                    id="lobby-room-id"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="meet-xxxxxx"
                    className="min-w-0 flex-1 rounded-xl border border-outline-variant bg-surface-container px-3 py-3 font-mono text-sm outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  {/* Copy button */}
                  <button
                    type="button"
                    id="lobby-copy-room"
                    onClick={copyRoomId}
                    title="Copy room code"
                    className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl border border-outline-variant bg-surface-container text-on-surface-variant transition-all hover:border-primary/40 hover:text-primary active:scale-95"
                  >
                    {copied
                      ? <span className="text-[10px] font-bold text-emerald-400">✓</span>
                      : <ClipboardCopy className="h-4 w-4" />
                    }
                  </button>
                  {/* Regenerate button */}
                  <button
                    type="button"
                    id="lobby-regen-room"
                    onClick={() => setRoomId(generateRoomId())}
                    title="Generate new room code"
                    className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl border border-outline-variant bg-surface-container text-on-surface-variant transition-all hover:border-primary/40 hover:text-primary active:scale-95"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </label>
            </div>

            {/* ── Device selects ─────────────────────────────── */}
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <DeviceSelect kind="audioinput"  label="Microphone" icon={Mic} />
              <DeviceSelect kind="videoinput"  label="Camera"     icon={Video} />
              <DeviceSelect kind="audiooutput" label="Speaker"    icon={MonitorSpeaker} />
            </div>

            {/* Media error */}
            {mediaError && (
              <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
                {mediaError}
              </p>
            )}

            {/* ── Join button ───────────────────────────────── */}
            <button
              type="submit"
              id="lobby-join-btn"
              disabled={!name.trim() || !roomId.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-black text-on-primary shadow-glow transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Video className="h-4 w-4" />
              Enter room
            </button>
          </form>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="mt-8 flex items-center justify-between border-t border-outline-variant pt-5 text-[11px] text-on-surface-variant">
          <span>MeetSphere / Lobby</span>
          <span className="font-mono">READY TO CONNECT</span>
        </footer>
      </div>
    </main>
  );
}