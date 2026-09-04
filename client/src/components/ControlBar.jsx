import React, { useState } from 'react';
import { Hand, Headphones, Mic, MicOff, MonitorUp, MessageCircle, PhoneOff, Video, VideoOff, Waves } from 'lucide-react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { createNoiseSuppressedTrack } from '../services/noiseSuppression';

export default function ControlBar({ onChat, onLeave, noiseSuppression, setNoiseSuppression }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [handRaised, setHandRaised] = useState(false);
  const [noiseError, setNoiseError] = useState('');

  const toggleNoiseSuppression = async () => {
    if (!noiseSuppression) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const processed = await createNoiseSuppressedTrack(stream);
        if (processed) {
          const publication = localParticipant.getTrackPublication(Track.Source.Microphone);
          if (publication?.track) await localParticipant.unpublishTrack(publication.track);
          await localParticipant.publishTrack(processed.track, { name: 'rnnoise-microphone', source: Track.Source.Microphone });
          setNoiseSuppression({ enabled: true, cleanup: () => { processed.stop(); stream.getTracks().forEach((track) => track.stop()); } });
        }
      } catch (error) {
        setNoiseError(error.message);
      }
    } else {
      noiseSuppression.cleanup?.();
      setNoiseSuppression(false);
      await localParticipant.setMicrophoneEnabled(true);
    }
  };

  const toggleHand = async () => {
    const next = !handRaised;
    setHandRaised(next);
    const payload = new TextEncoder().encode(JSON.stringify({ type: 'hand-raise', raised: next }));
    await room.localParticipant.publishData(payload, { reliable: true });
  };

  return <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-low/95 p-2 shadow-2xl backdrop-blur-xl"><button type="button" title="Mute microphone" onClick={() => localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled)} className="control-button">{localParticipant.isMicrophoneEnabled ? <Mic /> : <MicOff />}</button><button type="button" title="Toggle camera" onClick={() => localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled)} className="control-button">{localParticipant.isCameraEnabled ? <Video /> : <VideoOff />}</button><button type="button" title="Share screen" onClick={() => localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled, { resolution: { width: 2560, height: 1440, frameRate: 30 }, simulcast: true })} className="control-button"><MonitorUp /></button><button type="button" title="Raise hand" onClick={toggleHand} className={`control-button ${handRaised ? 'bg-amber-400 text-black' : ''}`}><Hand /></button><button type="button" title="AI noise suppression" onClick={toggleNoiseSuppression} className={`control-button ${noiseSuppression?.enabled ? 'bg-primary text-on-primary' : ''}`}><Waves /></button><button type="button" title="Open chat" onClick={onChat} className="control-button"><MessageCircle /></button><button type="button" title="Audio output" onClick={() => room.switchActiveDevice('audiooutput', '')} className="control-button"><Headphones /></button><button type="button" title="Leave room" onClick={onLeave} className="control-button bg-error text-white hover:bg-error/80"><PhoneOff /></button>{noiseError && <span className="absolute bottom-14 left-1/2 w-64 -translate-x-1/2 rounded-lg bg-error-container px-3 py-2 text-center text-[11px] text-on-error-container">{noiseError}</span>}</div>;
}