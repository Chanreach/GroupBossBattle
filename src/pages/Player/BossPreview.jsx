// ===== LIBRARIES ===== //
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  X,
  Trophy,
  User,
  TrendingUp,
  Clock,
} from "lucide-react";

// ===== HOOKS ===== //
import { useBossPreviewSocket } from "@/hooks/useBossPreviewSocket";
import { useAuth } from "@/context/useAuth";
import { useBossJoin } from "@/context/BossJoinContext";

// ===== UTILS ===== //
import { getGuestDisplayName, getGuestToken } from "@/utils/guestUtils";
import { getBossImageUrl } from "@/utils/imageUtils";

// ===== SERVICES ===== //
import { bossPreviewAPI } from "@/services/api";

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
import { toast } from "sonner";

// ===== STYLES ===== //
import "@/index.css";

const BossPreview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { joinedBoss, isJoinedToAnyBoss, joinBoss, leaveBoss, canJoinBoss } =
    useBossJoin();

  // Get URL parameters
  const bossId = searchParams.get("bossId");
  const eventId = searchParams.get("eventId");
  const joinCode = searchParams.get("joinCode");

  // State for resolving join code to boss/event IDs
  const [resolvedBossId, setResolvedBossId] = useState(bossId);
  const [resolvedEventId, setResolvedEventId] = useState(eventId);

  // Socket connection (use resolved IDs or original IDs)
  const { socket, connectionStatus, isConnected } = useBossPreviewSocket(
    resolvedBossId,
    resolvedEventId
  );

  // Get user token and nickname based on auth status
  const getUserToken = () => {
    if (user?.accessToken) {
      return user.accessToken;
    }
    return getGuestToken();
  };

  const getUserNickname = () => {
    if (user?.username) {
      return user.username;
    }
    return getGuestDisplayName();
  };

  // Component state
  const [nickname, setNickname] = useState("");
  const [userToken] = useState(getUserToken());
  const [isJoined, setIsJoined] = useState(false);
  const [playersOnline, setPlayersOnline] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [readyPlayers, setReadyPlayers] = useState(0);
  const [cooldownInfo, setCooldownInfo] = useState(null);
  const [battleCountdown, setBattleCountdown] = useState(null);
  const [bossData, setBossData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState({
    teams: 1,
    individual: 1,
    alltime: 1,
  });
  const PAGE_SIZE = 10;

  // Enhanced leaderboard data
  const [teamLeaderboard, setTeamLeaderboard] = useState([
    {
      rank: 1,
      team: "Kangaroo",
      dmg: 100,
      correct: 9,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 2,
      team: "Koala",
      dmg: 85,
      correct: 8,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
    {
      rank: 3,
      team: "Shellfish",
      dmg: 68,
      correct: 7,
      avatar: "/src/assets/Placeholder/Profile3.jpg",
    },
    {
      rank: 4,
      team: "Dolphins",
      dmg: 55,
      correct: 6,
      avatar: "/src/assets/Placeholder/Profile4.jpg",
    },
  ]);

  const [individualLeaderboard, setIndividualLeaderboard] = useState([
    {
      rank: 1,
      player: "Sovitep",
      dmg: 100,
      correct: 9,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 2,
      player: "Visoth",
      dmg: 90,
      correct: 8,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
    {
      rank: 3,
      player: "Roth",
      dmg: 75,
      correct: 7,
      avatar: "/src/assets/Placeholder/Profile3.jpg",
    },
    {
      rank: 4,
      player: "Alice",
      dmg: 65,
      correct: 6,
      avatar: "/src/assets/Placeholder/Profile4.jpg",
    },
    {
      rank: 5,
      player: "Bob",
      dmg: 55,
      correct: 5,
      avatar: "/src/assets/Placeholder/Profile5.jpg",
    },
    {
      rank: 6,
      player: "Charlie",
      dmg: 45,
      correct: 4,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 7,
      player: "David",
      dmg: 35,
      correct: 3,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
    {
      rank: 8,
      player: "Emma",
      dmg: 30,
      correct: 3,
      avatar: "/src/assets/Placeholder/Profile3.jpg",
    },
    {
      rank: 9,
      player: "Frank",
      dmg: 25,
      correct: 2,
      avatar: "/src/assets/Placeholder/Profile4.jpg",
    },
    {
      rank: 10,
      player: "Grace",
      dmg: 20,
      correct: 2,
      avatar: "/src/assets/Placeholder/Profile5.jpg",
    },
    {
      rank: 11,
      player: "Henry",
      dmg: 15,
      correct: 1,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 12,
      player: "Ivy",
      dmg: 10,
      correct: 1,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
  ]);

  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([
    {
      rank: 1,
      player: "Python",
      dmg: 300,
      correct: 25,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 2,
      player: "Sovitep",
      dmg: 280,
      correct: 22,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
    {
      rank: 3,
      player: "Visoth",
      dmg: 250,
      correct: 20,
      avatar: "/src/assets/Placeholder/Profile3.jpg",
    },
    {
      rank: 4,
      player: "Alice",
      dmg: 220,
      correct: 18,
      avatar: "/src/assets/Placeholder/Profile4.jpg",
    },
    {
      rank: 5,
      player: "Bob",
      dmg: 200,
      correct: 16,
      avatar: "/src/assets/Placeholder/Profile5.jpg",
    },
    {
      rank: 6,
      player: "Charlie",
      dmg: 180,
      correct: 14,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 7,
      player: "Master",
      dmg: 160,
      correct: 12,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
    {
      rank: 8,
      player: "Legend",
      dmg: 140,
      correct: 11,
      avatar: "/src/assets/Placeholder/Profile3.jpg",
    },
    {
      rank: 9,
      player: "Hero",
      dmg: 120,
      correct: 10,
      avatar: "/src/assets/Placeholder/Profile4.jpg",
    },
    {
      rank: 10,
      player: "Champion",
      dmg: 100,
      correct: 9,
      avatar: "/src/assets/Placeholder/Profile5.jpg",
    },
    {
      rank: 11,
      player: "Warrior",
      dmg: 90,
      correct: 8,
      avatar: "/src/assets/Placeholder/Profile1.jpg",
    },
    {
      rank: 12,
      player: "Fighter",
      dmg: 80,
      correct: 7,
      avatar: "/src/assets/Placeholder/Profile2.jpg",
    },
  ]);

  // Resolve join code to boss and event IDs
  useEffect(() => {
    const resolveJoinCode = async () => {
      if (!joinCode) return; // No join code, use direct IDs

      try {
        setIsLoading(true);
        setError(null);

        console.log("Resolving join code:", joinCode);
        const response = await bossPreviewAPI.getEventBossByJoinCode(joinCode);
        console.log("Join code response:", response);

        if (response.success && response.data) {
          const resolvedBoss = response.data.boss_id.toString();
          const resolvedEvent = response.data.event_id.toString();
          console.log("Resolved IDs:", {
            bossId: resolvedBoss,
            eventId: resolvedEvent,
          });

          setResolvedBossId(resolvedBoss);
          setResolvedEventId(resolvedEvent);
        } else {
          setError(
            "Invalid join code. This boss battle may not exist or has expired."
          );
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error resolving join code:", err);
        setError(
          "Failed to join boss battle. Please check the QR code and try again."
        );
        setIsLoading(false);
      }
    };

    resolveJoinCode();
  }, [joinCode]);

  // Load initial boss data
  useEffect(() => {
    const loadBossData = async () => {
      // Wait for join code resolution if needed
      const finalBossId = resolvedBossId || bossId;
      const finalEventId = resolvedEventId || eventId;

      console.log("Loading boss data with IDs:", {
        finalBossId,
        finalEventId,
        joinCode,
        resolvedBossId,
        resolvedEventId,
        bossId,
        eventId,
      });

      if (!finalBossId || !finalEventId) {
        // Only show error if no join code is being processed AND we have no direct IDs
        if (!joinCode && (!bossId || !eventId)) {
          setError("Boss ID and Event ID are required");
          setIsLoading(false);
        }
        // If we have a join code but no resolved IDs yet, keep loading
        console.log("Waiting for IDs to be resolved...");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching boss preview data for:", {
          eventId: finalEventId,
          bossId: finalBossId,
        });
        const response = await bossPreviewAPI.getBossPreview(
          finalEventId,
          finalBossId
        );

        if (response.success) {
          setBossData(response.data.boss);
          setCooldownInfo(response.data.cooldown);
        } else {
          setError("Failed to load boss data");
        }
      } catch (err) {
        console.error("Error loading boss data:", err);
        setError(err.response?.data?.message || "Failed to load boss data");
      } finally {
        setIsLoading(false);
      }
    };

    loadBossData();
  }, [resolvedBossId, resolvedEventId, bossId, eventId]);

  // Socket event handlers
  useEffect(() => {
    // Only redirect if we have neither direct IDs nor a join code
    if (!bossId && !eventId && !joinCode) {
      console.error("Boss ID, Event ID, or Join Code is required");
      navigate("/"); // Redirect to home if missing parameters
      return;
    }
  }, [bossId, eventId, joinCode, navigate]);

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    const currentBossId = resolvedBossId || bossId;
    const currentEventId = resolvedEventId || eventId;

    // Auto-join boss preview when socket connects (just for viewing, no nickname needed)
    if (currentBossId && currentEventId && !isJoined && userToken) {
      console.log("Auto-joining boss preview as viewer...");

      socket.emit("boss-preview:view", {
        bossId: currentBossId,
        eventId: currentEventId,
        token: userToken,
      });
    }

    // Boss preview event handlers
    socket.on("boss-preview:viewing", (data) => {
      console.log("Successfully viewing boss preview:", data);
      setBossData(data.boss);
      setPlayersOnline(data.session.totalPlayers);
      setReadyPlayers(data.session.readyPlayers);
      setCooldownInfo(data.session.cooldown);
      console.log(
        "Updated player count from viewing event:",
        data.session.totalPlayers
      );
    });

    socket.on("boss-preview:joined", (data) => {
      console.log("Successfully joined boss preview:", data);
      const finalBossId = resolvedBossId || bossId;
      const finalEventId = resolvedEventId || eventId;
      const serverNickname = data.player?.nickname || nickname.trim();

      setIsJoined(true); // Set joined status
      setIsReady(true); // Automatically ready when joined
      setBossData(data.boss);
      setPlayersOnline(data.session.totalPlayers);
      setReadyPlayers(data.session.readyPlayers);
      setCooldownInfo(data.session.cooldown);
      setNickname(serverNickname); // Use server nickname

      // Update global join context with server nickname
      joinBoss(finalBossId, finalEventId, serverNickname);

      toast.success("Successfully joined boss battle!");
      console.log(
        "Updated player count from joined event:",
        data.session.totalPlayers
      );
    });

    socket.on("boss-preview:viewer-joined", (data) => {
      console.log("Another viewer joined:", data);
      setPlayersOnline(data.totalPlayers);
      console.log(
        "Updated player count from viewer-joined event:",
        data.totalPlayers
      );
    });

    socket.on("boss-preview:player-joined", (data) => {
      console.log("Another player joined:", data);
      setPlayersOnline(data.totalPlayers);
      setReadyPlayers(data.readyPlayers || 0); // Update ready count too
      console.log(
        "Updated player count from player-joined event:",
        data.totalPlayers
      );
    });

    socket.on("boss-preview:viewer-left", (data) => {
      console.log("Viewer left:", data);
      setPlayersOnline(data.session.totalPlayers);
      console.log(
        "Updated player count from viewer-left event:",
        data.session.totalPlayers
      );
    });

    socket.on("boss-preview:player-left", (data) => {
      console.log("Player left:", data);
      setPlayersOnline(data.session.totalPlayers);
      setReadyPlayers(data.session.readyPlayers);
      console.log(
        "Updated player count from player-left event:",
        data.session.totalPlayers
      );
    });

    socket.on("boss-preview:player-ready", (data) => {
      console.log("Player ready:", data);
      setReadyPlayers(data.session.readyPlayers);
    });

    // Note: Removed ready-confirmed, ready-cancelled, and player-cancelled handlers
    // since joining now automatically makes players ready

    socket.on("boss-preview:battle-starting", (data) => {
      console.log("Battle starting:", data);
      setBattleCountdown(data.countdown);
    });

    socket.on("boss-preview:battle-countdown", (data) => {
      setBattleCountdown(data.countdown);
    });

    socket.on("boss-preview:battle-started", (data) => {
      console.log("Battle started:", data);
      // Redirect to battle page
      navigate(data.redirectTo);
    });

    socket.on("boss-preview:leaderboard-data", (data) => {
      console.log("Received leaderboard data:", data);
      if (data.teamLeaderboard) setTeamLeaderboard(data.teamLeaderboard);
      if (data.individualLeaderboard)
        setIndividualLeaderboard(data.individualLeaderboard);
      if (data.allTimeLeaderboard)
        setAllTimeLeaderboard(data.allTimeLeaderboard);

      // Update session info if available and player hasn't joined yet
      if (data.session && !isJoined) {
        setPlayersOnline(data.session.totalPlayers);
        setReadyPlayers(data.session.readyPlayers);
      }
    });

    socket.on("boss-preview:left", (data) => {
      console.log("Successfully left boss battle:", data);
      setIsJoined(false);
      setIsReady(false);
      setNickname("");
      setBattleCountdown(null); // Reset countdown when leaving
      setCooldownInfo(null); // Reset cooldown info
      setPlayersOnline(data.session?.totalPlayers || 0);
      setReadyPlayers(data.session?.readyPlayers || 0);

      // Update global join context
      leaveBoss();

      // Restart viewing mode since user is still on the page
      const finalBossId = resolvedBossId || bossId;
      const finalEventId = resolvedEventId || eventId;
      if (finalBossId && finalEventId && userToken) {
        console.log("Restarting view mode after leaving as player...");
        socket.emit("boss-preview:view", {
          bossId: finalBossId,
          eventId: finalEventId,
          token: userToken,
        });
      }

      toast.success("Left the battle");
    });

    socket.on("boss-preview:error", (data) => {
      console.error("Boss preview error:", data.message);
      toast.error(data.message);

      // If error indicates player is not in the session but we think they are,
      // reset the local state
      if (
        data.message.includes("not found") ||
        data.message.includes("session")
      ) {
        console.log(
          "Detected state inconsistency, resetting local join state..."
        );
        setIsJoined(false);
        setIsReady(false);
        setNickname("");
        // Don't clear global state here as player might be joined to another boss
      }
    });

    socket.on("boss-preview:countdown-cancelled", (data) => {
      console.log("Battle countdown cancelled:", data.message);
      setBattleCountdown(null);
      toast.warning(data.message);
    });

    // Request leaderboard data (send boss/event IDs for cases where player hasn't joined yet)
    const finalBossId = resolvedBossId || bossId;
    const finalEventId = resolvedEventId || eventId;

    if (finalBossId && finalEventId) {
      socket.emit("boss-preview:get-leaderboard", {
        bossId: finalBossId,
        eventId: finalEventId,
      });
    }

    // Cleanup event listeners
    return () => {
      socket.off("boss-preview:viewing");
      socket.off("boss-preview:joined");
      socket.off("boss-preview:left");
      socket.off("boss-preview:viewer-joined");
      socket.off("boss-preview:viewer-left");
      socket.off("boss-preview:player-joined");
      socket.off("boss-preview:player-left");
      socket.off("boss-preview:player-ready");
      socket.off("boss-preview:battle-starting");
      socket.off("boss-preview:battle-countdown");
      socket.off("boss-preview:battle-started");
      socket.off("boss-preview:countdown-cancelled");
      socket.off("boss-preview:leaderboard-data");
      socket.off("boss-preview:error");
    };
  }, [
    socket,
    isConnected,
    navigate,
    resolvedBossId,
    resolvedEventId,
    bossId,
    eventId,
  ]);

  // Sync local state with global boss join context
  useEffect(() => {
    const finalBossId = resolvedBossId || bossId;

    // If the user is joined to this specific boss in global context, sync local state
    if (joinedBoss && joinedBoss.bossId === finalBossId) {
      setIsJoined(true);
      setIsReady(true);
      setNickname(joinedBoss.nickname);
    }
    // If the user is joined to a different boss, make sure local state reflects not joined
    else if (
      isJoinedToAnyBoss &&
      joinedBoss &&
      joinedBoss.bossId !== finalBossId
    ) {
      setIsJoined(false);
      setIsReady(false);
    }
  }, [joinedBoss, isJoinedToAnyBoss, resolvedBossId, bossId]);

  // Enhanced leaderboard data (removed duplicate declaration)
  /*
  const teamLeaderboard = [
    // ... removed duplicate data
  ];
  */

  // Join boss preview when nickname is provided
  const handleJoinPreview = () => {
    const finalBossId = resolvedBossId || bossId;
    const finalEventId = resolvedEventId || eventId;

    // Check if user can join this boss (not already joined to another)
    if (!canJoinBoss(finalBossId)) {
      toast.error(
        `You are already joined to another boss battle. Please leave that battle first.`
      );
      return;
    }

    if (
      nickname.trim() &&
      socket &&
      isConnected &&
      !isJoined &&
      finalBossId &&
      finalEventId &&
      userToken
    ) {
      console.log("Joining boss preview with:", {
        bossId: finalBossId,
        eventId: finalEventId,
        nickname: nickname.trim(),
      });

      socket.emit("boss-preview:join", {
        bossId: finalBossId,
        eventId: finalEventId,
        nickname: nickname.trim(),
        token: userToken,
      });
    } else {
      console.error("Cannot join - missing data:", {
        nickname: nickname.trim(),
        socket: !!socket,
        isConnected,
        isJoined,
        finalBossId,
        finalEventId,
        userToken: !!userToken,
      });
    }
  };

  // Handle join button click
  const handleJoinOrReady = () => {
    if (!isJoined) {
      handleJoinPreview();
    }
    // No separate ready step - joining automatically makes player ready
  };

  // Handle leave battle
  const handleLeaveBattle = () => {
    if (socket && isJoined) {
      socket.emit("boss-preview:leave");
      setIsJoined(false);
      setIsReady(false);
      setNickname(""); // Clear nickname so they can enter a new one
      toast.success("Left the battle");
    }
  };

  const goBack = () => {
    navigate("/qr"); // Go to QR page
  };

  // Format cooldown time
  const formatCooldownTime = (timeRemaining) => {
    if (!timeRemaining) return "00:00";
    const totalSeconds = Math.ceil(timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Check if join button should be disabled
  const isJoinButtonDisabled = () => {
    const finalBossId = resolvedBossId || bossId;

    if (cooldownInfo?.isOnCooldown) return true;
    if (!nickname.trim()) return true;
    if (isJoined) return true; // Already joined

    // Check if user is joined to a different boss
    if (isJoinedToAnyBoss && !canJoinBoss(finalBossId)) return true;

    return false;
  };

  // Get button text based on state
  const getButtonText = () => {
    const finalBossId = resolvedBossId || bossId;

    if (cooldownInfo?.isOnCooldown) {
      return `Boss is on cooldown. Time remaining: ${cooldownInfo.formattedTime}`;
    }

    // Check if user is joined to a different boss
    if (isJoinedToAnyBoss && !canJoinBoss(finalBossId)) {
      return `Already joined to another boss battle`;
    }

    if (!isJoined) {
      return "Join Boss Battle";
    }
    if (battleCountdown !== null) {
      return `Battle starting in ${battleCountdown}...`;
    }
    return `Waiting for ${Math.max(0, 2 - readyPlayers)} more player${
      readyPlayers === 1 ? "" : "s"
    }...`;
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

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-sm mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading boss data...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-sm mx-auto">
            <Card className="overflow-hidden border-red-200">
              <CardContent className="p-6 text-center">
                <div className="text-red-500 mb-4">
                  <X className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="font-semibold text-red-700 mb-2">Error</h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content - Only show when loaded and no error */}
        {!isLoading && !error && (
          <>
            <div className="max-w-sm mx-auto">
              <Card className="overflow-hidden">
                {/* Boss Name Header */}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">
                    {bossData?.name || "CS BOSS"}
                  </CardTitle>
                  {connectionStatus === "disconnected" && (
                    <p className="text-sm text-red-500">Connecting...</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4 px-6 pb-6">
                  {/* Boss Image */}
                  <div className="relative">
                    <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={getBossImageUrl(bossData?.image)}
                        alt={bossData?.name || "CS Boss"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder-boss.png"; // Fallback image from public folder
                        }}
                      />
                    </div>
                  </div>

                  {/* Socket Connection Status */}
                  <div className="text-center py-2">
                    <div className="flex items-center justify-center text-xs">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          connectionStatus === "connected"
                            ? "bg-green-500"
                            : connectionStatus === "connecting"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={`${
                          connectionStatus === "connected"
                            ? "text-green-600"
                            : connectionStatus === "connecting"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {connectionStatus === "connected"
                          ? "Connected"
                          : connectionStatus === "connecting"
                          ? "Connecting..."
                          : "Disconnected"}
                      </span>
                    </div>
                  </div>

                  {/* Players Online */}
                  <div className="text-center py-2">
                    <div className="flex items-center justify-center text-muted-foreground text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Users viewing: {playersOnline}</span>
                    </div>
                    {readyPlayers > 0 && (
                      <div className="flex items-center justify-center text-green-600 text-sm mt-1">
                        <span>Ready for battle: {readyPlayers}</span>
                      </div>
                    )}
                  </div>

                  {/* Battle Countdown */}
                  {battleCountdown !== null && (
                    <div className="text-center py-2">
                      <div className="text-lg font-bold text-orange-600">
                        Battle starting in {battleCountdown}...
                      </div>
                    </div>
                  )}

                  {/* Join Button or Wait Status */}
                  {!isJoined ? (
                    <Button
                      onClick={handleJoinOrReady}
                      className="w-full"
                      disabled={isJoinButtonDisabled()}
                      variant={
                        cooldownInfo?.isOnCooldown ? "secondary" : "default"
                      }
                    >
                      {getButtonText()}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button className="flex-1" disabled variant="secondary">
                        {getButtonText()}
                      </Button>
                      <Button
                        onClick={handleLeaveBattle}
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                        title="Leave Battle"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Testing buttons for development */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => {
                        leaveBoss();
                        setIsJoined(false);
                        setIsReady(false);
                        setNickname("");
                        setBattleCountdown(null);
                        setCooldownInfo(null);
                        setPlayersOnline(0);
                        setReadyPlayers(0);
                        toast.success("Reset join state");
                      }}
                      variant="destructive"
                      size="sm"
                      className="text-xs"
                    >
                      Reset State
                    </Button>
                    <Button
                      onClick={() => {
                        const finalBossId = resolvedBossId || bossId;
                        const finalEventId = resolvedEventId || eventId;
                        if (finalBossId && finalEventId) {
                          navigate(
                            `/boss-battle?bossId=${finalBossId}&eventId=${finalEventId}`
                          );
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Go to Battle
                    </Button>
                  </div>

                  {/* Nickname Input - Only show when not joined */}
                  {!isJoined && (
                    <div className="space-y-2">
                      <Label htmlFor="nickname" className="text-sm">
                        Enter nickname to join battle:
                      </Label>
                      <Input
                        id="nickname"
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter your nickname"
                        disabled={cooldownInfo?.isOnCooldown}
                        maxLength={20}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !isJoinButtonDisabled()) {
                            handleJoinOrReady();
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Nickname required to participate in battle (2-20
                        characters)
                      </p>
                    </div>
                  )}

                  {/* Joined Status */}
                  {isJoined && (
                    <div className="text-center py-2">
                      <div className="flex items-center justify-center text-green-600 text-sm">
                        <span>
                          ✓ Ready for battle as:{" "}
                          <strong>{nickname || "(No nickname)"}</strong>
                        </span>
                      </div>
                    </div>
                  )}
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
                          {getPaginatedData(
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
                                  <span className="font-medium">
                                    {team.team}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {team.dmg}
                              </TableCell>
                              <TableCell className="text-right">
                                {team.correct}
                              </TableCell>
                            </TableRow>
                          ))}
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
                          {getPaginatedData(
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
                          ))}
                        </TableBody>
                      </Table>
                      <PaginationControls
                        {...getPaginatedData(
                          individualLeaderboard,
                          "individual"
                        )}
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
                          {getPaginatedData(
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
                          ))}
                        </TableBody>
                      </Table>
                      <PaginationControls
                        {...getPaginatedData(allTimeLeaderboard, "alltime")}
                        onPageChange={(page) =>
                          handlePageChange("alltime", page)
                        }
                      />
                    </TabsContent>{" "}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default BossPreview;
