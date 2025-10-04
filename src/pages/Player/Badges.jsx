// ===== LIBRARIES ===== //
import { useState } from "react";
import { Award, Trophy, Star, Shield, Sword, Target, Crown, Medal, Zap, Lock, Users, Calendar, Sparkles, Skull } from "lucide-react";

// ===== COMPONENTS (Shadcn.ui) ===== //
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ===== REUSABLE COMPONENTS ===== //
// Square-corner checkmark icon (filled) based on provided polygon
const CheckMark = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 512 512"
    focusable="false"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="437.3,30 202.7,339.3 64,200.7 0,264.7 213.3,478 512,94" fill="currentColor" />
  </svg>
);
// Sample events and bosses data
const eventsData = [
  {
    id: 1,
    name: "Open House 2025",
    isActive: true,
    bosses: [
      {
        id: 1,
        name: "Neil Ian Uy",
        description: "A powerful boss that tests your general knowledge",
        badges: [
          {
            id: 1,
            name: "Boss Defeated",
            description: "Awarded to every player on the team that deals the highest total damage to the boss during the fight.",
            icon: Skull,
            earned: true,
            earnedDate: "2025-01-15"
          },
          {
            id: 2,
            name: "Last-Hit",
            description: "Awarded to the player who lands the final blow that defeats the boss.",
            icon: Target,
            earned: true,
            earnedDate: "2025-01-15"
          },
          {
            id: 3,
            name: "MVP",
            description: "Awarded to a player with the highest total damage dealt during the boss fight, regardless of team outcome.",
            icon: Crown,
            earned: false,
            earnedDate: null
          }
        ]
      },
      {
        id: 2,
        name: "Knowledge Guardian",
        description: "A powerful boss that tests your general knowledge",
        badges: [
          {
            id: 4,
            name: "Boss Defeated",
            description: "Awarded to every player on the team that deals the highest total damage to the boss during the fight.",
            icon: Skull,
            earned: true,
            earnedDate: "2025-01-15"
          },
          {
            id: 5,
            name: "Last-Hit",
            description: "Awarded to the player who lands the final blow that defeats the boss.",
            icon: Target,
            earned: true,
            earnedDate: "2025-01-15"
          },
          {
            id: 6,
            name: "MVP",
            description: "Awarded to a player with the highest total damage dealt during the boss fight, regardless of team outcome.",
            icon: Crown,
            earned: false,
            earnedDate: null
          }
        ]
      },
      {
        id: 3,
        name: "Tech Titan",
        description: "Master of all things technology and programming",
        badges: [
          {
            id: 7,
            name: "Boss Defeated",
            description: "Awarded to every player on the team that deals the highest total damage to the boss during the fight.",
            icon: Skull,
            earned: false,
            earnedDate: null
          },
          {
            id: 8,
            name: "Last-Hit",
            description: "Awarded to the player who lands the final blow that defeats the boss.",
            icon: Target,
            earned: false,
            earnedDate: null
          },
          {
            id: 9,
            name: "MVP",
            description: "Awarded to a player with the highest total damage dealt during the boss fight, regardless of team outcome.",
            icon: Crown,
            earned: false,
            earnedDate: null
          }
        ]
      }
    ],
    // Event-wide milestone badges
    milestones: [
      {
        id: 101,
        name: "10 Questions Milestone",
        description: "Answer 10 questions correctly during the Open House 2025 event.",
        icon: Medal,
        earned: true,
        earnedDate: "2025-01-12",
        progress: 15,
        target: 10
      },
      {
        id: 102,
        name: "25 Questions Milestone",
        description: "Answer 25 questions correctly during the Open House 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 15,
        target: 25
      },
      {
        id: 103,
        name: "50 Questions Milestone",
        description: "Answer 50 questions correctly during the Open House 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 15,
        target: 50
      },
      {
        id: 104,
        name: "100 Questions Milestone",
        description: "Answer 100 questions correctly during the Open House 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 15,
        target: 100
      },
      {
        id: 105,
        name: "Hero",
        description: "Awarded to the player who defeats every boss in the Open House 2025 event.",
        icon: Trophy,
        earned: false,
        earnedDate: null
      }
    ]
  },
  {
    id: 5,
    name: "Tech Conference 2025",
    isActive: false,
    bosses: [
      {
        id: 3,
        name: "Algorithm Beast",
        description: "A fierce boss that challenges your algorithmic thinking",
        badges: [
          {
            id: 10,
            name: "Boss Defeated",
            description: "Awarded to every player on the team that deals the highest total damage to the boss during the fight.",
            icon: Users,
            earned: false,
            earnedDate: null
          },
          {
            id: 11,
            name: "Last-Hit",
            description: "Awarded to the player who lands the final blow that defeats the boss.",
            icon: Target,
            earned: false,
            earnedDate: null
          },
          {
            id: 12,
            name: "MVP",
            description: "Awarded to a player with the highest total damage dealt during the boss fight, regardless of team outcome.",
            icon: Crown,
            earned: false,
            earnedDate: null
          }
        ]
      }
    ],
    milestones: [
      {
        id: 201,
        name: "10 Questions Milestone",
        description: "Answer 10 questions correctly during the Tech Conference 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 0,
        target: 10
      },
      {
        id: 202,
        name: "25 Questions Milestone",
        description: "Answer 25 questions correctly during the Tech Conference 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 0,
        target: 25
      },
      {
        id: 203,
        name: "50 Questions Milestone",
        description: "Answer 50 questions correctly during the Tech Conference 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 0,
        target: 50
      },
      {
        id: 204,
        name: "100 Questions Milestone",
        description: "Answer 100 questions correctly during the Tech Conference 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 0,
        target: 100
      },
      {
        id: 205,
        name: "Hero",
        description: "Awarded to the player who defeats every boss in the Tech Conference 2025 event.",
        icon: Trophy,
        earned: false,
        earnedDate: null
      }
    ]
  },
  {
    id: 6,
    name: "Science Fair 2025",
    isActive: false,
    bosses: [
      {
        id: 4,
        name: "Science Overlord",
        description: "The ultimate test of scientific knowledge",
        badges: [
          {
            id: 13,
            name: "Boss Defeated",
            description: "Awarded to every player on the team that deals the highest total damage to the boss during the fight.",
            icon: Users,
            earned: false,
            earnedDate: null
          },
          {
            id: 14,
            name: "Last-Hit",
            description: "Awarded to the player who lands the final blow that defeats the boss.",
            icon: Target,
            earned: false,
            earnedDate: null
          },
          {
            id: 15,
            name: "MVP",
            description: "Awarded to a player with the highest total damage dealt during the boss fight, regardless of team outcome.",
            icon: Crown,
            earned: false,
            earnedDate: null
          }
        ]
      }
    ],
    milestones: [
      {
        id: 301,
        name: "10 Questions Milestone",
        description: "Answer 10 questions correctly during the Science Fair 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 0,
        target: 10
      },
      {
        id: 302,
        name: "25 Questions Milestone",
        description: "Answer 25 questions correctly during the Science Fair 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 0,
        target: 25
      },
      {
        id: 303,
        name: "50 Questions Milestone",
        description: "Answer 50 questions correctly during the Science Fair 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 0,
        target: 50
      },
      {
        id: 304,
        name: "100 Questions Milestone",
        description: "Answer 100 questions correctly during the Science Fair 2025 event.",
        icon: Medal,
        earned: false,
        earnedDate: null,
        progress: 0,
        target: 100
      },
      {
        id: 305,
        name: "Hero",
        description: "Awarded to the player who defeats every boss in the Science Fair 2025 event.",
        icon: Trophy,
        earned: false,
        earnedDate: null
      }
    ]
  }
];

