// ===== LIBRARIES ===== //
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeaderboardOverview } from "@/components/leaderboard/LeaderboardOverview";

// ===== HOOKS ===== //
import useBattleMonitor from "@/hooks/useBattleMonitor";

// ===== UTILITIES ===== //
import { formatTime } from "@/utils/helper";

const BossBattleMonitor = () => {
  const { eventId, eventBossId } = useParams();
  const navigate = useNavigate();

  const battleMonitor = useBattleMonitor(eventId, eventBossId);
  const {
    event,
    eventBoss,
    eventBossStatus,
    cooldownTimer,
    eventBossCurrentHP,
    eventBossMaxHP,
    activePlayers,
    leaderboard,
    unauthorizedAccess,
    loading,
  } = battleMonitor;

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (unauthorizedAccess.occurred) {
      navigate(`/manage/events/${eventId}`);
      setTimeout(() => {
        toast.error(unauthorizedAccess.message || "Forbidden: Access denied.");
      }, 100);
    }
  }, [unauthorizedAccess, navigate, eventId]);

  return (
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
                Event Leaderboard
              </h1>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Live
          </Badge>
        </div>

        {/* Event Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  {loading.leaderboard ? "Loading Event..." : event?.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Boss: {eventBoss?.name || "No Boss Selected"} •{" "}
                  {activePlayers || 0} Players Active
                </p>
              </div>
              <Badge
                className={`w-fit ${
                  eventBossStatus === "in-battle"
                    ? "bg-red-500 hover:bg-red-600"
                    : eventBossStatus === "active"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    eventBossStatus === "in-battle" ||
                    eventBossStatus === "active"
                      ? "bg-white animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                {eventBossStatus === "in-battle"
                  ? "Battle Active"
                  : eventBossStatus === "active"
                  ? "Ready to Battle"
                  : eventBossStatus === "cooldown"
                  ? `Cooldown ${formatTime(cooldownTimer)}`
                  : "Pending"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {eventBoss?.name || "No Boss Selected"}
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      eventBossStatus === "active"
                        ? "bg-green-500 animate-pulse"
                        : eventBossStatus === "in-battle"
                        ? "bg-red-500 animate-pulse"
                        : "bg-gray-500"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {eventBossCurrentHP || "--"} / {eventBossMaxHP || "--"} HP
                  </span>
                </div>
              </div>
              {/* Dynamic Progress Bar */}
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`rounded-full h-3 transition-all duration-500 ${
                    eventBossStatus === "cooldown"
                      ? "bg-gray-400 w-0"
                      : eventBossStatus === "active"
                      ? "bg-destructive w-full"
                      : "bg-destructive"
                  }`}
                  style={{
                    width:
                      eventBossStatus === "cooldown"
                        ? "0%"
                        : eventBossStatus === "active"
                        ? "100%"
                        : `${
                            ((eventBossCurrentHP || 0) /
                              (eventBossMaxHP || 100)) *
                            100
                          }%`,
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {eventBossStatus === "cooldown"
                    ? "Defeated"
                    : eventBossStatus === "active"
                    ? "Ready for Battle"
                    : `${Math.round(
                        ((eventBossCurrentHP || 0) / (eventBossMaxHP || 100)) *
                          100
                      )}% Remaining`}
                </span>
                <span>
                  {eventBossStatus === "in-battle" && activePlayers
                    ? `${activePlayers} players active`
                    : eventBossStatus === "cooldown"
                    ? "Battle Complete"
                    : "Waiting for players"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <LeaderboardOverview
          leaderboard={leaderboard}
          isLoading={loading.leaderboard}
          isPreview={true}
          isFullWidth={true}
        />
      </div>
    </div>
  );
};

export default BossBattleMonitor;
