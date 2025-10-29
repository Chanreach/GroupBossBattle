// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";
import { useAuth } from "@/context/useAuth";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";

const useBattleQueue = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();
  const { auth } = useAuth();

  const [session, setSession] = useState(null);
  const [queueSize, setQueueSize] = useState(0);
  const [countdownTimer, setCountdownTimer] = useState(null);
  const [countdownEndAt, setCountdownEndAt] = useState(null);
  const [playerSession, setPlayerSession] = useState(null);
  const [isPlayerDead, setIsPlayerDead] = useState(false);

  const [hasJoinedQueue, setHasJoinedQueue] = useState(false);
  const [hasJoinedMidGame, setHasJoinedMidGame] = useState(false);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [loading, setLoading] = useState({
    join: false,
    leave: false,
  });

  // Join the battle queue
  const joinQueue = useCallback(
    (playerInfo) => {
      if (!socket || !eventBossId || !joinCode || !playerInfo || loading.join)
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
    [socket, eventBossId, joinCode, loading]
  );

  // Leave the battle queue
  const leaveQueue = useCallback(
    (playerId) => {
      if (!socket || !playerId || loading.leave) return;

      socket.emit(SOCKET_EVENTS.BATTLE_QUEUE.LEAVE, { eventBossId, playerId });
    },
    [socket, eventBossId, loading]
  );

  // Join mid-game
  const joinMidGame = useCallback(
    (playerInfo) => {
      if (!socket || !eventBossId || !joinCode || !playerInfo || loading.join)
        return;

      if (!playerInfo.nickname || !playerInfo.nickname.trim()) {
        toast.error("Nickname is required to join the battle session.");
        return;
      }

      setLoading((prev) => ({ ...prev, join: true }));
      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.MID_GAME.JOIN, {
        eventBossId,
        playerInfo,
      });
    },
    [socket, eventBossId, joinCode, loading]
  );

  useEffect(() => {
    if (!socket || !eventBossId) return;

    socket.emit(SOCKET_EVENTS.PLAYER_SESSION.REQUEST, {
      eventBossId,
      playerId: auth?.user?.id,
    });
    socket.emit(SOCKET_EVENTS.BATTLE_SESSION.REQUEST, { eventBossId });
    socket.emit(SOCKET_EVENTS.BATTLE_QUEUE.QUEUE_SIZE.REQUEST, { eventBossId });
  }, [socket, eventBossId, auth]);

  useEffect(() => {
    if (!countdownEndAt) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((countdownEndAt - Date.now()) / 1000)
      );
      setCountdownTimer(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownEndAt]);

  useEffect(() => {
    if (!socket || !eventBossId) return;

    const handlePlayerSessionResponse = (payload) => {
      setPlayerSession(payload.data.playerSession);
      if (payload.data.playerSession?.battleState === "dead") {
        setIsPlayerDead(true);
      }

      const playerContextStatus = payload.data.playerSession?.contextStatus;
      if (playerContextStatus === "in-queue") {
        setHasJoinedQueue(true);
      } else {
        setHasJoinedQueue(false);
        setHasJoinedMidGame(false);
      }

      const countdownEndAt = payload.data.countdownEndAt;
      if (countdownEndAt && countdownEndAt > Date.now()) {
        setIsBattleStarted(true);
        setCountdownEndAt(countdownEndAt);
        setCountdownTimer(Math.ceil((countdownEndAt - Date.now()) / 1000));
      } else {
        setCountdownEndAt(null);
        setCountdownTimer(null);
      }
    };

    const handlePlayerSessionUpdated = (payload) => {
      setPlayerSession(payload.data.playerSession);
    };

    const handleSessionResponse = (payload) => {
      setSession(payload.data.session);
    };

    const handleBattleQueueSizeResponse = (payload) => {
      setQueueSize(payload.data.queueSize);
    };

    const handleBattleQueueJoined = (payload) => {
      setLoading((prev) => ({ ...prev, join: false }));
      setHasJoinedQueue(true);
      setQueueSize(payload.data.queueSize);
      setIsBattleStarted(payload.data.isBattleStarted);
    };

    const handleBattleQueueLeft = (payload) => {
      setLoading((prev) => ({ ...prev, leave: false }));
      setHasJoinedQueue(false);
      setQueueSize(payload.queueSize);
      setIsBattleStarted(payload.isBattleStarted);
    };

    const handleBattleQueueSizeUpdated = (payload) => {
      setQueueSize(payload.data.queueSize);
      setIsBattleStarted(payload.data.isBattleStarted);
    };

    const handleMidGameJoined = (payload) => {
      setLoading((prev) => ({ ...prev, join: false }));
      setHasJoinedMidGame(true);
      setIsBattleStarted(true);
      console.log(
        payload.message || "Successfully joined the battle session mid-game."
      );
    };

    const handleBattleCountdown = (payload) => {
      setCountdownEndAt(payload.data.countdownEndAt);
      setCountdownTimer(
        Math.ceil((payload.data.countdownEndAt - Date.now()) / 1000)
      );
    };

    const handlePlayerDead = (payload) => {
      setIsPlayerDead(true);
      toast.info(payload.message || "You have died! Better luck next time.");
    };

    socket.on(
      SOCKET_EVENTS.PLAYER_SESSION.RESPONSE,
      handlePlayerSessionResponse
    );
    socket.on(SOCKET_EVENTS.PLAYER_SESSION.UPDATED, handlePlayerSessionUpdated);
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
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.DEAD, handlePlayerDead);

    return () => {
      socket.off(
        SOCKET_EVENTS.PLAYER_SESSION.RESPONSE,
        handlePlayerSessionResponse
      );
      socket.off(
        SOCKET_EVENTS.PLAYER_SESSION.UPDATED,
        handlePlayerSessionUpdated
      );
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
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.DEAD, handlePlayerDead);
    };
  }, [socket, eventBossId, joinCode, playerSession]);

  return {
    playerSession,
    isPlayerDead,
    hasJoinedQueue,
    hasJoinedMidGame,
    session,
    queueSize,
    isBattleStarted,
    countdownTimer,
    loading,
    joinQueue,
    leaveQueue,
    joinMidGame,
  };
};

export default useBattleQueue;
