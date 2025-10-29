// ===== LIBRARIES ===== //
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";

const useBossPreview = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();

  const [eventBoss, setEventBoss] = useState(null);
  const [eventBossStatus, setEventBossStatus] = useState("pending");
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [cooldownEndAt, setCooldownEndAt] = useState(null);
  const [event, setEvent] = useState(null);
  const [eventStatus, setEventStatus] = useState("upcoming");
  const [sessionSize, setSessionSize] = useState(0);
  const [leaderboard, setLeaderboard] = useState(null);

  const hasFetchedFallback = useRef(false);
  const [isJoinable, setIsJoinable] = useState(false);
  const [joinRestrictionReason, setJoinRestrictionReason] = useState(null);
  const [hasJoinedPreview, setHasJoinedPreview] = useState(false);
  const [loading, setLoading] = useState({
    eventBoss: false,
    leaderboard: false,
  });
  const [error, setError] = useState(null);

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
    if (!socket || !eventBossId || !joinCode) return;

    setLoading({ eventBoss: true, leaderboard: true });
    socket.emit(SOCKET_EVENTS.BOSS.REQUEST, { eventBossId, joinCode });
    socket.emit(SOCKET_EVENTS.BATTLE_SESSION.SIZE.REQUEST, { eventBossId });
    socket.emit(SOCKET_EVENTS.BOSS_PREVIEW.LEADERBOARD.REQUEST, {
      eventBossId,
    });
  }, [socket, eventBossId, joinCode]);

  useEffect(() => {
    if (!cooldownEndAt) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((cooldownEndAt - Date.now()) / 1000)
      );
      setCooldownTimer(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEndAt]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode) return;

    const handleJoinedPreview = (payload) => {
      setHasJoinedPreview(true);
      console.log(payload.message || "Joined boss preview successfully.");
    };

    const handleBossNotFound = (payload) => {
      setLoading((prev) => ({ ...prev, eventBoss: false }));
      setEventBoss(null);
      setEventBossStatus("pending");
      setEvent(null);
      setEventStatus("upcoming");
      toast.error(payload.message || "Event boss not found.");
    };

    const handleBossResponse = (payload) => {
      setLoading((prev) => ({ ...prev, eventBoss: false }));
      setIsJoinable(true);
      setJoinRestrictionReason(null);
      setEventBoss(payload.data.eventBoss);
      setEventBossStatus(payload.data.eventBoss.status);
      setCooldownEndAt(
        new Date(payload.data.eventBoss.cooldownEndAt).getTime() || null
      );
      setEvent(payload.data.eventBoss.event);
      setEventStatus(payload.data.eventBoss.event.status);
    };

    const handleJoinedRestrictionResponse = (payload) => {
      setLoading((prev) => ({ ...prev, eventBoss: false }));
      const { isJoinable, reason } = payload.data;
      setIsJoinable(isJoinable);
      setJoinRestrictionReason(reason || null);
    };

    const handleBossStatusUpdated = (payload) => {
      setEventBossStatus(payload.data.eventBoss.status);
      setCooldownEndAt(
        new Date(payload.data.eventBoss.cooldownEndAt).getTime() || null
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
    };

    const handlePreviewLeaderboardResponse = (payload) => {
      setLoading((prev) => ({ ...prev, leaderboard: false }));
      setLeaderboard(payload.data.leaderboard);
    };

    const handlePreviewLeaderboardUpdated = (payload) => {
      setLoading((prev) => ({ ...prev, leaderboard: false }));
      setLeaderboard(payload.data.leaderboard);
    };

    const handlePlayersRemoved = (payload) => {
      setSessionSize(payload.data.sessionSize);
      setLeaderboard(payload.data.leaderboard);
      toast.info(payload.message || "A player has been removed from the battle.");
    };

    const handleEventEnded = (payload) => {
      setIsJoinable(false);
      setJoinRestrictionReason("The event has ended. \nThank you for participating.");
      setEventBossStatus("active");
      setSessionSize(0);
      toast.info(payload.message || "The event has ended.");
    }

    const handleSocketError = (error) => {
      toast.error(error.message || "A socket error occurred.");
      console.error("Socket error:", error);
    };

    socket.on(SOCKET_EVENTS.BOSS_PREVIEW.JOINED, handleJoinedPreview);
    socket.on(SOCKET_EVENTS.BOSS.NOT_FOUND, handleBossNotFound);
    socket.on(
      SOCKET_EVENTS.JOIN_RESTRICTION.RESPONSE,
      handleJoinedRestrictionResponse
    );
    socket.on(SOCKET_EVENTS.BOSS.RESPONSE, handleBossResponse);
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
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.PLAYERS.REMOVED, handlePlayersRemoved);
    socket.on(SOCKET_EVENTS.EVENT.ENDED, handleEventEnded);
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

    return () => {
      socket.off(SOCKET_EVENTS.BOSS_PREVIEW.JOINED, handleJoinedPreview);
      socket.off(SOCKET_EVENTS.BOSS.NOT_FOUND, handleBossNotFound);
      socket.off(SOCKET_EVENTS.BOSS.RESPONSE, handleBossResponse);
      socket.off(
        SOCKET_EVENTS.JOIN_RESTRICTION.RESPONSE,
        handleJoinedRestrictionResponse
      );
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
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.PLAYERS.REMOVED,
        handlePlayersRemoved
      );
      socket.off(SOCKET_EVENTS.EVENT.ENDED, handleEventEnded);
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
    };
  }, [socket, eventBossId, joinCode]);

  const fetchEventBoss = useCallback(async () => {
    if (!eventBossId || !joinCode || (!isJoinable && joinRestrictionReason)) {
      setLoading((prev) => ({ ...prev, eventBoss: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, eventBoss: true }));
    try {
      const response = await apiClient.get(
        `/event-bosses/${eventBossId}/${joinCode}`
      );
      setEventBoss(response.data);
      setEventBossStatus(response.data.status);
      setCooldownEndAt(new Date(response.data.cooldownEndAt).getTime() || null);
      setEvent(response.data.eventBoss.event);
      setEventStatus(response.data.eventBoss.event.status);

      const event = response.data.eventBoss.event;
      if (event?.status !== "ongoing") {
        setIsJoinable(false);
        const reason =
          event?.status === "completed"
            ? "The event has ended. \nThank you for participating."
            : "You cannot join the battle right now. \nThe event is not currently ongoing.";
        setJoinRestrictionReason(reason);
        return;
      }

      const questions = response.data.categories.flatMap((c) => c.questions);
      if (questions.length < 10) {
        setIsJoinable(false);
        setJoinRestrictionReason(
          "Not enough questions are available for this event boss."
        );
        return;
      }

      const answerChoices = questions.every(
        (question) =>
          question.answerChoices && question.answerChoices.length === 8
      );
      if (!answerChoices) {
        setIsJoinable(false);
        setJoinRestrictionReason(
          "Not all questions have the required answer choices."
        );
        return;
      }

      setIsJoinable(true);
      setJoinRestrictionReason(null);
    } catch (error) {
      console.error("Error fetching event boss:", error);
      const data = error?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch event boss data.");
      }
      setError(data?.message || "Failed to fetch event boss data.");
    } finally {
      setLoading((prev) => ({ ...prev, eventBoss: false }));
    }
  }, [eventBossId, joinCode, isJoinable, joinRestrictionReason]);

  useEffect(() => {
    if (hasFetchedFallback.current) return;
    if (!eventBossId) return;

    if (!eventBoss && !loading.eventBoss) {
      const fallbackTimer = setTimeout(() => {
        console.warn("Using HTTP fallback event boss data");
        hasFetchedFallback.current = true;
        fetchEventBoss();
      }, 1000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [eventBoss, loading.eventBoss, eventBossId, fetchEventBoss]);

  return {
    eventBoss,
    eventBossStatus,
    cooldownTimer,
    event,
    eventStatus,
    sessionSize,
    leaderboard,
    hasJoinedPreview,
    isJoinable,
    joinRestrictionReason,
    loading,
    error,
    joinPreview,
    leavePreview,
    fetchEventBoss,
  };
};

export default useBossPreview;
