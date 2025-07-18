import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ChevronRight, Plus } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      title: event.name,
      startTime: event.startTime,
      endTime: event.endTime,
    }));
  };

  const formattedEvents = formatEventsForUI(events);

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/host/events/assign_boss?eventId=${eventId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="text-center py-8">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
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
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Event Title */}
                  <h3 className="text-lg font-semibold text-foreground">
                    {event.title}
                  </h3>

                  <div className="flex flex-col sm:flex-row sm:gap-8 gap-2">
                    {/* Start Date/Time */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-muted-foreground">Start:</span>{" "}
                        {new Date(event.startTime).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(event.startTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>

                    {/* End Date/Time */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-muted-foreground">End:</span>{" "}
                        {new Date(event.endTime).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(event.endTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewEvents;
