// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Plus } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SVG_Boss, SVG_Checkmark } from "@/components/SVG";
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== HOOKS ===== //
import { useAuth } from "@/context/useAuth";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

// ===== UTILITIES ===== //
import { formatTextualDateTime } from "@/utils/helper";

const EventList = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events.");
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch events.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  const handleEventClick = (eventId) => {
    navigate(`/manage/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
        <StatusOverlay message="Loading events..." type="loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
        <StatusOverlay message={error} type="error" onRetry={fetchEvents} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className=" "></div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        </div>
        <Button
          onClick={() => navigate("/manage/events/create")}
          className="flex items-center gap-2"
          style={{
            display:
              auth?.user?.role === "superadmin" || auth?.user?.role === "admin"
                ? "flex"
                : "none",
          }}
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Events List - Vertical Stack */}
      <div className="space-y-4">
        {events.length === 0 ? (
          // No Events Found State
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Events Found
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              {auth?.user?.role === "superadmin" || auth?.user?.role === "admin"
                ? "No events have been created yet. Create your first event to get started."
                : "No events found."}
            </p>
          </div>
        ) : (
          // Events List - Each event as a full-width card
          events.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 border border-border/50 w-full"
              onClick={() => handleEventClick(event.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold flex items-center">
                        <div className="me-2">{event.name}</div>
                        <Badge
                          variant="outline"
                          className={
                            getStatusBadgeStyle(event.status) +
                            " mt-auto capitalize"
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
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-4 mb-4">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Start:</span>
                        <span className="font-medium text-muted-foreground">
                          {event.startAt
                            ? formatTextualDateTime(event.startAt)
                            : "TBD"}
                        </span>
                      </div>

                      <div className="hidden sm:block h-4 w-px bg-border"></div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">End:</span>
                        <span className="font-medium text-muted-foreground">
                          {event.endAt
                            ? formatTextualDateTime(event.endAt)
                            : "TBD"}
                        </span>
                      </div>

                      <div className="hidden sm:block h-4 w-px bg-border"></div>

                      <div className="flex items-center gap-1">
                        <SVG_Boss className="w-6 h-6 text-muted-foreground" />
                        <span className="text-muted-foreground">Bosses:</span>
                        <span className="font-medium text-muted-foreground">
                          {event.eventBossCount} assigned
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EventList;
