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
import { apiClient } from "@/api";
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-black dark:bg-white rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Create New Event
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Set up your event details and schedule
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Event Information Card */}
            <Card className="border-0 shadow-lg bg-card">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="event-name"
                    className="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    Event Name *
                  </Label>
                  <Input
                    id="event-name"
                    value={eventData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter event name..."
                    className="h-11 bg-background border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    Description
                  </Label>
                  <textarea
                    id="description"
                    value={eventData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your event..."
                    rows={4}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-background px-3 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="start-datetime"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Start Date & Time *
                    </Label>
                    <Input
                      id="start-datetime"
                      type="datetime-local"
                      value={eventData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="end-datetime"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      End Date & Time *
                    </Label>
                    <Input
                      id="end-datetime"
                      type="datetime-local"
                      value={eventData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="border-0 shadow-lg bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 h-11 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg"
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
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
