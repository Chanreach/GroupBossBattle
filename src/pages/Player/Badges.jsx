// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { Award, Trophy, Shield, Lock, Gift } from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BadgeCard from "@/components/BadgeCard";
import CheckMark from "@/components/CheckMark";
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const Badges = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedBossId, setSelectedBossId] = useState(null);
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllUserBadges = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/user-badges/");
      if (response.data) {
        setEvents(response.data.events);
      }
    } catch (error) {
      setError(error.message || "Error fetching badges.");
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUserBadges();
  }, [fetchAllUserBadges]);

  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  // Filter badges based on current selection
  const getFilteredBadges = (badges) => {
    if (!badges) return [];
    if (badgeFilter === "earned")
      return badges.filter((badge) => badge.isEarned);
    if (badgeFilter === "unearned")
      return badges.filter((badge) => !badge.isEarned);
    if (badgeFilter === "redeemed")
      return badges.filter((badge) => badge.isRedeemed);
    return badges;
  };

  const handleEventChange = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    setSelectedEvent(event);
    setSelectedBossId(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
        <StatusOverlay type="loading" message="Loading badges..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
        <StatusOverlay
          type="error"
          message={error}
          onRetry={fetchAllUserBadges}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      {/* ===== EVENTS FILTERS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* MOBILE: Tabs for Events */}
        <div className="lg:hidden">
          <Tabs
            value={selectedEvent?.id || ""}
            onValueChange={(value) => handleEventChange(value)}
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 h-auto gap-1 p-1">
              {events.map((event) => (
                <TabsTrigger
                  key={event.id}
                  value={event.id}
                  className="text-xs sm:text-sm flex items-center gap-1 h-auto py-2 px-2"
                >
                  {event.status === "ongoing" && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                  <span className="truncate text-center">{event.name}</span>
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
              <Tabs
                value={selectedEvent?.id || ""}
                onValueChange={(value) => handleEventChange(value)}
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-1">
                  {events.map((event) => (
                    <TabsTrigger
                      key={event.id}
                      value={event.id}
                      className="w-full justify-start text-sm h-auto py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-transparent hover:bg-accent"
                    >
                      <div className="flex items-center space-x-2 w-full">
                        {event.status === "ongoing" && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        )}
                        <span className="truncate text-wrap text-left flex-1">
                          {event.name}
                        </span>
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
                    <span>{selectedEvent?.name}</span>
                    {selectedEvent?.status === "ongoing" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800 text-xs"
                        >
                          Happening Now
                        </Badge>
                      </div>
                    )}
                  </CardTitle>

                  {/* Event Progress Summary */}
                  <div className="mt-2">
                    {(() => {
                      const progressPercentage =
                        selectedEvent?.maxBadges > 0
                          ? Math.round(
                              (selectedEvent.totalUserBadges /
                                selectedEvent.maxBadges) *
                                100
                            )
                          : 0;
                      return (
                        <div className="flex flex-col gap-2 py-2">
                          <div className="flex flex-wrap items-center gap-2 pb-2">
                            <Badge variant="secondary" className="text-xs">
                              Total Bosses:{" "}
                              {selectedEvent?.totalEventBosses || 0}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Total Badges Earned:{" "}
                              {selectedEvent?.totalUserBadges || 0}/
                              {selectedEvent?.maxBadges || 0}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <div className="w-full sm:w-70 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* ===== Boss Navigation Tabs ===== */}
                <Tabs
                  value={selectedBossId === null ? "all" : selectedBossId}
                  onValueChange={(value) =>
                    setSelectedBossId(value === "all" ? null : value)
                  }
                >
                  <TabsList className="grid w-full grid-cols-3 h-auto gap-1 p-1">
                    <TabsTrigger
                      value="all"
                      className="w-full text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="truncate max-w-[10rem]">
                          All Bosses
                        </span>
                        {(() => {
                          return (
                            <span className="text-[10px] text-muted-foreground">
                              {selectedEvent?.totalUserBadges || 0}/
                              {selectedEvent?.maxBadges || 0}
                            </span>
                          );
                        })()}
                      </div>
                    </TabsTrigger>
                    {selectedEvent?.eventBosses?.map((eventBoss) => {
                      return (
                        <TabsTrigger
                          key={eventBoss.id}
                          value={eventBoss.id.toString()}
                          className="w-full text-[11px] sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="truncate max-w-[10rem] text-wrap">
                              {eventBoss.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {eventBoss.totalUserBadges}/{eventBoss.maxBadges}
                            </span>
                          </div>
                        </TabsTrigger>
                      );
                    }) || []}
                  </TabsList>
                </Tabs>

                {/* ===== ALL/EARNED/UNEARNED/REDEEMED FILTER ===== */}
                <Tabs
                  value={badgeFilter}
                  onValueChange={(value) => setBadgeFilter(value)}
                >
                  <TabsList className="grid w-full grid-cols-4 h-auto gap-1 p-1">
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
                      value="redeemed"
                      className="text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight"
                    >
                      <span className="inline-flex items-center gap-1 justify-center">
                        <Gift className="h-3 w-3 me-1" /> Redeemed
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
              {selectedEvent?.eventBosses
                ?.filter(
                  (boss) =>
                    selectedBossId === null || boss.id === selectedBossId
                )
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
                            const complete =
                              boss.totalUserBadges > 0 &&
                              boss.totalUserBadges === boss.maxBadges;
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
                                  Earned: {boss.totalUserBadges}/
                                  {boss.maxBadges}
                                </Badge>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Boss Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {filteredBadges.map((badge) => (
                          <BadgeCard key={badge.id} badge={badge} />
                        ))}
                      </div>
                    </div>
                  );
                }) || []}

              {/* ===== Event Milestone Badges ===== */}
              {selectedBossId === null &&
                (() => {
                  // const milestones = getEnhancedMilestones(selectedEvent);
                  const milestones = selectedEvent?.milestoneBadges || [];
                  const filteredMilestones = getFilteredBadges(milestones);
                  const mpEarned = milestones.filter((m) => m.earnedAt).length;
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
                          Progress tracked across all boss sessions within this
                          event
                        </p>
                      </div>

                      {/* Milestone Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {filteredMilestones.map((milestone) => (
                          <BadgeCard
                            key={milestone.id}
                            badge={milestone}
                            isMilestone={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}

              {/* ===== Empty State ===== */}
              {(selectedEvent?.eventBosses || [])
                .filter(
                  (boss) =>
                    selectedBossId === null || boss.id === selectedBossId
                )
                .every((boss) => getFilteredBadges(boss.badges).length === 0) &&
                (selectedBossId !== null ||
                  getFilteredBadges(selectedEvent?.milestoneBadges || [])
                    .length === 0) && (
                  <div className="text-center py-10 sm:py-14">
                    <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      No badges to show
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4 max-w-xl mx-auto">
                      {badgeFilter === "earned"
                        ? "Play more sessions and keep an eye on boss fights to earn achievements."
                        : badgeFilter === "unearned"
                        ? "Nice! You've collected all available achievements here. Check other events for more."
                        : badgeFilter === "redeemed"
                        ? "No badges have been redeemed yet. Visit the badge redemption center to redeem your earned badges."
                        : "This event currently has no badges available. Check back later or pick another event."}
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
