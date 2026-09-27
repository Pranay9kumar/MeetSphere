import React from 'react';
import { Hand, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useParticipants } from '@livekit/components-react';
import { qualityLabel } from './ParticipantStatus';

function getParticipantDisplayName(participant) {
  if (participant?.name) return participant.name;
  if (participant?.metadata) {
    try {
      const parsed = typeof participant.metadata === 'string' ? JSON.parse(participant.metadata) : participant.metadata;
      if (parsed?.name) return parsed.name;
    } catch {
      // ignore parse error
    }
  }
  return participant?.identity || 'User';
}

export default function ParticipantList({ raisedHands }) {
  const participants = useParticipants();
  const handQueue = participants.filter((participant) => raisedHands.has(participant.identity));

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="mb-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Raised hands</p>
        {handQueue.length === 0 ? (
          <p className="text-xs text-on-surface-variant">No hands raised.</p>
        ) : (
          <div className="space-y-2">
            {handQueue.map((participant) => {
              const name = getParticipantDisplayName(participant);
              return (
                <div key={participant.identity} className="flex items-center gap-2 rounded-xl bg-amber-300/10 px-3 py-2 text-xs">
                  <Hand className="h-3.5 w-3.5 text-amber-300" />
                  <span>{name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {participants.map((participant) => {
          const name = getParticipantDisplayName(participant);
          return (
            <div key={participant.identity} className="flex items-center gap-3 rounded-xl bg-surface-container px-3 py-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container">
                {name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{name}{participant.isLocal && ' · You'}</p>
                <p className="text-[10px] text-on-surface-variant">{qualityLabel(participant)} connection</p>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                {participant.isMicrophoneEnabled ? <Mic className="h-3.5 w-3.5 text-emerald-400" /> : <MicOff className="h-3.5 w-3.5 text-error" />}
                {participant.isCameraEnabled ? <Video className="h-3.5 w-3.5 text-emerald-400" /> : <VideoOff className="h-3.5 w-3.5 text-error" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
