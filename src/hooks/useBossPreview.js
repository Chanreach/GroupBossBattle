// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";

// ===== SERVICES ===== //
import { fetchEventBossById } from "@/services/eventBossService";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";

const useBossPreview = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();

  const [eventBoss, setEventBoss] = useState(null);
  const [eventBossStatus, setEventBossStatus] = useState("active");
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [cooldownEndTime, setCooldownEndTime] = useState(null);
  const [sessionSize, setSessionSize] = useState(0);
  const [leaderboard, setLeaderboard] = useState(null);

  const [loading, setLoading] = useState({
    eventBoss: false,
    leaderboard: false,
  });
  const [hasJoinedPreview, setHasJoinedPreview] = useState(false);

  // Join preview page
  const joinPreview = useCallback(() => {
    if (!socket || !eventBossId || !joinCode) return;

    setLoading((prev) => ({ ...prev, eventBoss: true }));
    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.JOIN, { eventBossId, joinCode });
  }, [socket, eventBossId, joinCode]);

  // Leave preview page
  const leavePreview = useCallback(() => {
    if (!socket || !eventBossId) return;

    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.LEAVE, { eventBossId });
  }, [socket, eventBossId]);

  useEffect(() => {
    if (!socket || !eventBossId) return;

    socket.emit(SOCKET_EVENTS.BATTLE_SESSION.SIZE.REQUEST, eventBossId);
    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.LEADERBOARD.REQUEST, {
      eventBossId,
    });
    setLoading((prev) => ({ ...prev, leaderboard: true }));
  }, [socket, eventBossId]);

  useEffect(() => {
    if (!cooldownEndTime) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((cooldownEndTime - Date.now()) / 1000)
      );
      setCooldownTimer(timeLeft);
      console.log("Cooldown time left:", timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode) return;

    if (!hasJoinedPreview) {
      joinPreview();
      setHasJoinedPreview(true);
    }

    const handleJoinedPreview = (payload) => {
      setLoading((prev) => ({ ...prev, eventBoss: false }));
      setEventBoss(payload.data.eventBoss);
      setEventBossStatus(payload.data.eventBoss.status);
      setCooldownEndTime(
        new Date(payload.data.eventBoss.cooldownEndTime).getTime() || null
      );
    };

    const handleBossStatusUpdated = (payload) => {
      setEventBossStatus(payload.data.eventBoss.status);
      setCooldownEndTime(
        new Date(payload.data.eventBoss.cooldownEndTime).getTime() || null
      );
    };

    const handleSessionSizeResponse = (payload) => {
      setSessionSize(payload.data.sessionSize);
    };

    const handleSessionSizeUpdated = (payload) => {
      setSessionSize(payload.data.sessionSize);
    };

    const handlePreviewLeaderboardResponse = (payload) => {
      console.log(payload);
      setLoading((prev) => ({ ...prev, leaderboard: false }));
      setLeaderboard(payload.data.leaderboard);
    };

    const handlePreviewLeaderboardUpdated = (payload) => {
      setLoading((prev) => ({ ...prev, leaderboard: false }));
      setLeaderboard(payload.data.leaderboard);
    };

    const handleSocketError = (error) => {
      setLoading((prev) => ({ ...prev, eventBoss: false, leaderboard: false }));
      toast.error(`Socket error: ${error.message}`);
      console.error("Socket error:", error);
    };

    socket.on(SOCKET_EVENTS.BOSS_PREVIEW.JOINED, handleJoinedPreview);
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
      socket.off(SOCKET_EVENTS.BOSS_STATUS.UPDATED, handleBossStatusUpdated);
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.SIZE.RESPONSE,
        handleSessionSizeResponse
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.SIZE.UPDATED,
        handleSessionSizeUpdated
      );
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
  }, [socket, eventBossId, joinCode, hasJoinedPreview, joinPreview]);

  useEffect(() => {
    if (!eventBoss && !loading.eventBoss && eventBossId && hasJoinedPreview) {
      const fallbackTimer = setTimeout(() => {
        console.warn("Using HTTP fallback event boss data");
        fetchEventBossById(eventBossId)
          .then((eventBoss) => {
            if (eventBoss) {
              setEventBoss(eventBoss);
              setCooldownEndTime(eventBoss.cooldownEndTime.getTime());
            }
          })
          .catch((error) => {
            console.error("Error fetching fallback event boss data:", error);
          });
      }, 1000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [eventBoss, loading.eventBoss, eventBossId, hasJoinedPreview]);

  return {
    eventBoss,
    eventBossStatus,
    cooldownTimer,
    loading,
    sessionSize,
    leaderboard,
    joinPreview,
    leavePreview,
  };
};

export default useBossPreview;
