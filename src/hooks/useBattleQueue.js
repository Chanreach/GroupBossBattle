// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";

const useBattleQueue = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();

  const [hasJoinedQueue, setHasJoinedQueue] = useState(false);
  const [hasJoinedMidGame, setHasJoinedMidGame] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState(null);
  const [countdownEndTime, setCountdownEndTime] = useState(null);

  // Join the battle queue
  const joinQueue = useCallback(
    (playerInfo) => {
      if (!socket || !eventBossId || !joinCode || !playerInfo || isProcessing)
        return;

      if (!playerInfo.nickname || !playerInfo.nickname.trim()) {
        toast.error("Nickname is required to join the battle queue.");
        return;
      }

      setIsProcessing(true);

      socket.emit(SOCKET_EVENTS.BATTLE_QUEUE.JOIN, {
        eventBossId,
        playerInfo,
      });
    },
    [socket, eventBossId, joinCode, isProcessing]
  );

  // Leave the battle queue
  const leaveQueue = useCallback(
    (playerId) => {
      if (!socket || !playerId) return;

      setIsProcessing(true);
      socket.emit(SOCKET_EVENTS.BATTLE_QUEUE.LEAVE, { eventBossId, playerId });
    },
    [socket, eventBossId]
  );

  const joinMidGame = useCallback(
    (playerInfo) => {
      if (!socket || !eventBossId || !joinCode || !playerInfo || isProcessing)
        return;

      if (!playerInfo.nickname || !playerInfo.nickname.trim()) {
        toast.error("Nickname is required to join the battle session.");
        return;
      }

      setIsProcessing(true);

      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.MID_GAME.JOIN, {
        eventBossId,
        playerInfo
      });
    },
    [socket, eventBossId, joinCode, isProcessing]
  );

  useEffect(() => {
    if (!socket || !eventBossId) return;

    setIsProcessing(true);
    socket.emit(SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.REQUEST, eventBossId);
  }, [socket, eventBossId]);

  useEffect(() => {
    if (!countdownEndTime) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(0, Math.ceil((countdownEndTime - Date.now()) / 1000));
      setCountdownTimer(timeLeft);
      console.log("Battle countdown:", timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownEndTime]);

  useEffect(() => {
    if (!socket || !eventBossId) return;

    const handleBattleQueueSizeResponse = (payload) => {
      setQueueSize(payload.data);
      setIsProcessing(false);
    };

    const handleBattleQueueJoined = (payload) => {
      setHasJoinedQueue(true);
      setQueueSize(payload.data.queueSize);
      setIsBattleStarted(payload.data.isBattleStarted);
      setIsProcessing(false);
    };

    const handleBattleQueueLeft = (payload) => {
      setHasJoinedQueue(false);
      setQueueSize(payload.queueSize);
      setIsBattleStarted(payload.isBattleStarted);
      setIsProcessing(false);
    };

    const handleBattleQueueSizeUpdated = (payload) => {
      setQueueSize(payload.data.queueSize);
      setIsBattleStarted(payload.data.isBattleStarted);
      setIsProcessing(false);
    };

    const handleMidGameJoined = () => {
      setHasJoinedMidGame(true);
      setIsBattleStarted(true);
      setIsProcessing(false);
    };

    const handleBattleCountdown = (payload) => {
      setCountdownEndTime(payload.data.countdownEndTime);
      setCountdownTimer(Math.ceil((payload.data.countdownEndTime - Date.now()) / 1000));
      setIsProcessing(false);
    };

    socket.on(SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.RESPONSE, handleBattleQueueSizeResponse);
    socket.on(SOCKET_EVENTS.BATTLE_QUEUE.JOINED, handleBattleQueueJoined);
    socket.on(SOCKET_EVENTS.BATTLE_QUEUE.LEFT, handleBattleQueueLeft);
    socket.on(SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.UPDATED, handleBattleQueueSizeUpdated);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.MID_GAME.JOINED, handleMidGameJoined);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.COUNTDOWN, handleBattleCountdown);

    return () => {
      socket.off(SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.RESPONSE, handleBattleQueueSizeResponse);
      socket.off(SOCKET_EVENTS.BATTLE_QUEUE.JOINED, handleBattleQueueJoined);
      socket.off(SOCKET_EVENTS.BATTLE_QUEUE.LEFT, handleBattleQueueLeft);
      socket.off(SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.UPDATED, handleBattleQueueSizeUpdated);
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.MID_GAME.JOINED, handleMidGameJoined);
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.COUNTDOWN, handleBattleCountdown);
    };
  }, [socket, eventBossId, joinCode]);

  return {
    hasJoinedQueue,
    hasJoinedMidGame,
    queueSize,
    isBattleStarted,
    countdownTimer,
    isProcessing,
    joinQueue,
    leaveQueue,
    joinMidGame,
  };
};

export default useBattleQueue;
