// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, X, Trophy, User, TrendingUp, Sword } from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

// ===== STYLES ===== //
import "@/index.css";

import { apiClient } from "@/api";
import useBossBattle from "@/hooks/useBossBattle";
import { toast } from "sonner";
import { useAuth } from "@/context/useAuth";
import { getGuestUser } from "@/utils/guestUtils";
import { getBossImageUrl } from "@/utils/imageUtils";

const BossPreview = () => {
  const { eventBossId, joinCode } = useParams();
  const { socket } = useBossBattle();
  const { user } = useAuth();

  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");

  const [countdown, setCountdown] = useState(null);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [session, setSession] = useState(null);

  const [eventBoss, setEventBoss] = useState(null);
  const [bossStatus, setBossStatus] = useState("active"); // active, in-battle, cooldown
  const [cooldownTimer, setCooldownTimer] = useState(0); // seconds remaining

  // Auto-fill nickname with username when user is available
  useEffect(() => {
    if (user && !nickname) {
      setNickname(user.username || "");
    } else if (!user && !nickname) {
      // Check for guest user
      const guestUser = getGuestUser();
      if (guestUser) {
        setNickname(guestUser.username || "");
      }
    }
  }, [user, nickname]);

  // Get user info from localStorage/auth context
  const getUserInfo = () => {
    if (user) {
      if (user.isGuest) {
        // Guest user
        return {
          id: user.id,
          username: user.username,
          isGuest: true,
        };
      } else {
        // Regular authenticated user
        return {
          id: user.id,
          username: user.username,
          isGuest: false,
        };
      }
    }

    // Fallback: check localStorage directly for guest user
    const guestUser = getGuestUser();
    if (guestUser) {
      return {
        id: guestUser.id,
        username: guestUser.username,
        isGuest: true,
      };
    }

    return null;
  };

  // Nickname validation function
  const validateNickname = (nickname) => {
    const trimmed = nickname.trim();

    // Length validation
    if (trimmed.length < 2) {
      return "Nickname must be at least 2 characters long";
    }
    if (trimmed.length > 20) {
      return "Nickname must be 20 characters or less";
    }

    // Character validation (alphanumeric + spaces, hyphens, underscores)
    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validPattern.test(trimmed)) {
      return "Nickname can only contain letters, numbers, spaces, hyphens, and underscores";
    }

    // No consecutive spaces
    if (/\s{2,}/.test(trimmed)) {
      return "Nickname cannot contain consecutive spaces";
    }

    // Cannot start or end with special characters
    if (/^[-_\s]|[-_\s]$/.test(trimmed)) {
      return "Nickname cannot start or end with spaces, hyphens, or underscores";
    }

    return null; // Valid
  };

  // Handle nickname input change with validation
  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
  };

  useEffect(() => {
    const fetchEventBoss = async () => {
      try {
        const response = await apiClient.get(`/event-bosses/${eventBossId}`);
        const bossData = response.data;
        setEventBoss(bossData);

        // Set boss status and handle cooldown
        setBossStatus(bossData.status);

        if (bossData.status === "cooldown" && bossData.cooldownDuration) {
          const remainingTime = bossData.cooldownDuration;

          if (remainingTime > 0) {
            setCooldownTimer(remainingTime);
          } else {
            // Cooldown has ended, update status to active
            setBossStatus("active");
            try {
              await apiClient.patch(`/event-bosses/${eventBossId}/status`, {
                status: "active",
                cooldownEndTime: null,
              });
            } catch (error) {
              console.error("Failed to update boss status:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching event boss:", error);
        toast.error("Failed to fetch event boss details");
      }
    };
    fetchEventBoss();
  }, [eventBossId]);

  // Load leaderboard data from the new API
  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (!eventBossId || !eventBoss?.boss?.id) return;

      try {
        setRealLeaderboardData((prev) => ({ ...prev, isLoading: true }));

        // Use the new boss preview leaderboard API endpoint
        const response = await fetch(
          `/api/boss-preview/${eventBoss.eventId}/${eventBoss.boss.id}/leaderboard`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.data) {
            setRealLeaderboardData({
              teamLeaderboard: data.data.teamLeaderboard || [],
              individualLeaderboard: data.data.individualLeaderboard || [],
              allTimeLeaderboard: data.data.allTimeLeaderboard || [],
              isLoading: false,
            });

            console.log("� Leaderboard data loaded from new API:", data.data);
          }
        } else {
          console.warn("Failed to load leaderboard data, using fallback");
          setRealLeaderboardData((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error loading leaderboard data:", error);
        setRealLeaderboardData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadLeaderboardData();
  }, [eventBossId, eventBoss]);

  // Periodic leaderboard refresh
  useEffect(() => {
    if (!socket || !eventBossId) return;

    // Refresh leaderboard data every 30 seconds
    const refreshInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("boss-preview:request-leaderboard", { eventBossId });
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [socket, eventBossId]);

  // Cooldown timer effect
  useEffect(() => {
    let interval;

    if (bossStatus === "cooldown" && cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer((prev) => {
          if (prev <= 1) {
            // Cooldown finished, update boss status
            setBossStatus("active");

            // Update backend status
            apiClient
              .patch(`/event-bosses/${eventBossId}/status`, {
                status: "active",
                cooldownEndTime: null,
              })
              .catch((error) => {
                console.error("Failed to update boss status:", error);
              });

            toast.success("Boss is now available for battle!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bossStatus, cooldownTimer, eventBossId]);

  useEffect(() => {
    if (socket && eventBossId && joinCode) {
      socket.emit("boss-preview:join", { eventBossId, joinCode });
      // Send initial leaderboard data request after joining
      socket.on("boss-preview:joined", (data) => {
        toast.success("Joined boss preview successfully");
        // Update session data with current player count when first joining
        if (data.session) {
          setSession(data.session);
          setPlayersOnline(data.session.playerCount);
        }

        // Request initial leaderboard data
        socket.emit("boss-preview:request-leaderboard", { eventBossId });
      });

      // LISTEN FOR REAL-TIME PLAYER COUNT UPDATES (players who joined the battle)
      socket.on("player-count:updated", (data) => {
        setSession(data.session);
        setPlayersOnline(data.session?.playerCount);
      });

      // LISTEN FOR BOSS FIGHT JOIN CONFIRMATION
      socket.on("boss-fight:joined", (data) => {
        setPlayersOnline(data.session?.playerCount);
        setIsJoined(true);
        toast.success(data.message || "Successfully joined boss fight");
      });

      // LISTEN FOR RECONNECTION SUCCESS
      socket.on("boss-fight:reconnected", (data) => {
        setSession(data.session);
        setPlayersOnline(data.session?.playerCount);
        setIsJoined(true); // Reconnection means they previously joined
        toast.success("Reconnected to boss fight successfully");

        // If battle has started and player has joined, redirect to battle page
        if (data.session?.isStarted) {
          setIsBattleStarted(true);
          setCountdown(3); // Short countdown for reconnect
        }
      });

      // LISTEN FOR REAL-TIME LEADERBOARD UPDATES from new socket events
      socket.on("boss-preview:leaderboard-update", (data) => {
        console.log("📊 Received leaderboard update in preview:", data);

        if (data.leaderboardData) {
          setRealLeaderboardData((prev) => ({
            ...prev,
            teamLeaderboard:
              data.leaderboardData.teamLeaderboard?.map((team) => ({
                rank: team.rank,
                team: team.teamName,
                dmg: team.totalDamage,
                correct: team.totalCorrectAnswers,
                avatar: "/src/assets/Placeholder/Profile1.jpg",
                playerCount: team.playerCount,
              })) || prev.teamLeaderboard,
            individualLeaderboard:
              data.leaderboardData.individualLeaderboard?.map((player) => ({
                rank: player.rank,
                player: player.playerName,
                team: player.teamName,
                dmg: player.totalDamage,
                correct: player.correctAnswers,
                avatar: player.avatar || "/src/assets/Placeholder/Profile1.jpg",
              })) || prev.individualLeaderboard,
            allTimeLeaderboard:
              data.leaderboardData.allTimeLeaderboard?.map((player) => ({
                rank: player.rank,
                player: player.playerName,
                dmg: player.totalDamage,
                correct: player.correctAnswers,
                avatar: player.avatar || "/src/assets/Placeholder/Profile1.jpg",
              })) || prev.allTimeLeaderboard,
          }));
        }
      });

      // LISTEN FOR LEGACY LEADERBOARD UPDATES (fallback)
      socket.on("leaderboard-update", (data) => {
        console.log("📊 Received legacy leaderboard update in preview:", data);

        setRealLeaderboardData((prev) => ({
          ...prev,
          teamLeaderboard: data.teamLeaderboard || prev.teamLeaderboard,
          individualLeaderboard:
            data.playerLeaderboard || prev.individualLeaderboard,
        }));
      });

      // LISTEN FOR PLAYER JOIN NOTIFICATIONS
      socket.on("player:joined-notification", (data) => {
        toast.info(`${data.playerNickname} joined the battle!`);
      });

      // LISTEN FOR PLAYER KNOCKOUT NOTIFICATIONS
      socket.on("player:knockout-notification", (data) => {
        toast.error(`${data.playerNickname} was knocked out!`);
      });

      // LISTEN FOR BOSS DAMAGE UPDATES
      socket.on("boss:damage-update", (data) => {
        if (data.damage > 0) {
          toast.success(
            `Boss took ${data.damage} damage! HP: ${data.currentHP}/${data.maxHP}`
          );
        }
      });

      // LISTEN FOR BOSS STATUS UPDATES
      socket.on("boss-status:updated", (data) => {
        setBossStatus(data.status);

        if (data.status === "cooldown" && data.cooldownEndTime) {
          const endTime = new Date(data.cooldownEndTime).getTime();
          const now = Date.now();
          const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
          setCooldownTimer(remainingTime);
          toast.info(
            `Boss defeated! Cooldown: ${Math.ceil(remainingTime / 60)} minutes`
          );
        } else if (data.status === "in-battle") {
          toast.info("Boss battle has started!");
        } else if (data.status === "active") {
          setCooldownTimer(0);
          toast.success("Boss is now available for battle!");
        }
      });

      // LISTEN FOR BATTLE START (when enough players join)
      socket.on("battle:countdown-started", () => {
        setIsCountdownActive(true);
        toast.success("Battle starting soon! Get ready!");
      });

      // ATTEMPT RECONNECTION on socket connect/reconnect
      const attemptReconnection = () => {
        // Get user info for reconnection inline
        let userInfo = null;
        if (user) {
          userInfo = {
            id: user.id,
            username: user.username,
            isGuest: user.isGuest,
          };
        } else {
          const guestUser = getGuestUser();
          if (guestUser) {
            userInfo = {
              id: guestUser.id,
              username: guestUser.username,
              isGuest: true,
            };
          }
        }

        if (userInfo) {
          socket.emit("boss-fight:reconnect", {
            eventBossId,
            joinCode,
            userInfo,
          });
        } else {
          console.log("No user info available for reconnection");
        }
      };

      // Try reconnection when socket connects
      if (socket.connected) {
        attemptReconnection();
      }

      socket.on("connect", attemptReconnection);

      socket.on("error", (error) => {
        console.error("Socket error:", error);
        toast.error(
          "Socket connection error: " + (error.message || "Unknown error")
        );
      });

      socket.on("left-boss-session", (response) => {
        if (response.success) {
          toast.success("Successfully left boss session");
        } else {
          toast.error(response.message || "Failed to leave session");
        }
      });

      return () => {
        socket.off("boss-preview:joined");
        socket.off("boss-preview:leaderboard-update");
        socket.off("player-count:updated");
        socket.off("online-viewers:updated");
        socket.off("boss-fight:joined");
        socket.off("boss-fight:reconnected");
        socket.off("boss-status:updated");
        socket.off("battle:countdown-started");
        socket.off("leaderboard-update");
        socket.off("connect", attemptReconnection);
        socket.off("error");
        socket.off("left-boss-session");
      };
    }
  }, [socket, eventBossId, joinCode, user]);

  const [isJoined, setIsJoined] = useState(false);
  const [playersOnline, setPlayersOnline] = useState(0); // Players who joined the battle
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [currentPage, setCurrentPage] = useState({
    teams: 1,
    individual: 1,
    alltime: 1,
  });
  const PAGE_SIZE = 10;

  // Real leaderboard data state
  const [realLeaderboardData, setRealLeaderboardData] = useState({
    teamLeaderboard: [],
    individualLeaderboard: [],
    allTimeLeaderboard: [],
    isLoading: true,
  });

  // Use real leaderboard data or fallback to empty arrays
  const teamLeaderboard = realLeaderboardData.teamLeaderboard || [];
  const individualLeaderboard = realLeaderboardData.individualLeaderboard || [];
  const allTimeLeaderboard = realLeaderboardData.allTimeLeaderboard || [];

  const goBack = () => {
    navigate("/");
  };

  useEffect(() => {
    if (!socket || !socket.connect) return;

    // Only listen for battle start events if the player has already joined
    if (isJoined) {
      socket.on("battle:start", (data) => {
        setSession(data.session);
        setIsBattleStarted(true);
        setCountdown(5);
      });

      socket.on("battle:already-started", (data) => {
        setSession(data.session);
        setIsBattleStarted(true);
        setCountdown(5);
      });
    } else {
      console.log(
        "Player hasn't joined yet - not listening for battle start events"
      );
    }

    return () => {
      socket.off("battle:start");
      socket.off("battle:already-started");
    };
  }, [socket, isJoined]);

  useEffect(() => {
    // Only process countdown if player has joined
    if (countdown === null || !isJoined) return;

    if (countdown === 0) {
      navigate(`/boss-battle/${eventBossId}/${joinCode}`, {
        state: { session },
      });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate, session, eventBossId, joinCode, isJoined]);

  const handleJoin = () => {
    // Validate nickname
    const validationError = validateNickname(nickname);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Get user info for reconnection
    const userInfo = getUserInfo();

    const playerData = {
      nickname: nickname.trim(),
      ...userInfo,
    };

    // Listen for nickname uniqueness response
    const handleNicknameResponse = (response) => {
      if (response.success) {
        setIsJoined(true);
        toast.success("Successfully joined boss fight!");
      } else {
        toast.error(response.message || "Failed to join session");
      }

      // Remove the listener
      socket.off("nickname-check-response", handleNicknameResponse);
    };

    socket.on("nickname-check-response", handleNicknameResponse);

    socket.emit("boss-fight:join", {
      eventBossId,
      joinCode,
      playerData,
    });
  };

  const handleUnjoin = () => {
    if (isProcessing) return; // Prevent rapid clicks

    setIsProcessing(true);
    setIsJoined(false);

    // Remove any pending nickname check response listener
    socket.off("nickname-check-response");

    // Emit leave event to backend
    socket.emit("leave-boss-session");

    // Reset local state - don't manually decrement, wait for backend update
    setSession(null);

    // Reset processing state after a short delay
    setTimeout(() => setIsProcessing(false), 1000);
  };

  // Pagination helpers
  const getPaginatedData = (data, tabKey) => {
    const page = currentPage[tabKey];
    const totalPages = Math.ceil(data.length / PAGE_SIZE);
    const paginatedData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return { paginatedData, totalPages, currentPageNum: page };
  };

  const handlePageChange = (tabKey, newPage) => {
    setCurrentPage((prev) => ({ ...prev, [tabKey]: newPage }));
  };

  const getRankBadge = (rank) => {
    if (rank === 1)
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          1st
        </Badge>
      );
    if (rank === 2)
      return (
        <Badge className="bg-gray-400 hover:bg-gray-500 text-white">2nd</Badge>
      );
    if (rank === 3)
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
          3rd
        </Badge>
      );
    return (
      <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    );
  };

  // Pagination component
  const PaginationControls = ({ totalPages, currentPageNum, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(currentPageNum > 1 ? currentPageNum - 1 : 1);
                }}
                className={
                  currentPageNum === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  href="#"
                  isActive={currentPageNum === idx + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(idx + 1);
                  }}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(
                    currentPageNum < totalPages
                      ? currentPageNum + 1
                      : totalPages
                  );
                }}
                className={
                  currentPageNum === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <main className="flex-grow min-h-screen">
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button onClick={goBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-center">
                Boss Battle
              </h1>
              <p className="text-muted-foreground text-center">
                Join the battle and defeat the boss
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-sm mx-auto">
          <Card className="overflow-hidden">
            {/* Boss Name Header */}
            <CardHeader className="text-center">
              <CardTitle className="capitalize text-xl font-bold">
                {eventBoss?.boss?.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
              {/* Boss Image */}
              <div className="relative">
                <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
                  {eventBoss?.boss?.image ? (
                    <img
                      src={getBossImageUrl(eventBoss.boss.image)}
                      alt={eventBoss?.boss?.name || "Boss Image"}
                      className={`w-full h-full object-cover ${
                        bossStatus === "cooldown" ? "boss-image-paused" : ""
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-center">
                        <Sword className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                        <span className="text-sm text-muted-foreground">
                          No Image
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Sleeping Z Animation - Only show when boss is on cooldown */}
                {bossStatus === "cooldown" && cooldownTimer > 0 && (
                  <div className="absolute top-10 right-20 pointer-events-none">
                    <div className="sleeping-z">Z</div>
                    <div className="sleeping-z" style={{ left: '8px', top: '4px' }}>Z</div>
                    <div className="sleeping-z" style={{ left: '16px', top: '8px' }}>Z</div>
                  </div>
                )}
              </div>

              {/* Boss Status Display */}
              <div className="text-center pt-2 mb-0">
                {bossStatus === "cooldown" && cooldownTimer > 0 && (
                  <div className="font-semibold">
                    Boss on Cooldown
                  </div>
                )}
                {bossStatus === "in-battle" && (
                  <div className="text-purple-600 font-semibold flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Boss is currently in battle
                  </div>
                )}
                {bossStatus === "active" && (
                  <div className="text-purple-600 font-semibold">
                    Boss available for battle
                  </div>
                )}
              </div>

              {/* Players Joined */}
              <div className="text-center">
                <div className="flex items-center justify-center text-muted-foreground text-sm">
                  <Users className="w-4 h-4 mr-2 text-purple-600" />
                  <span className="text-purple-600">Players joined: {playersOnline}</span>
                </div>
              </div>

              {/* Join/Waiting Button */}
              {!isJoined ? (
                <Button
                  onClick={handleJoin}
                  className="w-full !bg-purple-500 hover:!bg-purple-600 !text-white !border-purple-500 halftone-texture"
                  disabled={!nickname.trim() || bossStatus === "cooldown"}
                >
                  {bossStatus === "cooldown" 
                    ? `Available in: ${Math.floor(cooldownTimer / 60)}m ${String(cooldownTimer % 60).padStart(2, '0')}s`
                    : "Join"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {session?.playersNeededToStart > 0 && (
                      <Button className="flex-1" disabled variant="secondary">
                        Waiting for {session?.playersNeededToStart} more
                        player(s)
                      </Button>
                    )}
                    {isBattleStarted && countdown !== null && (
                      <Button className="flex-1" disabled variant="destructive">
                        {countdown > 0
                          ? `Starting in ${countdown}...`
                          : "Battle Starting!"}
                      </Button>
                    )}
                    {!isCountdownActive && !isBattleStarted && (
                      <Button
                        onClick={handleUnjoin}
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                        title="Leave session"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Nickname Input */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-sm">
                  Nickname:
                </Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={handleNicknameChange}
                  placeholder="Enter your nickname"
                  maxLength={20}
                  disabled={isJoined || bossStatus === "cooldown"}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Card */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="h-[840px] relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Live Leaderboard Rankings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                View performance across different categories
              </p>
            </CardHeader>
            <CardContent className="relative h-full">
              <Tabs defaultValue="teams" className="space-y-3">
                {/* Tabs List */}
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="teams"
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Team Rankings</span>
                    <span className="sm:hidden">Teams</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="individual"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      Individual Rankings
                    </span>
                    <span className="sm:hidden">Players</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="alltime"
                    className="flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="hidden sm:inline">All-Time</span>
                    <span className="sm:hidden">All-Time</span>
                  </TabsTrigger>
                </TabsList>
                {/* Team Leaderboard */}
                <TabsContent value="teams" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Team Rankings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Current event team performance
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">
                          Team
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          DMG
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Correct
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realLeaderboardData.isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              Loading team leaderboard...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : getPaginatedData(teamLeaderboard, "teams")
                          .paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No team data available yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        getPaginatedData(
                          teamLeaderboard,
                          "teams"
                        ).paginatedData.map((team) => (
                          <TableRow
                            key={team.rank}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {getRankBadge(team.rank)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage
                                    src={team.avatar}
                                    alt={team.team}
                                  />
                                  <AvatarFallback>
                                    {team.team[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{team.team}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {team.dmg}
                            </TableCell>
                            <TableCell className="text-right">
                              {team.correct}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(teamLeaderboard, "teams")}
                    onPageChange={(page) => handlePageChange("teams", page)}
                  />
                </TabsContent>
                {/* Individual Leaderboard */}
                <TabsContent value="individual" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Individual Rankings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Current event individual player performance
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">
                          Player
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          DMG
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Correct
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realLeaderboardData.isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              Loading individual leaderboard...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : getPaginatedData(individualLeaderboard, "individual")
                          .paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No player data available yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        getPaginatedData(
                          individualLeaderboard,
                          "individual"
                        ).paginatedData.map((player) => (
                          <TableRow
                            key={player.rank}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {getRankBadge(player.rank)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage
                                    src={player.avatar}
                                    alt={player.player}
                                  />
                                  <AvatarFallback>
                                    {player.player[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {player.player}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {player.dmg}
                            </TableCell>
                            <TableCell className="text-right">
                              {player.correct}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(individualLeaderboard, "individual")}
                    onPageChange={(page) =>
                      handlePageChange("individual", page)
                    }
                  />
                </TabsContent>
                {/* All-Time Leaderboard */}
                <TabsContent value="alltime" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      All-Time Rankings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Historical player performance across all events
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead className="whitespace-normal">
                          Player
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Total DMG
                        </TableHead>
                        <TableHead className="text-right whitespace-normal">
                          Total Correct
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realLeaderboardData.isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              Loading all-time leaderboard...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : getPaginatedData(allTimeLeaderboard, "alltime")
                          .paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No historical data available yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        getPaginatedData(
                          allTimeLeaderboard,
                          "alltime"
                        ).paginatedData.map((player) => (
                          <TableRow
                            key={player.rank}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {getRankBadge(player.rank)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage
                                    src={player.avatar}
                                    alt={player.player}
                                  />
                                  <AvatarFallback>
                                    {player.player[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {player.player}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {player.dmg}
                            </TableCell>
                            <TableCell className="text-right">
                              {player.correct}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    {...getPaginatedData(allTimeLeaderboard, "alltime")}
                    onPageChange={(page) => handlePageChange("alltime", page)}
                  />
                </TabsContent>{" "}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default BossPreview;
