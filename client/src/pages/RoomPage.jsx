import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { useLiveKit } from '../context/LiveKitContext';
import MeetingRoom from '../components/MeetingRoom';

export default function RoomPage() {
  const { roomId } = useParams();
  const { state: joinSettings } = useLocation();
  const navigate = useNavigate();
  const { token, isLoading, fetchLiveKitToken, disconnect } = useLiveKit();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchLiveKitToken(decodeURIComponent(roomId)).catch((requestError) => {
      if (!cancelled) setError(requestError.response?.data?.error || 'Unable to authorize this room.');
    });
    return () => { cancelled = true; };
  }, [roomId, fetchLiveKitToken]);

  const leaveRoom = () => { disconnect(); navigate('/'); };
  if (isLoading) return <div className="grid min-h-screen place-items-center bg-surface text-on-surface"><p className="font-mono text-sm text-primary">AUTHORIZING ROOM...</p></div>;
  if (error || !token) return <main className="grid min-h-screen place-items-center bg-surface px-6 text-center text-on-surface"><div className="max-w-md"><p className="font-mono text-xs uppercase tracking-[0.24em] text-error">Connection blocked</p><h1 className="mt-4 font-display text-4xl font-black">This room is not available yet.</h1><p className="mt-4 text-sm leading-6 text-on-surface-variant">{error || 'A valid meeting token is required to enter.'}</p><button type="button" onClick={() => navigate('/')} className="mt-8 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary">Return to lobby</button></div></main>;

  return <LiveKitRoom token={token} serverUrl={import.meta.env.VITE_LIVEKIT_URL || 'wss://livekit.nexus.io'} connect audio={joinSettings?.micEnabled ?? true} video={joinSettings?.cameraEnabled ?? true} options={{ audioCaptureDefaults: { deviceId: joinSettings?.selected?.audioinput }, videoCaptureDefaults: { deviceId: joinSettings?.selected?.videoinput } }} onDisconnected={leaveRoom}><RoomAudioRenderer /><MeetingRoom roomId={decodeURIComponent(roomId)} onLeave={leaveRoom} /></LiveKitRoom>;
}