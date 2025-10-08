export const fetchAllEventAllTimeLeaderboards = async () => {
  try {
    const response = await fetch("/api/leaderboards/");
    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard");
    }
    const text = await response.text();
    console.log("Response text:", text); // See what server actually returns
    const data = JSON.parse(text); // only parse if valid JSON

    // const data = await response.json();
    console.log("Fetched all-time leaderboards:", data);
    return data;
  } catch (error) {
    console.error("Error fetching all-time leaderboards:", error);
    throw error;
  }
};
