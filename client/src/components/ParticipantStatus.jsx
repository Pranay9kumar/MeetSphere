import React from 'react';
import { Hand, MicOff, Signal } from 'lucide-react';

function qualityValue(participant) {
  if (participant.connectionQuality === 'excellent' || participant.connectionQuality === 3) return 3;
  if (participant.connectionQuality === 'good' || participant.connectionQuality === 2) return 2;
  return 1;
}

export function qualityLabel(participant) {
  return ['Weak', 'Good', 'Strong'][qualityValue(participant) - 1];
}

export default function ParticipantStatus({ participant, handRaised }) {
  const quality = qualityValue(participant);
  return <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-2 py-1.5 text-[10px] text-white">
    {!participant.isMicrophoneEnabled && <MicOff className="h-3 w-3 text-error" aria-label="Microphone muted" />}
    {handRaised && <Hand className="h-3 w-3 text-amber-300" aria-label="Hand raised" />}
    <Signal className="h-3 w-3 text-primary" aria-label={`Connection ${qualityLabel(participant)}`} />
    <span className="flex gap-0.5" aria-hidden="true">{[1, 2, 3].map((bar) => <span key={bar} className={`h-2 w-1 rounded-full ${bar <= quality ? 'bg-emerald-400' : 'bg-white/25'}`} />)}</span>
  </div>;
}
