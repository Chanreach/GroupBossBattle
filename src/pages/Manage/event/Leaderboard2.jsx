// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeaderboardOverview } from "@/components/leaderboard/LeaderboardOverview";

// ===== HOOKS ===== //
import useBattleMonitor from "@/hooks/useBattleMonitor";

const Leaderboard = () => {
  const { eventId, eventBossId } = useParams();
  const navigate = useNavigate();

  const battleMonitor = useBattleMonitor(eventId, eventBossId);
  const {
    event,
    eventBoss,
    eventBossStatus,
    eventBossCurrentHP,
    eventBossMaxHP,
    activePlayers,
    leaderboard,
    loading,
  } = battleMonitor;

  // Load initial data and set up socket listeners
  // useEffect(() => {
  //   if (!eventId) return;

  //   const loadInitialData = async () => {
  //     try {
  //       setBattleState((prev) => ({ ...prev, isLoading: true }));
  //       setLeaderboardData((prev) => ({ ...prev, isLoading: true }));

  //       // Load all-time leaderboard
  //       const allTimeResponse = await leaderboardAPI.getAllTimeLeaderboard(50);

  //       setLeaderboardData((prev) => ({
  //         ...prev,
  //         allTimeLeaderboard: allTimeResponse.leaderboard || [],
  //         isLoading: false,
  //       }));

  //       setBattleState((prev) => ({
  //         ...prev,
  //         isLoading: false,
  //       }));

  //       console.log("📈 Host leaderboard data loaded");
  //     } catch (error) {
  //       console.error("Error loading host leaderboard data:", error);
  //       toast.error("Failed to load leaderboard data");
  //       setLeaderboardData((prev) => ({ ...prev, isLoading: false }));
  //       setBattleState((prev) => ({ ...prev, isLoading: false }));
  //     }
  //   };

  //   loadInitialData();
  // }, [eventId]);

  // // Real-time socket setup effect
  // useEffect(() => {
  //   if (!socket || !eventBossId) return;

  //   // Join socket rooms for real-time updates
  //   socket.emit("get-boss-session-info", { eventBossId });

  //   // Request initial leaderboard data
  //   socket.emit("boss-preview:request-leaderboard", { eventBossId });

  //   // Set up periodic refresh for real-time data
  //   const refreshInterval = setInterval(() => {
  //     socket.emit("boss-preview:request-leaderboard", { eventBossId });
  //   }, 10000); // Refresh every 10 seconds

  //   return () => {
  //     clearInterval(refreshInterval);
  //   };
  // }, [socket, eventBossId]);

  // // Socket listeners for real-time updates
  // useEffect(() => {
  //   if (!socket) return;

  //   // Listen for boss session info (contains current boss state)
  //   const handleBossSessionInfo = (data) => {
  //     if (data.bossData) {
  //       setBattleState((prev) => ({
  //         ...prev,
  //         bossName: data.bossData.name || "Boss",
  //         bossStatus: data.isStarted
  //           ? "in-battle"
  //           : data.bossData.isActive
  //           ? "active"
  //           : "cooldown",
  //         currentHP: data.bossData.currentHp || prev.currentHP,
  //         maxHP: data.bossData.maxHp || prev.maxHP,
  //         playersActive: data.playerCount || 0,
  //         eventBossId: data.eventBossId,
  //       }));
  //     }
  //   };

  //   // Listen for real-time leaderboard updates from boss preview
  //   const handleBossPreviewLeaderboardUpdate = (data) => {
  //     if (data.leaderboardData) {
  //       setLeaderboardData((prev) => ({
  //         ...prev,
  //         teamLeaderboard:
  //           data.leaderboardData.teamLeaderboard || prev.teamLeaderboard,
  //         individualLeaderboard:
  //           data.leaderboardData.playerLeaderboard ||
  //           prev.individualLeaderboard,
  //       }));
  //     }
  //   };

  //   // Listen for real-time leaderboard updates from combat
  //   const handleLeaderboardUpdate = (data) => {
  //     setLeaderboardData((prev) => ({
  //       ...prev,
  //       teamLeaderboard: data.teamLeaderboard || prev.teamLeaderboard,
  //       individualLeaderboard:
  //         data.playerLeaderboard || prev.individualLeaderboard,
  //     }));
  //   };

  //   // Listen for boss status updates
  //   const handleBossStatusUpdate = (data) => {
  //     setBattleState((prev) => ({
  //       ...prev,
  //       bossStatus: data.status,
  //       bossName: data.bossName || prev.bossName,
  //       currentHP:
  //         data.currentHP !== undefined ? data.currentHP : prev.currentHP,
  //       maxHP: data.maxHP !== undefined ? data.maxHP : prev.maxHP,
  //     }));

  //     // Show toast notifications
  //     if (data.status === "in-battle") {
  //       toast.info(`${data.bossName || "Boss"} battle has started!`);
  //     } else if (data.status === "cooldown") {
  //       toast.success(`${data.bossName || "Boss"} has been defeated!`);
  //     }
  //   };

  //   // Listen for battle start events
  //   const handleBattleStart = (data) => {
  //     if (data.session) {
  //       setBattleState((prev) => ({
  //         ...prev,
  //         bossStatus: "in-battle",
  //         bossName: data.session.bossData?.name || prev.bossName,
  //         currentHP: data.session.bossData?.currentHp || prev.currentHP,
  //         maxHP: data.session.bossData?.maxHp || prev.maxHP,
  //         playersActive: data.session.playerCount || prev.playersActive,
  //       }));

  //       toast.info("Battle has started!");
  //     }
  //   };

  //   // Listen for battle status sync (real-time HP updates)
  //   const handleBattleStatusSync = (data) => {
  //     console.log("🔄 Host received battle status sync:", data);

  //     setBattleState((prev) => ({
  //       ...prev,
  //       currentHP:
  //         data.bossCurrentHp !== undefined
  //           ? data.bossCurrentHp
  //           : prev.currentHP,
  //       maxHP: data.bossMaxHp !== undefined ? data.bossMaxHp : prev.maxHP,
  //     }));
  //   };

  //   // Listen for player join notifications
  //   const handlePlayerJoined = (data) => {
  //     toast.info(`${data.playerNickname} joined the battle!`);
  //     setBattleState((prev) => ({
  //       ...prev,
  //       playersActive: prev.playersActive + 1,
  //     }));
  //   };

  //   // Listen for boss damage updates
  //   const handleBossDamageUpdate = (data) => {
  //     if (data.damage > 0) {
  //       setBattleState((prev) => ({
  //         ...prev,
  //         currentHP: data.currentHP,
  //         maxHP: data.maxHP,
  //       }));

  //       toast.success(
  //         `Boss took ${data.damage} damage! (${data.currentHP}/${data.maxHP} HP)`
  //       );
  //     }
  //   };

  //   // Listen for player knockout notifications
  //   const handlePlayerKnockout = (data) => {
  //     toast.error(`${data.playerNickname} was knocked out!`);
  //   };

  //   // Listen for boss defeated event
  //   const handleBossDefeated = (data) => {
  //     console.log("💀 Host received boss defeated:", data);

  //     setBattleState((prev) => ({
  //       ...prev,
  //       bossStatus: "cooldown",
  //       currentHP: 0,
  //     }));

  //     toast.success(`${data.winningTeam?.name || "A team"} defeated the boss!`);
  //   };

  //   // Listen for player count updates
  //   const handlePlayerCountUpdate = (data) => {
  //     console.log("👥 Host received player count update:", data);

  //     if (data.session) {
  //       setBattleState((prev) => ({
  //         ...prev,
  //         playersActive: data.session.playerCount || prev.playersActive,
  //         bossStatus: data.session.isStarted ? "in-battle" : prev.bossStatus,
  //       }));
  //     }
  //   };

  //   // Set up socket listeners
  //   socket.on("boss-session-info", handleBossSessionInfo);
  //   socket.on(
  //     "boss-preview:leaderboard-update",
  //     handleBossPreviewLeaderboardUpdate
  //   );
  //   socket.on("leaderboard-update", handleLeaderboardUpdate);
  //   socket.on("boss-status:updated", handleBossStatusUpdate);
  //   socket.on("battle:start", handleBattleStart);
  //   socket.on("battle-status-sync", handleBattleStatusSync);
  //   socket.on("player:joined-notification", handlePlayerJoined);
  //   socket.on("player:joined-battle", handlePlayerJoined);
  //   socket.on("boss:damage-update", handleBossDamageUpdate);
  //   socket.on("player:knockout-notification", handlePlayerKnockout);
  //   socket.on("boss-defeated", handleBossDefeated);
  //   socket.on("player-count:updated", handlePlayerCountUpdate);

  //   return () => {
  //     socket.off("boss-session-info", handleBossSessionInfo);
  //     socket.off(
  //       "boss-preview:leaderboard-update",
  //       handleBossPreviewLeaderboardUpdate
  //     );
  //     socket.off("leaderboard-update", handleLeaderboardUpdate);
  //     socket.off("boss-status:updated", handleBossStatusUpdate);
  //     socket.off("battle:start", handleBattleStart);
  //     socket.off("battle-status-sync", handleBattleStatusSync);
  //     socket.off("player:joined-notification", handlePlayerJoined);
  //     socket.off("player:joined-battle", handlePlayerJoined);
  //     socket.off("boss:damage-update", handleBossDamageUpdate);
  //     socket.off("player:knockout-notification", handlePlayerKnockout);
  //     socket.off("boss-defeated", handleBossDefeated);
  //     socket.off("player-count:updated", handlePlayerCountUpdate);
  //   };
  // }, [socket]);

  const handleBack = () => {
    const backUrl = eventBossId
      ? `/host/events/assign_boss?eventId=${eventId}&eventBossId=${eventBossId}`
      : `/host/events/assign_boss?eventId=${eventId}`;
    navigate(backUrl);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className=" "></div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Event Leaderboard
              </h1>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Live
          </Badge>
        </div>

        {/* Event Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  {loading.leaderboard
                    ? "Loading Event..."
                    : event?.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Boss: {eventBoss?.name || "No Boss Selected"} •{" "}
                  {activePlayers || 0} Players Active
                </p>
              </div>
              <Badge
                className={`w-fit ${
                  eventBossStatus === "in-battle"
                    ? "bg-red-500 hover:bg-red-600"
                    : eventBossStatus === "active"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    eventBossStatus === "in-battle" ||
                    eventBossStatus === "active"
                      ? "bg-white animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                {eventBossStatus === "in-battle"
                  ? "Battle Active"
                  : eventBossStatus === "active"
                  ? "Ready to Battle"
                  : "Boss Defeated"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {eventBoss?.name || "No Boss Selected"}
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      eventBossStatus === "active"
                        ? "bg-green-500 animate-pulse"
                        : eventBossStatus === "in-battle"
                        ? "bg-red-500 animate-pulse"
                        : "bg-gray-500"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {eventBossStatus === "cooldown"
                      ? "0"
                      : eventBossCurrentHP || "--"}{" "}
                    / {eventBossMaxHP || "--"} HP
                  </span>
                </div>
              </div>
              {/* Dynamic Progress Bar */}
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`rounded-full h-3 transition-all duration-500 ${
                    eventBossStatus === "cooldown"
                      ? "bg-gray-400 w-0"
                      : eventBossStatus === "active"
                      ? "bg-destructive w-full"
                      : "bg-destructive"
                  }`}
                  style={{
                    width:
                      eventBossStatus === "cooldown"
                        ? "0%"
                        : eventBossStatus === "active"
                        ? "100%"
                        : `${
                            ((eventBossCurrentHP || 0) /
                              (eventBossMaxHP || 100)) *
                            100
                          }%`,
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {eventBossStatus === "cooldown"
                    ? "Defeated"
                    : eventBossStatus === "active"
                    ? "Ready for Battle"
                    : `${Math.round(
                        ((eventBossCurrentHP || 0) /
                          (eventBossMaxHP || 100)) *
                          100
                      )}% Remaining`}
                </span>
                <span>
                  {eventBossStatus === "in-battle" && activePlayers
                    ? `${activePlayers} players active`
                    : eventBossStatus === "cooldown"
                    ? "Battle Complete"
                    : "Waiting for players"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <LeaderboardOverview
          leaderboard={leaderboard}
          isLoading={loading.leaderboard}
          isPreview={true}
          isFullWidth={true}
        />
      </div>
    </div>
  );
};

export default Leaderboard;
