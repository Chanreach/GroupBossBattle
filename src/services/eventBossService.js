const fetchEventBossById = async (eventBossId) => {
  try {
    const response = await fetch(`/api/event-bosses/${eventBossId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch event boss data");
    }

    const eventBoss = await response.json();
    return {
      name: eventBoss.boss.name,
      description: eventBoss.boss.description,
      image: eventBoss.boss.image,
      status: eventBoss.status,
      cooldownDuration: eventBoss.cooldownDuration,
      cooldownEndTime: eventBoss.cooldownEndTime,
    };
  } catch (error) {
    console.warn("Error fetching event boss data:", error);
    return null;
  }
};

export { fetchEventBossById };
