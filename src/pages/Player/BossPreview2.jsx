// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, X, Sword } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeaderboardOverview } from "@/components/leaderboard/LeaderboardOverview";

// ===== STYLES ===== //
import "@/index.css";

// ===== HOOKS ===== //
import useBossPreview from "@/hooks/useBossPreview";
import useBattleQueue from "@/hooks/useBattleQueue";
import { useAuth } from "@/context/useAuth";

// ===== UTILITIES ===== //
import { getBossImageUrl } from "@/utils/imageUtils";
import { getUserInfo } from "@/utils/userUtils";

const BossPreview = () => {
  const { eventBossId, joinCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const bossPreview = useBossPreview(eventBossId, joinCode);
  const battleQueue = useBattleQueue(eventBossId, joinCode);
  const MINIMUM_PLAYERS_REQUIRED = 2;

  const {
    eventBoss,
    eventBossStatus,
    cooldownTimer,
    sessionSize,
    leaderboard,
    loading,
  } = bossPreview;

  const {
    hasJoinedQueue,
    hasJoinedMidGame,
    queueSize,
    isBattleStarted,
    countdownTimer,
    joinQueue,
    leaveQueue,
    joinMidGame,
  } = battleQueue;
  const [nickname, setNickname] = useState("");

  const goBack = () => {
    navigate(-1);
  };

  const validateNickname = (nickname) => {
    const trimmed = nickname.trim();

    if (trimmed.length < 2) {
      return "Nickname must be at least 2 characters long";
    }
    if (trimmed.length > 20) {
      return "Nickname must be 20 characters or less";
    }

    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validPattern.test(trimmed)) {
      return "Nickname can only contain letters, numbers, spaces, hyphens, and underscores";
    }

    if (/\s{2,}/.test(trimmed)) {
      return "Nickname cannot contain consecutive spaces";
    }

    if (/^[-_\s]|[-_\s]$/.test(trimmed)) {
      return "Nickname cannot start or end with spaces, hyphens, or underscores";
    }

    return null;
  };

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m ` : ""}${secs
      .toString()
      .padStart(2, "0")}s`;
  };

  // Auto-fill nickname with username when user is available
  useEffect(() => {
    if (!nickname) {
      const name = getUserInfo()?.username || "";
      setNickname(name);
    }
  }, [user, nickname]);

  const handleJoin = () => {
    const validationError = validateNickname(nickname);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const userInfo = getUserInfo();
    const playerInfo = {
      ...userInfo,
      nickname: nickname.trim(),
    };

    if (eventBossStatus === "in-battle") {
      joinMidGame(playerInfo);
    } else {
      joinQueue(playerInfo);
    }
  };

  useEffect(() => {
    if (countdownTimer === 0) {
      navigate(`/boss-battle/${eventBossId}/${joinCode}`);
    }
  }, [countdownTimer, eventBossId, joinCode, navigate]);

  const handleUnjoin = () => {
    leaveQueue(getUserInfo()?.id);
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
                {eventBoss?.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
              {/* Boss Image */}
              <div className="relative">
                <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
                  {eventBoss?.image ? (
                    <img
                      src={getBossImageUrl(eventBoss.image)}
                      alt={eventBoss?.name || "Boss Image"}
                      className={`w-full h-full object-cover ${
                        eventBossStatus === "cooldown"
                          ? "boss-image-paused"
                          : ""
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
                {eventBossStatus === "cooldown" && cooldownTimer > 0 && (
                  <div className="absolute top-10 right-20 pointer-events-none">
                    <div className="sleeping-z">Z</div>
                    <div
                      className="sleeping-z"
                      style={{ left: "8px", top: "4px" }}
                    >
                      Z
                    </div>
                    <div
                      className="sleeping-z"
                      style={{ left: "16px", top: "8px" }}
                    >
                      Z
                    </div>
                  </div>
                )}
              </div>

              {/* Boss Status Display */}
              <div className="text-center pt-2 mb-0">
                {eventBossStatus === "cooldown" && cooldownTimer > 0 && (
                  <div className="font-semibold">Boss on Cooldown</div>
                )}
                {eventBossStatus === "in-battle" && (
                  <div className="text-purple-600 font-semibold flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Boss is currently in battle
                  </div>
                )}
                {eventBossStatus === "active" && (
                  <div className="text-purple-600 font-semibold">
                    Boss available for battle
                  </div>
                )}
              </div>

              {/* Players Joined */}
              <div className="text-center">
                <div className="flex items-center justify-center text-muted-foreground text-sm">
                  {eventBossStatus !== "cooldown" && (
                    <>
                      <Users className="w-4 h-4 mr-2 text-purple-600" />
                      <span className="text-purple-600">
                        {sessionSize > 0
                          ? `Players joined: ${sessionSize}`
                          : queueSize > 0
                          ? `Players in queue: ${queueSize}`
                          : `No players joined`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Join/Waiting Button */}
              {!hasJoinedQueue && !hasJoinedMidGame ? (
                <Button
                  onClick={handleJoin}
                  className="w-full !bg-purple-500 hover:!bg-purple-600 !text-white !border-purple-500 halftone-texture"
                  disabled={!nickname.trim() || eventBossStatus === "cooldown"}
                >
                  {eventBossStatus === "cooldown"
                    ? `Available in ${formatTime(cooldownTimer)}`
                    : "Join"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {queueSize > 0 && queueSize < MINIMUM_PLAYERS_REQUIRED && (
                      <Button className="flex-1" disabled variant="secondary">
                        Waiting for {MINIMUM_PLAYERS_REQUIRED - queueSize} more
                        player(s)
                      </Button>
                    )}
                    {isBattleStarted && (
                      <Button
                        className="flex-1c w-full halftone-texture"
                        disabled
                        variant="destructive"
                      >
                        {countdownTimer > 0
                          ? `Starting in ${countdownTimer}...`
                          : "Battle Starting!"}
                      </Button>
                    )}
                    {isBattleStarted && countdownTimer === 0 && (
                      <Button
                        className="flex-1c w-full halftone-texture"
                        onClick={() =>
                          navigate(`/boss-battle/${eventBossId}/${joinCode}`)
                        }
                        variant="default"
                      >
                        Return to Battle
                      </Button>
                    )}
                    {!isBattleStarted && (
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
                  disabled={hasJoinedQueue}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Card */}
        <LeaderboardOverview
          leaderboard={leaderboard}
          loading={loading.leaderboard}
          isPreview={true}
        />
      </div>
    </main>
  );
};

export default BossPreview;
