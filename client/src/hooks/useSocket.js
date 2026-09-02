import { useSocket } from '../context/SocketContext';

// Simple hook to import socket context easily
export function useSocketHook() {
  return useSocket();
}
