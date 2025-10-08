export const getPlayerState = (eventBossId) => {
  try {
    const data = localStorage.getItem(`player_${eventBossId}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to parse player state:", err);
    return null;
  }
};

export const savePlayerState = (eventBossId, player) => {
  if (!eventBossId || !player) return;

  localStorage.setItem(`player_${eventBossId}`, JSON.stringify(player));
};

export const updatePlayerState = (
  eventBossId,
  { battleSessionId, contextStatus, battleState }
) => {
  const player = getPlayerState(eventBossId);
  if (!player) return;

  if (battleSessionId) player.battleSessionId = battleSessionId;
  if (contextStatus) player.contextStatus = contextStatus;
  if (battleState) player.battleState = battleState;

  localStorage.setItem(`player_${eventBossId}`, JSON.stringify(player));
};

export const removePlayerState = (eventBossId) => {
  localStorage.removeItem(`player_${eventBossId}`);
};
