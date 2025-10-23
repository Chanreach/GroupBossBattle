// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sword,
  Plus,
  Check,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SVG_Checkmark } from "@/components/SVG";
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== HOOKS ===== //
import { useAuth } from "@/context/useAuth";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const AssignBoss = () => {
  const { eventId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedBosses, setSelectedBosses] = useState([]);
  const [availableBosses, setAvailableBosses] = useState([]);
  const [loading, setLoading] = useState({
    event: true,
    bosses: true,
  });
  const [error, setError] = useState({
    event: null,
    bosses: null,
  });
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchEvent = useCallback(async () => {
    setLoading((prev) => ({ ...prev, event: true }));
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch event details.");
      }
      setError((prev) => ({
        ...prev,
        event: data?.message || "Failed to fetch event details.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, event: false }));
    }
  }, [eventId]);

  const fetchBosses = useCallback(async () => {
    setLoading((prev) => ({ ...prev, bosses: true }));
    try {
      const response = await apiClient.get(
        `/events/${eventId}/available-bosses`
      );
      setAvailableBosses(response.data);
    } catch (error) {
      console.error("Error fetching bosses:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch bosses.");
      }
      setError((prev) => ({
        ...prev,
        bosses: data?.message || "Failed to fetch bosses.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, bosses: false }));
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      fetchBosses();
    }
  }, [eventId, fetchEvent, fetchBosses]);

  const handleBack = () => {
    navigate(`/manage/events/${eventId}`);
  };

  const handleBossSelect = (bossId) => {
    if (selectedBosses.includes(bossId)) {
      setSelectedBosses(selectedBosses.filter((id) => id !== bossId));
    } else {
      setSelectedBosses([...selectedBosses, bossId]);
    }
  };

  const handleAssignSelected = async () => {
    if (selectedBosses.length === 0) {
      toast.error("Please select at least one boss to assign.");
      return;
    }

    setIsAssigning(true);
    try {
      const response = await apiClient.post(`/events/${eventId}/bosses`, {
        bossIds: selectedBosses,
      });
      const result = response.data.results;
      const successCount = result.success.length;
      const failureCount = result.failed.length;
      navigate(`/manage/events/${eventId}`);
      setTimeout(() => {
        if (failureCount > 0) {
          toast.error(`${failureCount} boss(es) failed to assign.`);
          console.error("Failed to assign bosses:", result.failed);
        }
        if (successCount > 0) {
          toast.success(
            `${successCount} boss(es) successfully assigned to the event.`
          );
        }
      }, 100);
    } catch (error) {
      console.error("Error assigning bosses:", error);
      toast.error(error.response?.data?.message || "Failed to assign bosses");
    } finally {
      setIsAssigning(false);
    }
  };

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "ongoing":
        return "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "completed":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
    }
  };

  if (loading.event) {
    return (
      <div className="min-h-screen bg-background">
        <StatusOverlay message="Loading event details..." type="loading" />
      </div>
    );
  }

  if (error.event) {
    return (
      <div className="min-h-screen bg-background">
        <StatusOverlay
          message={error.event}
          type="error"
          onRetry={fetchEvent}
        />
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
                Assign Boss
              </h1>
            </div>
          </div>
          {selectedBosses.length > 0 && (
            <Button
              onClick={handleAssignSelected}
              disabled={isAssigning}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isAssigning
                ? "Assigning..."
                : `Assign Selected (${selectedBosses.length})`}
            </Button>
          )}
        </div>

        {/* Event Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center">
                  <div className="me-2">{event.name}</div>
                  <Badge
                    variant="outline"
                    className={
                      getStatusBadgeStyle(event.status) + " mt-auto capitalize"
                    }
                  >
                    {event.status?.toLowerCase() === "upcoming" ? (
                      <Clock className="w-3 h-3 mr-1" />
                    ) : event.status?.toLowerCase() === "ongoing" ? (
                      <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse mr-1"></div>
                    ) : event.status?.toLowerCase() === "completed" ? (
                      <SVG_Checkmark className="w-3 h-3 mr-1" />
                    ) : (
                      <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse mr-1"></div>
                    )}
                    {event.status ? event.status : "--"}
                  </Badge>
                </h2>
                <p className="text-sm text-muted-foreground mt-3">
                  Select bosses to add to this active event
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Available Bosses Section */}
        {loading.bosses ? (
          <StatusOverlay message="Loading available bosses..." type="loading" />
        ) : error.bosses ? (
          <StatusOverlay
            message={error.bosses}
            type="error"
            onRetry={fetchBosses}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-semibold">
                  Available Boss Templates
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Select bosses to add to your event
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {availableBosses.length} Available{" "}
                {auth?.user?.role === "host" ? "(Your Bosses Only)" : ""}
              </div>
            </div>

            {/* Available Bosses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableBosses.map((boss) => (
                <Card
                  key={boss.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedBosses.includes(boss.id)
                      ? "ring-2 ring-primary border-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleBossSelect(boss.id)}
                >
                  <CardContent className="p-0">
                    {/* Boss Image */}
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={
                          boss.image
                            ? boss.image
                            : "/src/assets/Placeholder/Falcon.png"
                        }
                        alt={boss.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute top-2 right-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                            selectedBosses.includes(boss.id)
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-background border-border"
                          }`}
                        >
                          {selectedBosses.includes(boss.id) && (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Boss Info */}
                    <div className="pt-4 px-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-base mb-1">
                          {boss.name}
                        </h3>
                        <div className="text-xs text-muted-foreground mb-2">
                          By: {boss.creator?.username || "Unknown"}
                        </div>
                        {boss.description && (
                          <p className="text-xs text-muted-foreground">
                            {boss.description}
                          </p>
                        )}

                        {/* Categories */}
                        {boss.Categories && boss.Categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {boss.Categories.map((category) => (
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
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Cooldown
                          </span>
                          <span className="font-medium">
                            {boss.cooldownDuration || 60}s
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Teams
                          </span>
                          <span className="font-medium">
                            {boss.numberOfTeams || 2}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {availableBosses.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Sword className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        No Bosses Available
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        {auth?.user?.role === "host"
                          ? "You haven't created any bosses yet. Create bosses first to assign them to events."
                          : "No bosses are available for assignment."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {selectedBosses.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <Card className="px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedBosses.length} boss
                  {selectedBosses.length !== 1 ? "es" : ""} selected
                </span>
                <Button
                  onClick={handleAssignSelected}
                  size="sm"
                  disabled={isAssigning}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isAssigning ? "Assigning..." : "Assign to Event"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignBoss;
