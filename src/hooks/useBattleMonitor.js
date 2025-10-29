// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";
import { useAuth } from "@/context/useAuth";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";

const useBattleMonitor = (eventId, eventBossId) => {
  const { socket } = useBossBattle();
  const { auth } = useAuth();

  const [event, setEvent] = useState(null);
  const [eventBoss, setEventBoss] = useState(null);
  const [eventBossStatus, setEventBossStatus] = useState(null);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [cooldownEndAt, setCooldownEndAt] = useState(null);
  const [eventBossCurrentHP, setEventBossCurrentHP] = useState(0);
  const [eventBossMaxHP, setEventBossMaxHP] = useState(0);
  const [activePlayers, setActivePlayers] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [unauthorizedAccess, setUnauthorizedAccess] = useState({
    occurred: false,
    message: "",
  });
  const [loading, setLoading] = useState({
    leaderboard: false,
  });
  const [hasJoinedMonitor, setHasJoinedMonitor] = useState(false);

  const joinBattleMonitor = useCallback(
    (spectatorId) => {
      if (!socket || !eventId || !eventBossId) return;

      setLoading((prev) => ({ ...prev, leaderboard: true }));
      socket.emit(SOCKET_EVENTS.BATTLE_MONITOR.JOIN, {
        eventId,
        eventBossId,
        spectatorId,
      });
    },
    [socket, eventId, eventBossId]
  );

  const leaveBattleMonitor = useCallback(() => {
    if (!socket || !eventBossId) return;

    socket.emit(SOCKET_EVENTS.BATTLE_MONITOR.LEAVE, {
      eventBossId,
    });
  }, [socket, eventBossId]);

  useEffect(() => {
    if (!socket || !eventId || !eventBossId || hasJoinedMonitor) return;

    joinBattleMonitor(auth?.user?.id || null);
  }, [socket, eventId, eventBossId, hasJoinedMonitor, auth, joinBattleMonitor]);

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
    if (!socket || !eventId || !eventBossId) return;

    const handleJoinedBattleMonitor = (payload) => {
      setHasJoinedMonitor(true);
      setUnauthorizedAccess({ occurred: false, message: "" });
      setEvent(payload.data.event);
      setEventBoss(payload.data.eventBoss);
      setEventBossStatus(payload.data.eventBoss.status);
      setCooldownEndAt(
        new Date(payload.data.eventBoss.cooldownEndAt).getTime() || null
      );
      setEventBossCurrentHP(payload.data.eventBoss.currentHP);
      setEventBossMaxHP(payload.data.eventBoss.maxHP);
      setActivePlayers(payload.data.activePlayers);
      setLoading((prev) => ({ ...prev, leaderboard: false }));
      setLeaderboard(payload.data.leaderboard);
      console.log("Joined battle monitor:", payload.data);
    };

    const handleLeftBattleMonitor = (payload) => {
      setHasJoinedMonitor(false);
      setUnauthorizedAccess({ occurred: false, message: "" });
      console.log("Left battle monitor:", payload.message);
    };

    const handleUnauthorizedAccess = (payload) => {
      setUnauthorizedAccess({ occurred: true, message: payload.message });
      console.error("Unauthorized access:", payload.message);
    };

    const handleBattleSessionStarted = (payload) => {
      setEventBossStatus(payload.data.eventBoss.status);
      setEventBossCurrentHP(payload.data.eventBoss.currentHP);
      setEventBossMaxHP(payload.data.eventBoss.maxHP);
      setActivePlayers(payload.data.activePlayers);
      setLeaderboard(payload.data.leaderboard);
      toast.success(payload.message || "Battle session updated.");
    };

    const handleBattleSessionEnded = (payload) => {
      setEventBossStatus(payload.data.eventBoss.status);
      setCooldownEndAt(
        new Date(payload.data.eventBoss.cooldownEndAt).getTime() || null
      );
      setEventBossCurrentHP(0);
      setEventBossMaxHP(0);
      setActivePlayers(0);
      toast.info(payload.message || "The battle session has ended.");
    };

    const handlePlayerJoined = (payload) => {
      setEventBossCurrentHP(payload.data.eventBoss.currentHP);
      setEventBossMaxHP(payload.data.eventBoss.maxHP);
      setActivePlayers(payload.data.activePlayers);
      setLeaderboard(payload.data.leaderboard);
    };

    const handlePlayerLeft = (payload) => {
      setActivePlayers(payload.data.activePlayers);
      toast.success(payload.message || "A player has left the battle.");
    };

    const handleBossDamaged = (payload) => {
      setEventBossStatus(payload.data.eventBoss.status);
      setEventBossCurrentHP(payload.data.eventBoss.currentHP);
      setEventBossMaxHP(payload.data.eventBoss.maxHP);
      setLeaderboard(payload.data.leaderboard);
    };

    const handleBossStatusUpdated = (payload) => {
      setEventBossStatus(payload.data.eventBoss.status);
      setEventBossCurrentHP(payload.data.eventBoss.currentHP);
      setEventBossMaxHP(payload.data.eventBoss.maxHP);
      setActivePlayers(payload.data.activePlayers);
      console.log("Boss status updated:", payload.data);
    };

    const handleEventEnded = (payload) => {
      setEventBossStatus("active");
      setEventBossCurrentHP(0);
      setEventBossMaxHP(0);
      setActivePlayers(0);
      toast.info(payload.message || "The event has ended.");
    };

    const handlePlayersRemoved = (payload) => {
      setLeaderboard(payload.data.leaderboard);
      setActivePlayers(payload.data.activePlayers);
      toast.info(payload.message || "One or more players have been removed from the battle.");
    };

    const handleSocketError = (payload) => {
      toast.error(
        payload.message || "An error occurred with the socket connection."
      );
      console.error("Socket error:", payload);
    };

    socket.on(SOCKET_EVENTS.BATTLE_MONITOR.JOINED, handleJoinedBattleMonitor);
    socket.on(SOCKET_EVENTS.BATTLE_MONITOR.LEFT, handleLeftBattleMonitor);
    socket.on(
      SOCKET_EVENTS.BATTLE_MONITOR.UNAUTHORIZED,
      handleUnauthorizedAccess
    );
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.START, handleBattleSessionStarted);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.ENDED, handleBattleSessionEnded);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.JOINED, handlePlayerJoined);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.LEFT, handlePlayerLeft);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.BOSS.DAMAGED, handleBossDamaged);
    socket.on(SOCKET_EVENTS.BOSS_STATUS.UPDATED, handleBossStatusUpdated);
    socket.on(SOCKET_EVENTS.EVENT.ENDED, handleEventEnded);
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.PLAYERS.REMOVED,
      handlePlayersRemoved
    );
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

    return () => {
      socket.off(
        SOCKET_EVENTS.BATTLE_MONITOR.JOINED,
        handleJoinedBattleMonitor
      );
      socket.off(SOCKET_EVENTS.BATTLE_MONITOR.LEFT, handleLeftBattleMonitor);
      socket.off(
        SOCKET_EVENTS.BATTLE_MONITOR.UNAUTHORIZED,
        handleUnauthorizedAccess
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.START,
        handleBattleSessionStarted
      );
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.ENDED, handleBattleSessionEnded);
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.PLAYER.JOINED,
        handlePlayerJoined
      );
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.LEFT, handlePlayerLeft);
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.BOSS.DAMAGED, handleBossDamaged);
      socket.off(SOCKET_EVENTS.BOSS_STATUS.UPDATED, handleBossStatusUpdated);
      socket.off(SOCKET_EVENTS.EVENT.ENDED, handleEventEnded);
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.PLAYERS.REMOVED,
        handlePlayersRemoved
      );
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
    };
  }, [socket, eventId, eventBossId]);

  return {
    event,
    eventBoss,
    eventBossStatus,
    cooldownTimer,
    eventBossCurrentHP,
    eventBossMaxHP,
    activePlayers,
    leaderboard,
    unauthorizedAccess,
    loading,
    joinBattleMonitor,
    leaveBattleMonitor,
  };
};

export default useBattleMonitor;
