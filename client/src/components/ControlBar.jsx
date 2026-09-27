import React, { useEffect, useRef, useState } from 'react';
import {
  Hand,
  Mic,
  MicOff,
  MonitorUp,
  MessageCircle,
  PhoneOff,
  Video,
  VideoOff,
  Waves,
  Disc,
  Square
} from 'lucide-react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { createNoiseSuppressedTrack } from '../services/noiseSuppression';
import { startRoomRecording, stopRoomRecording, getRoomRecordingStatus } from '../services/meetingService';
import RecordModal from './RecordModal';

export default function ControlBar({ onChat, onLeave, onHandChange, noiseSuppression, setNoiseSuppression }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [handRaised, setHandRaised] = useState(false);
  const [noiseError, setNoiseError] = useState('');
  
  // Recording State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isStartingRecord, setIsStartingRecord] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingEmail, setRecordingEmail] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const originalMicrophoneRef = useRef(null);
  const noiseStreamRef = useRef(null);
  const noiseSuppressionRef = useRef(noiseSuppression);
  const timerRef = useRef(null);

  const roomName = room?.name || 'lobby';

  // Check initial recording status on room enter
  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      if (!roomName) return;
      try {
        const res = await getRoomRecordingStatus(roomName);
        if (!cancelled && res?.isRecording) {
          setIsRecording(true);
          setRecordingEmail(res.recording?.targetEmail || '');
          setRecordingSeconds(res.recording?.elapsedSeconds || 0);
        }
      } catch {
        // Non-blocking
      }
    }

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, [roomName]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatRecTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async ({ targetEmail, layout }) => {
    try {
      setIsStartingRecord(true);
      const res = await startRoomRecording(roomName, targetEmail, layout);
      if (res?.status === 'recording' || res?.success) {
        setIsRecording(true);
        setRecordingEmail(targetEmail);
        setIsRecordModalOpen(false);
      }
    } catch (err) {
      console.error('[ControlBar] Failed to start recording:', err);
      alert(err.response?.data?.error || err.message || 'Failed to start recording');
    } finally {
      setIsStartingRecord(false);
    }
  };

  const handleStopRecording = async () => {
    if (!window.confirm(`Stop recording? The processed video link will be sent to ${recordingEmail}.`)) {
      return;
    }
    try {
      await stopRoomRecording(roomName);
      setIsRecording(false);
    } catch (err) {
      console.error('[ControlBar] Failed to stop recording:', err);
      setIsRecording(false);
    }
  };

  const toggleNoiseSuppression = async () => {
    if (!noiseSuppression) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const processed = await createNoiseSuppressedTrack(stream);
        if (processed) {
          const publication = localParticipant.getTrackPublication(Track.Source.Microphone);
          originalMicrophoneRef.current = { track: publication?.track, enabled: localParticipant.isMicrophoneEnabled };
          if (publication?.track) await localParticipant.unpublishTrack(publication.track, false);
          await localParticipant.publishTrack(processed.track, { name: 'rnnoise-microphone', source: Track.Source.Microphone });
          noiseStreamRef.current = stream;
          setNoiseSuppression({ enabled: true, processed, cleanup: () => { processed.stop(); stream.getTracks().forEach((track) => track.stop()); } });
        }
      } catch (error) {
        setNoiseError(error.message);
      }
    } else {
      const processedPublication = localParticipant.getTrackPublication(Track.Source.Microphone);
      if (processedPublication?.track) await localParticipant.unpublishTrack(processedPublication.track, false);
      if (originalMicrophoneRef.current?.track) await localParticipant.publishTrack(originalMicrophoneRef.current.track, { source: Track.Source.Microphone });
      noiseSuppression.cleanup?.();
      setNoiseSuppression(false);
      await localParticipant.setMicrophoneEnabled(originalMicrophoneRef.current?.enabled ?? true);
      originalMicrophoneRef.current = null;
      noiseStreamRef.current = null;
    }
  };

  const toggleHand = async () => {
    const next = !handRaised;
    setHandRaised(next);
    onHandChange?.(next);
    const payload = new TextEncoder().encode(JSON.stringify({ type: 'hand-raise', raised: next }));
    await room.localParticipant.publishData(payload, { reliable: true });
  };

  useEffect(() => {
    noiseSuppressionRef.current = noiseSuppression;
  }, [noiseSuppression]);

  useEffect(() => () => {
    noiseSuppressionRef.current?.cleanup?.();
    noiseStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  return (
    <>
      <div className="fixed bottom-5 left-1/2 z-30 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-2 overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900 p-2.5 shadow-2xl">
        {/* Microphone Toggle */}
        <button
          type="button"
          title={localParticipant.isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
          aria-label={localParticipant.isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
          onClick={() => localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled)}
          className="control-button"
        >
          {localParticipant.isMicrophoneEnabled ? <Mic /> : <MicOff />}
        </button>

        {/* Camera Toggle */}
        <button
          type="button"
          title={localParticipant.isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
          aria-label={localParticipant.isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
          onClick={() => localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled)}
          className="control-button"
        >
          {localParticipant.isCameraEnabled ? <Video /> : <VideoOff />}
        </button>

        {/* Screen Share */}
        <button
          type="button"
          title={localParticipant.isScreenShareEnabled ? 'Stop sharing screen' : 'Share screen'}
          aria-label={localParticipant.isScreenShareEnabled ? 'Stop sharing screen' : 'Share screen'}
          onClick={() =>
            localParticipant.setScreenShareEnabled(
              !localParticipant.isScreenShareEnabled,
              {
                resolution: { width: 2560, height: 1440, frameRate: 30 },
                contentHint: 'text',
                selfBrowserSurface: 'exclude',
                surfaceSwitching: 'include'
              },
              {
                videoCodec: 'vp9',
                screenShareEncoding: { maxBitrate: 6000000, maxFramerate: 30 },
                scalabilityMode: 'L3T3_KEY',
                degradationPreference: 'maintain-resolution',
                simulcast: false
              }
            )
          }
          className="control-button"
        >
          <MonitorUp />
        </button>

        {/* Hand Raise */}
        <button
          type="button"
          title={handRaised ? 'Lower hand' : 'Raise hand'}
          aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
          onClick={toggleHand}
          className={`control-button ${handRaised ? 'bg-amber-400 text-black' : ''}`}
        >
          <Hand />
        </button>

        {/* AI Noise Suppression */}
        <button
          type="button"
          title="AI noise suppression"
          aria-label="AI noise suppression"
          onClick={toggleNoiseSuppression}
          className={`control-button ${noiseSuppression?.enabled ? 'bg-primary text-on-primary' : ''}`}
        >
          <Waves />
        </button>

        {/* Cloud Recording Controls */}
        {isRecording ? (
          <button
            type="button"
            title={`Recording to ${recordingEmail} - Click to Stop`}
            aria-label="Stop Recording"
            onClick={handleStopRecording}
            className="flex items-center gap-2 rounded-xl bg-error/20 border border-error px-3 py-2 text-xs font-bold text-error hover:bg-error/30 transition-all shadow-md animate-pulse"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>REC {formatRecTime(recordingSeconds)}</span>
          </button>
        ) : (
          <button
            type="button"
            title="Record meeting to Cloud & Gmail"
            aria-label="Record meeting"
            onClick={() => setIsRecordModalOpen(true)}
            className="control-button hover:text-error"
          >
            <Disc />
          </button>
        )}

        {/* Open Chat */}
        <button
          type="button"
          title="Open chat"
          aria-label="Open chat"
          onClick={onChat}
          className="control-button"
        >
          <MessageCircle />
        </button>

        {/* Leave Room */}
        <button
          type="button"
          title="Leave room"
          aria-label="Leave room"
          onClick={onLeave}
          className="control-button bg-error text-white hover:bg-error/80"
        >
          <PhoneOff />
        </button>

        {noiseError && (
          <span className="absolute bottom-14 left-1/2 w-64 -translate-x-1/2 rounded-lg bg-error-container px-3 py-2 text-center text-[11px] text-on-error-container">
            {noiseError}
          </span>
        )}
      </div>

      {/* Record Confirmation & Gmail Entry Modal */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onStartRecording={handleStartRecording}
        isStarting={isStartingRecord}
      />
    </>
  );
}