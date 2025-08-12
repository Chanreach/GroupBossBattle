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

    const eventBoss = await response.json();
    return {
      name: eventBoss.boss.name,
      description: eventBoss.boss.description,
      image: eventBoss.boss.image,
      status: eventBoss.status,
      cooldownDuration: eventBoss.cooldownDuration,
      cooldownEndTime: eventBoss.cooldownEndTime,
    };
  } catch (error) {
    console.warn("Error fetching event boss data:", error);
    return null;
  }
};

const useBossPreview = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();

  const [eventBoss, setEventBoss] = useState(null);
  const [eventBossStatus, setEventBossStatus] = useState("active");
  const [cooldownTimer, setCooldownTimer] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasJoinedPreview, setHasJoinedPreview] = useState(false);

  // Join preview page
  const joinPreview = useCallback(() => {
    if (!socket || !eventBossId || !joinCode) return;

    setIsLoading(true);
    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.JOIN, { eventBossId, joinCode });
  }, [socket, eventBossId, joinCode]);

  // Leave preview page
  const leavePreview = useCallback(() => {
    if (!socket || !eventBossId) return;

    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.LEAVE, { eventBossId });
  }, [socket, eventBossId]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode) return;

    if (!hasJoinedPreview) {
      joinPreview();
      setHasJoinedPreview(true);
    }

    const handleJoinedPreview = (payload) => {
      setIsLoading(false);
      setEventBoss(payload.data.eventBoss);
      setEventBossStatus(payload.data.eventBoss.status);
      setCooldownTimer(payload.data.eventBoss.cooldownEndTime);
    };

    const handleSocketError = (error) => {
      setIsLoading(false);
      toast.error(`Socket error: ${error.message}`);
      console.error("Socket error:", error);
    };

    socket.on(SOCKET_EVENTS.BOSS_PREVIEW.JOINED, handleJoinedPreview);
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

    return () => {
      socket.off(SOCKET_EVENTS.BOSS_PREVIEW.JOINED, handleJoinedPreview);
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
    };
  }, [socket, eventBossId, joinCode, hasJoinedPreview, joinPreview]);

  useEffect(() => {
    if (!eventBoss && !isLoading && eventBossId && hasJoinedPreview) {
      const fallbackTimer = setTimeout(() => {
        console.warn("Using HTTP fallback event boss data");
        fetchEventBossData(eventBossId)
          .then((eventBoss) => {
            if (eventBoss) {
              setEventBoss(eventBoss);
              setEventBossStatus(eventBoss.status);
              setCooldownTimer(eventBoss.cooldownEndTime);
            }
          })
          .catch((error) => {
            console.error("Error fetching fallback event boss data:", error);
          });
      }, 1000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [eventBoss, isLoading, eventBossId, hasJoinedPreview]);

  return { eventBoss, isLoading, joinPreview, leavePreview };
};

export default useBossPreview;
