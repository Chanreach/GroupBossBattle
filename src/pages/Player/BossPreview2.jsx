// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  X,
  Trophy,
  User,
  TrendingUp,
  Sword,
} from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// ===== STYLES ===== //
import "@/index.css";

// // ===== HOOKS ===== //
import useBossPreview from "@/hooks/useBossPreview";
// import useBattleQueue from "@/hooks/useBattleQueue";
import { useAuth } from "@/context/useAuth";

// ===== UTILITIES ===== //
import { getGuestUser } from "@/utils/guestUtils";
import { getBossImageUrl } from "@/utils/imageUtils";
import { getUserInfo } from "@/utils/userUtils";

const BossPreview = () => {
  const { eventBossId, joinCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const bossPreview = useBossPreview(eventBossId, joinCode);
  // const battleQueue = useBattleQueue(eventBossId, joinCode);

  const {
    eventBoss,
    isLoading,
    joinPreview,
    leavePreview
  } = bossPreview;

  const [countdown, setCountdown] = useState(null);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [session, setSession] = useState(null);
  
  const [bossStatus, setBossStatus] = useState("active");
  const [cooldownTimer, setCooldownTimer] = useState(0);

  const [isJoined, setIsJoined] = useState(false);
  const [playersOnline, setPlayersOnline] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  const [nickname, setNickname] = useState("");
  const [currentPage, setCurrentPage] = useState({
    teams: 1,
    individual: 1,
    alltime: 1,
  });
  const PAGE_SIZE = 10;

  const [realLeaderboardData, setRealLeaderboardData] = useState({
    teamLeaderboard: [],
    individualLeaderboard: [],
    allTimeLeaderboard: [],
    isLoading: true,
  });

  const teamLeaderboard = realLeaderboardData.teamLeaderboard || [];
  const individualLeaderboard = realLeaderboardData.individualLeaderboard || [];
  const allTimeLeaderboard = realLeaderboardData.allTimeLeaderboard || [];

  const goBack = () => {
    navigate(-1);
  };

  const validateNickname = (nickname) => {
    const trimmed = nickname.trim();

    if (trimmed.length < 2) {
      return "Nickname must be at least 2 characters long";
    }
    if (trimmed.length > 20) {
      return "Nickname must be 20 characters or less";
    }

    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validPattern.test(trimmed)) {
      return "Nickname can only contain letters, numbers, spaces, hyphens, and underscores";
    }

    if (/\s{2,}/.test(trimmed)) {
      return "Nickname cannot contain consecutive spaces";
    }

    if (/^[-_\s]|[-_\s]$/.test(trimmed)) {
      return "Nickname cannot start or end with spaces, hyphens, or underscores";
    }

    return null;
  };

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
  };

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

  // Auto-fill nickname with username when user is available
  useEffect(() => {
    if (!nickname) {
      const name = user?.username || getGuestUser()?.username || "";
      setNickname(name);
    }
  }, [user, nickname]);

  const handleJoin = () => {

  };

  const handleUnjoin = () => {

  };

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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button onClick={goBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-center">
                Boss Battle
              </h1>
              <p className="text-muted-foreground text-center">
                Join the battle and defeat the boss
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-sm mx-auto">
          <Card className="overflow-hidden">
            {/* Boss Name Header */}
            <CardHeader className="text-center">
              <CardTitle className="capitalize text-xl font-bold">
                {eventBoss?.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
              {/* Boss Image */}
              <div className="relative">
                <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
                  {eventBoss?.image ? (
                    <img
                      src={getBossImageUrl(eventBoss.image)}
                      alt={eventBoss?.name || "Boss Image"}
                      className={`w-full h-full object-cover ${
                        bossStatus === "cooldown" ? "boss-image-paused" : ""
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-center">
                        <Sword className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                        <span className="text-sm text-muted-foreground">
                          No Image
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sleeping Z Animation - Only show when boss is on cooldown */}
                {bossStatus === "cooldown" && cooldownTimer > 0 && (
                  <div className="absolute top-10 right-20 pointer-events-none">
                    <div className="sleeping-z">Z</div>
                    <div
                      className="sleeping-z"
                      style={{ left: "8px", top: "4px" }}
                    >
                      Z
                    </div>
                    <div
                      className="sleeping-z"
                      style={{ left: "16px", top: "8px" }}
                    >
                      Z
                    </div>
                  </div>
                )}
              </div>

              {/* Boss Status Display */}
              <div className="text-center pt-2 mb-0">
                {bossStatus === "cooldown" && cooldownTimer > 0 && (
                  <div className="font-semibold">Boss on Cooldown</div>
                )}
                {bossStatus === "in-battle" && (
                  <div className="text-purple-600 font-semibold flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Boss is currently in battle
                  </div>
                )}
                {bossStatus === "active" && (
                  <div className="text-purple-600 font-semibold">
                    Boss available for battle
                  </div>
                )}
              </div>

              {/* Players Joined */}
              <div className="text-center">
                <div className="flex items-center justify-center text-muted-foreground text-sm">
                  <Users className="w-4 h-4 mr-2 text-purple-600" />
                  <span className="text-purple-600">
                    Players joined: {playersOnline}
                  </span>
                </div>
              </div>

              {/* Join/Waiting Button */}
              {!isJoined ? (
                <Button
                  onClick={handleJoin}
                  className="w-full !bg-purple-500 hover:!bg-purple-600 !text-white !border-purple-500 halftone-texture"
                  disabled={!nickname.trim() || bossStatus === "cooldown"}
                >
                  {bossStatus === "cooldown"
                    ? `Available in: ${Math.floor(
                        cooldownTimer / 60
                      )}m ${String(cooldownTimer % 60).padStart(2, "0")}s`
                    : "Join"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {session?.playersNeededToStart > 0 && (
                      <Button className="flex-1" disabled variant="secondary">
                        Waiting for {session?.playersNeededToStart} more
                        player(s)
                      </Button>
                    )}
                    {isBattleStarted && countdown !== null && (
                      <Button
                        className="flex-1c w-full halftone-texture"
                        disabled
                        variant="destructive"
                      >
                        {countdown > 0
                          ? `Starting in ${countdown}...`
                          : "Battle Starting!"}
                      </Button>
                    )}
                    {isBattleStarted && countdown === null && (
                      <Button
                        className="flex-1c w-full halftone-texture"
                        onClick={() =>
                          navigate(`/boss-battle/${eventBossId}/${joinCode}`, {
                            state: { session },
                          })
                        }
                        variant="default"
                      >
                        Return to Battle
                      </Button>
                    )}
                    {!isCountdownActive && !isBattleStarted && (
                      <Button
                        onClick={handleUnjoin}
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                        title="Leave session"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Nickname Input */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-sm">
                  Nickname:
                </Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={handleNicknameChange}
                  placeholder="Enter your nickname"
                  maxLength={20}
                  disabled={isJoined}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Card */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="h-[840px] relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Live Leaderboard Rankings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                View performance across different categories
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
                    <span className="hidden sm:inline">Team Rankings</span>
                    <span className="sm:hidden">Teams</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="individual"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      Individual Rankings
                    </span>
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
                    <h3 className="text-lg font-semibold mb-2">
                      Team Rankings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Current event team performance
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
                          DMG
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Correct
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realLeaderboardData.isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              Loading team leaderboard...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : getPaginatedData(teamLeaderboard, "teams")
                          .paginatedData.length === 0 ? (
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
                        ).paginatedData.map((team) => (
                          <TableRow
                            key={team.rank}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {getRankBadge(team.rank)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage
                                    src={team.avatar}
                                    alt={team.team}
                                  />
                                  <AvatarFallback>
                                    {team.team[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{team.team}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {team.dmg}
                            </TableCell>
                            <TableCell className="text-right">
                              {team.correct}
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
                        <TableHead className="whitespace-normal">
                          Player
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          DMG
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Correct
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realLeaderboardData.isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              Loading individual leaderboard...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : getPaginatedData(individualLeaderboard, "individual")
                          .paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No player data available yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        getPaginatedData(
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
                                    src={player.avatar}
                                    alt={player.player}
                                  />
                                  <AvatarFallback>
                                    {player.player[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {player.player}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {player.dmg}
                            </TableCell>
                            <TableCell className="text-right">
                              {player.correct}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(individualLeaderboard, "individual")}
                    onPageChange={(page) =>
                      handlePageChange("individual", page)
                    }
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
                        <TableHead className="whitespace-normal">
                          Player
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Total DMG
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Total Correct
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realLeaderboardData.isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              Loading all-time leaderboard...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : getPaginatedData(allTimeLeaderboard, "alltime")
                          .paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No historical data available yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        getPaginatedData(
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
                                    src={player.avatar}
                                    alt={player.player}
                                  />
                                  <AvatarFallback>
                                    {player.player[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {player.player}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {player.dmg}
                            </TableCell>
                            <TableCell className="text-right">
                              {player.correct}
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
                </TabsContent>{" "}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default BossPreview;
