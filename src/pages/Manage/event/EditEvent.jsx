// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

// ===== UTILITIES ===== //
import {
  formatUTCDateTimeForLocalInput,
  convertLocalDateTimeToUTC,
} from "@/utils/helper";

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    startAt: "",
    endAt: "",
    status: "",
  });

  const [originalEventData, setOriginalEventData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      const event = {
        name: response.data.name || "",
        description: response.data.description || "",
        startAt: formatUTCDateTimeForLocalInput(response.data.startAt),
        endAt: formatUTCDateTimeForLocalInput(response.data.endAt),
        status: response.data.status || "upcoming",
      };
      setEventData(event);
      setOriginalEventData(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch event details.");
      }
      setError(data?.message || "Failed to fetch event details.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, fetchEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hasChanges = () => {
    if (!eventData || !originalEventData) return false;

    return Object.keys(eventData).some(
      (key) => eventData[key] !== originalEventData[key]
    );
  };

  const isSaveEnabled = () => {
    const requiredFields = ["name", "startAt", "endAt"];
    const areRequiredFieldsFilled = requiredFields.every((key) => {
      const value = eventData[key];
      return value && value.toString().trim() !== "";
    });

    return hasChanges() && areRequiredFieldsFilled;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await apiClient.put(`/events/${eventId}`, {
        name: eventData.name,
        description: eventData.description,
        startAt: convertLocalDateTimeToUTC(eventData.startAt),
        endAt: convertLocalDateTimeToUTC(eventData.endAt),
      });
      navigate(`/manage/events/${eventId}`);
      setTimeout(() => {
        toast.success(response.data.message || "Event updated successfully!");
      }, 100);
    } catch (error) {
      console.error("Error updating event:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to update event.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/events/${eventId}`);
      navigate("/manage/events");
      setTimeout(() => {
        toast.success("Event deleted successfully!");
      }, 100);
    } catch (error) {
      console.error("Error deleting event:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to delete event.");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    navigate(`/manage/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <StatusOverlay status="loading" message="Loading event details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <StatusOverlay status="error" message={error} />
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
                    name="name"
                    value={eventData.name}
                    onChange={handleChange}
                    placeholder="Enter event name..."
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={eventData.description}
                    onChange={handleChange}
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
                        name="startAt"
                        type="datetime-local"
                        value={eventData.startAt}
                        onChange={handleChange}
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
                        name="endAt"
                        type="datetime-local"
                        value={eventData.endAt}
                        onChange={handleChange}
                        min={eventData.startAt}
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
                disabled={isSubmitting || !isSaveEnabled()}
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
