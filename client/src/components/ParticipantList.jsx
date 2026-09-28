import React, { useState } from 'react';
import { Hand, Mic, MicOff, Video, VideoOff, UserX } from 'lucide-react';
import { useParticipants } from '@livekit/components-react';
import { qualityLabel } from './ParticipantStatus';
import { removeMeetingParticipant } from '../services/meetingService';

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

export default function ParticipantList({ raisedHands, roomId }) {
  const participants = useParticipants();
  const [confirmKickParticipant, setConfirmKickParticipant] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [actionError, setActionError] = useState('');

  const handQueue = participants.filter((participant) => raisedHands.has(participant.identity));
  const localParticipant = participants.find((p) => p.isLocal);

  const handleRemoveConfirm = async () => {
    if (!confirmKickParticipant || !roomId) return;
    setIsRemoving(true);
    setActionError('');
    try {
      await removeMeetingParticipant(roomId, confirmKickParticipant.identity);
      setConfirmKickParticipant(null);
    } catch (err) {
      console.error('[ParticipantList] Failed to remove participant:', err);
      setActionError(err.response?.data?.error || 'Failed to remove participant. Only the host can perform this action.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 relative">
      {actionError && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error-container/20 p-2.5 text-xs text-on-error-container flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="p-1 hover:text-white">✕</button>
        </div>
      )}

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
          const isRemote = !participant.isLocal;

          return (
            <div key={participant.identity} className="flex items-center gap-3 rounded-xl bg-surface-container px-3 py-3 group hover:bg-surface-container-high transition-colors">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container">
                {name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-on-surface">{name}{participant.isLocal && ' · You'}</p>
                <p className="text-[10px] text-on-surface-variant">{qualityLabel(participant)} connection</p>
              </div>

              <div className="flex items-center gap-1.5 text-on-surface-variant">
                {participant.isMicrophoneEnabled ? <Mic className="h-3.5 w-3.5 text-emerald-400" /> : <MicOff className="h-3.5 w-3.5 text-error" />}
                {participant.isCameraEnabled ? <Video className="h-3.5 w-3.5 text-emerald-400" /> : <VideoOff className="h-3.5 w-3.5 text-error" />}

                {/* Host Kick Action Button */}
                {isRemote && (
                  <button
                    type="button"
                    onClick={() => setConfirmKickParticipant(participant)}
                    className="ml-1 p-1 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-all"
                    title={`Remove ${name} from meeting`}
                  >
                    <UserX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Kick / Remove */}
      {confirmKickParticipant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-error">
              <UserX className="h-5 w-5" />
              <h4 className="font-display font-bold text-base text-on-surface">Remove Participant?</h4>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to remove <strong className="text-on-surface">{getParticipantDisplayName(confirmKickParticipant)}</strong> from this meeting? They will be immediately disconnected from the room.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => setConfirmKickParticipant(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRemoving}
                onClick={handleRemoveConfirm}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-error text-on-error hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRemoving ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Removing...
                  </>
                ) : (
                  'Remove Participant'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

