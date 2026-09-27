import { useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

export default function useParticipantSignals() {
  const room = useRoomContext();
  const [raisedHands, setRaisedHands] = useState(() => new Set());

  useEffect(() => {
    const handleData = (payload, participant) => {
      try {
        const event = JSON.parse(new TextDecoder().decode(payload));
        if (event.type !== 'hand-raise' || !participant?.identity) return;
        setRaisedHands((current) => {
          const next = new Set(current);
          if (event.raised) next.add(participant.identity);
          else next.delete(participant.identity);
          return next;
        });
      } catch {
        // Ignore data packets owned by another feature.
      }
    };
    room.on(RoomEvent.DataReceived, handleData);
    return () => room.off(RoomEvent.DataReceived, handleData);
  }, [room]);

  return raisedHands;
}
