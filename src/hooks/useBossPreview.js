// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";

const fetchEventBossData = async (eventBossId) => {
  try {
    const response = await fetch(`/api/event-boss/${eventBossId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch event boss data");
    }

    return await response.json();
  } catch (error) {
    console.warn("Error fetching event boss data:", error);
    return null;
  }
};

const useBossPreview = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();

  const [eventBoss, setEventBoss] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasEnteredPreview, setHasEnteredPreview] = useState(false);

  // Enter preview page
  const enterPreview = useCallback(() => {
    if (!socket || !eventBossId || !joinCode) return;

    setIsLoading(true);
    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.ENTER, { eventBossId, joinCode });
  }, [socket, eventBossId, joinCode]);

  // Exit preview page
  const exitPreview = useCallback(() => {
    if (!socket || !eventBossId) return;

    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.EXIT, { eventBossId });
  }, [socket, eventBossId]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode) return;

    if (!hasEnteredPreview) {
      enterPreview();
      setHasEnteredPreview(true);
    }

    const handleEnteredPreview = (data) => {
      setIsLoading(false);

      setEventBoss(data.eventBoss);

    };

    const handleSocketError = (error) => {
      setIsLoading(false);
      toast.error(`Socket error: ${error.message}`);
      console.error("Socket error:", error);
    };

    socket.on(SOCKET_EVENTS.BOSS_PREVIEW.ENTERED, handleEnteredPreview);
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

    return () => {
      socket.off(SOCKET_EVENTS.BOSS_PREVIEW.ENTERED, handleEnteredPreview);
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
    };
  }, [socket, eventBossId, joinCode, hasEnteredPreview, enterPreview]);

  return { eventBoss, enterPreview, exitPreview, isLoading };
};

export default useBossPreview;
