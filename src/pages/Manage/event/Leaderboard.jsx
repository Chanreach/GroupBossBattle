import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Trophy,
  Users,
  User,
  TrendingUp,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import useBossBattle from "@/hooks/useBossBattle";
import { leaderboardAPI } from "@/services/api";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const eventBossId = searchParams.get("eventBossId"); // Get eventBossId for real-time updates
  const { socket } = useBossBattle();

  const [currentPage, setCurrentPage] = useState({
    teams: 1,
    individual: 1,
    alltime: 1,
  });
  const PAGE_SIZE = 10;

  // Real-time leaderboard data state
  const [leaderboardData, setLeaderboardData] = useState({
    teamLeaderboard: [],
    individualLeaderboard: [],
    allTimeLeaderboard: [],
    isLoading: true,
  });

  // Boss battle state with real-time tracking
  const [battleState, setBattleState] = useState({
    bossName: "Boss",
    bossStatus: "active", // active, in-battle, cooldown
    currentHP: 1000,
    maxHP: 1000,
    playersActive: 0,
    eventBossId: null, // Track the current eventBossId
    isLoading: true,
  });

  // Load initial data and set up socket listeners
  useEffect(() => {
    if (!eventId) return;

    const loadInitialData = async () => {
      try {
        setBattleState((prev) => ({ ...prev, isLoading: true }));
        setLeaderboardData((prev) => ({ ...prev, isLoading: true }));

        // Load all-time leaderboard
        const allTimeResponse = await leaderboardAPI.getAllTimeLeaderboard(50);

        setLeaderboardData((prev) => ({
          ...prev,
          allTimeLeaderboard: allTimeResponse.leaderboard || [],
          isLoading: false,
        }));

        setBattleState((prev) => ({
          ...prev,
          isLoading: false,
        }));

        console.log("📈 Host leaderboard data loaded");
      } catch (error) {
        console.error("Error loading host leaderboard data:", error);
        toast.error("Failed to load leaderboard data");
        setLeaderboardData((prev) => ({ ...prev, isLoading: false }));
        setBattleState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadInitialData();
  }, [eventId]);

  // Real-time socket setup effect
  useEffect(() => {
    if (!socket || !eventBossId) return;

    console.log(
      `📡 Host joining real-time rooms for eventBoss: ${eventBossId}`
    );

    // Join socket rooms for real-time updates
    socket.emit("get-boss-session-info", { eventBossId });

    // Request initial leaderboard data
    socket.emit("boss-preview:request-leaderboard", { eventBossId });

    // Set up periodic refresh for real-time data
    const refreshInterval = setInterval(() => {
      socket.emit("boss-preview:request-leaderboard", { eventBossId });
    }, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [socket, eventBossId]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for boss session info (contains current boss state)
    const handleBossSessionInfo = (data) => {
      console.log("🎯 Host received boss session info:", data);

      if (data.bossData) {
        setBattleState((prev) => ({
          ...prev,
          bossName: data.bossData.name || "Boss",
          bossStatus: data.isStarted
            ? "in-battle"
            : data.bossData.isActive
            ? "active"
            : "cooldown",
          currentHP: data.bossData.currentHp || prev.currentHP,
          maxHP: data.bossData.maxHp || prev.maxHP,
          playersActive: data.playerCount || 0,
          eventBossId: data.eventBossId,
        }));
      }
    };

    // Listen for real-time leaderboard updates from boss preview
    const handleBossPreviewLeaderboardUpdate = (data) => {
      console.log("📊 Host received boss preview leaderboard update:", data);

      if (data.leaderboardData) {
        setLeaderboardData((prev) => ({
          ...prev,
          teamLeaderboard:
            data.leaderboardData.teamLeaderboard || prev.teamLeaderboard,
          individualLeaderboard:
            data.leaderboardData.playerLeaderboard ||
            prev.individualLeaderboard,
        }));
      }
    };

    // Listen for real-time leaderboard updates from combat
    const handleLeaderboardUpdate = (data) => {
      console.log("📊 Host received combat leaderboard update:", data);

      setLeaderboardData((prev) => ({
        ...prev,
        teamLeaderboard: data.teamLeaderboard || prev.teamLeaderboard,
        individualLeaderboard:
          data.playerLeaderboard || prev.individualLeaderboard,
      }));
    };

    // Listen for boss status updates
    const handleBossStatusUpdate = (data) => {
      console.log("🎯 Host received boss status update:", data);

      setBattleState((prev) => ({
        ...prev,
        bossStatus: data.status,
        bossName: data.bossName || prev.bossName,
        currentHP:
          data.currentHP !== undefined ? data.currentHP : prev.currentHP,
        maxHP: data.maxHP !== undefined ? data.maxHP : prev.maxHP,
      }));

      // Show toast notifications
      if (data.status === "in-battle") {
        toast.info(`${data.bossName || "Boss"} battle has started!`);
      } else if (data.status === "cooldown") {
        toast.success(`${data.bossName || "Boss"} has been defeated!`);
      }
    };

    // Listen for battle start events
    const handleBattleStart = (data) => {
      console.log("🚀 Host received battle start:", data);

      if (data.session) {
        setBattleState((prev) => ({
          ...prev,
          bossStatus: "in-battle",
          bossName: data.session.bossData?.name || prev.bossName,
          currentHP: data.session.bossData?.currentHp || prev.currentHP,
          maxHP: data.session.bossData?.maxHp || prev.maxHP,
          playersActive: data.session.playerCount || prev.playersActive,
        }));

        toast.info("Battle has started!");
      }
    };

    // Listen for battle status sync (real-time HP updates)
    const handleBattleStatusSync = (data) => {
      console.log("🔄 Host received battle status sync:", data);

      setBattleState((prev) => ({
        ...prev,
        currentHP:
          data.bossCurrentHp !== undefined
            ? data.bossCurrentHp
            : prev.currentHP,
        maxHP: data.bossMaxHp !== undefined ? data.bossMaxHp : prev.maxHP,
      }));
    };

    // Listen for player join notifications
    const handlePlayerJoined = (data) => {
      toast.info(`${data.playerNickname} joined the battle!`);
      setBattleState((prev) => ({
        ...prev,
        playersActive: prev.playersActive + 1,
      }));
    };

    // Listen for boss damage updates
    const handleBossDamageUpdate = (data) => {
      if (data.damage > 0) {
        setBattleState((prev) => ({
          ...prev,
          currentHP: data.currentHP,
          maxHP: data.maxHP,
        }));

        toast.success(
          `Boss took ${data.damage} damage! (${data.currentHP}/${data.maxHP} HP)`
        );
      }
    };

    // Listen for player knockout notifications
    const handlePlayerKnockout = (data) => {
      toast.error(`${data.playerNickname} was knocked out!`);
    };

    // Listen for boss defeated event
    const handleBossDefeated = (data) => {
      console.log("💀 Host received boss defeated:", data);

      setBattleState((prev) => ({
        ...prev,
        bossStatus: "cooldown",
        currentHP: 0,
      }));

      toast.success(`${data.winningTeam?.name || "A team"} defeated the boss!`);
    };

    // Listen for player count updates
    const handlePlayerCountUpdate = (data) => {
      console.log("👥 Host received player count update:", data);

      if (data.session) {
        setBattleState((prev) => ({
          ...prev,
          playersActive: data.session.playerCount || prev.playersActive,
          bossStatus: data.session.isStarted ? "in-battle" : prev.bossStatus,
        }));
      }
    };

    // Set up socket listeners
    socket.on("boss-session-info", handleBossSessionInfo);
    socket.on(
      "boss-preview:leaderboard-update",
      handleBossPreviewLeaderboardUpdate
    );
    socket.on("leaderboard-update", handleLeaderboardUpdate);
    socket.on("boss-status:updated", handleBossStatusUpdate);
    socket.on("battle:start", handleBattleStart);
    socket.on("battle-status-sync", handleBattleStatusSync);
    socket.on("player:joined-notification", handlePlayerJoined);
    socket.on("player:joined-battle", handlePlayerJoined);
    socket.on("boss:damage-update", handleBossDamageUpdate);
    socket.on("player:knockout-notification", handlePlayerKnockout);
    socket.on("boss-defeated", handleBossDefeated);
    socket.on("player-count:updated", handlePlayerCountUpdate);

    return () => {
      socket.off("boss-session-info", handleBossSessionInfo);
      socket.off(
        "boss-preview:leaderboard-update",
        handleBossPreviewLeaderboardUpdate
      );
      socket.off("leaderboard-update", handleLeaderboardUpdate);
      socket.off("boss-status:updated", handleBossStatusUpdate);
      socket.off("battle:start", handleBattleStart);
      socket.off("battle-status-sync", handleBattleStatusSync);
      socket.off("player:joined-notification", handlePlayerJoined);
      socket.off("player:joined-battle", handlePlayerJoined);
      socket.off("boss:damage-update", handleBossDamageUpdate);
      socket.off("player:knockout-notification", handlePlayerKnockout);
      socket.off("boss-defeated", handleBossDefeated);
      socket.off("player-count:updated", handlePlayerCountUpdate);
    };
  }, [socket]);

  // Use real data or fallback to empty arrays
  const teamLeaderboard = leaderboardData.teamLeaderboard || [];
  const individualLeaderboard = leaderboardData.individualLeaderboard || [];
  const allTimeLeaderboard = leaderboardData.allTimeLeaderboard || [];

  // Pagination helpers
  const getPaginatedData = (data, tabKey) => {
    const page = currentPage[tabKey];
    const totalPages = Math.ceil(data.length / PAGE_SIZE);
    const paginatedData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return { paginatedData, totalPages, currentPageNum: page };
  };

  const handlePageChange = (tabKey, newPage) => {
    setCurrentPage((prev) => ({ ...prev, [tabKey]: newPage }));
  };

  const handleBack = () => {
    const backUrl = eventBossId
      ? `/host/events/assign_boss?eventId=${eventId}&eventBossId=${eventBossId}`
      : `/host/events/assign_boss?eventId=${eventId}`;
    navigate(backUrl);
  };

  const getRankBadge = (rank) => {
    if (rank === 1)
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          1st
        </Badge>
      );
    if (rank === 2)
      return (
        <Badge className="bg-gray-400 hover:bg-gray-500 text-white">2nd</Badge>
      );
    if (rank === 3)
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
          3rd
        </Badge>
      );
    return (
      <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    );
  };

  // Pagination component
  const PaginationControls = ({ totalPages, currentPageNum, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(currentPageNum > 1 ? currentPageNum - 1 : 1);
                }}
                className={
                  currentPageNum === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  href="#"
                  isActive={currentPageNum === idx + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(idx + 1);
                  }}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(
                    currentPageNum < totalPages
                      ? currentPageNum + 1
                      : totalPages
                  );
                }}
                className={
                  currentPageNum === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
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

        {/* Event Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  {battleState.isLoading
                    ? "Loading Event..."
                    : "Event Leaderboard"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Boss: {battleState.bossName || "No Boss Selected"} •{" "}
                  {battleState.playersActive || 0} Players Active
                </p>
              </div>
              <Badge
                className={`w-fit ${
                  battleState.bossStatus === "in-battle"
                    ? "bg-red-500 hover:bg-red-600"
                    : battleState.bossStatus === "active"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    battleState.bossStatus === "in-battle" ||
                    battleState.bossStatus === "active"
                      ? "bg-white animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                {battleState.bossStatus === "in-battle"
                  ? "Battle Active"
                  : battleState.bossStatus === "active"
                  ? "Ready to Battle"
                  : "Boss Defeated"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {battleState.bossName || "No Boss Selected"}
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      battleState.bossStatus === "active"
                        ? "bg-green-500 animate-pulse"
                        : battleState.bossStatus === "in-battle"
                        ? "bg-red-500 animate-pulse"
                        : "bg-gray-500"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {battleState.bossStatus === "cooldown"
                      ? "0"
                      : battleState.currentHP || 0}{" "}
                    / {battleState.maxHP || 100} HP
                  </span>
                </div>
              </div>
              {/* Dynamic Progress Bar */}
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`rounded-full h-3 transition-all duration-500 ${
                    battleState.bossStatus === "cooldown"
                      ? "bg-gray-400 w-0"
                      : battleState.bossStatus === "active"
                      ? "bg-destructive w-full"
                      : "bg-destructive"
                  }`}
                  style={{
                    width:
                      battleState.bossStatus === "cooldown"
                        ? "0%"
                        : battleState.bossStatus === "active"
                        ? "100%"
                        : `${
                            ((battleState.currentHP || 0) /
                              (battleState.maxHP || 100)) *
                            100
                          }%`,
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {battleState.bossStatus === "cooldown"
                    ? "Defeated"
                    : battleState.bossStatus === "active"
                    ? "Ready for Battle"
                    : `${Math.round(
                        ((battleState.currentHP || 0) /
                          (battleState.maxHP || 100)) *
                          100
                      )}% Remaining`}
                </span>
                <span>
                  {battleState.bossStatus === "in-battle" &&
                  battleState.playersActive
                    ? `${battleState.playersActive} players active`
                    : battleState.bossStatus === "cooldown"
                    ? "Battle Complete"
                    : "Waiting for players"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Leaderboard Rankings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              View performance across different categories
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="teams" className="space-y-6">
              {/* Tabs List */}
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="teams" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Team Rankings</span>
                  <span className="sm:hidden">Teams</span>
                </TabsTrigger>
                <TabsTrigger
                  value="individual"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Individual Rankings</span>
                  <span className="sm:hidden">Players</span>
                </TabsTrigger>
                <TabsTrigger
                  value="alltime"
                  className="flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">All-Time</span>
                  <span className="sm:hidden">All-Time</span>
                </TabsTrigger>
              </TabsList>

              {/* Team Leaderboard */}
              <TabsContent value="teams" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Team Rankings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Current event team performance
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">Damage</TableHead>
                      <TableHead className="text-right">
                        Correct Answers
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Loader className="w-4 h-4 animate-spin" />
                            Loading team leaderboard...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : teamLeaderboard.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No team data available yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      getPaginatedData(
                        teamLeaderboard,
                        "teams"
                      ).paginatedData.map((team, index) => (
                        <TableRow
                          key={team.teamName || index}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {getRankBadge(index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={
                                    team.avatar ||
                                    "/src/assets/Placeholder/Team1.jpg"
                                  }
                                  alt={team.teamName || `Team ${index + 1}`}
                                />
                                <AvatarFallback>
                                  {(team.teamName || `T${index + 1}`)[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {team.teamName || `Team ${index + 1}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {team.totalDamage || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {team.totalCorrectAnswers || 0}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <PaginationControls
                  {...getPaginatedData(teamLeaderboard, "teams")}
                  onPageChange={(page) => handlePageChange("teams", page)}
                />
              </TabsContent>

              {/* Individual Leaderboard */}
              <TabsContent value="individual" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Individual Rankings
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Current event individual player performance
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Damage</TableHead>
                      <TableHead className="text-right">
                        Correct Answers
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Loader className="w-4 h-4 animate-spin" />
                            Loading individual leaderboard...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : individualLeaderboard.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No individual player data available yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      getPaginatedData(
                        individualLeaderboard,
                        "individual"
                      ).paginatedData.map((player, index) => (
                        <TableRow
                          key={player.playerNickname || index}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {getRankBadge(index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={
                                    player.avatar ||
                                    "/src/assets/Placeholder/Profile1.jpg"
                                  }
                                  alt={
                                    player.playerNickname ||
                                    `Player ${index + 1}`
                                  }
                                />
                                <AvatarFallback>
                                  {
                                    (player.playerNickname ||
                                      `P${index + 1}`)[0]
                                  }
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {player.playerNickname || `Player ${index + 1}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {player.totalDamage || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {player.totalCorrectAnswers || 0}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <PaginationControls
                  {...getPaginatedData(individualLeaderboard, "individual")}
                  onPageChange={(page) => handlePageChange("individual", page)}
                />
              </TabsContent>

              {/* All-Time Leaderboard */}
              <TabsContent value="alltime" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    All-Time Rankings
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Historical player performance across all events
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Total Damage</TableHead>
                      <TableHead className="text-right">
                        Total Correct
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Loader className="w-4 h-4 animate-spin" />
                            Loading all-time leaderboard...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : allTimeLeaderboard.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No all-time data available yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      getPaginatedData(
                        allTimeLeaderboard,
                        "alltime"
                      ).paginatedData.map((player, index) => (
                        <TableRow
                          key={player.playerName || index}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {getRankBadge(index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={
                                    player.profilePicture ||
                                    "/src/assets/Placeholder/Profile1.jpg"
                                  }
                                  alt={
                                    player.playerName ||
                                    player.nickname ||
                                    `Player ${index + 1}`
                                  }
                                />
                                <AvatarFallback>
                                  {
                                    (player.playerName ||
                                      player.nickname ||
                                      `P${index + 1}`)[0]
                                  }
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {player.playerName ||
                                  player.nickname ||
                                  `Player ${index + 1}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {player.totalDamage || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {player.totalCorrectAnswers || 0}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <PaginationControls
                  {...getPaginatedData(allTimeLeaderboard, "alltime")}
                  onPageChange={(page) => handlePageChange("alltime", page)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
