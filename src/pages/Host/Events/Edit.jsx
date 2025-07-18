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

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/events/${eventId}`);
        const event = response.data;

        // Format datetime for input fields (convert from API format to datetime-local format)
        const formatForInput = (dateTime) => {
          if (!dateTime) return "";
          const date = new Date(dateTime);
          return date.toISOString().slice(0, 16);
        };

        setEventData({
          name: event.name || "",
          description: event.description || "",
          startTime: formatForInput(event.startTime),
          endTime: formatForInput(event.endTime),
          status: event.status || "upcoming",
        });
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
    setHasChanges(true);
  };

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
      setHasChanges(false);
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
        <div className="text-center py-8">Loading event details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
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
                    Edit Event
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Modify your event details and schedule
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete Event</span>
            </Button>
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
                  <Textarea
                    id="description"
                    value={eventData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your event..."
                    rows={4}
                    className="bg-background border-gray-200 dark:border-gray-700"
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
                      value={eventData.startTime}
                      onChange={(e) =>
                        handleInputChange("startTime", e.target.value)
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
                      value={eventData.endTime}
                      onChange={(e) =>
                        handleInputChange("endTime", e.target.value)
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
                      !eventData.startTime ||
                      !eventData.endTime ||
                      !hasChanges
                    }
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
              </CardContent>
            </Card>
          </div>
        </form>
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
