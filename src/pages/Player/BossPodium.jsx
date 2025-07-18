// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Trophy, User, Crown, Medal, Award } from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

// ===== UTILITIES ===== //
import { startConfettiCelebration } from "@/lib/Confetti";

// ===== AUDIOS ===== //
import victoryDrumsSound from "@/assets/Audio/victory-drums.mp3";
import victoryThemeSound from "@/assets/Audio/victory-theme.mp3";

// ===== STYLES ===== //
import "@/index.css";

const BossPodium = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState({ teams: 1, individual: 1, alltime: 1 });
  const PAGE_SIZE = 10;

  // ===== BOSS CONFIGURATION (Backend Integration Ready) ===== //
  // This will be replaced with data from the bosses API endpoint
  const bossDataFromBackend = {
    id: "boss_001",
    name: "CS Boss",
    image: "/src/assets/Placeholder/Falcon.png",
    description: "A challenging computer science boss battle",
    cooldown_duration: 300,
    number_of_teams: 4,
    creator_id: "admin_001",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const BOSS_NAME = bossDataFromBackend.name;

  // Enhanced leaderboard data - final results after boss defeat
  const teamLeaderboard = [
    { rank: 1, team: 'Kangaroo', dmg: 100, correctPercent: 90, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 2, team: 'Koala', dmg: 85, correctPercent: 85, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 3, team: 'Shellfish', dmg: 68, correctPercent: 78, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 4, team: 'Dolphins', dmg: 55, correctPercent: 70, avatar: '/src/assets/Placeholder/Profile4.jpg' },
  ];

  const individualLeaderboard = [
    { rank: 1, player: 'Sovitep', dmg: 100, correctPercent: 95, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 2, player: 'Visoth', dmg: 90, correctPercent: 88, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 3, player: 'Roth', dmg: 75, correctPercent: 82, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 4, player: 'Alice', dmg: 65, correctPercent: 79, avatar: '/src/assets/Placeholder/Profile4.jpg' },
    { rank: 5, player: 'Bob', dmg: 55, correctPercent: 75, avatar: '/src/assets/Placeholder/Profile5.jpg' },
    { rank: 6, player: 'Charlie', dmg: 45, correctPercent: 72, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 7, player: 'David', dmg: 35, correctPercent: 68, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 8, player: 'Emma', dmg: 30, correctPercent: 65, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 9, player: 'Frank', dmg: 25, correctPercent: 62, avatar: '/src/assets/Placeholder/Profile4.jpg' },
    { rank: 10, player: 'Grace', dmg: 20, correctPercent: 58, avatar: '/src/assets/Placeholder/Profile5.jpg' },
    { rank: 11, player: 'Henry', dmg: 15, correctPercent: 55, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 12, player: 'Ivy', dmg: 10, correctPercent: 50, avatar: '/src/assets/Placeholder/Profile2.jpg' }
  ];

  const allTimeLeaderboard = [
    { rank: 1, player: 'Python', dmg: 300, correctPercent: 92, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 2, player: 'Sovitep', dmg: 280, correctPercent: 90, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 3, player: 'Visoth', dmg: 250, correctPercent: 87, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 4, player: 'Alice', dmg: 220, correctPercent: 85, avatar: '/src/assets/Placeholder/Profile4.jpg' },
    { rank: 5, player: 'Bob', dmg: 200, correctPercent: 83, avatar: '/src/assets/Placeholder/Profile5.jpg' },
    { rank: 6, player: 'Charlie', dmg: 180, correctPercent: 80, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 7, player: 'Master', dmg: 160, correctPercent: 78, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 8, player: 'Legend', dmg: 140, correctPercent: 75, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 9, player: 'Hero', dmg: 120, correctPercent: 72, avatar: '/src/assets/Placeholder/Profile4.jpg' },
    { rank: 10, player: 'Champion', dmg: 100, correctPercent: 70, avatar: '/src/assets/Placeholder/Profile5.jpg' },
    { rank: 11, player: 'Warrior', dmg: 90, correctPercent: 68, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 12, player: 'Fighter', dmg: 80, correctPercent: 65, avatar: '/src/assets/Placeholder/Profile2.jpg' },
  ];

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
    setCurrentPage(prev => ({ ...prev, [tabKey]: newPage }));
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-500 text-white">2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 hover:bg-amber-700 text-white">3rd</Badge>;
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
  };

  // Podium helpers
  const getPodiumColor = (rank) => {
    if (rank === 1) return "bg-yellow-500"; // Gold
    if (rank === 2) return "bg-gray-400";   // Silver
    if (rank === 3) return "bg-amber-600";  // Bronze
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
        }
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
                className={currentPageNum === 1 ? "pointer-events-none opacity-50" : ""}
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
                  onPageChange(currentPageNum < totalPages ? currentPageNum + 1 : totalPages);
                }}
                className={currentPageNum === totalPages ? "pointer-events-none opacity-50" : ""}
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
              {podiumPlayers.map((player, idx) => {
                // Height for podium effect
                let height = player.rank === 1 ? 120 : player.rank === 2 ? 80 : 60;
                // Animation classes based on rank - only for the avatar
                let animationClass = player.rank === 1 ? "animate-bounce-excited-first" : 
                                   player.rank === 2 ? "animate-bounce-excited-second" : 
                                   "animate-bounce-excited-third";
                return (
                  <div key={player.rank} className={`flex flex-col items-center ${idx === 0 ? "order-2" : idx === 1 ? "order-1" : "order-3"}`}>
                    <div className="mb-2 relative">
                      <Avatar className={`w-20 h-20 md:w-24 md:h-24 border-4 border-gray-200 dark:border-gray-700 shadow-lg ${animationClass}`}>
                        <AvatarImage src={player.avatar} alt={player.player} />
                        <AvatarFallback>{player.player[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full ${getPodiumColor(player.rank)} flex items-center justify-center shadow-lg border-2 border-white`}>
                        {getPodiumIcon(player.rank)}
                      </div>
                    </div>
                    <div className="font-bold text-lg mb-1">{player.player}</div>
                    <div className="text-xs text-muted-foreground mb-1">{player.dmg.toLocaleString()} DMG</div>
                    <div className="text-xs text-muted-foreground mb-2">{player.correctPercent}% Correct</div>
                    <div className={`w-20 md:w-24 h-6 rounded-t-lg ${getPodiumColor(player.rank)} text-white flex items-center justify-center font-bold text-sm shadow-lg`} style={{ height: `${height}px` }}>
                      {player.rank === 1 ? "1st" : player.rank === 2 ? "2nd" : "3rd"}
                    </div>
                  </div>
                );
              })}
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
              <p className="text-sm text-muted-foreground">Complete performance rankings for this battle</p>
            </CardHeader>
            <CardContent className="relative h-full">
              <Tabs defaultValue="teams" className="space-y-3">
                
                {/* Tabs List */}
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="teams" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Team Results</span>
                    <span className="sm:hidden">Teams</span>
                  </TabsTrigger>
                  <TabsTrigger value="individual" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Individual Results</span>
                    <span className="sm:hidden">Players</span>
                  </TabsTrigger>
                  <TabsTrigger value="alltime" className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span className="hidden sm:inline">All-Time Records</span>
                    <span className="sm:hidden">All-Time</span>
                  </TabsTrigger>
                </TabsList>

                {/* Team Results */}
                <TabsContent value="teams" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Team Final Rankings</h3>
                    <p className="text-sm text-muted-foreground mb-4">Final team performance for this battle</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">Team</TableHead>
                        <TableHead className="text-right whitespace-normal">Total DMG</TableHead>
                        <TableHead className="text-right whitespace-normal">Correct %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(teamLeaderboard, 'teams').paginatedData.map((team) => (
                        <TableRow key={team.rank} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {getRankBadge(team.rank)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={team.avatar} alt={team.team} />
                                <AvatarFallback>{team.team[0]}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{team.team}</span>
                              {team.rank === 1 && <Crown className="w-4 h-4 text-yellow-500" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{team.dmg}</TableCell>
                          <TableCell className="text-right">{team.correctPercent}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(teamLeaderboard, 'teams')}
                    onPageChange={(page) => handlePageChange('teams', page)}
                  />
                </TabsContent>

                {/* Individual Results */}
                <TabsContent value="individual" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Individual Final Rankings</h3>
                    <p className="text-sm text-muted-foreground mb-4">Final individual player performance for this battle</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">Player</TableHead>
                        <TableHead className="text-right whitespace-normal">Total DMG</TableHead>
                        <TableHead className="text-right whitespace-normal">Correct %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(individualLeaderboard, 'individual').paginatedData.map((player) => (
                        <TableRow key={player.rank} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {getRankBadge(player.rank)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={player.avatar} alt={player.player} />
                                <AvatarFallback>{player.player[0]}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{player.player}</span>
                              {player.rank === 1 && <Crown className="w-4 h-4 text-yellow-500" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{player.dmg}</TableCell>
                          <TableCell className="text-right">{player.correctPercent}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(individualLeaderboard, 'individual')}
                    onPageChange={(page) => handlePageChange('individual', page)}
                  />
                </TabsContent>

                {/* All-Time Records */}
                <TabsContent value="alltime" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">All-Time Records</h3>
                    <p className="text-sm text-muted-foreground mb-4">Historical player performance across all battles</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">Player</TableHead>
                        <TableHead className="text-right whitespace-normal">Total DMG</TableHead>
                        <TableHead className="text-right whitespace-normal">Correct %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(allTimeLeaderboard, 'alltime').paginatedData.map((player) => (
                        <TableRow key={player.rank} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {getRankBadge(player.rank)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={player.avatar} alt={player.player} />
                                <AvatarFallback>{player.player[0]}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{player.player}</span>
                              {player.rank === 1 && <Crown className="w-4 h-4 text-yellow-500" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{player.dmg}</TableCell>
                          <TableCell className="text-right">{player.correctPercent}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(allTimeLeaderboard, 'alltime')}
                    onPageChange={(page) => handlePageChange('alltime', page)}
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
