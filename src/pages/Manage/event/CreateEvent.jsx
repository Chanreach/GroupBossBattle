// ===== LIBRARIES ===== //
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

// ===== UTILITIES ===== //
import { convertLocalDateTimeToUTC } from "@/utils/helper";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    startAt: "",
    endAt: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/events", {
        name: eventData.name,
        description: eventData.description,
        startAt: convertLocalDateTimeToUTC(eventData.startAt),
        endAt: convertLocalDateTimeToUTC(eventData.endAt),
      });

      navigate("/manage/events");
      setTimeout(() => {
        toast.success(response.data.message || "Event created successfully!");
      }, 100);
    } catch (error) {
      console.error("Error creating event:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to create event.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/manage/events");
  };

  const isCreateDisabled =
    !eventData.name || !eventData.startAt || !eventData.endAt;

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
              disabled={isSubmitting || isCreateDisabled}
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
