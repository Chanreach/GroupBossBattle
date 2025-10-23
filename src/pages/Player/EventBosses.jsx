// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trophy, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

// ===== UTILITIES ===== //
import { formatTextualDateTime } from "@/utils/helper";

const EventBosses = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [eventBosses, setEventBosses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/events/public/${eventId}`);
      setEvent(response.data);
      setEventBosses(response.data.eventBosses || []);
    } catch (error) {
      console.error("Error fetching event:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to load event.");
      }
      setError(data?.message || "Failed to load event.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleBack = () => {
    navigate("/");
  };

  const handleViewLeaderboard = () => {
    navigate("/leaderboard");
  };

  const handleJoinBoss = (boss) => {
    const joinUrl = `/boss-preview/${boss.id}/${boss.joinCode}`;
    navigate(joinUrl);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <StatusOverlay status="loading" message="Loading event..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <StatusOverlay status="error" message={error} onRetry={fetchEvent} />
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
                    {formatTextualDateTime(event.startAt) || "TBD"}
                  </span>
                  <span>
                    <strong>End:</strong>{" "}
                    {formatTextualDateTime(event.endAt) || "TBD"}
                  </span>
                  <span>
                    <strong>Bosses:</strong> {eventBosses.length} available
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
        {eventBosses.length === 0 ? (
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
                  eventBosses.filter(
                    (boss) =>
                      !boss.status || boss.status.toLowerCase() === "active"
                  ).length
                }{" "}
                Ready •{" "}
                {
                  eventBosses.filter(
                    (boss) =>
                      boss.status && boss.status.toLowerCase() !== "active"
                  ).length
                }{" "}
                On Cooldown
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {eventBosses.map((boss) => (
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
                          const isActive =
                            !boss.status ||
                            boss.status.toLowerCase() === "active";
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
                          const isActive =
                            !boss.status ||
                            boss.status.toLowerCase() === "active";
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
