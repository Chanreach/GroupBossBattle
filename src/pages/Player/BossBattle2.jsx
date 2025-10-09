// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Heart,
  Trophy,
  LogOut,
  Sun,
  Moon,
  Smartphone,
  Ambulance,
  Skull,
  Sword,
} from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import LeaderboardBattle from "@/components/leaderboard/LeaderboardBattle";
import BadgeNotification from "@/components/BadgeNotification";

// ===== STYLES ===== //
import "@/index.css";

// ===== HOOKS ===== //
import useBattleSession from "@/hooks/useBattleSession";
import { useAuth } from "@/context/useAuth";
import { useThemeColor } from "@/theme/theme-provider";

// ===== UTILITIES ===== //
import { getUserInfo } from "@/utils/userUtils";

const BossBattle = () => {
  const { user } = useAuth();
  const { eventBossId, joinCode } = useParams();
  const navigate = useNavigate();

  const battleSession = useBattleSession(eventBossId, joinCode);
  const {
    eventBoss,
    eventBossCurrentHP,
    eventBossMaxHP,
    currentQuestion,
    currentQuestionNumber,
    questionTimeRemaining,
    playerLivesRemaining,
    playerTeam,
    isBossTakingDamage,
    isPlayerHurt,
    choiceIndexSelected,
    damageNumbersArray,
    isPlayerKnockedOut,
    isPlayerDead,
    playerRevivalCode,
    revivalTimer,
    teammateKnockedOutCount,
    isDefeatMessageVisible,
    isPodiumCountdownVisible,
    isEventBossDefeated,
    podiumTimer,
    currentPlayerBadge,
    isBadgeDisplaying,
    isDataNotFound,
    hasSubmittedAnswerRef,
    isLoading,
    leaveSession,
    submitAnswer,
    submitRevivalCode,
    removeCurrentBadge,
  } = battleSession;
  const questionTimeLimit = currentQuestion?.timeLimit;

  // ===== UI ANIMATION STATES ===== //
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const { colorScheme, toggleColorScheme } = useThemeColor();

  // ===== PLAYER REVIVAL SYSTEM ===== //
  const [isRevivalDialogVisible, setIsRevivalDialogVisible] = useState(false);
  const [revivalOtpInput, setRevivalOtpInput] = useState("");

  const handleAnswerSelect = (choiceIndex) => {
    // Add immediate haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(250);
    }

    const responseTime = questionTimeLimit - questionTimeRemaining;
    const userInfo = getUserInfo(user);

    if (!userInfo.id) {
      toast.error("User not found, please refresh");
      return;
    }

    submitAnswer(userInfo.id, choiceIndex, responseTime);
  };

  const handleLeave = () => {
    leaveSession();

    // Redirect back to boss preview with boss/event IDs if available
    if (eventBossId && joinCode) {
      navigate(`/boss-preview/${eventBossId}/${joinCode}`);
    } else {
      navigate("/");
    }
  };

  const handleLiveLeaderboard = () => {
    setIsLeaderboardVisible((prev) => !prev);
    console.log("Toggling live leaderboard");
  };

  // Handle OTP completion
  const handleRevivalOtpComplete = (otpValue) => {
    const sanitizedCode = otpValue.trim().toUpperCase();

    if (!sanitizedCode) {
      toast.error("Please enter a revival code");
      return;
    }

    if (sanitizedCode.length !== 6) {
      toast.error("Revival code must be 6 characters");
      return;
    }
    submitRevivalCode(otpValue);
    setIsRevivalDialogVisible(false);
    setRevivalOtpInput("");
  };

  // Get timer color based on time remaining
  const getTimerColor = () => {
    const timePercentage = (questionTimeRemaining / questionTimeLimit) * 100;
    if (timePercentage > 66) {
      return "text-green-500"; // Fast zone (green)
    } else if (timePercentage > 33) {
      return "text-yellow-500"; // Normal zone (yellow)
    } else {
      return "text-red-500"; // Slow zone (red)
    }
  };

  useEffect(() => {
    if (isDataNotFound) {
      navigate(`/boss-preview/${eventBossId}/${joinCode}`);
    }
  }, [isDataNotFound, navigate, eventBossId, joinCode]);

  useEffect(() => {
    if (podiumTimer === 0 && isPodiumCountdownVisible) {
      navigate(`/boss-podium/${eventBossId}/${joinCode}`);
    }
  }, [podiumTimer, isPodiumCountdownVisible, eventBossId, joinCode, navigate]);

  return (
    <main
      className={`h-screen overflow-hidden bg-background relative ${
        isPlayerHurt ? "player-shake" : ""
      } portrait-only`}
    >
      {/* Landscape Rotation Warning */}
      <div className="landscape-warning fixed inset-0 bg-background z-[100] flex items-center justify-center p-4 md:hidden">
        <div className="text-center">
          <div className="mb-4">
            <Smartphone className="w-16 h-16 mx-auto text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Rotate Your Device</h2>
          <p className="text-muted-foreground">
            Please rotate your device to portrait mode to play.
          </p>
        </div>
      </div>

      {/* Full Screen Wrong Answer Flash - z-80 (covers everything below but stays below top controls) */}
      {isPlayerHurt && (
        <div className="absolute inset-0 bg-red-500/60 z-80 animate-pulse"></div>
      )}

      {/* Top Controls - z-90 (above dialog backdrops but below dialog content) */}
      <div className="fixed top-0 left-0 right-0 z-90 p-3 pointer-events-auto">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3 flex-shrink-0 relative">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLeave}
                variant="outline"
                size="sm"
                className={`flex items-center justify-center ${
                  isPlayerKnockedOut || isPlayerDead || isRevivalDialogVisible
                    ? "bg-[#464646] text-white border-[#464646] hover:bg-[#494949] dark:bg-background dark:text-foreground dark:border-border dark:hover:bg-accent"
                    : ""
                }`}
              >
                <LogOut
                  className={`w-4 h-4 rotate-180 ${
                    isPlayerKnockedOut || isPlayerDead || isRevivalDialogVisible
                      ? "text-white dark:text-foreground"
                      : ""
                  }`}
                />
              </Button>
            </div>

            {/* Boss Name - Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h2 className="text-lg font-bold text-center">
                {eventBoss?.name}
              </h2>
              {/* Team Information */}
              {playerTeam && (
                <div className="text-xs text-center text-muted-foreground">
                  Your Team: {playerTeam}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={toggleColorScheme}
                variant="outline"
                size="sm"
                className={`flex items-center justify-center ${
                  isPlayerKnockedOut || isPlayerDead || isRevivalDialogVisible
                    ? "bg-[#464646] text-white border-[#464646] hover:bg-[#494949] dark:bg-background dark:text-foreground dark:border-border dark:hover:bg-accent"
                    : ""
                }`}
              >
                {colorScheme === "light" ? (
                  <Moon
                    className={`w-4 h-4 ${
                      isPlayerKnockedOut ||
                      isPlayerDead ||
                      isRevivalDialogVisible
                        ? "text-white dark:text-foreground"
                        : ""
                    }`}
                  />
                ) : (
                  <Sun
                    className={`w-4 h-4 ${
                      isPlayerKnockedOut ||
                      isPlayerDead ||
                      isRevivalDialogVisible
                        ? "text-white dark:text-foreground"
                        : ""
                    }`}
                  />
                )}
              </Button>
              <Button
                onClick={handleLiveLeaderboard}
                variant="outline"
                size="sm"
                className={`flex items-center justify-center ${
                  isPlayerKnockedOut || isPlayerDead || isRevivalDialogVisible
                    ? "bg-[#464646] text-white border-[#464646] hover:bg-[#494949] dark:bg-background dark:text-foreground dark:border-border dark:hover:bg-accent"
                    : ""
                }`}
              >
                <Trophy
                  className={`w-4 h-4 ${
                    isPlayerKnockedOut || isPlayerDead || isRevivalDialogVisible
                      ? "text-white dark:text-foreground"
                      : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-full flex flex-col p-3 max-w-md mx-auto relative z-10 pt-20">
        {/* Boss Health Section */}
        <div className="mb-3 flex-shrink-0">
          {/* Boss Image with Overlay */}
          <div className="relative">
            <div
              className={`aspect-square bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-600 transition-all duration-500 ${
                isBossTakingDamage ? "bg-red-500/50 shake" : ""
              }`}
            >
              {eventBoss?.image ? (
                <img
                  src={eventBoss.image}
                  alt={eventBoss.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isBossTakingDamage ? "opacity-70" : ""
                  } ${
                    eventBossCurrentHP === 0
                      ? "grayscale brightness-50 blur-sm"
                      : ""
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="text-center">
                    <Sword className="h-16 w-16 text-primary/60 mx-auto mb-2" />
                    <span className="text-sm text-muted-foreground">
                      No Image
                    </span>
                  </div>
                </div>
              )}

              {/* Damage Flash Overlay */}
              {isBossTakingDamage && (
                <div className="absolute inset-0 bg-red-500/40 animate-pulse"></div>
              )}

              {/* Damage Numbers */}
              {damageNumbersArray.map((dmg) => (
                <div
                  key={dmg.id}
                  className={`absolute font-bold text-4xl pointer-events-none z-20 ${
                    dmg.color || "text-red-500"
                  }`}
                  style={{
                    left: `${dmg.x}%`,
                    top: `${dmg.y}%`,
                    transform: "translate(-50%, -50%)",
                    animation: "damage-float 2s ease-out forwards",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  -{dmg.damage}
                  {dmg.responseCategory && (
                    <div className="text-xs font-normal opacity-80 mt-1">
                      {dmg.responseCategory}
                    </div>
                  )}
                </div>
              ))}

              {/* Boss Info Overlay */}
              <div className="absolute top-3 left-0 right-0 z-10">
                <div className="px-3">
                  <div className="relative">
                    <Progress
                      value={
                        eventBossMaxHP > 0
                          ? (eventBossCurrentHP / eventBossMaxHP) * 100
                          : 0
                      }
                      className="h-6 [&>div]:bg-red-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white drop-shadow-lg">
                        {eventBossCurrentHP}/{eventBossMaxHP} HP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boss Defeat Message */}
              {isDefeatMessageVisible && (
                <div className="absolute inset-0 items-center justify-center z-30 animate-fade-in">
                  <div className="mt-30 sm:mt-40 text-center bg-black/80 p-4">
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2 flex items-center justify-center gap-2">
                      <Skull className="w-6 h-6" />
                      {eventBoss.name} has been defeated!
                    </h2>
                  </div>
                  {/* Show countdown under defeat message */}
                  {isPodiumCountdownVisible && (
                    <div className="text-center animate-fade-in">
                      <h3 className="text-lg text-muted-foreground py-2">
                        Redirecting to Podium
                      </h3>
                      <div className="text-3xl font-bold text-white">
                        {podiumTimer}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question Section */}
        <Card className="flex-1 flex flex-col min-h-0">
          {/* Player Lives or Hearts */}
          <div className="flex justify-between items-center px-3 pt-0 -mt-2 -mb-5 h-8">
            {/* Hearts on the left */}
            <div className="flex gap-1">
              {[...Array(3)].map((_, index) => (
                <Heart
                  key={index}
                  className={`w-6 h-6 ${
                    index < playerLivesRemaining
                      ? "text-red-500 fill-red-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Right side - Revive section and Timer */}
            <div className="flex items-center gap-2">
              {/* Revive section - show when any teammates are knocked out */}
              {teammateKnockedOutCount > 0 &&
                !isPlayerKnockedOut &&
                !isPlayerDead &&
                !isRevivalDialogVisible && (
                  <>
                    <span className="text-xs font-bold text-muted-foreground">
                      {teammateKnockedOutCount} Player
                      {teammateKnockedOutCount > 1 ? "s" : ""} Down
                    </span>
                    {/* Revive button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-9 h-9 p-0 flex items-center justify-center text-green-500 border-background-500 border-3 hover:bg-green-500 hover:text-white rounded-full animate-pulse"
                      disabled={
                        isPlayerKnockedOut ||
                        isPlayerDead ||
                        isRevivalDialogVisible
                      }
                      onClick={() => {
                        setIsRevivalDialogVisible(true);
                      }}
                    >
                      <Ambulance className="text-lg font-bold" />
                    </Button>
                  </>
                )}

              {/* Circular Timer */}
              <div className="relative flex items-center justify-center w-9 h-9 p-0">
                <svg
                  className="w-12 h-12 transform rotate-0"
                  viewBox="0 0 36 36"
                >
                  {/* Background circle */}
                  <path
                    className="stroke-current text-muted-foreground/20"
                    fill="none"
                    strokeWidth="3"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress circle */}
                  <path
                    className={`stroke-current transition-all duration-200 ${getTimerColor()}`}
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: "100, 100",
                      strokeDashoffset:
                        100 -
                          Math.floor(
                            (questionTimeRemaining / questionTimeLimit) * 100
                          ) || 0,
                    }}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Timer text in center */}
                <div
                  className={`absolute inset-0 flex items-center justify-center ${getTimerColor()}`}
                >
                  <span className="text-xs font-mono font-bold">
                    {Math.ceil(questionTimeRemaining / 1000)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="px-3 pt-0 flex flex-col h-full">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0 pt-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Q{currentQuestionNumber}
                </Badge>
                {currentQuestion?.categoryName && (
                  <Badge variant="secondary" className="text-xs">
                    {currentQuestion.categoryName}
                  </Badge>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-3 flex-shrink-0">
              <p className="text-sm font-medium">
                {isLoading.question
                  ? isLoading.result
                    ? "Processing your answer..."
                    : "isLoading question..."
                  : currentQuestion?.questionText}
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-2 flex-1 min-h-0 -mb-3">
              {isLoading.question
                ? [...Array(4)].map((_, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full p-2 h-full text-center whitespace-normal font-medium text-sm bg-muted animate-pulse"
                      disabled
                    >
                      isLoading...
                    </Button>
                  ))
                : currentQuestion?.answerChoices.map((choice, index) => {
                    const colors = [
                      "!bg-red-500 hover:!bg-red-600 !text-white !border-red-500", // Option A - Red
                      "!bg-purple-500 hover:!bg-purple-600 !text-white !border-purple-500", // Option B - Purple
                      "!bg-yellow-500 hover:!bg-yellow-600 !text-white !border-yellow-500", // Option C - Yellow
                      "!bg-blue-500 hover:!bg-blue-600 !text-white !border-blue-500", // Option D - Blue
                    ];

                    const selectedColors = [
                      "!bg-red-700 !text-white !border-red-700", // Selected Red
                      "!bg-purple-700 !text-white !border-purple-700", // Selected Purple
                      "!bg-yellow-700 !text-white !border-yellow-700", // Selected Yellow
                      "!bg-blue-700 !text-white !border-blue-700", // Selected Blue
                    ];

                    const isDisabled =
                      isEventBossDefeated ||
                      isPlayerDead ||
                      isPlayerKnockedOut ||
                      isLoading.question ||
                      isLoading.result ||
                      hasSubmittedAnswerRef.current;

                    return (
                      <Button
                        key={`${currentQuestionNumber}-${index}`}
                        variant="outline"
                        className={`w-full p-2 h-full text-center whitespace-normal font-medium transition-all text-sm halftone-texture ${
                          choiceIndexSelected === choice.index
                            ? selectedColors[index]
                            : colors[index]
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isDisabled}
                        onClick={() => {
                          handleAnswerSelect(choice.index);
                        }}
                      >
                        {choice.text}
                      </Button>
                    );
                  })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Battle Leaderboard - Higher z-index (modal overlay) */}
      <LeaderboardBattle
        isOpen={isLeaderboardVisible}
        onClose={() => setIsLeaderboardVisible(false)}
      />

      {/* ========== DIALOGS - Very High z-index (typically 1000+) ========== */}
      {/* Knocked Out Alert Dialog - shadcn/ui AlertDialog has very high z-index by default */}
      <AlertDialog open={isPlayerKnockedOut || isPlayerDead}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            {isPlayerDead ? (
              // Dead state - show death message
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Skull className="w-8 h-8 text-foreground" />
                  <AlertDialogTitle className="text-center text-foreground text-xl font-bold">
                    You are Dead
                  </AlertDialogTitle>
                </div>

                <AlertDialogDescription className="text-center text-muted-foreground text-base">
                  What kills you makes you stronger.
                </AlertDialogDescription>

                <div className="pt-4">
                  <Button
                    onClick={handleLeave}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="w-8 h-8 text-foreground rotate-180" />
                    Leave
                  </Button>
                </div>
              </div>
            ) : (
              // Knocked out state - show revival interface
              <div className="text-center space-y-4">
                {/* Timer at the top */}
                <div className="text-4xl font-bold text-foreground">
                  <Heart className="w-8 h-8 text-red-500 fill-red-500 mb-4 mx-auto heartbeat" />
                  {revivalTimer || 60}s
                </div>

                {/* Main message */}
                <AlertDialogTitle className="text-center text-foreground text-lg font-semibold mb-3">
                  You are down!
                </AlertDialogTitle>

                {/* Instructions */}
                <AlertDialogDescription className="text-center text-muted-foreground mb-4">
                  {playerTeam && (
                    <span className="block mb-0">
                      Find your team:{" "}
                      <b className="text-foreground">{playerTeam}</b>
                    </span>
                  )}
                  Show this code to a teammate to get revived!
                </AlertDialogDescription>

                {/* Revival code - only show if code exists */}
                {playerRevivalCode ? (
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <span className="text-2xl font-mono font-bold text-foreground tracking-wider">
                      {playerRevivalCode.slice(0, 3)}-
                      {playerRevivalCode.slice(3)}
                    </span>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg animate-pulse">
                    <span className="text-lg text-muted-foreground">
                      Waiting for revival code...
                    </span>
                  </div>
                )}
              </div>
            )}
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      {/* OTP Input Dialog for Revival Code - shadcn/ui AlertDialog has very high z-index by default */}
      <AlertDialog
        open={isRevivalDialogVisible}
        onOpenChange={setIsRevivalDialogVisible}
      >
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center flex items-center justify-center gap-2">
              <span>Enter Revival Code</span>
              <Ambulance className="w-5 h-5" />
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Enter the 6-character revival code from your teammate
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <InputOTP
              maxLength={6}
              value={revivalOtpInput}
              inputMode="text"
              onChange={(value) => {
                setRevivalOtpInput(value);
                if (value.length === 6) {
                  handleRevivalOtpComplete(value);
                }
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              -
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRevivalDialogVisible(false);
                  setRevivalOtpInput("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleRevivalOtpComplete(revivalOtpInput)}
                disabled={revivalOtpInput.length !== 6}
              >
                Revive
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Answer Grid Overlay - z-20 (disabled state overlay when knocked out or dead) */}
      {(isPlayerKnockedOut || isPlayerDead) && (
        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
          <div className="text-white text-center">
            {isPlayerDead ? (
              <>
                <p className="text-lg font-bold mb-2">Game Over</p>
                <p className="text-sm opacity-75">
                  You are permanently out of this round
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold mb-2">Waiting for Revival...</p>
                <p className="text-sm opacity-75">
                  Share your code: {playerRevivalCode}
                </p>
              </>
            )}
          </div>
        </div>
      )}

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
  );
};

export default BossBattle;
