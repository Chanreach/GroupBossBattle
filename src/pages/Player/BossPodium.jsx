// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Trophy,
  User,
  Crown,
  Medal,
  Award,
} from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

// ===== CONTEXTS ===== //
import useBossBattle from "@/hooks/useBossBattle";

// ===== UTILITIES ===== //
import { startConfettiCelebration } from "@/lib/Confetti";

// ===== AUDIOS ===== //
import victoryDrumsSound from "@/assets/Audio/victory-drums.mp3";
import victoryThemeSound from "@/assets/Audio/victory-theme.mp3";

// ===== STYLES ===== //
import "@/index.css";

const BossPodium = () => {
  const navigate = useNavigate();
  const { socket, currentBoss } = useBossBattle();
  const [currentPage, setCurrentPage] = useState({
    teams: 1,
    individual: 1,
    alltime: 1,
  });
  const [leaderboardData, setLeaderboardData] = useState({
    teamLeaderboard: [],
    individualLeaderboard: [],
    allTimeLeaderboard: [],
    winningTeam: null,
    mvpPlayer: null,
    battleStats: null,
    isLoading: true,
  });
  const PAGE_SIZE = 10;

  // ===== BOSS CONFIGURATION ===== //
  const BOSS_NAME = currentBoss?.name || "CS Boss";

  // ===== EFFECT: Load leaderboard data and set up socket listeners ===== //
  useEffect(() => {
    if (!socket) return;

    // Listen for final leaderboards from backend
    const handleFinalLeaderboards = (data) => {
      console.log("📊 Received final leaderboards:", data);

      setLeaderboardData({
        teamLeaderboard: data.teamLeaderboard || [],
        individualLeaderboard: data.playerLeaderboard || [],
        allTimeLeaderboard: [], // Will be loaded separately via API
        winningTeam: data.winningTeam,
        mvpPlayer: data.mvpPlayer,
        battleStats: data.battleStats,
        isLoading: false,
      });
    };

    socket.on("final-leaderboards", handleFinalLeaderboards);

    // Load all-time leaderboard from API for this specific boss
    const loadAllTimeLeaderboard = async () => {
      try {
        const bossId = currentBoss?.id || 'default';
        const response = await fetch(
          `http://localhost:3000/api/leaderboards/all-time?bossId=${bossId}`
        );
        if (response.ok) {
          const allTimeData = await response.json();
          setLeaderboardData((prev) => ({
            ...prev,
            allTimeLeaderboard: allTimeData.leaderboard || [],
          }));
          console.log("📈 All-time leaderboard loaded for boss:", bossId);
        }
      } catch (error) {
        console.error("Error loading all-time leaderboard:", error);
      }
    };

    loadAllTimeLeaderboard();

    // If no data is received initially, show loading state
    const timeout = setTimeout(() => {
      if (leaderboardData.isLoading) {
        console.log("⏳ Waiting for battle completion data...");
        // Keep loading state - no mock data
        setLeaderboardData(prev => ({
          ...prev,
          isLoading: false // Stop loading after timeout, show empty state
        }));
      }
    }, 5000); // Wait longer for real data

    return () => {
      socket.off("final-leaderboards", handleFinalLeaderboards);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]); // Remove leaderboardData.isLoading dependency to avoid infinite loop

  // ===== RENDER HELPERS ===== //
  const teamLeaderboard = leaderboardData.teamLeaderboard;
  const individualLeaderboard = leaderboardData.individualLeaderboard;
  const allTimeLeaderboard = leaderboardData.allTimeLeaderboard;

  const goBack = () => {
    navigate("/qr"); // Go to QR page
  };

  const handlePlayAgain = () => {
    navigate("/boss-preview");
  };

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

  // Podium helpers
  const getPodiumColor = (rank) => {
    if (rank === 1) return "bg-yellow-500"; // Gold
    if (rank === 2) return "bg-gray-400"; // Silver
    if (rank === 3) return "bg-amber-600"; // Bronze
    return "bg-gray-500";
  };

  const getPodiumIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-white" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-white" />;
    if (rank === 3) return <Award className="w-4 h-4 text-white" />;
    return null;
  };

  // Top 3 individual players for podium
  const podiumPlayers = individualLeaderboard.slice(0, 3);

  // Debug logging
  useEffect(() => {
    console.log(
      "🏆 Podium Debug - Individual Leaderboard:",
      individualLeaderboard
    );
    console.log("🏆 Podium Debug - Podium Players:", podiumPlayers);
    console.log("🏆 Podium Debug - Full Leaderboard Data:", leaderboardData);
  }, [individualLeaderboard, podiumPlayers, leaderboardData]);

  // Audio
  const victoryDrumsAudio = new Audio(victoryDrumsSound);
  const victoryThemeAudio = new Audio(victoryThemeSound);
  victoryDrumsAudio.volume = 0.03;
  victoryThemeAudio.volume = 0.02;

  // Confetti celebration and victory sounds on component mount
  useEffect(() => {
    const playVictorySounds = async () => {
      try {
        // Play victory drums first
        console.log("Playing victory drums...");
        victoryDrumsAudio.currentTime = 0;
        await victoryDrumsAudio.play();

        // Play victory theme 3 seconds after drums start
        setTimeout(async () => {
          console.log("Playing victory theme...");
          victoryThemeAudio.currentTime = 0;
          victoryThemeAudio.loop = false; // Ensure no loop
          await victoryThemeAudio.play();
          console.log("Victory sounds sequence complete!");
        }, 3800); // 4 seconds delay
      } catch (error) {
        console.log("Victory audio play failed:", error);
      }
    };

    const triggerVictoryConfetti = async () => {
      // Start confetti celebration with 3 bursts
      await startConfettiCelebration({
        origin: { y: 0.6 }, // Start from 60% down the screen (good for podium)
        maxBursts: 3, // 3 confetti bursts
        burstInterval: 1500, // 1.5 seconds between bursts
        onComplete: () => {
          console.log("Victory confetti celebration complete!");
        },
      });
    };

    // Start victory sounds immediately and confetti after a short delay
    const effectTimer = setTimeout(() => {
      playVictorySounds(); // Start sounds immediately
      triggerVictoryConfetti(); // Start confetti
    }, 100); // Very short delay to let the page render

    // Cleanup
    return () => {
      clearTimeout(effectTimer);
      // Stop and cleanup audio if component unmounts
      victoryDrumsAudio.pause();
      victoryDrumsAudio.currentTime = 0;
      victoryThemeAudio.pause();
      victoryThemeAudio.currentTime = 0;
    };
  }, []); // Empty dependency array - only run once on mount

  // Pagination component
  const PaginationControls = ({ totalPages, currentPageNum, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
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
    <main className="flex-grow min-h-screen">
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        {/* Back Button */}
        <Button onClick={goBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to QR
        </Button>

        {/* Victory Podium Section */}
        <Card className="mb-8">
          <CardHeader className="pb-3 sm:pb-6 text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
              <div className="flex items-center justify-center gap-3">
                <Crown className="w-6 h-6 text-yellow-500" />
                <span>Victory Podium</span>
              </div>
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {BOSS_NAME} has been defeated! Top 3 battle champions
            </p>
          </CardHeader>
          <CardContent>
            {/* Desktop Podium */}
            <div className="flex items-end justify-center gap-6 py-4">
              {podiumPlayers.length > 0 ? (
                podiumPlayers.map((player, idx) => {
                  // Height for podium effect
                  let height =
                    player.rank === 1 ? 120 : player.rank === 2 ? 80 : 60;
                  // Animation classes based on rank - only for the avatar
                  let animationClass =
                    player.rank === 1
                      ? "animate-bounce-excited-first"
                      : player.rank === 2
                      ? "animate-bounce-excited-second"
                      : "animate-bounce-excited-third";
                  return (
                    <div
                      key={player.rank}
                      className={`flex flex-col items-center ${
                        idx === 0
                          ? "order-2"
                          : idx === 1
                          ? "order-1"
                          : "order-3"
                      }`}
                    >
                      <div className="mb-2 relative">
                        <Avatar
                          className={`w-20 h-20 md:w-24 md:h-24 border-4 border-gray-200 dark:border-gray-700 shadow-lg ${animationClass}`}
                        >
                          <AvatarImage
                            src={player.avatar}
                            alt={player.nickname || player.username}
                          />
                          <AvatarFallback>
                            {(player.nickname || player.username || "P")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -top-3 -right-3 w-8 h-8 rounded-full ${getPodiumColor(
                            player.rank
                          )} flex items-center justify-center shadow-lg border-2 border-white`}
                        >
                          {getPodiumIcon(player.rank)}
                        </div>
                      </div>
                      <div className="font-bold text-lg mb-1">
                        {player.nickname || player.username}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {(player.totalDamage || 0).toLocaleString()} DMG
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {Math.round(player.accuracy || 0)}% Correct
                      </div>
                      <div
                        className={`w-20 md:w-24 h-6 rounded-t-lg ${getPodiumColor(
                          player.rank
                        )} text-white flex items-center justify-center font-bold text-sm shadow-lg`}
                        style={{ height: `${height}px` }}
                      >
                        {player.rank === 1
                          ? "1st"
                          : player.rank === 2
                          ? "2nd"
                          : "3rd"}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg font-medium mb-2">
                    {leaderboardData.isLoading
                      ? "Loading battle results..."
                      : "No battle results yet"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {leaderboardData.isLoading
                      ? "Please wait while we process the final rankings..."
                      : "Complete a boss battle to see the victory podium"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Final Results Leaderboard */}
        <div className="max-w-4xl mx-auto">
          <Card className="h-[840px] relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="w-5 h-5" />
                Final Battle Results
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete performance rankings for this battle
              </p>
            </CardHeader>
            <CardContent className="relative h-full">
              <Tabs defaultValue="teams" className="space-y-3">
                {/* Tabs List */}
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="teams"
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Team Results</span>
                    <span className="sm:hidden">Teams</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="individual"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Individual Results</span>
                    <span className="sm:hidden">Players</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="alltime"
                    className="flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span className="hidden sm:inline">All-Time Records</span>
                    <span className="sm:hidden">All-Time</span>
                  </TabsTrigger>
                </TabsList>

                {/* Team Results */}
                <TabsContent value="teams" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Team Final Rankings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Final team performance for this battle
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">
                          Team
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Total DMG
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Correct %
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(
                        teamLeaderboard,
                        "teams"
                      ).paginatedData.map((team) => (
                        <TableRow key={team.rank} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {getRankBadge(team.rank)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={`/src/assets/Placeholder/Profile${
                                    (team.rank % 5) + 1
                                  }.jpg`}
                                  alt={team.teamName}
                                />
                                <AvatarFallback>
                                  {team.teamName?.[0] || "T"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {team.teamName || `Team ${team.teamId}`}
                              </span>
                              {team.rank === 1 && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {team.totalDamage || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {team.players && team.players.length > 0
                              ? Math.round(
                                  team.players.reduce(
                                    (sum, p) => sum + (p.accuracy || 0),
                                    0
                                  ) / team.players.length
                                )
                              : 0}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(teamLeaderboard, "teams")}
                    onPageChange={(page) => handlePageChange("teams", page)}
                  />
                </TabsContent>

                {/* Individual Results */}
                <TabsContent value="individual" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Individual Final Rankings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Final individual player performance for this battle
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">
                          Player
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Total DMG
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Correct %
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(
                        individualLeaderboard,
                        "individual"
                      ).paginatedData.map((player) => (
                        <TableRow
                          key={player.rank}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {getRankBadge(player.rank)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={`/src/assets/Placeholder/Profile${
                                    (player.rank % 5) + 1
                                  }.jpg`}
                                  alt={player.nickname}
                                />
                                <AvatarFallback>
                                  {player.nickname?.[0] || "P"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {player.nickname || player.username}
                              </span>
                              {player.rank === 1 && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {player.totalDamage || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {Math.round(player.accuracy || 0)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(individualLeaderboard, "individual")}
                    onPageChange={(page) =>
                      handlePageChange("individual", page)
                    }
                  />
                </TabsContent>

                {/* All-Time Records */}
                <TabsContent value="alltime" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      All-Time Records
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Historical player performance across all battles
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">
                          Player
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Total DMG
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Correct %
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(
                        allTimeLeaderboard,
                        "alltime"
                      ).paginatedData.map((player) => (
                        <TableRow
                          key={player.rank}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {getRankBadge(player.rank)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={`/src/assets/Placeholder/Profile${
                                    (player.rank % 5) + 1
                                  }.jpg`}
                                  alt={player.nickname}
                                />
                                <AvatarFallback>
                                  {player.nickname?.[0] || "P"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {player.nickname || player.username}
                              </span>
                              {player.rank === 1 && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {player.totalDamage || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {Math.round(player.accuracy || 0)}%
                          </TableCell>
                        </TableRow>
                      ))}
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
    </main>
  );
};

export default BossPodium;
