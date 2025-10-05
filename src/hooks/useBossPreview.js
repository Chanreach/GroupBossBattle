// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";

// ===== SERVICES ===== //
import { fetchEventBossById } from "@/services/eventBossService";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";
import { removePlayerState } from "@/utils/playerUtils";

const useBossPreview = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();

  const [eventBoss, setEventBoss] = useState(null);
  const [eventBossStatus, setEventBossStatus] = useState("active");
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [cooldownEndTime, setCooldownEndTime] = useState(null);
  const [isEventBossNotFound, setIsEventBossNotFound] = useState(false);
  const [sessionSize, setSessionSize] = useState(0);
  const [leaderboard, setLeaderboard] = useState(null);

  const [hasJoinedPreview, setHasJoinedPreview] = useState(false);
  const [isLoading, setIsLoading] = useState({
    eventBoss: false,
    leaderboard: false,
  });

  // Join preview page
  const joinPreview = useCallback(() => {
    if (!socket || !eventBossId || !joinCode) return;

    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.JOIN, { eventBossId, joinCode });
  }, [socket, eventBossId, joinCode]);

  // Leave preview page
  const leavePreview = useCallback(() => {
    if (!socket || !eventBossId) return;

    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.LEAVE, { eventBossId });
  }, [socket, eventBossId]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode || hasJoinedPreview) return;

    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.JOIN, { eventBossId, joinCode });
  }, [socket, eventBossId, joinCode, hasJoinedPreview]);

  useEffect(() => {
    if (!socket || !eventBossId) return;

    setIsLoading({ eventBoss: true, leaderboard: true });
    socket.emit(SOCKET_EVENTS.BOSS.REQUEST, { eventBossId });
    socket.emit(SOCKET_EVENTS.BATTLE_SESSION.SIZE.REQUEST, { eventBossId });
    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.LEADERBOARD.REQUEST, {
      eventBossId,
    });
  }, [socket, eventBossId]);

  useEffect(() => {
    if (!cooldownEndTime) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((cooldownEndTime - Date.now()) / 1000)
      );
      setCooldownTimer(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode) return;

    const handleJoinedPreview = (payload) => {
      setHasJoinedPreview(true);
      console.log(payload.message || "Joined boss preview successfully.");
    };

    const handleBossResponse = (payload) => {
      setIsLoading((prev) => ({ ...prev, eventBoss: false }));
      setEventBoss(payload.data.eventBoss);
      setEventBossStatus(payload.data.eventBoss.status);
      setCooldownEndTime(
        new Date(payload.data.eventBoss.cooldownEndTime).getTime() || null
      );
      setIsEventBossNotFound(false);
    };

    const handleBossNotFound = (payload) => {
      setIsLoading((prev) => ({ ...prev, eventBoss: false }));
      toast.error(payload.message || "Event boss not found.");
      console.error(payload.message || "Event boss not found.");
    };

    const handleBossStatusUpdated = (payload) => {
      setEventBossStatus(payload.data.eventBoss?.status);
      setCooldownEndTime(
        new Date(payload.data.eventBoss?.cooldownEndTime).getTime() || null
      );
    };

    const handleSessionSizeResponse = (payload) => {
      setSessionSize(payload.data.sessionSize);
    };

    const handleSessionSizeUpdated = (payload) => {
      setSessionSize(payload.data.sessionSize);
    };

    const handleSessionEnded = (payload) => {
      toast.success(payload.message || "The battle session has ended.");
      setSessionSize(0);
      removePlayerState(eventBossId);
    };

    const handlePreviewLeaderboardResponse = (payload) => {
      setIsLoading((prev) => ({ ...prev, leaderboard: false }));
      setLeaderboard(payload.data.leaderboard);
    };

    const handlePreviewLeaderboardUpdated = (payload) => {
      setIsLoading((prev) => ({ ...prev, leaderboard: false }));
      setLeaderboard(payload.data.leaderboard);
    };

    const handleSocketError = (error) => {
      toast.error(error.message || "A socket error occurred.");
      console.error("Socket error:", error);
    };

    socket.on(SOCKET_EVENTS.BOSS_PREVIEW.JOINED, handleJoinedPreview);
    socket.on(SOCKET_EVENTS.BOSS.RESPONSE, handleBossResponse);
    socket.on(SOCKET_EVENTS.BOSS.NOT_FOUND, handleBossNotFound);
    socket.on(SOCKET_EVENTS.BOSS_STATUS.UPDATED, handleBossStatusUpdated);
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.SIZE.RESPONSE,
      handleSessionSizeResponse
    );
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.SIZE.UPDATED,
      handleSessionSizeUpdated
    );
    socket.on(
      SOCKET_EVENTS.BOSS_PREVIEW.BATTLE_SESSION.ENDED,
      handleSessionEnded
    );
    socket.on(
      SOCKET_EVENTS.BOSS_PREVIEW.LEADERBOARD.RESPONSE,
      handlePreviewLeaderboardResponse
    );
    socket.on(
      SOCKET_EVENTS.BOSS_PREVIEW.LEADERBOARD.UPDATED,
      handlePreviewLeaderboardUpdated
    );
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

    return () => {
      socket.off(SOCKET_EVENTS.BOSS_PREVIEW.JOINED, handleJoinedPreview);
      socket.off(SOCKET_EVENTS.BOSS.RESPONSE, handleBossResponse);
      socket.off(SOCKET_EVENTS.BOSS.NOT_FOUND, handleBossNotFound);
      socket.off(SOCKET_EVENTS.BOSS_STATUS.UPDATED, handleBossStatusUpdated);
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.SIZE.RESPONSE,
        handleSessionSizeResponse
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.SIZE.UPDATED,
        handleSessionSizeUpdated
      );
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.ENDED, handleSessionEnded);
      socket.off(
        SOCKET_EVENTS.BOSS_PREVIEW.LEADERBOARD.RESPONSE,
        handlePreviewLeaderboardResponse
      );
      socket.off(
        SOCKET_EVENTS.BOSS_PREVIEW.LEADERBOARD.UPDATED,
        handlePreviewLeaderboardUpdated
      );
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
    };
  }, [socket, eventBossId, joinCode]);

  useEffect(() => {
    if (!eventBoss && !isLoading.eventBoss && eventBossId) {
      const fallbackTimer = setTimeout(() => {
        console.warn("Using HTTP fallback event boss data");
        fetchEventBossById(eventBossId)
          .then((eventBoss) => {
            if (eventBoss) {
              setEventBoss(eventBoss);
              setEventBossStatus(eventBoss.status);
              setCooldownEndTime(
                new Date(eventBoss.cooldownEndTime).getTime() || null
              );
              setIsEventBossNotFound(false);
              toast.success("Fetched event boss data via HTTP fallback.");
              console.log("Fetched event boss data via HTTP fallback.");
            } else {
              setIsEventBossNotFound(true);
              toast.error("Event boss not found in fallback fetch.");
              console.error("Event boss not found in fallback fetch.");
            }
          })
          .catch((error) => {
            console.error("Error fetching fallback event boss data:", error);
          });
      }, 1000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [eventBoss, isLoading.eventBoss, eventBossId]);

  return {
    eventBoss,
    eventBossStatus,
    cooldownTimer,
    isEventBossNotFound,
    sessionSize,
    leaderboard,
    hasJoinedPreview,
    isLoading,
    joinPreview,
    leavePreview,
  };
};

export default useBossPreview;
