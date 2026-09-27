import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getMeetingDetails } from '../services/meetingService';
import { useAuth } from '../context/AuthContext';

export default function MeetingPage() {
  const { meetingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function openMeeting() {
      if (!meetingId) {
        setError('This meeting link is missing its meeting ID.');
        return;
      }

      try {
        const response = await getMeetingDetails(meetingId);
        const meeting = response.meeting;
        if (!meeting?.roomName) {
          throw new Error('The meeting does not have a room assigned.');
        }
        if (!cancelled) {
          navigate(`/room/${encodeURIComponent(meeting.roomName)}`, {
            replace: true,
            state: {
              name: user?.name || user?.email || 'Workspace Member',
              roomId: meeting.roomName,
              meetingId: meeting._id || meetingId,
              title: meeting.title,
              micEnabled: location.state?.micEnabled ?? true,
              cameraEnabled: location.state?.cameraEnabled ?? true,
              selected: location.state?.selected
            }
          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.response?.data?.error || requestError.message || 'Unable to open this meeting.');
        }
      }
    }

    openMeeting();
    return () => { cancelled = true; };
  }, [meetingId, navigate, user, location.state]);

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-6 text-on-surface">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-low p-8 text-center shadow-xl">
        {error ? (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-error">Meeting unavailable</p>
            <h1 className="mt-3 font-display text-2xl font-black">Unable to open meeting</h1>
            <p className="mt-3 text-sm text-on-surface-variant">{error}</p>
            <button type="button" onClick={() => navigate('/dashboard')} className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary">Return to dashboard</button>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">Opening meeting</p>
            <p className="mt-2 text-sm text-on-surface-variant">Authorizing the saved meeting room...</p>
          </>
        )}
      </div>
    </main>
  );
}
