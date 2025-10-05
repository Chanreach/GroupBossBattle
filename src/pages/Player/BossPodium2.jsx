// ===== LIBRARIES ===== //
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Home, Users, Trophy, Crown, Medal, Award } from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeaderboardOverview } from "@/components/leaderboard/LeaderboardOverview";
import BadgeNotification from "@/components/BadgeNotification";

// ===== LAYOUTS ===== //
import Spotlight from "@/lib/Spotlight";

// ===== CONTEXTS ===== //
import useBossPodium from "@/hooks/useBossPodium";

// ===== UTILITIES ===== //
import { startConfettiCelebration } from "@/lib/Confetti";

// ===== AUDIOS ===== //
import victoryDrumsSound from "@/assets/Audio/victory-drums.mp3";
import victoryThemeSound from "@/assets/Audio/victory-theme.mp3";

// ===== STYLES ===== //
import "@/index.css";

const BossPodium = () => {
  const { eventBossId, joinCode } = useParams();
  const navigate = useNavigate();

  const bossPodium = useBossPodium(eventBossId, joinCode);
  const {
    eventBoss,
    battleState,
    currentPlayerBadge,
    isBadgeDisplaying,
    leaderboard,
    podium,
    isLoading,
    hasJoinedPodium,
    hasRequestedPodium,
    isLeaderboardEmpty,
    isPodiumEmpty,
    removeCurrentBadge,
  } = bossPodium;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goBack = () => {
    navigate("/");
  };

  // Podium helpers
  const getPodiumColor = (rank) => {
    if (rank === 1) return "bg-yellow-500"; // Gold
    if (rank === 2) return "bg-gray-400"; // Silver
    if (rank === 3) return "bg-amber-600"; // Bronze
    return "bg-gray-500";
  };

  const getPodiumIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-white" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-white" />;
    if (rank === 3) return <Award className="w-4 h-4 text-white" />;
    return null;
  };

  useEffect(() => {
    if (!hasJoinedPodium || !hasRequestedPodium) return;

    const shouldNavigate =
      !battleState ||
      battleState !== "ended" ||
      (isLeaderboardEmpty && !isLoading.leaderboard) ||
      (isPodiumEmpty && !isLoading.podium);
    console.log({ shouldNavigate });

    if (shouldNavigate) {
      navigate(`/boss-preview/${eventBossId}/${joinCode}`);
      console.log("Navigating away from podium due to battle state...");
    }
  }, [
    hasJoinedPodium,
    hasRequestedPodium,
    battleState,
    isLeaderboardEmpty,
    isPodiumEmpty,
    isLoading,
    navigate,
    eventBossId,
    joinCode,
  ]);

  // Confetti celebration and victory sounds on component mount
  useEffect(() => {
    // Audio objects
    const victoryDrumsAudio = new Audio(victoryDrumsSound);
    const victoryThemeAudio = new Audio(victoryThemeSound);
    victoryDrumsAudio.volume = 0.03;
    victoryThemeAudio.volume = 0.02;

    // Keep track of timeouts and confetti cleanup
    let soundTimeout = null;
    let themeTimeout = null;
    let confettiCleanup = null;

    const playVictorySounds = async () => {
      try {
        // Play victory drums first
        console.log("Playing victory drums...");
        victoryDrumsAudio.currentTime = 0;
        await victoryDrumsAudio.play();

        // Play victory theme 3 seconds after drums start
        themeTimeout = setTimeout(async () => {
          console.log("Playing victory theme...");
          victoryThemeAudio.currentTime = 0;
          victoryThemeAudio.loop = false; // Ensure no loop
          await victoryThemeAudio.play();
          console.log("Victory sounds sequence complete!");
        }, 3800); // 4 seconds delay
      } catch (error) {
        console.log("Victory audio play failed:", error);
      }
    };

    const triggerVictoryConfetti = async () => {
      // Start confetti celebration with 3 bursts and store cleanup function
      confettiCleanup = await startConfettiCelebration({
        origin: { y: 0.6 }, // Start from 60% down the screen (good for podium)
        maxBursts: 3, // 3 confetti bursts
        burstInterval: 1500, // 1.5 seconds between bursts
        onComplete: () => {
          console.log("Victory confetti celebration complete!");
          confettiCleanup = null; // Clear reference when complete
        },
      });
    };

    // Start victory sounds immediately and confetti after a short delay
    soundTimeout = setTimeout(() => {
      playVictorySounds(); // Start sounds immediately
      triggerVictoryConfetti(); // Start confetti
    }, 100);

    // Cleanup function to stop everything when component unmounts or navigates away
    return () => {
      // Clear all timeouts
      if (soundTimeout) clearTimeout(soundTimeout);
      if (themeTimeout) clearTimeout(themeTimeout);
      
      // Stop and cleanup audio
      victoryDrumsAudio.pause();
      victoryDrumsAudio.currentTime = 0;
      victoryThemeAudio.pause();
      victoryThemeAudio.currentTime = 0;
      
      // Stop confetti animation
      if (confettiCleanup) {
        console.log("Cleaning up confetti due to component unmount/navigation");
        confettiCleanup();
        confettiCleanup = null;
      }
      
      // Additional cleanup: clear any remaining confetti particles from DOM
      if (window.confetti) {
        // Stop any ongoing confetti animations
        window.confetti.reset && window.confetti.reset();
      }
    };
  }, []);

  return (
    <Spotlight
      duration={3500}
      fadeOutDuration={2000}
      className="flex-grow min-h-screen"
    >
      {({ showSpotlight, revealComplete }) => (
        <main className="flex-grow min-h-screen relative">
          <div
            className={`container mx-auto p-3 sm:p-6 max-w-4xl ${
              revealComplete
                ? "opacity-100 transform translate-y-0"
                : "opacity-100 transform translate-y-1"
            }`}
          >
            {/* Back Button */}
            <Button onClick={goBack} variant="outline" className="mb-4">
              <Home className="w-4 h-4 mr-2" /> Home
            </Button>

            {/* ===== Victory Podium Section ===== */}
            <Card
              className={`mb-8 ${showSpotlight ? "spotlight-focused" : ""}`}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
                  <div className="flex items-center justify-center gap-3">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <span>Victory Podium</span>
                  </div>
                </CardTitle>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                  {eventBoss?.name} has been defeated!
                </p>
              </CardHeader>
              <CardContent>
                {/* Podium */}
                <div className="flex items-end justify-center gap-6 pt-4">
                  {podium.length > 0 ? (
                    podium.map((team, index) => {
                      // Height for podium effect
                      let height =
                        team.rank === 1 ? 120 : team.rank === 2 ? 80 : 60;
                      // Animation classes based on rank - only for the team icon
                      let animationClass =
                        team.rank === 1
                          ? "animate-bounce-excited-first"
                          : team.rank === 2
                          ? "animate-bounce-excited-second"
                          : "animate-bounce-excited-third";
                      return (
                        <div
                          key={index}
                          className={`flex flex-col items-center ${
                            index === 0
                              ? "order-2"
                              : index === 1
                              ? "order-1"
                              : "order-3"
                          }`}
                        >
                          <div className="mb-2 relative">
                            <div
                              className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-200 dark:border-gray-700 shadow-lg ${animationClass} flex items-center justify-center`}
                              style={{
                                background:
                                  team.rank === 1
                                    ? "linear-gradient(135deg, #FFD700, #FFA500)"
                                    : team.rank === 2
                                    ? "linear-gradient(135deg, #C0C0C0, #808080)"
                                    : "linear-gradient(135deg, #CD7F32, #8B4513)",
                              }}
                            >
                              <Users className="w-10 h-10 md:w-12 md:h-12 text-white" />
                            </div>
                            <div
                              className={`absolute -top-3 -right-3 w-8 h-8 rounded-full ${getPodiumColor(
                                team.rank
                              )} flex items-center justify-center shadow-lg border-2 border-white`}
                            >
                              {getPodiumIcon(team.rank)}
                            </div>
                          </div>
                          <div className="font-bold text-lg mb-1 text-center">
                            {team.name || `Team ${team.id}`}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {(
                              team.totalDamageDealt ||
                              team.totalDamage ||
                              0
                            ).toLocaleString()}{" "}
                            DMG
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {team.playerCount} Player
                            {team.playerCount !== 1 ? "s" : ""}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {(team.accuracy * 100).toFixed(2)}% Accuracy
                          </div>
                          <div
                            className={`w-20 md:w-24 h-6 rounded-t-lg ${getPodiumColor(
                              team.rank
                            )} text-white flex items-center justify-center font-bold text-sm shadow-lg`}
                            style={{ height: `${height}px` }}
                          >
                            {team.rank === 1
                              ? "1st"
                              : team.rank === 2
                              ? "2nd"
                              : "3rd"}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-lg font-medium mb-2">
                        {isLoading.leaderboard
                          ? "Loading battle results..."
                          : "No battle results yet"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isLoading.leaderboard
                          ? "Please wait while we process the final rankings..."
                          : "Complete a boss battle to see the victory podium"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ===== Final Results Leaderboard ===== */}
            <LeaderboardOverview
              leaderboard={leaderboard}
              isLoading={isLoading.leaderboard}
              isPreview={false}
            />
          </div>

          {currentPlayerBadge && isBadgeDisplaying && (
            <div className="fixed top-4 right-4 z-30 space-y-2">
              <div
                style={{
                  transform: "translateY(0.5rem)",
                }}
              >
                <BadgeNotification
                  badge={currentPlayerBadge}
                  onClose={removeCurrentBadge}
                  duration={3000}
                />
              </div>
            </div>
          )}
        </main>
      )}
    </Spotlight>
  );
};

export default BossPodium;
