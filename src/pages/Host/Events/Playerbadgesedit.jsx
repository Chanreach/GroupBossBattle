import React, { useState } from 'react';
import { ArrowLeft, Award, Save, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

const PlayerBadgesEdit = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Player data with badge management
  const [players, setPlayers] = useState([
    {
      id: 1,
      name: 'Sodavith',
      avatar: '/src/assets/Placeholder/Profile1.jpg',
      badges: [
        { id: 'boss_slayer', name: 'Boss Slayer', image: '/src/assets/badges/SlayBossBadge.png', redeemed: false },
        { id: 'heart_collector', name: 'Heart Collector', image: '/src/assets/badges/heart.png', redeemed: false }
      ]
    },
    {
      id: 2,
      name: 'Chanreach',
      avatar: '/src/assets/Placeholder/Profile2.jpg',
      badges: [
        { id: 'heart_collector', name: 'Heart Collector', image: '/src/assets/badges/heart.png', redeemed: false }
      ]
    },
    {
      id: 3,
      name: 'Visoth',
      avatar: '/src/assets/Placeholder/Profile3.jpg',
      badges: [
        { id: 'heart_collector', name: 'Heart Collector', image: '/src/assets/badges/heart.png', redeemed: false }
      ]
    },
    {
      id: 4,
      name: 'Roth',
      avatar: '/src/assets/Placeholder/Profile4.jpg',
      badges: [
        { id: 'boss_slayer', name: 'Boss Slayer', image: '/src/assets/badges/SlayBossBadge.png', redeemed: false },
        { id: 'heart_collector', name: 'Heart Collector', image: '/src/assets/badges/heart.png', redeemed: false }
      ]
    }
  ]);

  // Filter players based on search term
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    navigate('/host/events/player_badges');
  };

  const handleBadgeClick = (playerId, badgeId) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            badges: player.badges.map(badge => {
              if (badge.id === badgeId) {
                return { ...badge, redeemed: !badge.redeemed };
              }
              return badge;
            })
          };
        }
        return player;
      })
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    // Here you would typically save to a backend
    console.log('Saving badge changes:', players);
    setHasChanges(false);
    // Navigate back to player badges page
    navigate('/host/events/player_badges');
  };

  const handleDiscard = () => {
    // Reset to original state or navigate back
    setHasChanges(false);
    navigate('/host/events/player_badges');
  };

  const getBadgeOpacity = (redeemed) => {
    return redeemed ? 'opacity-50' : 'opacity-100';
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
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Manage Player Badges</h1>
              </div>
            </div>
            {hasChanges && (
              <Badge variant="destructive" className="animate-pulse">
                Unsaved Changes
              </Badge>
            )}
          </div>

          {/* Event Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Adventure Quest 2024</CardTitle>
                  <p className="text-sm text-muted-foreground">Click on badges to toggle redemption status • {filteredPlayers.length} Players</p>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 w-fit">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Editing Mode
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-sm">
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
                    Click badges to toggle redemption
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players Badge Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Player Badges
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on any badge to mark it as redeemed or unredeemed
              </p>
            </CardHeader>
            <CardContent>
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No players found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'No players available'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Badges</TableHead>
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
                            {player.badges.map((badge) => (
                              <Tooltip key={badge.id}>
                                <TooltipTrigger asChild>
                                  <div 
                                    className={`relative cursor-pointer ${getBadgeOpacity(badge.redeemed)} hover:scale-110 transition-all`}
                                    onClick={() => handleBadgeClick(player.id, badge.id)}
                                  >
                                    <img 
                                      src={badge.image} 
                                      alt={badge.name}
                                      className="w-8 h-8 object-contain" 
                                    />
                                    {badge.redeemed && (
                                      <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                                        <div className="w-10 h-4 bg-green-500 rounded flex items-center justify-center transform rotate-45">
                                          <span 
                                            className="text-white text-[8px] font-bold whitespace-nowrap transform rotate-0"
                                          >
                                            REDEEMED
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{badge.name} - Click to {badge.redeemed ? 'unredeem' : 'redeem'}</p>
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

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Make sure to save your changes before leaving this page
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleDiscard}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PlayerBadgesEdit;