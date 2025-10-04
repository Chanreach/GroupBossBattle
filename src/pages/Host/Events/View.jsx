import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ChevronRight, Plus } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SVG_Boss, SVG_Checkmark } from "@/components/SVG";
import { apiClient } from "@/api";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";

const ViewEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // Format the API data to match the UI expectations
  const formatEventsForUI = (apiEvents) => {
    return apiEvents.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      status: event.status,
      startTime: event.startTime,
      endTime: event.endTime,
      eventBosses: event.eventBosses || [],
    }));
  };

  // Sort events by status priority: Ongoing -> Upcoming -> Completed
  const sortEventsByStatus = (events) => {
    const statusPriority = {
      'ongoing': 1,
      'upcoming': 2,
      'completed': 3
    };

    return events.sort((a, b) => {
      const priorityA = statusPriority[a.status?.toLowerCase()] || 999;
      const priorityB = statusPriority[b.status?.toLowerCase()] || 999;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same status, sort by start time (newest first for ongoing/upcoming, oldest first for completed)
      if (a.status?.toLowerCase() === 'completed' && b.status?.toLowerCase() === 'completed') {
        return new Date(a.startTime) - new Date(b.startTime);
      } else {
        return new Date(b.startTime) - new Date(a.startTime);
      }
    });
  };

  const formattedEvents = sortEventsByStatus(formatEventsForUI(events));

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/host/events/assign_boss?eventId=${eventId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
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
          onClick={() => navigate("/host/events/create")}
          className="flex items-center gap-2"
          style={{ display: user?.role === "admin" ? "flex" : "none" }}
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Events List - Vertical Stack */}
      <div className="space-y-4">
        {formattedEvents.length === 0 ? (
          // No Events Found State
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Events Found
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              No events have been created yet. Create your first event to get
              started.
            </p>
          </div>
        ) : (
          // Events List - Each event as a full-width card
          formattedEvents.map((event) => (
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
                            event.status?.toLowerCase() === "upcoming"
                              ? "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 mt-auto"
                              : event.status?.toLowerCase() === "ongoing"
                              ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 mt-auto"
                              : event.status?.toLowerCase() === "completed"
                              ? "bg-muted text-muted-foreground border-border mt-auto"
                              : "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 mt-auto"
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
                          {event.status 
                            ? event.status.charAt(0).toUpperCase() + event.status.slice(1).toLowerCase()
                            : "--"}
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
                          {event.startTime 
                            ? new Date(event.startTime).toLocaleDateString() + 
                              " " + 
                              new Date(event.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </span>
                      </div>

                      <div className="hidden sm:block h-4 w-px bg-border"></div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">End:</span>
                        <span className="font-medium text-muted-foreground">
                          {event.endTime 
                            ? new Date(event.endTime).toLocaleDateString() + 
                              " " + 
                              new Date(event.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </span>
                      </div>

                      <div className="hidden sm:block h-4 w-px bg-border"></div>

                      <div className="flex items-center gap-1">
                        <SVG_Boss className="w-6 h-6 text-muted-foreground" />
                        <span className="text-muted-foreground">Bosses:</span>
                        <span className="font-medium text-muted-foreground">
                          {event.eventBosses.length} assigned
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

export default ViewEvents;
