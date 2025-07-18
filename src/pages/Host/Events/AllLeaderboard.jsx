import React, { useState } from 'react';
import { Menu, Trophy, Medal, Award } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Leaderboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [eventFilter, setEventFilter] = useState("all");
  const PAGE_SIZE = 5;

  // Event-specific leaderboard data
  const leaderboardData = {
    all: [
      { rank: 1, player: 'Python', dmg: 12000, correct: 95, avatar: '/src/assets/Placeholder/Profile1.jpg', event: 'Open House 2025' },
      { rank: 2, player: 'Sovitep', dmg: 11000, correct: 90, avatar: '/src/assets/Placeholder/Profile2.jpg', event: 'Tech Conference 2025' },
      { rank: 3, player: 'Visoth', dmg: 9500, correct: 88, avatar: '/src/assets/Placeholder/Profile3.jpg', event: 'Open House 2025' },
      { rank: 4, player: 'Alice', dmg: 9000, correct: 85, avatar: '/src/assets/Placeholder/Profile4.jpg', event: 'Science Fair 2025' },
      { rank: 5, player: 'Bob', dmg: 8500, correct: 80, avatar: '/src/assets/Placeholder/Profile5.jpg', event: 'Open House 2025' },
      { rank: 6, player: 'TechMaster', dmg: 8200, correct: 92, avatar: '/src/assets/Placeholder/Profile1.jpg', event: 'Tech Conference 2025' },
      { rank: 7, player: 'ScienceWiz', dmg: 7800, correct: 87, avatar: '/src/assets/Placeholder/Profile2.jpg', event: 'Science Fair 2025' },
      { rank: 8, player: 'CodeNinja', dmg: 7500, correct: 83, avatar: '/src/assets/Placeholder/Profile3.jpg', event: 'Tech Conference 2025' },
      { rank: 9, player: 'KnowledgeSeeker', dmg: 7200, correct: 89, avatar: '/src/assets/Placeholder/Profile4.jpg', event: 'Open House 2025' },
      { rank: 10, player: 'AlgoHero', dmg: 6900, correct: 86, avatar: '/src/assets/Placeholder/Profile5.jpg', event: 'Tech Conference 2025' }
    ],
    "Open House 2025": [
      { rank: 1, player: 'Python', dmg: 12000, correct: 95, avatar: '/src/assets/Placeholder/Profile1.jpg', event: 'Open House 2025' },
      { rank: 2, player: 'Visoth', dmg: 9500, correct: 88, avatar: '/src/assets/Placeholder/Profile3.jpg', event: 'Open House 2025' },
      { rank: 3, player: 'Bob', dmg: 8500, correct: 80, avatar: '/src/assets/Placeholder/Profile5.jpg', event: 'Open House 2025' },
      { rank: 4, player: 'KnowledgeSeeker', dmg: 7200, correct: 89, avatar: '/src/assets/Placeholder/Profile4.jpg', event: 'Open House 2025' },
      { rank: 5, player: 'WisdomWarrior', dmg: 5800, correct: 78, avatar: '/src/assets/Placeholder/Profile1.jpg', event: 'Open House 2025' },
      { rank: 6, player: 'BrainBuster', dmg: 5400, correct: 75, avatar: '/src/assets/Placeholder/Profile3.jpg', event: 'Open House 2025' }
    ],
    "Tech Conference 2025": [
      { rank: 1, player: 'Sovitep', dmg: 11000, correct: 90, avatar: '/src/assets/Placeholder/Profile2.jpg', event: 'Tech Conference 2025' },
      { rank: 2, player: 'TechMaster', dmg: 8200, correct: 92, avatar: '/src/assets/Placeholder/Profile1.jpg', event: 'Tech Conference 2025' },
      { rank: 3, player: 'CodeNinja', dmg: 7500, correct: 83, avatar: '/src/assets/Placeholder/Profile3.jpg', event: 'Tech Conference 2025' },
      { rank: 4, player: 'AlgoHero', dmg: 6900, correct: 86, avatar: '/src/assets/Placeholder/Profile5.jpg', event: 'Tech Conference 2025' },
      { rank: 5, player: 'ByteBeast', dmg: 6100, correct: 82, avatar: '/src/assets/Placeholder/Profile4.jpg', event: 'Tech Conference 2025' },
      { rank: 6, player: 'DevDestroyer', dmg: 5700, correct: 79, avatar: '/src/assets/Placeholder/Profile2.jpg', event: 'Tech Conference 2025' }
    ],
    "Science Fair 2025": [
      { rank: 1, player: 'Alice', dmg: 9000, correct: 85, avatar: '/src/assets/Placeholder/Profile4.jpg', event: 'Science Fair 2025' },
      { rank: 2, player: 'ScienceWiz', dmg: 7800, correct: 87, avatar: '/src/assets/Placeholder/Profile2.jpg', event: 'Science Fair 2025' },
      { rank: 3, player: 'DataMaster', dmg: 6500, correct: 84, avatar: '/src/assets/Placeholder/Profile1.jpg', event: 'Science Fair 2025' },
      { rank: 4, player: 'LabLegend', dmg: 5900, correct: 81, avatar: '/src/assets/Placeholder/Profile5.jpg', event: 'Science Fair 2025' },
      { rank: 5, player: 'FormulaFighter', dmg: 5300, correct: 77, avatar: '/src/assets/Placeholder/Profile3.jpg', event: 'Science Fair 2025' }
    ]
  };

  // Get data based on selected event filter
  const currentData = leaderboardData[eventFilter] || leaderboardData.all;
  
  // Reset page when event filter changes
  const handleEventFilterChange = (value) => {
    setEventFilter(value);
    setCurrentPage(1);
  };

  // Enhanced leaderboard data with avatars
  const teamLeaderboard = [
    { rank: 1, team: 'Kangaroo', dmg: 100, correct: 9, avatar: '/src/assets/Placeholder/Team1.jpg' },
    { rank: 2, team: 'Koala', dmg: 85, correct: 8, avatar: '/src/assets/Placeholder/Team2.jpg' },
    { rank: 3, team: 'Shellfish', dmg: 68, correct: 7, avatar: '/src/assets/Placeholder/Team3.jpg' }
  ];

  const individualLeaderboard = [
    { rank: 1, player: 'Sovitep', dmg: 100, correct: 9, avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 2, player: 'Visoth', dmg: 90, correct: 8, avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 3, player: 'Roth', dmg: 75, correct: 7, avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 4, player: 'Alice', dmg: 65, correct: 6, avatar: '/src/assets/Placeholder/Profile4.jpg' },
    { rank: 5, player: 'Bob', dmg: 55, correct: 5, avatar: '/src/assets/Placeholder/Profile5.jpg' },
    { rank: 6, player: 'Charlie', dmg: 45, correct: 4, avatar: '/src/assets/Placeholder/Profile6.jpg' },
    { rank: 7, player: 'David', dmg: 35, correct: 3, avatar: '/src/assets/Placeholder/Profile7.jpg' }
  ];

  const allTimeLeaderboard = [
    { rank: 1, player: 'Python', dmg: 300, correct: 25, lastPlayed: '12/15/2024', avatar: '/src/assets/Placeholder/Profile1.jpg' },
    { rank: 2, player: 'Sovitep', dmg: 180, correct: 15, lastPlayed: '12/14/2024', avatar: '/src/assets/Placeholder/Profile2.jpg' },
    { rank: 3, player: 'Visoth', dmg: 90, correct: 8, lastPlayed: '12/13/2024', avatar: '/src/assets/Placeholder/Profile3.jpg' },
    { rank: 4, player: 'Alice', dmg: 85, correct: 7, lastPlayed: '12/12/2024', avatar: '/src/assets/Placeholder/Profile4.jpg' },
    { rank: 5, player: 'Bob', dmg: 75, correct: 6, lastPlayed: '12/11/2024', avatar: '/src/assets/Placeholder/Profile5.jpg' },
    { rank: 6, player: 'Charlie', dmg: 65, correct: 5, lastPlayed: '12/10/2024', avatar: '/src/assets/Placeholder/Profile6.jpg' }
  ];

  // Podium helpers
  const getPodiumColor = (rank) => {
    if (rank === 1) return "bg-yellow-500 dark:bg-yellow-600"; // Gold
    if (rank === 2) return "bg-gray-400 dark:bg-gray-500";   // Silver
    if (rank === 3) return "bg-amber-600 dark:bg-amber-700";  // Bronze
    return "bg-gray-500 dark:bg-gray-600";
  };

  const getPodiumIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-white" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-white" />;
    if (rank === 3) return <Award className="w-4 h-4 text-white" />;
    return null;
  };

  const getRowBackground = (rank) => {
    if (rank === 1) return "bg-yellow-500 dark:bg-yellow-700 hover:bg-yellow-500 dark:hover:bg-yellow-600";
    if (rank === 2) return "bg-gray-400 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500";
    if (rank === 3) return "bg-amber-600 dark:bg-amber-800 hover:bg-amber-600 dark:hover:bg-amber-700";
    return "";
  };

  const getTextColor = (rank) => {
    return rank <= 3 ? "text-white" : "text-gray-900 dark:text-white";
  };

  // Pagination for individual leaderboard
  const totalPages = Math.ceil(individualLeaderboard.length / PAGE_SIZE);
  const paginatedIndividual = individualLeaderboard.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Top 3 for podium from current event data
  const podiumPlayers = currentData.slice(0, 3);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">


          
     

        {/* Podium Section */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6 text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" /> Top Players
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
              Top 3 players by damage and accuracy
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-6 py-4">
              {podiumPlayers.map((player, idx) => {
                let height = player.rank === 1 ? 120 : player.rank === 2 ? 80 : 60;
                return (
                  <div key={player.rank} className={`flex flex-col items-center ${idx === 0 ? "order-2" : idx === 1 ? "order-1" : "order-3"}`}>
                    <div className="mb-2 relative">
                      <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-gray-200 dark:border-gray-700 shadow-lg">
                        <AvatarImage src={player.avatar} alt={player.player} />
                        <AvatarFallback>{player.player[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full ${getPodiumColor(player.rank)} flex items-center justify-center shadow-lg border-2 border-white`}>
                        {getPodiumIcon(player.rank)}
                      </div>
                    </div>
                    <div className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{player.player}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{player.dmg} DMG</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{player.correct} Correct</div>
                    <div className={`w-20 md:w-24 h-6 rounded-t-lg ${getPodiumColor(player.rank)} text-white flex items-center justify-center font-bold text-sm shadow-lg`} style={{ height: `${height}px` }}>
                      {player.rank === 1 ? "1st" : player.rank === 2 ? "2nd" : "3rd"}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live Team Leaderboard */}
        {/* REMOVED: Live Team Leaderboard */}

        {/* Live Individual Leaderboard with Pagination */}
        {/* REMOVED: Live Individual Leaderboard */}

        {/* All Time Leaderboard */}
        <Card className="relative">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold">All-time Leaderboard</CardTitle>
            <p className="text-muted-foreground mt-2 -mb-7 text-sm sm:text-base">
              See the top players by overall damage and answer accuracy
            </p>
          </CardHeader>
          <CardContent>
            {/* Event Filter Tabs */}
            <div className="mb-4">
              <Tabs value={eventFilter} onValueChange={handleEventFilterChange}>
                <TabsList className="grid w-full grid-cols-4 h-10 gap-1 p-1">
                  <TabsTrigger
                    value="all"
                    className="text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight flex items-center justify-center"
                  >
                    All Events
                  </TabsTrigger>
                  <TabsTrigger
                    value="Open House 2025"
                    className="text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight flex items-center justify-center"
                  >
                    <span className="break-words">Open House 2025</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="Tech Conference 2025"
                    className="text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight flex items-center justify-center"
                  >
                    <span className="break-words">Tech Conference 2025</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="Science Fair 2025"
                    className="text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight flex items-center justify-center"
                  >
                    <span className="break-words">Science Fair 2025</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">DMG</TableHead>
                  <TableHead className="text-right">Correct</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((player) => (
                  <TableRow key={player.rank} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="text-center font-bold">
                      {player.rank === 1 ? (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">1st</Badge>
                      ) : player.rank === 2 ? (
                        <Badge className="bg-gray-400 hover:bg-gray-500 text-white">2nd</Badge>
                      ) : player.rank === 3 ? (
                        <Badge className="bg-amber-600 hover:bg-amber-700 text-white">3rd</Badge>
                      ) : (
                        <span className="text-gray-900 dark:text-white">#{player.rank}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Avatar className="w-7 h-7 border border-gray-200 dark:border-gray-700">
                        <AvatarImage src={player.avatar} alt={player.player} />
                        <AvatarFallback>{player.player[0]}</AvatarFallback>
                      </Avatar>
                      {player.player}
                    </TableCell>
                    <TableCell className="text-right">{player.dmg.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{player.correct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
};

export default Leaderboard;