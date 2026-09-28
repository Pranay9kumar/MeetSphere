import React from 'react';
import ParticipantTile from './ParticipantTile';

function gridClassName(count) {
  if (count <= 1) return 'grid-cols-1';
  if (count <= 4) return 'grid-cols-2';
  if (count <= 9) return 'grid-cols-3';
  if (count <= 16) return 'grid-cols-4';
  if (count <= 25) return 'grid-cols-5';
  return 'grid-cols-[repeat(auto-fit,minmax(180px,1fr))]';
}

export default function MeetingGrid({ tracks, raisedHands }) {
  const screenShares = tracks.filter((trackRef) => trackRef.source === 'screen_share');
  const hasScreenShare = screenShares.length > 0;
  const isSoloPerson = tracks.length === 1;

  const orderedTracks = [...tracks].sort((left, right) => {
    const leftIsScreenShare = left.source === 'screen_share';
    const rightIsScreenShare = right.source === 'screen_share';
    if (leftIsScreenShare !== rightIsScreenShare) return leftIsScreenShare ? -1 : 1;
    return Number(right.participant.isSpeaking) - Number(left.participant.isSpeaking);
  });

  const layoutClassName = hasScreenShare
    ? 'grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]'
    : gridClassName(tracks.length);

  return (
    <div className={`meeting-grid grid min-h-0 gap-3 ${isSoloPerson ? 'h-full w-full' : 'flex-1 auto-rows-fr'} ${layoutClassName}`}>
      {orderedTracks.map((trackRef) => (
        <ParticipantTile
          key={`${trackRef.participant.identity}-${trackRef.source}`}
          trackRef={trackRef}
          participant={trackRef.participant}
          handRaised={raisedHands.has(trackRef.participant.identity)}
          featured={trackRef.source === 'screen_share'}
          solo={isSoloPerson}
        />
      ))}
      {tracks.length === 0 && (
        <div className="col-span-full grid min-h-[50vh] place-items-center rounded-2xl border border-dashed border-outline-variant text-center">
          <div>
            <p className="font-display text-xl font-bold">Waiting for the room to light up</p>
            <p className="mt-2 text-sm text-on-surface-variant">Share the room link when you are ready.</p>
          </div>
        </div>
      )}
    </div>
  );
}
