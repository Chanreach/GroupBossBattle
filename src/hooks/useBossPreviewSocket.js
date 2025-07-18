import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for managing boss preview socket connection
 */
export const useBossPreviewSocket = (bossId, eventId) => {
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    if (!bossId || !eventId) {
      return;
    }

    setConnectionStatus('connecting');

    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
      withCredentials: true,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Connected to server");
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionStatus("error");
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("boss-preview:leave");
        socketRef.current.disconnect();
      }
    };
  }, [bossId, eventId]);

  return {
    socket: socketRef.current,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  };
};
