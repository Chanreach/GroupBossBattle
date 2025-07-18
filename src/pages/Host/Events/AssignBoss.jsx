import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  X,
  QrCode,
  SkipForward,
  Trophy,
  Clock,
  Zap,
  AlertTriangle,
  Badge as BadgeIcon,
  Download,
  Copy,
  Check,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getBossImageUrl } from "@/utils/imageUtils";
import { apiClient } from "@/api";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";

const AssignBoss = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    bossId: null,
    bossName: "",
  });
  const [qrDialog, setQrDialog] = useState({
    isOpen: false,
    bossName: "",
    qrUrl: "",
    qrCode: null,
    loading: false,
  });
  const [copied, setCopied] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedBosses, setAssignedBosses] = useState([]);

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/events/${eventId}`);
      setEvent(response.data);

      // Extract assigned bosses from event data
      const bosses =
        response.data.eventBosses?.map((eventBoss) => ({
          id: eventBoss.boss.id,
          eventBossId: eventBoss.id,
          name: eventBoss.boss.name,
          image: eventBoss.boss.image,
          description: eventBoss.boss.description,
          cooldownDuration: eventBoss.cooldownDuration,
          numberOfTeams: eventBoss.numberOfTeams,
          status: eventBoss.status,
          joinCode: eventBoss.joinCode,
          creatorId: eventBoss.boss.creatorId,
          creator: eventBoss.boss.creator,
          categories: eventBoss.boss.Categories || [], // Include categories
        })) || [];

      setAssignedBosses(bosses);
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast.error("Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    } else {
      // If no eventId, redirect back to events view
      navigate("/host/events/view");
    }
  }, [eventId, navigate, fetchEventDetails]);

  const handleShowQR = async (boss) => {
    try {
      const joinUrl = `${window.location.origin}/boss-preview/join?code=${boss.joinCode}`;
      setQrDialog({
        isOpen: true,
        bossName: boss.name,
        qrUrl: joinUrl,
        qrCode: null,
        loading: true,
      });

      // Fetch the actual QR code from the API
      const response = await apiClient.get(
        `/events/${eventId}/bosses/${boss.id}/qr`
      );

      setQrDialog((prev) => ({
        ...prev,
        qrCode: response.data.qrCode,
        loading: false,
      }));
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
      setQrDialog((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  const handleDownloadQR = () => {
    if (qrDialog.qrCode) {
      const link = document.createElement("a");
      link.download = `${qrDialog.bossName.replace(/\s+/g, "_")}_QR.png`;
      link.href = qrDialog.qrCode;
      link.click();
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrDialog.qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleRemoveBoss = (boss) => {
    // Check if user can unassign this boss (hosts can only unassign their own bosses)
    if (user.role === "host" && boss.creatorId !== user.id) {
      toast.error("You can only unassign bosses you created");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      bossId: boss.id,
      eventBossId: boss.eventBossId,
      bossName: boss.name,
    });
  };

  const confirmRemoveBoss = async () => {
    if (confirmDialog.eventBossId) {
      try {
        await apiClient.delete(
          `/events/${eventId}/bosses/${confirmDialog.bossId}`
        );
        setAssignedBosses(
          assignedBosses.filter((boss) => boss.id !== confirmDialog.bossId)
        );
        toast.success("Boss unassigned successfully");
      } catch (error) {
        console.error("Error unassigning boss:", error);
        toast.error("Failed to unassign boss");
      }
    }
    setConfirmDialog({
      isOpen: false,
      bossId: null,
      eventBossId: null,
      bossName: "",
    });
  };

  const cancelRemoveBoss = () => {
    setConfirmDialog({
      isOpen: false,
      bossId: null,
      eventBossId: null,
      bossName: "",
    });
  };

  const handleSkipCooldown = async () => {
    try {
      // This would need to be implemented in the backend
      toast.info("Skip cooldown feature coming soon");
    } catch (error) {
      console.error("Error skipping cooldown:", error);
      toast.error("Failed to skip cooldown");
    }
  };

  const handleAssignBoss = () => {
    navigate(`/host/events/boss_template?eventId=${eventId}`);
  };

  const handleBack = () => {
    navigate("/host/events/view");
  };

  const handleViewLeaderboard = () => {
    navigate(`/host/events/leaderboard?eventId=${eventId}`);
  };

  const handlePlayerBadges = () => {
    navigate("/host/events/player_badges");
  };

  const handleEditEvent = () => {
    navigate(`/host/events/edit?eventId=${eventId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="text-center py-8">Event not found</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handlePlayerBadges}
              >
                <BadgeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Player Badges</span>
              </Button>
              <Button
                size="sm"
                onClick={handleAssignBoss}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Assign Boss</span>
              </Button>
            </div>
          </div>

          {/* Event Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">{event.name}</h2>
                    {user?.role === "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditEvent}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Event
                      </Button>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      <strong>Start:</strong>{" "}
                      {event.startTime
                        ? new Date(event.startTime).toLocaleDateString() +
                          " " +
                          new Date(event.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </span>
                    <span>
                      <strong>End:</strong>{" "}
                      {event.endTime
                        ? new Date(event.endTime).toLocaleDateString() +
                          " " +
                          new Date(event.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </span>
                    <span>
                      <strong>Bosses:</strong> {assignedBosses.length} assigned
                    </span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 ml-4"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {event.status || "Active"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Content Area */}
          {assignedBosses.length === 0 ? (
            // No Bosses Assigned State
            <Card>
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      No Bosses Assigned
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Get started by assigning bosses to this event. Players
                      will be able to battle them once assigned.
                    </p>
                  </div>
                  <Button className="mt-4" onClick={handleAssignBoss}>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Your First Boss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Bosses Grid
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Assigned Bosses</Label>
                <div className="text-sm text-muted-foreground">
                  {
                    assignedBosses.filter((boss) => boss.status === "active")
                      .length
                  }{" "}
                  Active •{" "}
                  {
                    assignedBosses.filter((boss) => boss.status === "cooldown")
                      .length
                  }{" "}
                  On Cooldown
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedBosses.map((boss) => (
                  <Card
                    key={boss.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-0">
                      {/* Boss Image */}
                      <div className="relative bg-gradient-to-br from-primary/20 to-primary/5">
                        <img
                          src={
                            boss.image
                              ? getBossImageUrl(boss.image)
                              : "/src/assets/Placeholder/Falcon.png"
                          }
                          alt={boss.name}
                          className="w-full h-[270px] object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          {boss.status === "active" ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Zap className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-800"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Cooldown
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-2 right-2">
                          {/* Only show remove button if user can unassign this boss */}
                          {(user?.role === "admin" ||
                            boss.creatorId === user?.id) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0 bg-background/80 hover:bg-background"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveBoss(boss);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Unassign Boss</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      {/* Boss Info */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-base mb-1">
                            {boss.name}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>
                              By: {boss.creator?.username || "Unknown"}
                            </span>
                            <span>{boss.cooldownDuration || 60}s cooldown</span>
                          </div>
                          {boss.description && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {boss.description}
                            </p>
                          )}

                          {/* Categories */}
                          {boss.categories && boss.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {boss.categories.map((category) => (
                                <Badge
                                  key={category.id}
                                  variant="outline"
                                  className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {category.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Status Info */}
                        <div className="space-y-2">
                          {boss.status === "cooldown" ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Status:
                              </span>
                              <span className="text-sm font-mono">
                                On Cooldown
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Teams Allowed:
                              </span>
                              <span className="text-sm font-semibold">
                                {boss.numberOfTeams || 2}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Join Code:
                            </span>
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {boss.joinCode}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-1">
                            {boss.status === "cooldown" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => handleSkipCooldown()}
                                  >
                                    <SkipForward className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Skip Cooldown</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => handleShowQR(boss)}
                                >
                                  <QrCode className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Generate QR Code</TooltipContent>
                            </Tooltip>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={handleViewLeaderboard}
                              >
                                <Trophy className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Leaderboard</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* QR Code Dialog */}
        <Dialog
          open={qrDialog.isOpen}
          onOpenChange={(open) => setQrDialog({ ...qrDialog, isOpen: open })}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code - {qrDialog.bossName}
              </DialogTitle>
              <DialogDescription>
                Scan this QR code to access the boss battle directly
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center space-y-4 py-4">
              {/* QR Code Image */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                {qrDialog.loading ? (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : qrDialog.qrCode ? (
                  <img
                    src={qrDialog.qrCode}
                    alt="QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-gray-500">
                    Failed to load QR code
                  </div>
                )}
              </div>

              {/* URL Display */}
              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Direct Link:</Label>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="flex-1 text-xs break-all">
                    {qrDialog.qrUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={handleCopyUrl}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600">
                    URL copied to clipboard!
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setQrDialog({ ...qrDialog, isOpen: false })}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                onClick={handleDownloadQR}
                className="w-full sm:w-auto"
                disabled={!qrDialog.qrCode || qrDialog.loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <AlertDialog
          open={confirmDialog.isOpen}
          onOpenChange={cancelRemoveBoss}
        >
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <AlertDialogTitle>Unassign Boss</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1">
                    Are you sure you want to unassign{" "}
                    <span className="font-semibold">
                      {confirmDialog.bossName}
                    </span>{" "}
                    from this event?
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                This action will remove the boss from the event and players will
                no longer be able to battle it. This cannot be undone.
              </p>
            </div>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveBoss}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Unassign Boss
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default AssignBoss;
