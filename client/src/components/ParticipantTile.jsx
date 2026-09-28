import React from 'react';
import { Hand, VideoOff } from 'lucide-react';
import { VideoTrack } from '@livekit/components-react';
import ParticipantStatus from './ParticipantStatus';

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

export default function ParticipantTile({ trackRef, participant, handRaised, featured = false, solo = false }) {
  const isSpeaking = participant.isSpeaking;
  const isScreenShare = trackRef.source === 'screen_share';
  const cameraEnabled = participant.isCameraEnabled ?? true;
  const displayName = getParticipantDisplayName(participant);

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-surface-container-lowest ${solo ? 'h-full w-full min-h-[60vh]' : featured ? 'min-h-0 min-h-[320px] lg:row-span-2' : 'min-h-[180px]'} ${isSpeaking ? 'speaker-ring' : 'border-outline-variant'}`}>
      {isScreenShare || cameraEnabled ? (
        <VideoTrack trackRef={trackRef} className="h-full min-h-[180px] w-full object-cover" />
      ) : (
        <div className="grid h-full min-h-[180px] place-items-center text-on-surface-variant">
          <div className="flex flex-col items-center gap-3">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/15 text-2xl font-black text-primary">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <span className="flex items-center gap-2 text-xs font-semibold"><VideoOff className="h-4 w-4" /> Camera off</span>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
        <span className="max-w-[65%] truncate rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs font-bold text-white shadow-md">
          {displayName}{participant.isLocal && ' · You'}
        </span>
        <ParticipantStatus participant={participant} handRaised={handRaised} />
      </div>
      {isSpeaking && <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-1 text-[9px] font-black uppercase tracking-widest text-on-primary">Speaking</span>}
      {handRaised && <span className="absolute right-3 top-3 rounded-full bg-amber-300 p-1.5 text-black" title="Hand raised"><Hand className="h-3.5 w-3.5" /></span>}
    </div>
  );
}
