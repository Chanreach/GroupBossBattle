import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Type,
  Save,
  Trash2,
  AlertTriangle,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiClient } from "@/api";
import { toast } from "sonner";

const EditEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    status: "",
  });

  const [originalEventData, setOriginalEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/events/${eventId}`);
        const event = response.data;

        // Format datetime for input fields (convert from API format to datetime-local format)
        const formatForInput = (dateTime) => {
          console.log(dateTime);
          if (!dateTime) return "";
          const date = new Date(dateTime);
          console.log(date.toLocaleDateString());
          return (
            date.toLocaleDateString() +
            " " +
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          );
        };

        const formattedData = {
          name: event.name || "",
          description: event.description || "",
          startTime: formatForInput(event.startTime),
          endTime: formatForInput(event.endTime),
          status: event.status || "upcoming",
        };

        setEventData(formattedData);
        setOriginalEventData(formattedData);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to fetch event details");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const handleInputChange = (field, value) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Check if current data is different from original data
  const hasChanges =
    originalEventData &&
    (eventData.name !== originalEventData.name ||
      eventData.description !== originalEventData.description ||
      eventData.startTime !== originalEventData.startTime ||
      eventData.endTime !== originalEventData.endTime);

  // Check if save should be enabled
  const isSaveEnabled =
    hasChanges &&
    eventData.name.trim() &&
    eventData.startTime &&
    eventData.endTime;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventData.name || !eventData.startTime || !eventData.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData = {
        name: eventData.name,
        description: eventData.description,
        startTime: eventData.startTime, // Send raw datetime-local value
        endTime: eventData.endTime, // Send raw datetime-local value
      };

      await apiClient.put(`/events/${eventId}`, updateData);
      toast.success("Event updated successfully");
      navigate(`/host/events/assign_boss?eventId=${eventId}`);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(error.response?.data?.message || "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.delete(`/events/${eventId}`);
      toast.success("Event deleted successfully");
      navigate("/host/events/view");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.response?.data?.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      // Show confirmation dialog for unsaved changes
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    navigate(`/host/events/assign_boss?eventId=${eventId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                  Edit Event
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Modify your event details and schedule
                </p>
              </div>
            </div>

            {/* Delete Button - Top Right */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
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
                        value={eventData.startTime}
                        onChange={(e) =>
                          handleInputChange("startTime", e.target.value)
                        }
                        className="rounded-r-none border-r-0 [&::-webkit-calendar-picker-indicator]:hidden"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document
                            .getElementById("start-datetime")
                            .showPicker?.()
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
                        value={eventData.endTime}
                        onChange={(e) =>
                          handleInputChange("endTime", e.target.value)
                        }
                        min={eventData.startTime}
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
                disabled={isSubmitting || !isSaveEnabled}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" />
              Delete Event
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                "{eventData.name}"
              </span>
              ? This action cannot be undone and will remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditEvent;
