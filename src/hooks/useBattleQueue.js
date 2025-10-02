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
  const [isProcessing, setIsProcessing] = useState({
    joinQueue: false,
    leaveQueue: false,
    joinMidGame: false,
    sessionRequest: false,
    queueSizeRequest: false,
  });

  // Join the battle queue
  const joinQueue = useCallback(
    (playerInfo) => {
      if (!socket || !eventBossId || !joinCode || !playerInfo || isProcessing.joinQueue)
        return;

      if (!playerInfo.nickname || !playerInfo.nickname.trim()) {
        toast.error("Nickname is required to join the battle queue.");
        return;
      }

      setIsProcessing((prev) => ({ ...prev, joinQueue: true }));
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

      setIsProcessing((prev) => ({ ...prev, leaveQueue: true }));
      socket.emit(SOCKET_EVENTS.BATTLE_QUEUE.LEAVE, { eventBossId, playerId });
    },
    [socket, eventBossId]
  );

  const joinMidGame = useCallback(
    (playerInfo) => {
      if (!socket || !eventBossId || !joinCode || !playerInfo || isProcessing.joinMidGame)
        return;

      if (!playerInfo.nickname || !playerInfo.nickname.trim()) {
        toast.error("Nickname is required to join the battle session.");
        return;
      }

      setIsProcessing((prev) => ({ ...prev, joinMidGame: true }));
      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.MID_GAME.JOIN, {
        eventBossId,
        playerInfo,
      });
    },
    [socket, eventBossId, joinCode, isProcessing]
  );

  useEffect(() => {
    if (!socket || !eventBossId) return;

    setIsProcessing((prev) => ({
      ...prev,
      sessionRequest: true,
      queueSizeRequest: true,
    }));
    socket.emit(SOCKET_EVENTS.BATTLE_SESSION.REQUEST, eventBossId);
    socket.emit(SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.REQUEST, eventBossId);
  }, [socket, eventBossId]);

  useEffect(() => {
    if (!countdownEndTime) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((countdownEndTime - Date.now()) / 1000)
      );
      setCountdownTimer(timeLeft);
      console.log("Battle countdown:", timeLeft);
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
      setIsProcessing((prev) => ({ ...prev, sessionRequest: false }));

      if (!payload.data.session) {
        removePlayerState(eventBossId);
        setPlayerContextStatus("idle");
        return;
      }
    };

    const handleBattleQueueSizeResponse = (payload) => {
      setQueueSize(payload.data);
      setIsProcessing((prev) => ({ ...prev, queueSizeRequest: false }));
    };

    const handleBattleQueueJoined = (payload) => {
      setHasJoinedQueue(true);
      setQueueSize(payload.data.queueSize);
      setIsBattleStarted(payload.data.isBattleStarted);
      setIsProcessing((prev) => ({ ...prev, joinQueue: false }));
      savePlayerState(
        eventBossId,
        payload.data.player
      );
      setPlayerContextStatus("in-queue");
    };

    const handleBattleQueueLeft = (payload) => {
      setHasJoinedQueue(false);
      setQueueSize(payload.queueSize);
      setIsBattleStarted(payload.isBattleStarted);
      setIsProcessing((prev) => ({ ...prev, leaveQueue: false }));
      removePlayerState(eventBossId);
      setPlayerContextStatus("idle");
    };

    const handleBattleQueueSizeUpdated = (payload) => {
      setQueueSize(payload.data.queueSize);
      setIsBattleStarted(payload.data.isBattleStarted);
      setIsProcessing((prev) => ({ ...prev, leaveQueue: false }));
    };

    const handleMidGameJoined = (payload) => {
      setHasJoinedMidGame(true);
      setIsBattleStarted(true);
      setIsProcessing((prev) => ({ ...prev, joinMidGame: false }));
      savePlayerState(
        eventBossId,
        payload.data.player
      );
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
    isProcessing,
    joinQueue,
    leaveQueue,
    joinMidGame,
  };
};

export default useBattleQueue;
