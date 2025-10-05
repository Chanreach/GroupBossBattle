export const fetchEventBossById = async (eventBossId) => {
  try {
    const response = await fetch(`/api/event-bosses/${eventBossId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch event boss data");
    }

    const eventBoss = await response.json();
    return {
      id: eventBoss.id,
      name: eventBoss.boss.name,
      description: eventBoss.boss.description,
      image: eventBoss.boss.image,
      creatorId: eventBoss.boss.creatorId,
      status: eventBoss.status,
      numberOfTeams: eventBoss.numberOfTeams,
      cooldownDuration: eventBoss.cooldownDuration,
      cooldownEndTime: eventBoss.cooldownEndTime,
      joinCode: eventBoss.joinCode,
    };
  } catch (error) {
    console.warn("Error fetching event boss data:", error);
    return null;
  }
};
