// ===== LIBRARIES ===== //
import { useState } from "react";
import { X, Trophy, Users, ChevronDown, ChevronRight } from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ===== STYLES ===== //
import "@/index.css";

const BattleLeaderboard = ({ isOpen, onClose }) => {
  const [expandedTeams, setExpandedTeams] = useState(new Set());

  // Sample leaderboard data with players
  const leaderboardData = [
    { 
      rank: 1, 
      team: 'Kangaroo', 
      dmg: 450, 
      players: [
        { name: 'Player_Alpha', username: '@alpha123', dmg: 200 },
        { name: 'Player_Beta', username: '@beta456', dmg: 150 },
        { name: 'Player_Gamma', username: '@gamma789', dmg: 100 }
      ]
    },
    { 
      rank: 2, 
      team: 'Koala', 
      dmg: 380, 
      players: [
        { name: 'PlayerOne', username: '@player1', dmg: 180 },
        { name: 'PlayerTwo', username: '@player2', dmg: 120 },
        { name: 'PlayerThree', username: '@player3', dmg: 80 }
      ]
    },
    { 
      rank: 3, 
      team: 'Shellfish', 
      dmg: 320, 
      players: [
        { name: 'User123', username: '@user123', dmg: 170 },
        { name: 'User456', username: '@user456', dmg: 90 },
        { name: 'User789', username: '@user789', dmg: 60 }
      ]
    },
    { 
      rank: 4, 
      team: 'Dolphins', 
      dmg: 280, 
      players: [
        { name: 'Dolphin_A', username: '@dolphin_a', dmg: 160 },
        { name: 'Dolphin_B', username: '@dolphin_b', dmg: 70 },
        { name: 'Dolphin_C', username: '@dolphin_c', dmg: 50 }
      ]
    },
    { 
      rank: 5, 
      team: 'Eagles', 
      dmg: 250, 
      players: [
        { name: 'Eagle_One', username: '@eagle1', dmg: 140 },
        { name: 'Eagle_Two', username: '@eagle2', dmg: 65 },
        { name: 'Eagle_Three', username: '@eagle3', dmg: 45 }
      ]
    },
    { 
      rank: 6, 
      team: 'Lions', 
      dmg: 220, 
      players: [
        { name: 'Lion_King', username: '@lionking', dmg: 130 },
        { name: 'Lion_Queen', username: '@lionqueen', dmg: 55 },
        { name: 'Lion_Cub', username: '@lioncub', dmg: 35 }
      ]
    },
    { 
      rank: 7, 
      team: 'Tigers', 
      dmg: 190, 
      players: [
        { name: 'Tiger_Roar', username: '@tigerroar', dmg: 110 },
        { name: 'Tiger_Claw', username: '@tigerclaw', dmg: 50 },
        { name: 'Tiger_Stripe', username: '@tigerstripe', dmg: 30 }
      ]
    },
    { 
      rank: 8, 
      team: 'Bears', 
      dmg: 160, 
      players: [
        { name: 'Bear_Paw', username: '@bearpaw', dmg: 90 },
        { name: 'Bear_Cub', username: '@bearcub', dmg: 40 },
        { name: 'Bear_Den', username: '@bearден', dmg: 30 }
      ]
    },
  ];

  // Sort players within each team by damage (descending)
  const sortedLeaderboardData = leaderboardData.map(team => ({
    ...team,
    players: [...team.players].sort((a, b) => b.dmg - a.dmg)
  }));

  const toggleTeamExpansion = (teamName) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamName)) {
        newSet.delete(teamName);
      } else {
        newSet.add(teamName);
      }
      return newSet;
    });
  };

  const collapseAll = () => {
    setExpandedTeams(new Set());
  };

  const expandAll = () => {
    const allTeamNames = new Set(sortedLeaderboardData.map(team => team.team));
    setExpandedTeams(allTeamNames);
  };

  const toggleAllExpansion = () => {
    if (expandedTeams.size === 0) {
      expandAll();
    } else {
      collapseAll();
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold">1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-500 text-white font-bold">2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-bold">3rd</Badge>;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      {/* Leaderboard Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-background/93 backdrop-blur-[1px] border-l border-border z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        shadow-2xl
      `}>
        <Card className="h-full rounded-none bg-background/0 border-0 flex flex-col">
          {/* Header */}
          <CardHeader className="flex-shrink-0 -mb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Live Leaderboard
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                className="h-7 w-7"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="flex-1 overflow-y-auto px-4 pb-10">
            {/* Expand/Collapse All Button */}
            <div className="flex justify-end mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllExpansion}
                className="h-7 px-3 py-0 text-xs text-muted-foreground hover:text-foreground"
              >
                {expandedTeams.size === 0 ? 'Expand All' : 'Collapse All'}
              </Button>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-3 pb-2 mb-2 border-b border-border text-xs font-medium text-muted-foreground">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-7">Team</div>
              <div className="col-span-3 text-right">DMG</div>
            </div>

            <div className="space-y-1">
              {sortedLeaderboardData.map((team) => {
                const isExpanded = expandedTeams.has(team.team);
                return (
                  <div key={team.rank}>
                    {/* Team Row */}
                    <div 
                      className={`
                        grid grid-cols-12 gap-3 items-center py-1.5 px-2 rounded border transition-all cursor-pointer hover:bg-muted/60
                        ${team.rank <= 3 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800' 
                          : 'bg-muted/20 hover:bg-muted/40 border-border'
                        }
                      `}
                      onClick={() => toggleTeamExpansion(team.team)}
                    >
                      {/* Rank */}
                      <div className="col-span-2 flex justify-center">
                        {getRankBadge(team.rank)}
                      </div>

                      {/* Team Name with Expand Icon */}
                      <div className="col-span-7 flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        )}
                        <p className="font-medium text-sm truncate">{team.team}</p>
                        <span className="text-xs text-muted-foreground">({team.players.length})</span>
                      </div>

                      {/* Total Team Damage */}
                      <div className="col-span-3 text-right">
                        <div className="font-bold text-sm">{team.dmg}</div>
                      </div>
                    </div>

                    {/* Expanded Player List */}
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {team.players.map((player, playerIndex) => (
                          <div 
                            key={playerIndex}
                            className="grid grid-cols-10 gap-3 items-center py-1 px-2 rounded bg-muted/10"
                          >
                            {/* Player Name */}
                            <div className="col-span-7 pl-4">
                              <div className="flex flex-col">
                                <p className="text-xs font-medium truncate text-muted-foreground">{player.name}</p>
                                <p className="text-xs truncate text-muted-foreground/70">{player.username}</p>
                              </div>
                            </div>

                            {/* Player Damage */}
                            <div className="col-span-3 text-right">
                              <div className="text-xs font-medium">{player.dmg}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-center text-xs text-muted-foreground">
                <p className="mt-1">Teams: {sortedLeaderboardData.length}</p>
                <p className="mt-1">Players: {sortedLeaderboardData.reduce((total, team) => total + team.players.length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BattleLeaderboard;
