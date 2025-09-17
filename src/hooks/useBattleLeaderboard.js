// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";

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

    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.LEADERBOARD.RESPONSE,
      handleLeaderboardResponse
    );
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.LEADERBOARD.UPDATED,
      handleLeaderboardUpdated
    );

    return () => {
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.LEADERBOARD.RESPONSE,
        handleLeaderboardResponse
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.LEADERBOARD.UPDATED,
        handleLeaderboardUpdated
      );
    };
  }, [socket, eventBossId, joinCode]);

  return { leaderboard, requestLeaderboard };
};

export default useBattleLeaderboard;
