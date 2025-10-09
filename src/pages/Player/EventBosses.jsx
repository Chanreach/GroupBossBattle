import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Trophy, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/api";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";

const EventBosses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedBosses, setAssignedBosses] = useState([]);

  useEffect(() => {
    // Add some debugging
    console.log("EventBosses: useEffect triggered", { eventId, user });

    if (eventId) {
      fetchEventDetails();
    } else {
      setLoading(false);
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    // Don't make API calls if no eventId
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch event details (includes eventBosses data)
      const eventResponse = await apiClient.get(`/public/events/${eventId}`);
      if (eventResponse.data) {
        const eventData = eventResponse.data;
        console.log("EventBosses: Fetched event data:", eventData);
        setEvent(eventData);

        // Extract bosses from eventBosses association
        const bosses =
          eventData.eventBosses?.map((eventBoss) => ({
            ...eventBoss.boss,
            status: eventBoss.status || "active", // Default to active if no status
            eventBossId: eventBoss.id,
            joinCode: eventBoss.joinCode, // Add joinCode for navigation
            categories: eventBoss.boss.Categories || [], // Include categories
          })) || [];

        console.log("EventBosses: Extracted bosses:", bosses);
        console.log("EventBosses: Boss statuses:", bosses.map(b => ({ name: b.name, status: b.status, eventBossId: b.eventBossId, joinCode: b.joinCode })));
        setAssignedBosses(bosses);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      // More specific error handling
      if (error.response?.status === 404) {
        toast.error("Event not found");
      } else if (error.response?.status === 403) {
        toast.error("Access denied to this event");
      } else {
        toast.error("Failed to load event details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleViewLeaderboard = () => {
    navigate("/leaderboard");
  };

  const handleJoinBoss = (boss) => {
    console.log("Attempting to join boss:", boss);

    // Check if boss has required properties
    if (!boss.eventBossId) {
      toast.error("Invalid boss configuration: Missing eventBossId");
      return;
    }
    
    if (!boss.joinCode) {
      toast.error("Invalid boss configuration: Missing joinCode");
      return;
    }

    // Construct the boss preview URL similar to AssignBoss.jsx
    const joinUrl = `/boss-preview/${boss.eventBossId}/${boss.joinCode}`;
    console.log("Navigating to:", joinUrl);
    navigate(joinUrl);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">No Event Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select an event to view its bosses.
          </p>
          <Button onClick={handleBack}>Go Back to Home</Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested event could not be found.
          </p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

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
                Event Bosses
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleViewLeaderboard}
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
          </div>
        </div>

        {/* Event Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">{event.name}</h2>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    <strong>Start:</strong>{" "}
                    {event.startTimeFormatted?.formatted || "N/A"}
                  </span>
                  <span>
                    <strong>End:</strong>{" "}
                    {event.endTimeFormatted?.formatted || "N/A"}
                  </span>
                  <span>
                    <strong>Bosses:</strong> {assignedBosses.length} available
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {event.status || "Ready"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Bosses Grid */}
        {assignedBosses.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No Bosses Available</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    There are currently no bosses assigned to this event. Check
                    back later!
                  </p>
                </div>
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Available Bosses</Label>
              <div className="text-sm text-muted-foreground">
                {
                  assignedBosses.filter((boss) => !boss.status || boss.status.toLowerCase() === "active")
                    .length
                }{" "}
                Ready •{" "}
                {
                  assignedBosses.filter((boss) => boss.status && boss.status.toLowerCase() !== "active")
                    .length
                }{" "}
                On Cooldown
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {assignedBosses.map((boss) => (
                <Card
                  key={boss.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    {/* Boss Image */}
                    <div className="relative bg-gradient-to-br from-primary/20 to-primary/5">
                      <img
                        src={
                          boss.image
                            ? boss.image
                            : "/src/assets/Placeholder/Falcon.png"
                        }
                        alt={boss.name}
                        className="w-full h-[270px] object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        {(() => {
                          const isActive = !boss.status || boss.status.toLowerCase() === "active";
                          return isActive ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Zap className="w-3 h-3 mr-1" />
                              Ready
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-800"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {boss.status || "Cooldown"}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Boss Details */}
                    <div className="pt-4 px-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-base mb-1">
                          {boss.name}
                        </h3>

                        {boss.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {boss.description}
                          </p>
                        )}

                        {/* Categories */}
                        {boss.categories && boss.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {boss.categories.map((category) => (
                              <Badge
                                key={category.id}
                                variant="outline"
                                className={`text-xs px-1.5 py-0.5`}
                              >
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Boss Stats */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            Teams Allowed:
                          </span>
                          <span className="text-sm font-semibold">
                            {boss.numberOfTeams || 2}
                          </span>
                        </div>
                      </div>

                      {/* Join Button */}
                      <div className="pt-3">
                        {(() => {
                          const isActive = !boss.status || boss.status.toLowerCase() === "active";
                          return (
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1 w-full font-semibold px-3 py-2 rounded-2 !bg-purple-500 hover:!bg-purple-600 !text-white !border-purple-700 dark:!border-purple-600 halftone-texture"
                              onClick={() => handleJoinBoss(boss)}
                            >
                              {isActive ? "Join" : "View Boss"}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBosses;
