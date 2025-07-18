// ===== LIBRARIES ===== //
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, X, Trophy, User, TrendingUp } from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

// ===== STYLES ===== //
import "@/index.css";

const BossPreview = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [playersOnline, setPlayersOnline] = useState(0);
  const [currentPage, setCurrentPage] = useState({ teams: 1, individual: 1, alltime: 1 });
  const PAGE_SIZE = 10;

  // Enhanced leaderboard data
  const teamLeaderboard = [
    { rank: 1, team: 'Kangaroo', dmg: 100, correct: 9, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 2, team: 'Koala', dmg: 85, correct: 8, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 3, team: 'Shellfish', dmg: 68, correct: 7, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 4, team: 'Dolphins', dmg: 55, correct: 6, avatar: '/src/assets/Placeholder/Profile4.jpg' },
  ];

  const individualLeaderboard = [
    { rank: 1, player: 'Sovitep', dmg: 100, correct: 9, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 2, player: 'Visoth', dmg: 90, correct: 8, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 3, player: 'Roth', dmg: 75, correct: 7, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 4, player: 'Alice', dmg: 65, correct: 6, avatar: '/src/assets/Placeholder/Profile4.jpg' },
    { rank: 5, player: 'Bob', dmg: 55, correct: 5, avatar: '/src/assets/Placeholder/Profile5.jpg' },
    { rank: 6, player: 'Charlie', dmg: 45, correct: 4, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 7, player: 'David', dmg: 35, correct: 3, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 8, player: 'Emma', dmg: 30, correct: 3, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 9, player: 'Frank', dmg: 25, correct: 2, avatar: '/src/assets/Placeholder/Profile4.jpg' },
    { rank: 10, player: 'Grace', dmg: 20, correct: 2, avatar: '/src/assets/Placeholder/Profile5.jpg' },
    { rank: 11, player: 'Henry', dmg: 15, correct: 1, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 12, player: 'Ivy', dmg: 10, correct: 1, avatar: '/src/assets/Placeholder/Profile2.jpg' }
  ];

  const allTimeLeaderboard = [
    { rank: 1, player: 'Python', dmg: 300, correct: 25, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 2, player: 'Sovitep', dmg: 280, correct: 22, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 3, player: 'Visoth', dmg: 250, correct: 20, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 4, player: 'Alice', dmg: 220, correct: 18, avatar: '/src/assets/Placeholder/Profile4.jpg' },
    { rank: 5, player: 'Bob', dmg: 200, correct: 16, avatar: '/src/assets/Placeholder/Profile5.jpg' },
    { rank: 6, player: 'Charlie', dmg: 180, correct: 14, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 7, player: 'Master', dmg: 160, correct: 12, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 8, player: 'Legend', dmg: 140, correct: 11, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 9, player: 'Hero', dmg: 120, correct: 10, avatar: '/src/assets/Placeholder/Profile4.jpg' },
    { rank: 10, player: 'Champion', dmg: 100, correct: 9, avatar: '/src/assets/Placeholder/Profile5.jpg' },
    { rank: 11, player: 'Warrior', dmg: 90, correct: 8, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 12, player: 'Fighter', dmg: 80, correct: 7, avatar: '/src/assets/Placeholder/Profile2.jpg' },
  ];

  const goBack = () => {
    navigate("/qr"); // Go to QR page
  };

  const handleJoin = () => {
    if (nickname.trim()) {
      setIsJoined(true);
      setPlayersOnline(prev => prev + 1);
      console.log("Joining with nickname:", nickname);
      // Handle join logic here
    }
  };

  const handleUnjoin = () => {
    setIsJoined(false);
    setPlayersOnline(prev => Math.max(0, prev - 1));
    console.log("Unjoining from battle");
    // Handle unjoin logic here
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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button onClick={goBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-center">Boss Battle</h1>
              <p className="text-muted-foreground text-center">Join the battle and defeat the boss</p>
            </div>
          </div>
        </div>

        <div className="max-w-sm mx-auto">
          <Card className="overflow-hidden">
            {/* Boss Name Header */}
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold">
                CS BOSS
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
              {/* Boss Image */}
              <div className="relative">
                <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src="/src/assets/Swords.png"
                    alt="CS Boss"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Players Online */}
              <div className="text-center py-2">
                <div className="flex items-center justify-center text-muted-foreground text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Players online: {playersOnline}</span>
                </div>
              </div>

              {/* Join/Waiting Button */}
              {!isJoined ? (
                <Button
                  onClick={handleJoin}
                  className="w-full"
                  disabled={!nickname.trim()}
                >
                  Join
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    className="flex-1"
                    disabled
                    variant="secondary"
                  >
                    Waiting for 1 more player
                  </Button>
                  <Button
                    onClick={handleUnjoin}
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
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
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
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
              <p className="text-sm text-muted-foreground">View performance across different categories</p>
            </CardHeader>
            <CardContent className="relative h-full">
              <Tabs defaultValue="teams" className="space-y-3">
                
                {/* Tabs List */}
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="teams" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Team Rankings</span>
                    <span className="sm:hidden">Teams</span>
                  </TabsTrigger>
                  <TabsTrigger value="individual" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Individual Rankings</span>
                    <span className="sm:hidden">Players</span>
                  </TabsTrigger>
                  <TabsTrigger value="alltime" className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span className="hidden sm:inline">All-Time</span>
                    <span className="sm:hidden">All-Time</span>
                  </TabsTrigger>
                </TabsList>

                {/* Team Leaderboard */}
                <TabsContent value="teams" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Team Rankings</h3>
                    <p className="text-sm text-muted-foreground mb-4">Current event team performance</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">Team</TableHead>
                        <TableHead className="text-right whitespace-normal">DMG</TableHead>
                        <TableHead className="text-right whitespace-normal">Correct</TableHead>
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
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{team.dmg}</TableCell>
                          <TableCell className="text-right">{team.correct}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(teamLeaderboard, 'teams')}
                    onPageChange={(page) => handlePageChange('teams', page)}
                  />
                </TabsContent>

                {/* Individual Leaderboard */}
                <TabsContent value="individual" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Individual Rankings</h3>
                    <p className="text-sm text-muted-foreground mb-4">Current event individual player performance</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">Player</TableHead>
                        <TableHead className="text-right whitespace-normal">DMG</TableHead>
                        <TableHead className="text-right whitespace-normal">Correct</TableHead>
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
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{player.dmg}</TableCell>
                          <TableCell className="text-right">{player.correct}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(individualLeaderboard, 'individual')}
                    onPageChange={(page) => handlePageChange('individual', page)}
                  />
                </TabsContent>

                {/* All-Time Leaderboard */}
                <TabsContent value="alltime" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">All-Time Rankings</h3>
                    <p className="text-sm text-muted-foreground mb-4">Historical player performance across all events</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">Player</TableHead>
                        <TableHead className="text-right whitespace-normal">Total DMG</TableHead>
                        <TableHead className="text-right whitespace-normal">Total Correct</TableHead>
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
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{player.dmg}</TableCell>
                          <TableCell className="text-right">{player.correct}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(allTimeLeaderboard, 'alltime')}
                    onPageChange={(page) => handlePageChange('alltime', page)}
                  />
                </TabsContent>            </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default BossPreview;
