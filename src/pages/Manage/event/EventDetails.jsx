// ===== LIBRARIES ===== //
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { SVG_Boss, SVG_Checkmark } from "@/components/SVG";
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
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== HOOKS ===== //
import { useAuth } from "@/context/useAuth";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

// ==== UTILITIES ===== //
import { formatTextualDateTime } from "@/utils/helper";

const EventDetails = () => {
  const { eventId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    bossNames: [],
  });
  const [qrDialog, setQrDialog] = useState({
    isOpen: false,
    bossName: "",
    qrUrl: "",
  });
  const qrRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedBosses, setAssignedBosses] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBosses, setSelectedBosses] = useState([]);
  const [isUnAssigning, setIsUnAssigning] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      const event = response.data;
      event.startAt = formatTextualDateTime(event.startAt);
      event.endAt = formatTextualDateTime(event.endAt);
      setEvent(event);
      setAssignedBosses(response.data.eventBosses);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError("Failed to fetch event details.");
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch event details.");
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    } else {
      navigate("/manage/events");
    }
  }, [eventId, navigate, fetchEventDetails]);

  const handleShowQR = async (boss) => {
    const joinUrl = `${window.location.origin}/boss-preview/${boss.id}/${boss.joinCode}`;
    setQrDialog({
      isOpen: true,
      bossName: boss.name,
      qrUrl: joinUrl,
    });

    setQrDialog((prev) => ({
      ...prev,
      loading: false,
    }));
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector("canvas");
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${qrDialog.bossName.replace(/\s+/g, "_")}_QR.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrDialog.qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      toast.error("Failed to copy URL.");
    }
  };

  const handleBossSelect = (bossId) => {
    if (selectedBosses.includes(bossId)) {
      setSelectedBosses(selectedBosses.filter((id) => id !== bossId));
    } else {
      setSelectedBosses([...selectedBosses, bossId]);
    }
  };

  const handleUnAssignSelected = () => {
    if (selectedBosses.length === 0) return;

    const bossNames = assignedBosses
      .filter((boss) => selectedBosses.includes(boss.id))
      .map((boss) => boss.name);

    setConfirmDialog({
      isOpen: true,
      bossNames,
    });
  };

  const handleRemoveBoss = (boss) => {
    if (auth.user.role === "host" && boss.creatorId !== auth.user.id) {
      toast.error("You can only unassign bosses you created");
      return;
    }

    setSelectedBosses([boss.id]);
    setConfirmDialog({
      isOpen: true,
      bossNames: [boss.name],
    });
  };

  const confirmUnAssignedSelected = async () => {
    setIsUnAssigning(true);
    try {
      console.log("Unassigning bosses:", selectedBosses);
      const response = await apiClient.delete(`/events/${eventId}/bosses`, {
        data: {
          eventBossIds: selectedBosses,
        },
      });
      const results = response.data.results;
      setAssignedBosses(response.data.eventBosses);
      if (results.success.length > 0) {
        toast.success(
          `Successfully unassigned ${results.success.length} boss(es)!`
        );
      }
      if (results.failed.length > 0) {
        results.failed.forEach((fail) => {
          toast.error(
            `Failed to unassign boss ${fail.eventBossName}: ${fail.reason}`
          );
        });
      }

      setSelectedBosses([]);
      setSelectionMode(false);
    } catch (error) {
      console.error("Error unassigning bosses:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to unassign bosses.");
      }
    } finally {
      setIsUnAssigning(false);
      setConfirmDialog({
        isOpen: false,
        bossNames: [],
      });
    }
  };

  const cancelConfirmUnAssign = () => {
    setConfirmDialog({
      isOpen: false,
      bossNames: [],
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
    navigate(`/manage/events/${eventId}/assign-boss`);
  };

  const handleBack = () => {
    navigate("/manage/events");
  };

  const handlePlayerBadges = () => {
    navigate(`/manage/events/${eventId}/player-badges`);
  };

  const handleEditEvent = () => {
    navigate(`/manage/events/${eventId}/edit`);
  };

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

  const getBossStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Zap className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "in battle":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <Zap className="w-3 h-3 mr-1" />
            In Battle
          </Badge>
        );
      case "cooldown":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Cooldown
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
        <StatusOverlay message="Loading event details..." type="loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
        <StatusOverlay message={error} type="error" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
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
              {selectionMode ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedBosses([]);
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Discard</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUnAssignSelected}
                    className="flex items-center gap-2"
                    disabled={selectedBosses.length === 0 || isUnAssigning}
                  >
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Unassign</span>
                  </Button>
                </>
              ) : (
                <>
                  {assignedBosses.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setSelectionMode(true)}
                      className="flex items-center gap-2"
                    >
                      <SVG_Boss className="w-4 h-4" />
                      <span className="hidden sm:inline">Select Boss</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleAssignBoss}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Assign Boss</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Event Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h2 className="text-lg font-semibold">{event.name}</h2>
                      <Badge
                        variant="outline"
                        className={`mt-[4px] self-start capitalize ${getStatusBadgeStyle(
                          event.status
                        )}`}
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
                        {event.status || "--"}
                      </Badge>
                    </div>{" "}
                    <div className="justify-end flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handlePlayerBadges}
                      >
                        <BadgeIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Manage Badges</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditEvent}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit Event</span>
                      </Button>
                    </div>
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
                        {event.startAt || "TBD"}
                      </span>
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-border"></div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">End:</span>
                      <span className="font-medium text-muted-foreground">
                        {event.endAt || "TBD"}
                      </span>
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-border"></div>

                    <div className="flex items-center gap-1">
                      <SVG_Boss className="w-6 h-6 text-muted-foreground" />
                      <span className="text-muted-foreground">Bosses:</span>
                      <span className="font-medium text-muted-foreground">
                        {assignedBosses.length} assigned
                      </span>
                    </div>
                  </div>
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {assignedBosses.map((boss) => (
                  <Card
                    key={boss.id}
                    className={`overflow-hidden hover:shadow-md transition-shadow  ${
                      selectionMode && selectedBosses.includes(boss.id)
                        ? "ring-2 ring-primary border-primary cursor-pointer"
                        : selectionMode
                        ? "hover:border-primary/50 cursor-pointer"
                        : ""
                    }`}
                    onClick={() => {
                      if (selectionMode) handleBossSelect(boss.id);
                    }}
                  >
                    <CardContent className="p-0">
                      {/* Boss Image */}
                      <div className="relative bg-gradient-to-br from-primary/20 to-primary/5">
                        <img
                          src={
                            boss.image
                              ? boss.image
                              : "/src/assets/Placeholder/Falcon.png"
                          }
                          alt={boss.name}
                          className="w-full h-[270px] object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          {getBossStatusBadge(boss.status)}
                        </div>
                        <div className="absolute top-2 right-2">
                          {/* Only show remove button if user can unassign this boss */}
                          {(auth.user?.role === "superadmin" ||
                            auth.user?.role === "admin" ||
                            boss.creatorId === auth.user?.id) &&
                          selectionMode ? (
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                                selectedBosses.includes(boss.id)
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "bg-background border-border"
                              }`}
                            >
                              {selectedBosses.includes(boss.id) && (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                          ) : (
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
                      <div className="pt-4 px-4 space-y-3">
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
                                  className={`text-xs px-1.5 py-0.5`}
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
                            <div className="flex items-center justify-between pt-2 border-t">
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
                        <div className="flex items-center justify-between">
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
                                onClick={() =>
                                  navigate(
                                    `/manage/events/${eventId}/${boss.eventBossId}/leaderboard`
                                  )
                                }
                              >
                                <Trophy className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              View Boss Leaderboard
                            </TooltipContent>
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
                <div
                  ref={qrRef}
                  className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center"
                >
                  <QRCodeCanvas
                    value={qrDialog.qrUrl}
                    size={224}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"M"}
                  />
                </div>
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
              <Button onClick={handleDownloadQR} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <AlertDialog
          open={confirmDialog.isOpen}
          onOpenChange={() => cancelConfirmUnAssign()}
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
                      {confirmDialog.bossNames.join(", ")}
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
                onClick={confirmUnAssignedSelected}
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

export default EventDetails;