const BadgeCard = ({ badge, isMilestone = false }) => {
  const IconComponent = badge.icon;

  return (
    <Card
      className={`py-0 relative overflow-hidden ${
        badge.earned
          ? "border-border bg-muted"
          : "border-border bg-muted"
      }`}
    >


      <CardContent className="p-3 sm:p-4">
        {/* Badge Status Icon */}
        {/* <div className="absolute top-2 right-2">
          {badge.earned ? (
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
          ) : (
            <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
          )}
        </div> */}

        {/* Badge Icon */}
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 ring-1 ring-inset ${
            badge.earned
              ? "bg-gradient-to-tr from-emerald-500 to-green-400 text-white ring-emerald-300/70"
              : "bg-gradient-to-tr from-gray-200 to-gray-300 text-gray-600 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 ring-gray-300/60 dark:ring-gray-500/50"
          }`}
        >
          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        {/* Badge Info */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base leading-tight">{badge.name}</h4>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 leading-relaxed line-clamp-3">
          {badge.description}
        </p>

        {/* Progress Bar for Milestones */}
        {isMilestone && badge.target && (
          <div className="mb-2 sm:mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>
                {badge.progress}/{badge.target}
              </span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((badge.progress / badge.target) * 100, 100)}%` }}
              />
              <div className="absolute -top-4 right-0 text-[10px] sm:text-xs text-muted-foreground">
                {Math.min(Math.round((badge.progress / badge.target) * 100), 100)}%
              </div>
            </div>
          </div>
        )}

        {/* Earned Status / Date */}
        <div className="flex items-center justify-between">
          {badge.earned ? (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
              <CheckMark className="h-3 w-3 me-0" />
              Earned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
              <Lock className="h-3 w-3" />
              {isMilestone && badge.target ? `${badge.target - badge.progress} more needed` : "Locked"}
            </span>
          )}

          {badge.earned && badge.earnedDate && (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {badge.earnedDate}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Badges = () => {
  const [selectedEvent, setSelectedEvent] = useState(eventsData[0]);
  const [selectedBoss, setSelectedBoss] = useState(null); // null means show all bosses
  const [filter, setFilter] = useState("all"); // all, earned, unearned

  // Calculate total stats
  const allBadges = eventsData.flatMap(event => [
    ...event.bosses.flatMap(boss => boss.badges),
    ...event.milestones
  ]);
  const earnedBadges = allBadges.filter(badge => badge.earned);
  const totalBadges = allBadges.length;

  // Calculate progress for each event
  const getEventProgress = (event) => {
    const eventBadges = [
      ...event.bosses.flatMap(boss => boss.badges),
      ...event.milestones
    ];
    const eventEarnedBadges = eventBadges.filter(badge => badge.earned);
    return {
      earned: eventEarnedBadges.length,
      total: eventBadges.length,
      percentage: eventBadges.length > 0 ? Math.round((eventEarnedBadges.length / eventBadges.length) * 100) : 0
    };
  };

  const getBossProgress = (boss) => {
    const total = boss.badges.length;
    const earned = boss.badges.filter(b => b.earned).length;
    return { earned, total };
  };

  // Count how many unique bosses in an event are defeated (i.e., have an earned "Boss Defeated" badge)
  const getBossesDefeatedCount = (event) => {
    return event.bosses.filter((boss) =>
      boss.badges.some((b) => b.name === "Boss Defeated" && b.earned)
    ).length;
  };

  // Enhance milestones so the "Hero" badge gains a progress bar based on bosses defeated in the event
  const getEnhancedMilestones = (event) => {
    const defeated = getBossesDefeatedCount(event);
    const target = event.bosses.length;
    return event.milestones.map((m) =>
      m.name === "Hero"
        ? {
            ...m,
            progress: typeof m.progress === "number" ? m.progress : defeated,
            target: typeof m.target === "number" ? m.target : target,
            earned: target > 0 ? defeated >= target : m.earned,
          }
        : m
    );
  };

  // Filter badges based on current selection
  const getFilteredBadges = (badges) => {
    if (filter === "earned") return badges.filter(badge => badge.earned);
    if (filter === "unearned") return badges.filter(badge => !badge.earned);
    return badges;
  };

  // Reset boss selection when event changes
  const handleEventChange = (event) => {
    setSelectedEvent(event);
    setSelectedBoss(null); // Reset to show all bosses
  };

  return (
  <div className="container mx-auto p-3 sm:p-6 max-w-7xl">

      {/* ===== EVENTS FILTERS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">

        {/* MOBILE: Tabs for Events */}
        <div className="lg:hidden">
          <Tabs value={selectedEvent.id.toString()} onValueChange={(value) => handleEventChange(eventsData.find(e => e.id.toString() === value))}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 h-auto gap-1 p-1">
              {eventsData.map((event) => (
                <TabsTrigger
                  key={event.id}
                  value={event.id.toString()}
                  className="text-xs sm:text-sm flex items-center gap-1 h-auto py-2 px-2"
                >
                  {event.isActive && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                  <span className="truncate text-center">{event.name.replace(' 2025', '')}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* DESKTOP: Vertical Tabs for Events */}
        <div className="hidden lg:block lg:col-span-1">
          <Card className="h-full">

            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className=" text-lg sm:text-xl">Events</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 sm:space-y-2">
              <Tabs value={selectedEvent.id.toString()} onValueChange={(value) => handleEventChange(eventsData.find(e => e.id.toString() === value))} orientation="vertical" className="w-full">
                <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-1">
                  {eventsData.map((event) => (
                    <TabsTrigger
                      key={event.id}
                      value={event.id.toString()}
                      className="w-full justify-start text-sm h-auto py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-transparent hover:bg-accent"
                    >
                      <div className="flex items-center space-x-2 w-full">
                        {event.isActive && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        )}
                        <span className="truncate text-wrap text-left flex-1">{event.name}</span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>

          </Card>
        </div>



        {/* ===== MAIN CONTENT ===== */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>

                  {/* Event Title */}
                  <CardTitle className="flex flex-row sm:items-center gap-2 text-lg sm:text-xl">
                    <span>{selectedEvent.name}</span>
                    {selectedEvent.isActive && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800 text-xs">
                        Happening Now
                        </Badge>
                      </div>
                    )}
                  </CardTitle>

                  {/* Event Progress Summary */}
                  <div className="mt-2">
                    {(() => {
                      const progress = getEventProgress(selectedEvent);
                      return (
                        <div className="flex flex-col gap-2 py-2">
                          <div className="flex flex-wrap items-center gap-2 pb-2">
                            <Badge variant="secondary" className="text-xs">
                              Total Bosses: {selectedEvent.bosses.length}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Total Badges Earned: {progress.earned}/{progress.total}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <div className="w-full sm:w-70 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>



                {/* ===== Boss Navigation Tabs ===== */}
                <Tabs value={selectedBoss === null ? "all" : selectedBoss.toString()} onValueChange={(value) => setSelectedBoss(value === "all" ? null : parseInt(value))}>
                  <TabsList className="grid w-full grid-cols-3 h-auto gap-1 p-1">
                    <TabsTrigger
                      value="all"
                      className="w-full text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight">
                      <div className="flex flex-col items-center gap-1">

                        <span className="truncate max-w-[10rem]">All Bosses</span>
                        {(() => {
                          const progress = getEventProgress(selectedEvent);
                          return (
                            <span className="text-[10px] text-muted-foreground">
                              {progress.earned}/{progress.total}
                            </span>
                          );
                        })()}

                      </div>
                    </TabsTrigger>
                    {selectedEvent.bosses.map((boss) => {
                      const bp = getBossProgress(boss);
                      return (
                        <TabsTrigger
                          key={boss.id}
                          value={boss.id.toString()}
                          className="w-full text-[11px] sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="truncate max-w-[10rem] text-wrap">{boss.name}</span>
                            <span className="text-[10px] text-muted-foreground">{bp.earned}/{bp.total}</span>
                          </div>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>



                {/* ===== ALL/EARNED/UNEARNED FILTER ===== */}
                <Tabs value={filter} onValueChange={(value) => setFilter(value)}>
                  <TabsList className="grid w-full grid-cols-3 h-auto gap-1 p-1">
                    <TabsTrigger
                      value="all"
                      className="text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight"
                    >
                      <span className="inline-flex items-center gap-1 justify-center">
                        {/* <Star className="h-3 w-3" /> */}
                        All Badges
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="earned"
                      className="text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight"
                    >
                      <span className="inline-flex items-center gap-1 justify-center">
                        <CheckMark className="h-3 w-3 me-1" /> Earned
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="unearned"
                      className="text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight"
                    >
                      <span className="inline-flex items-center gap-1 justify-center">
                        <Lock className="h-3 w-3 me-1" /> Locked
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>



            {/* ===== DISPLAY ALL BADGES ===== */}
            <CardContent className="space-y-6 sm:space-y-8">
              {selectedEvent.bosses
                .filter(boss => selectedBoss === null || boss.id === selectedBoss)
                .map((boss, bossIndex) => {
                  const filteredBadges = getFilteredBadges(boss.badges);

                  if (filteredBadges.length === 0) return null;

                  return (
                    <div key={boss.id}>
                      {bossIndex > 0 && <Separator className="my-4 sm:my-6" />}

                      {/* Boss Header */}
                      <div className="mb-4 sm:mb-6">
                        <div className="flex flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                            {boss.name}
                          </h3>
                          {(() => {
                            const bp = getBossProgress(boss);
                            const complete = bp.total > 0 && bp.earned === bp.total;
                            return (
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    complete
                                      ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/70 text-emerald-700 dark:text-emerald-400"
                                      : ""
                                  }`}
                                >
                                  Earned: {bp.earned}/{bp.total}
                                </Badge>
                              </div>
                            );
                          })()}
                        </div>
                        <p className="text-muted-foreground text-sm sm:text-base">{boss.description}</p>
                      </div>

                      {/* Boss Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {filteredBadges.map((badge) => (
                          <BadgeCard key={badge.id} badge={badge} />
                        ))}
                      </div>
                    </div>
                  );
                })}

              {/* ===== Event Milestone Badges ===== */}
              {selectedBoss === null && (() => {
                const milestones = getEnhancedMilestones(selectedEvent);
                const filteredMilestones = getFilteredBadges(milestones);
                const mpEarned = milestones.filter((m) => m.earned).length;
                const mpTotal = milestones.length;
                const mpComplete = mpTotal > 0 && mpEarned === mpTotal;
                if (filteredMilestones.length === 0) return null;

                return (
                  <div>
                    <Separator className="my-4 sm:my-6" />

                      {/* Milestone Header */}
                    <div className="mb-4 sm:mb-6">
                      <div className="flex flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0 flex items-center gap-2">
                          <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                          Event Milestones
                        </h3>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              mpComplete
                                ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/70 text-emerald-700 dark:text-emerald-400"
                                : ""
                            }`}
                          >
                            Earned: {mpEarned}/{mpTotal}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        Progress tracked across all boss sessions within this event
                      </p>
                    </div>

                    {/* Milestone Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {filteredMilestones.map((milestone) => (
                        <BadgeCard key={milestone.id} badge={milestone} isMilestone />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* ===== Empty State ===== */}
              {selectedEvent.bosses
                .filter(boss => selectedBoss === null || boss.id === selectedBoss)
                .every(boss => getFilteredBadges(boss.badges).length === 0) &&
                (selectedBoss !== null || getFilteredBadges(selectedEvent.milestones).length === 0) && (
                  <div className="text-center py-10 sm:py-14">
                    <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      No badges to show
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4 max-w-xl mx-auto">
                      {filter === "earned"
                        ? "Play more sessions and keep an eye on boss fights to earn achievements."
                        : filter === "unearned"
                          ? "Nice! You've collected all available achievements here. Check other events for more."
                          : "This event currently has no badges available. Check back later or pick another event."
                      }
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Badges;

