import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, FileText, Type, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/api/apiClient";
import { toast } from "sonner";

const CreateEvent = () => {
  const navigate = useNavigate();

  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    startDate: "", // This will hold the datetime-local value
    endDate: "", // This will hold the datetime-local value
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!eventData.name || !eventData.startDate || !eventData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate that start time is before end time (using raw datetime-local values)
    if (new Date(eventData.startDate) >= new Date(eventData.endDate)) {
      toast.error("Start time must be before end time");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post("/events", {
        name: eventData.name,
        description: eventData.description,
        startTime: eventData.startDate, // Send raw datetime-local value
        endTime: eventData.endDate, // Send raw datetime-local value
      });

      toast.success("Event created successfully!");
      navigate("/host/events/view");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to events view
    navigate("/host/events/view");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="p-2 hover:bg-accent/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Event
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set up your event details and schedule
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Information Card */}
          <Card className="border-0 shadow-lg bg-card">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="event-name">
                  Event Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="event-name"
                  value={eventData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter event name..."
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe your event..."
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-background text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="start-datetime"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Start Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative flex">
                    <Input
                      id="start-datetime"
                      type="datetime-local"
                      value={eventData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className="rounded-r-none border-r-0 [&::-webkit-calendar-picker-indicator]:hidden"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("start-datetime").showPicker?.()
                      }
                      className="rounded-l-none border-l-0"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="end-datetime"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    End Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative flex">
                    <Input
                      id="end-datetime"
                      type="datetime-local"
                      value={eventData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      min={eventData.startDate}
                      className="rounded-r-none border-r-0 [&::-webkit-calendar-picker-indicator]:hidden"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("end-datetime").showPicker?.()
                      }
                      className="rounded-l-none border-l-0"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-0 pb-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto sm:min-w-[120px]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto sm:min-w-[120px]"
              disabled={
                isSubmitting ||
                !eventData.name.trim() ||
                !eventData.startDate ||
                !eventData.endDate
              }
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
