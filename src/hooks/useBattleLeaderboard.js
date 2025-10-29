// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";

const useBattleLeaderboard = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();

  const [leaderboard, setLeaderboard] = useState([]);

  const requestLeaderboard = useCallback(() => {
    if (!socket || !eventBossId || !joinCode) return;

    socket.emit(SOCKET_EVENTS.BATTLE_SESSION.LEADERBOARD.REQUEST, {
      eventBossId,
    });
  }, [socket, eventBossId, joinCode]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode) return;

    const handleLeaderboardResponse = (payload) => {
      setLeaderboard(payload.data.leaderboard);
    };

    const handleLeaderboardUpdated = (payload) => {
      setLeaderboard(payload.data.leaderboard);
    };

    const handlePlayersRemoved = (payload) => {
      toast.info(payload.message || "One or more players have been removed from the battle.");
      setLeaderboard(payload.data.leaderboard);
    };

    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.LEADERBOARD.RESPONSE,
      handleLeaderboardResponse
    );
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.LEADERBOARD.UPDATED,
      handleLeaderboardUpdated
    );
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.PLAYERS.REMOVED, handlePlayersRemoved);

    return () => {
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.LEADERBOARD.RESPONSE,
        handleLeaderboardResponse
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.LEADERBOARD.UPDATED,
        handleLeaderboardUpdated
      );
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.PLAYERS.REMOVED, handlePlayersRemoved);
    };
  }, [socket, eventBossId, joinCode]);

  return { leaderboard, requestLeaderboard };
};

export default useBattleLeaderboard;
