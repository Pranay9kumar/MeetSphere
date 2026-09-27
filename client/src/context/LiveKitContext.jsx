import React, { createContext, useCallback, useContext, useState } from 'react';
import { getMeetingToken } from '../services/meetingService';

const LiveKitContext = createContext(null);

export function useLiveKit() {
  return useContext(LiveKitContext);
}

export function LiveKitProvider({ children }) {
  const [token, setToken] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLiveKitToken = useCallback(async (room, userMetadata = {}) => {
    setIsLoading(true);
    console.log(`[LiveKit] Fetching room token for: Room=${room}`);
    try {
      const { token } = await getMeetingToken(room, userMetadata);
      setToken(token);
      setRoomName(room);
      setIsLoading(false);
      return token;
    } catch (err) {
      console.error('[LiveKit] Token fetch failed:', err);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const disconnect = () => {
    setToken(null);
    setRoomName(null);
    console.log('[LiveKit] Disconnected from session');
  };

  return (
    <LiveKitContext.Provider value={{ token, roomName, isLoading, fetchLiveKitToken, disconnect }}>
      {children}
    </LiveKitContext.Provider>
  );
}
