import React, { useState } from "react";
import { ArrowLeft, Trophy, Users, User, TrendingUp } from "lucide-react";
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

const Leaderboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [currentPage, setCurrentPage] = useState({
    teams: 1,
    individual: 1,
    alltime: 1,
  });
  const PAGE_SIZE = 10;

  // Enhanced leaderboard data
  const teamLeaderboard = [
    {
      rank: 1,
      team: "Kangaroo",
      dmg: 100,
      correct: 9,
      avatar: "/src/assets/Placeholder/Team1.jpg",
    },
    {
      rank: 2,
      team: "Koala",
      dmg: 85,
      correct: 8,
      avatar: "/src/assets/Placeholder/Team2.jpg",
    },
    {
      rank: 3,
      team: "Shellfish",
      dmg: 68,
      correct: 7,
      avatar: "/src/assets/Placeholder/Team3.jpg",
    },
    {
      rank: 4,
      team: "Dolphins",
      dmg: 55,
      correct: 6,
      avatar: "/src/assets/Placeholder/Team1.jpg",
    },
    {
      rank: 5,
      team: "Eagles",
      dmg: 42,
      correct: 5,
      avatar: "/src/assets/Placeholder/Team2.jpg",
    },
    {
      rank: 6,
      team: "Tigers",
      dmg: 38,
      correct: 4,
      avatar: "/src/assets/Placeholder/Team3.jpg",
    },
    {
      rank: 7,
      team: "Lions",
      dmg: 35,
      correct: 4,
      avatar: "/src/assets/Placeholder/Team1.jpg",
    },
    {
      rank: 8,
      team: "Bears",
      dmg: 32,
      correct: 3,
      avatar: "/src/assets/Placeholder/Team2.jpg",
    },
    {
      rank: 9,
      team: "Wolves",
      dmg: 28,
      correct: 3,
      avatar: "/src/assets/Placeholder/Team3.jpg",
    },
    {
      rank: 10,
      team: "Panthers",
      dmg: 25,
      correct: 2,
      avatar: "/src/assets/Placeholder/Team1.jpg",
    },
    {
      rank: 11,
      team: "Hawks",
      dmg: 22,
      correct: 2,
      avatar: "/src/assets/Placeholder/Team2.jpg",
    },
    {
      rank: 12,
      team: "Falcons",
      dmg: 18,
      correct: 1,
      avatar: "/src/assets/Placeholder/Team3.jpg",
    },
  ];

  const individualLeaderboard = [
    {
      rank: 1,
      player: "Sovitep",
      dmg: 100,
      correct: 9,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 2,
      player: "Visoth",
      dmg: 90,
      correct: 8,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
    {
      rank: 3,
      player: "Roth",
      dmg: 75,
      correct: 7,
      avatar: "/src/assets/Placeholder/Profile3.jpg",
    },
    {
      rank: 4,
      player: "Alice",
      dmg: 65,
      correct: 6,
      avatar: "/src/assets/Placeholder/Profile4.jpg",
    },
    {
      rank: 5,
      player: "Bob",
      dmg: 55,
      correct: 5,
      avatar: "/src/assets/Placeholder/Profile5.jpg",
    },
    {
      rank: 6,
      player: "Charlie",
      dmg: 45,
      correct: 4,
      avatar: "/src/assets/Placeholder/Profile6.jpg",
    },
    {
      rank: 7,
      player: "David",
      dmg: 35,
      correct: 3,
      avatar: "/src/assets/Placeholder/Profile7.jpg",
    },
    {
      rank: 8,
      player: "Emma",
      dmg: 30,
      correct: 3,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 9,
      player: "Frank",
      dmg: 25,
      correct: 2,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
    {
      rank: 10,
      player: "Grace",
      dmg: 20,
      correct: 2,
      avatar: "/src/assets/Placeholder/Profile3.jpg",
    },
    {
      rank: 11,
      player: "Henry",
      dmg: 15,
      correct: 1,
      avatar: "/src/assets/Placeholder/Profile4.jpg",
    },
    {
      rank: 12,
      player: "Ivy",
      dmg: 10,
      correct: 1,
      avatar: "/src/assets/Placeholder/Profile5.jpg",
    },
  ];

  const allTimeLeaderboard = [
    {
      rank: 1,
      player: "Python",
      dmg: 300,
      correct: 25,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 2,
      player: "Sovitep",
      dmg: 280,
      correct: 22,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
    {
      rank: 3,
      player: "Visoth",
      dmg: 250,
      correct: 20,
      avatar: "/src/assets/Placeholder/Profile3.jpg",
    },
    {
      rank: 4,
      player: "Alice",
      dmg: 220,
      correct: 18,
      avatar: "/src/assets/Placeholder/Profile4.jpg",
    },
    {
      rank: 5,
      player: "Bob",
      dmg: 200,
      correct: 16,
      avatar: "/src/assets/Placeholder/Profile5.jpg",
    },
    {
      rank: 6,
      player: "Charlie",
      dmg: 180,
      correct: 14,
      avatar: "/src/assets/Placeholder/Profile6.jpg",
    },
    {
      rank: 7,
      player: "Master",
      dmg: 160,
      correct: 12,
      avatar: "/src/assets/Placeholder/Profile7.jpg",
    },
    {
      rank: 8,
      player: "Legend",
      dmg: 140,
      correct: 11,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 9,
      player: "Hero",
      dmg: 120,
      correct: 10,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
    {
      rank: 10,
      player: "Champion",
      dmg: 100,
      correct: 9,
      avatar: "/src/assets/Placeholder/Profile3.jpg",
    },
    {
      rank: 11,
      player: "Warrior",
      dmg: 90,
      correct: 8,
      avatar: "/src/assets/Placeholder/Profile4.jpg",
    },
    {
      rank: 12,
      player: "Fighter",
      dmg: 80,
      correct: 7,
      avatar: "/src/assets/Placeholder/Profile5.jpg",
    },
  ];

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
    navigate(`/host/events/assign_boss?eventId=${eventId}`);
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
                <CardTitle className="text-lg">Adventure Quest 2024</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Boss: Dragon Lord • 10 Players Active
                </p>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600 w-fit">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active Battle
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Boss Health</Label>
                <span className="text-sm text-muted-foreground">
                  250 / 1000 HP
                </span>
              </div>
              {/* Custom Progress Bar */}
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-destructive rounded-full h-3 transition-all duration-300"
                  style={{ width: "25%" }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>25% Remaining</span>
                <span>750 damage dealt</span>
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
                              <AvatarImage src={team.avatar} alt={team.team} />
                              <AvatarFallback>{team.team[0]}</AvatarFallback>
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
                    ))}
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
                    {getPaginatedData(
                      individualLeaderboard,
                      "individual"
                    ).paginatedData.map((player) => (
                      <TableRow key={player.rank} className="hover:bg-muted/50">
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
                            <span className="font-medium">{player.player}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {player.dmg}
                        </TableCell>
                        <TableCell className="text-right">
                          {player.correct}
                        </TableCell>
                      </TableRow>
                    ))}
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
                    {getPaginatedData(
                      allTimeLeaderboard,
                      "alltime"
                    ).paginatedData.map((player) => (
                      <TableRow key={player.rank} className="hover:bg-muted/50">
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
                            <span className="font-medium">{player.player}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {player.dmg}
                        </TableCell>
                        <TableCell className="text-right">
                          {player.correct}
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
  );
};

export default Leaderboard;
