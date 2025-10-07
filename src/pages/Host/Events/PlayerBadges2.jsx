// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trophy,
  Users,
  Award,
  Search,
  Skull,
  Target,
  Crown,
  Medal,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SVG_Boss, SVG_Checkmark } from "@/components/SVG";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ===== API ===== //
import { apiClient } from "@/api";

const PlayerBadges = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [tempBadges, setTempBadges] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (eventId) {
      const fetchAllUserBadges = async () => {
        try {
          setIsLoading(true);
          const response = await apiClient.get(`/user-badges/${eventId}`);
          if (response.data) {
            setEvent(response.data.event);
            setPlayers(response.data.users);
          }
        } catch (error) {
          setError(error);
          console.error("Error fetching user badges:", error);
          toast.error("Failed to fetch user badges");
        } finally {
          setIsLoading(false);
        }
      };

      fetchAllUserBadges();
    } else {
      navigate("/host/events/view");
    }
  }, [eventId, navigate]);

  // Filter and sort players alphabetically by name
  const filteredPlayers = players
    ? players
        .filter((player) =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedPlayers = filteredPlayers.slice(startIndex, endIndex);

  const getDefaultIcon = (badge, isMilestone) => {
    if (isMilestone) {
      if (!badge.threshold) return Trophy;
      return Medal;
    }

    if (badge.code === "boss-defeated") return Skull;
    if (badge.code === "last-hit") return Target;
    return Crown;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleBadgeClick = async (userBadgeId, currentlyRedeemed) => {
    if (!userBadgeId) {
      console.error("Invalid Requirements!");
      toast.error("Invalid Requirements! Please refresh the page.");
      return;
    }

    setTempBadges((prev) => {
      const existingIndex = prev.findIndex(
        (b) => b.userBadgeId === userBadgeId
      );
      let updated;

      if (existingIndex >= 0) {
        const existingBadge = prev[existingIndex];
        const newRedeemedState = !existingBadge.isRedeemed;

        if (newRedeemedState === currentlyRedeemed) {
          updated = prev.filter((b) => b.userBadgeId !== userBadgeId);
        } else {
          updated = [...prev];
          updated[existingIndex].isRedeemed = newRedeemedState;
        }
      } else {
        updated = [
          ...prev,
          {
            userBadgeId,
            isRedeemed: !currentlyRedeemed,
          },
        ];
      }

      setHasChanges(updated.length > 0);
      return updated;
    });
  };

  const handleDiscard = () => {
    setIsEditing(false);
    setTempBadges([]);
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (tempBadges.length === 0) return;

    try {
      const requests = tempBadges.map(({ userBadgeId, isRedeemed }) =>
        apiClient.put(`/user-badges/${userBadgeId}/update`, {
          isRedeemed,
        })
      );

      const results = await Promise.allSettled(requests);
      const successes = [];
      const failures = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successes.push(tempBadges[index]);
        } else {
          failures.push({
            ...tempBadges[index],
            error: result.reason,
          });
        }
      });

      if (successes.length > 0) {
        setPlayers((prev) =>
          prev.map((player) => ({
            ...player,
            eventBosses: player.eventBosses.map((eb) => ({
              ...eb,
              badges: eb.badges.map((b) => {
                const updated = tempBadges.find(
                  (tb) => tb.userBadgeId === b.userBadgeId
                );
                return updated ? { ...b, isRedeemed: updated.isRedeemed } : b;
              }),
            })),
            milestoneBadges: player.milestoneBadges.map((b) => {
              const updated = tempBadges.find(
                (tb) => tb.userBadgeId === b.userBadgeId
              );
              return updated ? { ...b, isRedeemed: updated.isRedeemed } : b;
            }),
          }))
        );
        setEvent((prev) => {
          const redeemedCountChange = successes.reduce((acc, badge) => {
            return acc + (badge.isRedeemed ? 1 : -1);
          }, 0);

          return {
            ...prev,
            totalBadgesRedeemed: Math.max(
              0,
              (prev.totalBadgesRedeemed || 0) + redeemedCountChange
            ),
          };
        });
        toast.success(`${successes.length} badge(s) saved successfully!`);
      }

      if (failures.length > 0) {
        console.error("Failed updates:", failures);
        toast.error(`${failures.length} badge(s) failed to save.`);
      }

      setTempBadges(failures);
      setHasChanges(failures.length > 0);
      setIsEditing(failures.length > 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes.");
    }
  };

  const handleBack = () => {
    navigate(`/host/events/assign_boss?eventId=${eventId}`);
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="text-center py-8">Event not found</div>
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
                  Badge Management
                </h1>
              </div>
            </div>
          </div>

          {/* Event Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {event?.name || "Event Name"}
                      </h2>
                      <Badge
                        variant="outline"
                        className={`mt-[4px] ${
                          event?.status?.toLowerCase() === "upcoming"
                            ? "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 self-start"
                            : event?.status?.toLowerCase() === "ongoing"
                            ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 self-start"
                            : event?.status?.toLowerCase() === "completed"
                            ? "bg-muted text-muted-foreground border-border self-start"
                            : "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 self-start"
                        }`}
                      >
                        {event?.status?.toLowerCase() === "upcoming" ? (
                          <Clock className="w-3 h-3 mr-1" />
                        ) : event?.status?.toLowerCase() === "ongoing" ? (
                          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse mr-1"></div>
                        ) : event?.status?.toLowerCase() === "completed" ? (
                          <SVG_Checkmark className="w-3 h-3 mr-1" />
                        ) : (
                          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse mr-1"></div>
                        )}
                        {event?.status
                          ? event.status.charAt(0).toUpperCase() +
                            event.status.slice(1).toLowerCase()
                          : "--"}
                      </Badge>
                    </div>
                  </div>

                  {event?.description && (
                    <p className="text-sm text-muted-foreground mt-4 mb-4">
                      {event.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Start:</span>
                      <span className="font-medium text-muted-foreground">
                        {event?.startTime
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
                        {event?.endTime
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
                        {event?.totalEventBosses || 0} assigned
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Player Badges Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Badge Status
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track individual boss badges and event milestone progress for
                each player
              </p>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Players
                    </p>
                    <p className="text-xl font-bold">{players?.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Badges Earned
                    </p>
                    <p className="text-xl font-bold">
                      {event?.totalBadgesEarned || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                      <span className="text-white/70 text-[6px] font-bold whitespace-nowrap bg-green-900 px-[3px] py-[1px] rounded-[1px] rotate-[45deg]">
                        REDEEMED
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Badges Redeemed
                    </p>
                    <p className="text-xl font-bold">
                      {event?.totalBadgesRedeemed || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between pt-3 gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-9"
                  />
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDiscard}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Discard</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!hasChanges}
                      className="flex items-center gap-2"
                    >
                      <SVG_Checkmark className="w-4 h-4" />
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {paginatedPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No players found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "No players have been assigned badges yet"}
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Badges</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPlayers.map((player, index) => (
                        <TableRow key={player.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={
                                    player.profileImage ||
                                    `/src/assets/Placeholder/Profile${
                                      (index % 5) + 1
                                    }.jpg`
                                  }
                                  alt={player.name}
                                />
                                <AvatarFallback>
                                  {player.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="sm:font-medium">
                                {startIndex + index + 1}. {player.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-full">
                              {/* Boss Badges Table */}
                              <table className="w-full border-collapse">
                                <tbody>
                                  {/* Boss Badges */}
                                  {player.eventBosses.map((eventBoss) => (
                                    <tr key={eventBoss.id}>
                                      <td className="pt-3 text-xs text-muted-foreground text-wrap w-32 py-1 pr-3 align-top">
                                        {eventBoss.name}
                                      </td>
                                      <td className="py-1">
                                        <div className="flex items-center gap-1">
                                          {eventBoss.badges.map(
                                            (badge, badgeIndex) => {
                                              const IconComponent =
                                                badge.icon ||
                                                getDefaultIcon(badge, false);
                                              const isTempRedeemed =
                                                tempBadges.find(
                                                  (b) =>
                                                    b.userBadgeId ===
                                                    badge?.userBadgeId
                                                )?.isRedeemed ??
                                                badge.isRedeemed;
                                              return (
                                                <Tooltip key={badgeIndex}>
                                                  <TooltipTrigger asChild>
                                                    <div
                                                      className={`flex items-center gap-1 ${
                                                        isEditing
                                                          ? badge.isEarned
                                                            ? "cursor-pointer"
                                                            : "cursor-not-allowed"
                                                          : ""
                                                      }`}
                                                      onClick={
                                                        isEditing &&
                                                        badge.isEarned
                                                          ? () =>
                                                              handleBadgeClick(
                                                                badge?.userBadgeId,
                                                                badge.isRedeemed
                                                              )
                                                          : undefined
                                                      }
                                                    >
                                                      <div className="relative">
                                                        <div
                                                          className={`w-8 h-8 rounded-full flex items-center justify-center ring-1 ring-inset transition-all ${
                                                            badge.isEarned
                                                              ? "bg-gradient-to-tr from-emerald-500 to-green-400 text-white ring-emerald-300/70"
                                                              : "bg-gradient-to-tr from-gray-200 to-gray-300 text-gray-600 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 ring-gray-300/60 dark:ring-gray-500/50"
                                                          } ${
                                                            isTempRedeemed
                                                              ? "opacity-70"
                                                              : ""
                                                          }`}
                                                        >
                                                          <IconComponent className="h-4 w-4" />
                                                        </div>
                                                        {isTempRedeemed && (
                                                          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                                                            <span className="text-white/70 text-[5px] font-bold whitespace-nowrap bg-green-900 ms-[2px] ps-[2px] pt-[1.5px] pb-[1px] px-[2px] rounded-[1px] rotate-[45deg]">
                                                              REDEEMED
                                                            </span>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p className="text-center">
                                                      {badge.name}
                                                      <br />
                                                      <b>
                                                        {isTempRedeemed
                                                          ? "Redeemed"
                                                          : badge.isEarned
                                                          ? "Earned"
                                                          : "Locked"}
                                                      </b>
                                                    </p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              );
                                            }
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}

                                  {/* Milestone Badges */}
                                  {player.milestoneBadges.length > 0 && (
                                    <tr key="milestones">
                                      <td className="pt-3 text-xs text-muted-foreground w-32 py-1 pr-3 align-top">
                                        Milestones:
                                      </td>
                                      <td className="py-1">
                                        <div className="flex items-center gap-1 flex-wrap">
                                          {player.milestoneBadges.map(
                                            (badge) => {
                                              const IconComponent =
                                                badge.icon ||
                                                getDefaultIcon(badge, true);
                                              const isTempRedeemed =
                                                tempBadges.find(
                                                  (b) =>
                                                    b.userBadgeId ===
                                                    badge?.userBadgeId
                                                )?.isRedeemed ??
                                                badge.isRedeemed;
                                              return (
                                                <Tooltip key={badge.id}>
                                                  <TooltipTrigger asChild>
                                                    <div
                                                      className={`flex items-center gap-1 ${
                                                        isEditing
                                                          ? badge.isEarned
                                                            ? "cursor-pointer"
                                                            : "cursor-not-allowed"
                                                          : ""
                                                      }`}
                                                      onClick={
                                                        isEditing &&
                                                        badge.isEarned
                                                          ? () =>
                                                              handleBadgeClick(
                                                                badge?.userBadgeId,
                                                                badge.isRedeemed
                                                              )
                                                          : undefined
                                                      }
                                                    >
                                                      <div className="relative">
                                                        <div
                                                          className={`w-8 h-8 rounded-full flex items-center justify-center ring-1 ring-inset transition-all ${
                                                            badge.isEarned
                                                              ? "bg-gradient-to-tr from-emerald-500 to-green-400 text-white ring-emerald-300/70"
                                                              : "bg-gradient-to-tr from-gray-200 to-gray-300 text-gray-600 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 ring-gray-300/60 dark:ring-gray-500/50"
                                                          } ${
                                                            isTempRedeemed
                                                              ? "opacity-70"
                                                              : ""
                                                          }`}
                                                        >
                                                          <IconComponent className="h-4 w-4" />
                                                        </div>
                                                        {isTempRedeemed && (
                                                          <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                                                            <span className="text-white/70 text-[5px] font-bold whitespace-nowrap bg-green-900 ms-[2px] ps-[2px] pt-[1.5px] pb-[1px] px-[2px] rounded-[1px] rotate-[45deg]">
                                                              REDEEMED
                                                            </span>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    {isEditing ? (
                                                      <p className="text-center">
                                                        {badge.name} <br />
                                                        <b>
                                                          {badge.isEarned
                                                            ? ` Click to ${
                                                                isTempRedeemed
                                                                  ? "unredeem"
                                                                  : "redeem"
                                                              }`
                                                            : " Locked"}{" "}
                                                        </b>
                                                      </p>
                                                    ) : (
                                                      <p>
                                                        {badge.name}{" "}
                                                        {isTempRedeemed
                                                          ? "(Redeemed)"
                                                          : badge.isEarned
                                                          ? "(Earned)"
                                                          : "(Locked)"}
                                                      </p>
                                                    )}
                                                  </TooltipContent>
                                                </Tooltip>
                                              );
                                            }
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground text-center sm:text-left">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(endIndex, filteredPlayers.length)} of{" "}
                        {filteredPlayers.length} players
                      </p>
                      <div className="flex items-center gap-1">
                        {/* First Page Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                          className="h-7 px-2 text-xs"
                        >
                          First
                        </Button>

                        {/* Previous Page Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>

                        {/* Page Numbers */}
                        {totalPages > 3 && currentPage > 2 && (
                          <span className="text-muted-foreground text-xs px-1">
                            ...
                          </span>
                        )}

                        {Array.from(
                          { length: Math.min(totalPages, 3) },
                          (_, i) => {
                            let page;
                            if (currentPage <= 2) {
                              // Show pages 1, 2, 3 when on first two pages
                              page = i + 1;
                            } else if (currentPage >= totalPages - 1) {
                              // Show last 3 pages when on last two pages
                              page = totalPages - 2 + i;
                            } else {
                              // Show current page in the middle
                              page = currentPage - 1 + i;
                            }

                            if (page < 1 || page > totalPages) return null;
                            return (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="h-7 w-7 p-0 text-xs"
                              >
                                {page}
                              </Button>
                            );
                          }
                        )}

                        {totalPages > 3 && currentPage < totalPages - 1 && (
                          <span className="text-muted-foreground text-xs px-1">
                            ...
                          </span>
                        )}

                        {/* Next Page Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>

                        {/* Last Page Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="h-7 px-2 text-xs"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PlayerBadges;
