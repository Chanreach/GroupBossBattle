import React, { useState } from 'react';
import { ArrowLeft, Edit, Trophy, Users, Award, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

const PlayerBadges = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced player data with badges - all badges not redeemed by default
  const players = [
    {
      id: 1,
      name: 'Sodavith',
      avatar: '/src/assets/Placeholder/Profile1.jpg',
      badges: [
        { name: 'Boss Slayer', image: '/src/assets/badges/SlayBossBadge.png', redeemed: false },
        { name: 'Heart Collector', image: '/src/assets/badges/heart.png', redeemed: false }
      ],
      totalBadges: 8,
      redeemedBadges: 0
    },
    {
      id: 2,
      name: 'Chanreach',
      avatar: '/src/assets/Placeholder/Profile2.jpg',
      badges: [
        { name: 'Heart Collector', image: '/src/assets/badges/heart.png', redeemed: false }
      ],
      totalBadges: 3,
      redeemedBadges: 0
    },
    {
      id: 3,
      name: 'Visoth',
      avatar: '/src/assets/Placeholder/Profile3.jpg',
      badges: [
        { name: 'Heart Collector', image: '/src/assets/badges/heart.png', redeemed: false }
      ],
      totalBadges: 5,
      redeemedBadges: 0
    },
    {
      id: 4,
      name: 'Roth',
      avatar: '/src/assets/Placeholder/Profile4.jpg',
      badges: [
        { name: 'Boss Slayer', image: '/src/assets/badges/SlayBossBadge.png', redeemed: false },
        { name: 'Heart Collector', image: '/src/assets/badges/heart.png', redeemed: false }
      ],
      totalBadges: 6,
      redeemedBadges: 0
    }
  ];

  // Filter players based on search term
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    navigate('/host/events/assign_boss');
  };

  const handleEditBadges = () => {
    navigate('/host/events/player_badges_edit');
  };

  const getBadgeOpacity = (redeemed) => {
    return redeemed ? 'opacity-50' : 'opacity-100';
  };

  const getRedeemedBadgeCount = () => {
    return players.reduce((total, player) => 
      total + player.badges.filter(badge => badge.redeemed).length, 0
    );
  };

  const getTotalBadgeCount = () => {
    return players.reduce((total, player) => total + player.badges.length, 0);
  };

  return (
    <TooltipProvider>
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
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Player Badges</h1>
              </div>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleEditBadges}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Manage Badges</span>
            </Button>
          </div>

          {/* Event Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Adventure Quest 2024</CardTitle>
                  <p className="text-sm text-muted-foreground">Event Badge Management • {filteredPlayers.length} Players</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active Event
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Players</p>
                    <p className="text-2xl font-bold">{players.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Badges</p>
                    <p className="text-2xl font-bold">{getTotalBadgeCount()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Redeemed</p>
                    <p className="text-2xl font-bold">{getRedeemedBadgeCount()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Instructions */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <div className="w-3 h-3 bg-muted rounded opacity-50"></div>
                    Redeemed badges are dimmed
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Badges Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Badge Status
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track player badge collection and redemption status
              </p>
            </CardHeader>
            <CardContent>
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No players found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'No players have been assigned badges yet'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Badges Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlayers.map((player, index) => (
                      <TableRow key={player.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={player.avatar} alt={player.name} />
                              <AvatarFallback>{player.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {player.badges.map((badge, badgeIndex) => (
                              <Tooltip key={badgeIndex}>
                                <TooltipTrigger asChild>
                                  <div className={`relative ${getBadgeOpacity(badge.redeemed)}`}>
                                    <img 
                                      src={badge.image} 
                                      alt={badge.name}
                                      className="w-8 h-8 object-contain hover:scale-110 transition-transform cursor-pointer" 
                                    />
                                    {badge.redeemed && (
                                      <div className="absolute inset-0 bg-black/20 rounded-full"></div>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{badge.name} {badge.redeemed ? '(Redeemed)' : '(Available)'}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                            {player.badges.length === 0 && (
                              <span className="text-sm text-muted-foreground">No badges yet</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PlayerBadges;