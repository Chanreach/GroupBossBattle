// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";
import { useAuth } from "@/context/useAuth";

// ===== SERVICES ===== //
// import { fetchEventBossById } from "@/services/eventBossService";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";
import { getUserInfo } from "@/utils/userUtils";

const useBossPodium = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();
  const { user } = useAuth();

  const [eventBoss, setEventBoss] = useState(null);
  const [battleState, setBattleState] = useState(null);
  const [playerBadges, setPlayerBadges] = useState([]);
  const [currentPlayerBadge, setCurrentPlayerBadge] = useState(null);
  const [isBadgeDisplaying, setIsBadgeDisplaying] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);
  const [podium, setPodium] = useState([]);
  const [loading, setLoading] = useState({ leaderboard: false, podium: false });
  const [hasJoinedPodium, setHasJoinedPodium] = useState(false);
  const [hasRequestedPodium, setHasRequestedPodium] = useState(false);  
  const [isLeaderboardEmpty, setIsLeaderboardEmpty] = useState(true);
  const [isPodiumEmpty, setIsPodiumEmpty] = useState(true);

  const joinPodium = useCallback(
    (playerId) => {
      if (!socket || !eventBossId) return;

      socket.emit(SOCKET_EVENTS.PODIUM.JOIN, { eventBossId, playerId });
    },
    [socket, eventBossId]
  );

  const leavePodium = useCallback(
    (playerId) => {
      if (!socket || !eventBossId) return;

      socket.emit(SOCKET_EVENTS.PODIUM.LEAVE, { eventBossId, playerId });
    },
    [socket, eventBossId]
  );

  const requestPodium = useCallback(() => {
    if (!socket || !eventBossId) return;

    setLoading((prev) => ({ ...prev, leaderboard: true, podium: true }));
    socket.emit(SOCKET_EVENTS.PODIUM.REQUEST, { eventBossId });
  }, [socket, eventBossId]);

  const addPlayerBadgeToQueue = useCallback((badge, message) => {
    const badgeNotification = {
      id: Date.now() + Math.random(),
      badgeId: badge.id,
      name: badge.name,
      code: badge.code,
      type: badge.type,
      threshold: badge.threshold,
      message,
    };
    setPlayerBadges((prev) => [...prev, badgeNotification]);
  }, []);

  const removeCurrentBadge = useCallback(() => {
    setCurrentPlayerBadge(null);
    setIsBadgeDisplaying(false);
  }, []);

  const shouldNavigateAway = useCallback(() => {
    if (battleState && battleState !== "ended") return true;
    if (isLeaderboardEmpty && !loading.leaderboard) return true;
    if (isPodiumEmpty && !loading.podium) return true;
    return false;
  }, [battleState, isLeaderboardEmpty, isPodiumEmpty, loading]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode || hasJoinedPodium) return;

    const userInfo = getUserInfo(user);
    joinPodium(userInfo.id || null);
  }, [socket, eventBossId, joinCode, hasJoinedPodium, user, joinPodium]);

  useEffect(() => {
    if (
      !socket ||
      !eventBossId ||
      !joinCode ||
      !hasJoinedPodium ||
      hasRequestedPodium
    )
      return;

    setHasRequestedPodium(true);
    requestPodium();
  }, [
    socket,
    eventBossId,
    joinCode,
    hasJoinedPodium,
    hasRequestedPodium,
    requestPodium,
  ]);

  useEffect(() => {
    if (playerBadges.length === 0 || isBadgeDisplaying) return;

    setCurrentPlayerBadge(playerBadges[0]);
    setPlayerBadges((prev) => prev.slice(1));
    setIsBadgeDisplaying(true);
  }, [playerBadges, isBadgeDisplaying]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode) return;

    const handleJoinedPodium = (payload) => {
      setHasJoinedPodium(true);
      setEventBoss(payload.data.eventBoss);
      setBattleState(payload.data.battleState);
    };

    const handleLeftPodium = (payload) => {
      setHasJoinedPodium(false);
      setBattleState(payload.data.battleState);
    };

    const handleBadgeEarned = (payload) => {
      addPlayerBadgeToQueue(payload.data.playerBadge.badge, payload.message);
    };

    const handlePodiumResponse = (payload) => {
      if (!payload.data.leaderboard || payload.data.leaderboard.length === 0) {
        setIsLeaderboardEmpty(true);
      } else {
        setIsLeaderboardEmpty(false);
        setLeaderboard(payload.data.leaderboard);
        setLoading((prev) => ({ ...prev, leaderboard: false }));
      }

      if (!payload.data.podium || payload.data.podium.length === 0) {
        setIsPodiumEmpty(true);
      } else {
        setIsPodiumEmpty(false);
        setPodium(payload.data.podium);
        setLoading((prev) => ({ ...prev, podium: false }));
      }
    };

    const handleSocketError = (payload) => {
      toast.error(`Socket error: ${payload.message}`);
      console.error("Socket error:", payload);
    };

    socket.on(SOCKET_EVENTS.PODIUM.JOINED, handleJoinedPodium);
    socket.on(SOCKET_EVENTS.PODIUM.LEFT, handleLeftPodium);
    socket.on(SOCKET_EVENTS.BADGE.EARNED, handleBadgeEarned);
    socket.on(SOCKET_EVENTS.PODIUM.RESPONSE, handlePodiumResponse);
    socket.on(SOCKET_EVENTS.PODIUM.ERROR, handleSocketError);

    return () => {
      socket.off(SOCKET_EVENTS.PODIUM.JOINED, handleJoinedPodium);
      socket.off(SOCKET_EVENTS.PODIUM.LEFT, handleLeftPodium);
      socket.off(SOCKET_EVENTS.BADGE.EARNED, handleBadgeEarned);
      socket.off(SOCKET_EVENTS.PODIUM.RESPONSE, handlePodiumResponse);
      socket.off(SOCKET_EVENTS.PODIUM.ERROR, handleSocketError);
    };
  }, [socket, eventBossId, joinCode, addPlayerBadgeToQueue]);

  return {
    eventBoss,
    battleState,
    playerBadges,
    currentPlayerBadge,
    isBadgeDisplaying,
    leaderboard,
    podium,
    loading,
    hasJoinedPodium,
    isLeaderboardEmpty,
    isPodiumEmpty,
    joinPodium,
    leavePodium,
    removeCurrentBadge,
    shouldNavigateAway,
  };
};

export default useBossPodium;
