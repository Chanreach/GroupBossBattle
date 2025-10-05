// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";
import {
  getPlayerState,
  savePlayerState,
  updatePlayerState,
  removePlayerState,
} from "@/utils/playerUtils";

const useBattleQueue = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();

  const [session, setSession] = useState(null);
  const [queueSize, setQueueSize] = useState(0);
  const [countdownTimer, setCountdownTimer] = useState(null);
  const [countdownEndTime, setCountdownEndTime] = useState(null);
  const [playerContextStatus, setPlayerContextStatus] = useState("idle");

  const [hasJoinedQueue, setHasJoinedQueue] = useState(false);
  const [hasJoinedMidGame, setHasJoinedMidGame] = useState(false);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isLoading, setIsLoading] = useState({
    join: false,
    leave: false,
  });

  // Join the battle queue
  const joinQueue = useCallback(
    (playerInfo) => {
      if (!socket || !eventBossId || !joinCode || !playerInfo || isLoading.join)
        return;

      if (!playerInfo.nickname || !playerInfo.nickname.trim()) {
        toast.error("Nickname is required to join the battle queue.");
        return;
      }

      socket.emit(SOCKET_EVENTS.BATTLE_QUEUE.JOIN, {
        eventBossId,
        playerInfo,
      });
    },
    [socket, eventBossId, joinCode, isLoading]
  );

  // Leave the battle queue
  const leaveQueue = useCallback(
    (playerId) => {
      if (!socket || !playerId || isLoading.leave) return;

      socket.emit(SOCKET_EVENTS.BATTLE_QUEUE.LEAVE, { eventBossId, playerId });
    },
    [socket, eventBossId, isLoading]
  );

  // Join mid-game
  const joinMidGame = useCallback(
    (playerInfo) => {
      if (!socket || !eventBossId || !joinCode || !playerInfo || isLoading.join)
        return;

      if (!playerInfo.nickname || !playerInfo.nickname.trim()) {
        toast.error("Nickname is required to join the battle session.");
        return;
      }

      setIsLoading((prev) => ({ ...prev, join: true }));
      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.MID_GAME.JOIN, {
        eventBossId,
        playerInfo,
      });
    },
    [socket, eventBossId, joinCode, isLoading]
  );

  useEffect(() => {
    if (!socket || !eventBossId) return;

    socket.emit(SOCKET_EVENTS.BATTLE_SESSION.REQUEST, { eventBossId });
    socket.emit(SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.REQUEST, { eventBossId });
  }, [socket, eventBossId]);

  useEffect(() => {
    if (!countdownEndTime) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((countdownEndTime - Date.now()) / 1000)
      );
      setCountdownTimer(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownEndTime]);

  useEffect(() => {
    const storedPlayer = getPlayerState(eventBossId);
    if (!storedPlayer) return;

    setPlayerContextStatus(storedPlayer.contextStatus || "idle");
  }, [eventBossId]);

  useEffect(() => {
    if (!socket || !eventBossId) return;

    const handleSessionResponse = (payload) => {
      setSession(payload.data.session);
      if (!payload.data.session) {
        setPlayerContextStatus("idle");
        removePlayerState(eventBossId);
        return;
      }
    };

    const handleBattleQueueSizeResponse = (payload) => {
      setQueueSize(payload.data.queueSize);
    };

    const handleBattleQueueJoined = (payload) => {
      setIsLoading((prev) => ({ ...prev, join: false }));
      setHasJoinedQueue(true);
      setQueueSize(payload.data.queueSize);
      setIsBattleStarted(payload.data.isBattleStarted);
      setPlayerContextStatus("in-queue");
      savePlayerState(eventBossId, payload.data.player);
    };

    const handleBattleQueueLeft = (payload) => {
      setIsLoading((prev) => ({ ...prev, leave: false }));
      setHasJoinedQueue(false);
      setQueueSize(payload.queueSize);
      setIsBattleStarted(payload.isBattleStarted);
      setPlayerContextStatus("idle");
      removePlayerState(eventBossId);
    };

    const handleBattleQueueSizeUpdated = (payload) => {
      setQueueSize(payload.data.queueSize);
      setIsBattleStarted(payload.data.isBattleStarted);
    };

    const handleMidGameJoined = (payload) => {
      setIsLoading((prev) => ({ ...prev, join: false }));
      setHasJoinedMidGame(true);
      setIsBattleStarted(true);
      savePlayerState(eventBossId, payload.data.player);
    };

    const handleBattleCountdown = (payload) => {
      setCountdownEndTime(payload.data.countdownEndTime);
      setCountdownTimer(
        Math.ceil((payload.data.countdownEndTime - Date.now()) / 1000)
      );
      updatePlayerState(eventBossId, {
        battleSessionId: payload.data.battleSessionId,
        contextStatus: "in-battle",
      });
      setPlayerContextStatus("in-battle");
    };

    socket.on(SOCKET_EVENTS.BATTLE_SESSION.RESPONSE, handleSessionResponse);
    socket.on(
      SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.RESPONSE,
      handleBattleQueueSizeResponse
    );
    socket.on(SOCKET_EVENTS.BATTLE_QUEUE.JOINED, handleBattleQueueJoined);
    socket.on(SOCKET_EVENTS.BATTLE_QUEUE.LEFT, handleBattleQueueLeft);
    socket.on(
      SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.UPDATED,
      handleBattleQueueSizeUpdated
    );
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.MID_GAME.JOINED,
      handleMidGameJoined
    );
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.COUNTDOWN, handleBattleCountdown);

    return () => {
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.RESPONSE, handleSessionResponse);
      socket.off(
        SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.RESPONSE,
        handleBattleQueueSizeResponse
      );
      socket.off(SOCKET_EVENTS.BATTLE_QUEUE.JOINED, handleBattleQueueJoined);
      socket.off(SOCKET_EVENTS.BATTLE_QUEUE.LEFT, handleBattleQueueLeft);
      socket.off(
        SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.UPDATED,
        handleBattleQueueSizeUpdated
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.MID_GAME.JOINED,
        handleMidGameJoined
      );
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.COUNTDOWN, handleBattleCountdown);
    };
  }, [socket, eventBossId, joinCode]);

  return {
    playerContextStatus,
    hasJoinedQueue,
    hasJoinedMidGame,
    session,
    queueSize,
    isBattleStarted,
    countdownTimer,
    isLoading,
    joinQueue,
    leaveQueue,
    joinMidGame,
  };
};

export default useBattleQueue;
