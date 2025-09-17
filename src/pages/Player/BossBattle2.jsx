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
import BattleLeaderboard from "@/layouts/BossBattleLeaderboard2";
import BadgeNotification from "@/components/BadgeNotification";

// ===== STYLES ===== //
import "@/index.css";

// ===== HOOKS ===== //
import useBattleSession from "@/hooks/useBattleSession";

// ===== UTILITIES ===== //
import { getBossImageUrl } from "@/utils/imageUtils";
import { getUserInfo } from "@/utils/userUtils";

const BossBattle = () => {
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
    isDefeatCountdownVisible,
    loading,
    submitAnswer,
    submitRevivalCode,
  } = battleSession;
  const questionMaxTimeSeconds = currentQuestion?.timeLimit / 1000;

  const handleAnswerSelect = (choiceIndex) => {
    const responseTime = currentQuestion.timeLimit - questionTimeRemaining;
    submitAnswer(getUserInfo().id, choiceIndex, responseTime);
  };

  // ===== TIMING CONFIGURATION ===== //
  const BOSS_DEFEAT_MESSAGE_DELAY_MS = 1000;
  const BOSS_DEFEAT_COUNTDOWN_DELAY_MS = 1000;
  const BOSS_DEFEAT_COUNTDOWN_DURATION_SECONDS = 5;

  // ===== UI ANIMATION STATES ===== //
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);

  // ===== BOSS DEFEAT STATES ===== //
  const [bossDefeatCountdownNumber, setBossDefeatCountdownNumber] = useState(3);

  // ===== PLAYER REVIVAL SYSTEM ===== //
  const [isRevivalDialogVisible, setIsRevivalDialogVisible] = useState(false);
  const [revivalOtpInput, setRevivalOtpInput] = useState("");

  // ===== SOCKET.IO INTEGRATION ===== //
  // useEffect(() => {
  //   if (!socket) {
  //     console.error("No socket connection available");
  //     return;
  //   }

  //   // Set initial loading state
  //   setIsLoadingQuestion(true);

  //   socket.emit("question:request", {
  //     eventBossId,
  //   });

  //   socket.on("question:received", (data) => {
  //     // Update question data with new format
  //     if (data.question) {
  //       // Keep the original choice structure with indices
  //       const choicesWithIndices = data.question.choices.map(
  //         (choice, arrayIndex) => ({
  //           originalIndex: choice.index, // The index from backend after shuffling
  //           displayIndex: arrayIndex, // The display position (0, 1, 2, 3)
  //           text: choice.text,
  //         })
  //       );

  //       setCurrentQuestionData({
  //         questionId: data.question.id,
  //         categoryId: data.question.categoryId,
  //         categoryName: data.question.categoryName,
  //         questionText: data.question.text,
  //         timeLimitSeconds: data.question.timeLimit, // Already in seconds
  //         answerOptions: choicesWithIndices.map((c) => c.text), // For display
  //         choicesWithIndices: choicesWithIndices, // Keep full structure for submission
  //         correctAnswerIndex: data.question.correctAnswerIndex,
  //         questionNumber: data.question.questionNumber,
  //       });

  //       // Reset question timer and states
  //       setQuestionTimeRemaining(data.question.timeLimit);
  //       setCurrentQuestionNumber(data.question.questionNumber);
  //       setIsLoadingQuestion(false);
  //       setIsWaitingForResult(false); // **NEW: Clear waiting state for new question**
  //       setPlayerSelectedAnswer(""); // **NEW: Clear previous selection**
  //     }

  //     // Update battle status
  //     if (data.battleStatus) {
  //       // Update boss health with dynamic max HP
  //       setBossCurrentHealth(data.battleStatus.bossCurrentHp);
  //       setBossMaxHealth(data.battleStatus.bossMaxHp);
  //       setPlayerLivesRemaining(data.battleStatus.playerHearts);
  //       setCurrentPlayerTeam({
  //         teamId: data.battleStatus.playerTeamId,
  //         teamName:
  //           data.battleStatus.playerTeamName ||
  //           `Team ${data.battleStatus.playerTeamId}`, // **FIXED: Use actual team name or fallback**
  //       });

  //       // Update knocked out status
  //       if (data.battleStatus.isKnockedOut) {
  //         setIsCurrentPlayerKnockedOut(true);
  //       }
  //     }
  //   });

  //   // Listen for answer result feedback
  //   socket.on("answer-result", (data) => {
  //     // Always clear loading and waiting states when we get a result
  //     setIsLoadingQuestion(false);
  //     setIsWaitingForResult(false); // **NEW: Clear waiting state**

  //     if (data.isCorrect) {
  //       // Correct answer - play sound effect and show damage number
  //       if (punchAudioRef.current) {
  //         punchAudioRef.current.currentTime = 0;
  //         punchAudioRef.current.play().catch((error) => {
  //           console.log("Audio play failed:", error);
  //         });
  //       }

  //       // Generate floating damage number if damage was dealt
  //       if (data.damage && data.damage > 0) {
  //         generateDamageNumber(data.damage, data.responseCategory || "NORMAL");

  //         // Show boss taking damage animation
  //         setIsBossTakingDamage(true);
  //         setTimeout(() => setIsBossTakingDamage(false), 500);
  //       }
  //     } else {
  //       // Wrong answer - play hurt sound and show feedback
  //       playHurtSound();
  //       setIsPlayerHurt(true);
  //       setTimeout(() => {
  //         setIsPlayerHurt(false);
  //       }, 500);
  //     }

  //     // Update battle status if provided
  //     if (data.battleStatus) {
  //       setBossCurrentHealth(data.battleStatus.bossCurrentHp);
  //       setBossMaxHealth(data.battleStatus.bossMaxHp);
  //       setPlayerLivesRemaining(data.battleStatus.playerHearts);
  //       if (data.battleStatus.isKnockedOut) {
  //         setIsCurrentPlayerKnockedOut(true);
  //       }
  //     }

  //     // **FIXED: Request next question after processing answer result**
  //     // Only request if player is not knocked out and boss is still alive
  //     if (
  //       !data.battleStatus?.isKnockedOut &&
  //       data.battleStatus?.bossCurrentHp > 0
  //     ) {
  //       // Add a small delay to ensure all state updates are processed
  //       setTimeout(() => {
  //         if (socket && (eventBossId || fallbackEventId)) {
  //           const currentEventBossId = eventBossId || fallbackEventId;

  //           socket.emit("question:request", {
  //             eventBossId: currentEventBossId,
  //           });
  //         }
  //       }, 100);
  //     } else {
  //       console.log(
  //         "📝 Not requesting next question - player knocked out or boss defeated"
  //       );
  //     }
  //   });

  //   // Listen for player attack broadcasts (other players' attacks)
  //   socket.on("player-attacked", (data) => {
  //     // Update boss health
  //     setBossCurrentHealth(data.bossCurrentHp);

  //     // Get current user info to avoid double damage indicators
  //     const currentUser = getUserInfo();
  //     const isCurrentPlayerAttack =
  //       currentUser &&
  //       (data.playerNickname === currentUser.username ||
  //         data.playerId === currentUser.id);

  //     // Generate floating damage number only for OTHER players' attacks
  //     // (Current player's attacks are handled by answer-result event)
  //     if (data.damage && data.damage > 0 && !isCurrentPlayerAttack) {
  //       generateDamageNumber(data.damage, data.responseCategory || "NORMAL");
  //     } else if (isCurrentPlayerAttack) {
  //       console.log(
  //         `🎯 Skipping damage number for current player's own attack (handled by answer-result)`
  //       );
  //     }

  //     // Show damage animation for all attacks (including current player's)
  //     setIsBossTakingDamage(true);
  //     setTimeout(() => setIsBossTakingDamage(false), 500);
  //   });

  //   // Listen for boss defeated
  //   socket.on("boss-defeated", (data) => {
  //     console.log("🏆 Boss Defeated!", data);
  //     setBossCurrentHealth(0);

  //     // Play victory sound
  //     if (punchAudioRef.current) {
  //       punchAudioRef.current.currentTime = 0;
  //       punchAudioRef.current.play().catch((error) => {
  //         console.log("Audio play failed:", error);
  //       });
  //     }
  //   });

  //   // **NEW: Listen for final leaderboards data**
  //   socket.on("final-leaderboards", (data) => {
  //     console.log("📊 Received final leaderboards in battle:", data);
  //     setFinalLeaderboardData(data);
  //   });

  //   // **NEW: Listen for badge notifications**
  //   socket.on("badge-earned", (data) => {
  //     console.log("🎖️ Badge Earned!", data);

  //     // Add badge to queue for sequential display
  //     addBadgeToQueue(data);
  //   });

  //   // Listen for battle state updates
  //   socket.on("battle-state-updated", (data) => {
  //     if (data.session?.bossData) {
  //       setBossCurrentHealth(data.session.bossData.currentHp);
  //       setBossMaxHealth(data.session.bossData.maxHp);
  //     }
  //   });

  //   // Listen for battle status updates (after heart processing)
  //   socket.on("battle-status-update", (data) => {
  //     if (data.battleStatus) {
  //       setBossCurrentHealth(data.battleStatus.bossCurrentHp);
  //       setBossMaxHealth(data.battleStatus.bossMaxHp);
  //       setPlayerLivesRemaining(data.battleStatus.playerHearts);
  //       if (data.battleStatus.isKnockedOut) {
  //         console.log(
  //           "💀 Player marked as knocked out from battle status update"
  //         );
  //         setIsCurrentPlayerKnockedOut(true);
  //       }
  //     }
  //   });

  //   // Listen for battle status sync (immediate HP sync for new/rejoining players)
  //   socket.on("battle-status-sync", (data) => {
  //     setBossCurrentHealth(data.bossCurrentHp);
  //     setBossMaxHealth(data.bossMaxHp);
  //   });

  //   // Listen for team information updates
  //   socket.on("player:team-info", (data) => {
  //     if (data.teamId && data.teamName) {
  //       setCurrentPlayerTeam({
  //         teamId: data.teamId,
  //         teamName: data.teamName, // Use actual team name from backend
  //       });

  //       // **NEW: Show toast message when showToast is true**
  //       if (data.showToast && data.message) {
  //         toast.info(data.message);
  //       }
  //     }
  //   });

  //   // **NEW: Listen for new player joining battle notifications**
  //   socket.on("player:joined-battle", (data) => {
  //     // Update boss health
  //     setBossCurrentHealth(data.bossCurrentHp);
  //     setBossMaxHealth(data.bossMaxHp);

  //     // Show toast notification
  //     toast.info(data.message);
  //   });

  //   // **NEW: Listen for teammate knockout notifications**
  //   socket.on("teammate:knocked-out", (data) => {
  //     // **FIXED: Add knocked out teammate to the array so revival button shows**
  //     setTeamKnockedOutPlayers((prev) => {
  //       console.log("💀 Current knocked out players before update:", prev);

  //       // Check if this player is already in the list
  //       const existingPlayer = prev.find(
  //         (p) => p.playerName === data.knockedOutPlayerNickname
  //       );

  //       if (!existingPlayer) {
  //         const newPlayer = {
  //           playerId: data.knockedOutPlayerId || `temp_${Date.now()}`,
  //           playerName: data.knockedOutPlayerNickname,
  //           revivalCode: null, // Will be provided when player gets revival code
  //           timeLeftSeconds: 60,
  //         };

  //         console.log("💀 Adding new knocked out player:", newPlayer);
  //         const updatedArray = [...prev, newPlayer];
  //         console.log("💀 Updated knocked out players array:", updatedArray);

  //         return updatedArray;
  //       } else {
  //         console.log("💀 Player already in knocked out list:", existingPlayer);
  //       }
  //       return prev;
  //     });

  //     // **FIXED: Show toast notification using the data message**
  //     toast.error(
  //       data.message || `${data.knockedOutPlayerNickname} has been knocked out!`
  //     );
  //   });

  //   // **NEW: Listen for player knockout events (when current player gets knocked out)**
  //   socket.on("player-knocked-out", (data) => {
  //     // **FIXED: Show toast notification when knocked out**
  //     toast.error(
  //       "You have been knocked out! Share your revival code with teammates."
  //     );

  //     // Set the revival code for display
  //     setCurrentPlayerRevivalCode(data.reviveCode);
  //     setCurrentPlayerRevivalTimeLeft(60); // 60 seconds
  //     setIsCurrentPlayerKnockedOut(true);

  //     // Play heartbeats sound when knocked out
  //     if (heartbeatsAudioRef.current) {
  //       heartbeatsAudioRef.current.currentTime = 0;
  //       heartbeatsAudioRef.current.loop = true;
  //       heartbeatsAudioRef.current.play().catch((error) => {
  //         console.log("Heartbeats audio play failed:", error);
  //       });
  //     }
  //   });

  //   // **NEW: Listen for player death events**
  //   socket.on("player-died", (data) => {
  //     // Stop heartbeats sound
  //     if (heartbeatsAudioRef.current) {
  //       heartbeatsAudioRef.current.pause();
  //       heartbeatsAudioRef.current.currentTime = 0;
  //       heartbeatsAudioRef.current.loop = false;
  //     }

  //     // Show death message
  //     toast.error(data.message);

  //     // Mark player as dead
  //     setIsCurrentPlayerDead(true);
  //     setIsCurrentPlayerKnockedOut(false);

  //     // Auto-redirect after 3 seconds
  //     if (data.shouldRedirect) {
  //       setTimeout(() => {
  //         if (eventBossId && joinCode) {
  //           // navigate(`/boss-preview/${eventBossId}/${joinCode}`);
  //           window.location.href = `/boss-preview/${eventBossId}/${joinCode}`;
  //         } else {
  //           navigate("/player");
  //         }
  //       }, 3000);
  //     }
  //   });

  //   // **NEW: Listen for teammate death events**
  //   socket.on("teammate-died", (data) => {
  //     // **FIXED: Remove dead player from knocked out list**
  //     setTeamKnockedOutPlayers((prev) => {
  //       const updatedArray = prev.filter(
  //         (p) => p.playerName !== data.deadPlayerNickname
  //       );
  //       console.log(
  //         "☠️ Removed dead player from knocked out list:",
  //         updatedArray
  //       );
  //       return updatedArray;
  //     });

  //     // Show death notification
  //     toast.error(data.message);
  //   });

  //   // **NEW: Listen for successful revival events**
  //   socket.on("player-revived", (data) => {
  //     // Stop heartbeats sound
  //     if (heartbeatsAudioRef.current) {
  //       heartbeatsAudioRef.current.pause();
  //       heartbeatsAudioRef.current.currentTime = 0;
  //       heartbeatsAudioRef.current.loop = false;
  //     }

  //     // Update player state
  //     setIsCurrentPlayerKnockedOut(false);
  //     setIsCurrentPlayerDead(false);
  //     setPlayerLivesRemaining(data.hearts);
  //     setCurrentPlayerRevivalCode("");
  //     setCurrentPlayerRevivalTimeLeft(60);

  //     // Show revival success message
  //     toast.success(data.message);
  //   });

  //   // **NEW: Listen for teammate revival events**
  //   socket.on("teammate-revived", (data) => {
  //     // **FIXED: Remove revived player from knocked out list**
  //     setTeamKnockedOutPlayers((prev) => {
  //       const updatedArray = prev.filter(
  //         (p) => p.playerName !== data.revivedPlayer
  //       );
  //       return updatedArray;
  //     });

  //     // Show revival notification
  //     toast.success(data.message);
  //   });

  //   return () => {
  //     socket.off("question:received");
  //     socket.off("answer-result");
  //     socket.off("player-attacked");
  //     socket.off("boss-defeated");
  //     socket.off("final-leaderboards");
  //     socket.off("badge-earned");
  //     socket.off("battle-state-updated");
  //     socket.off("battle-status-update");
  //     socket.off("battle-status-sync");
  //     socket.off("player:team-info");
  //     socket.off("player:joined-battle"); // **NEW**
  //     socket.off("teammate:knocked-out"); // **NEW**
  //     socket.off("player-knocked-out"); // **NEW**
  //     socket.off("player-died"); // **NEW**
  //     socket.off("teammate-died"); // **NEW**
  //     socket.off("player-revived"); // **NEW**
  //     socket.off("teammate-revived"); // **NEW**
  //   };
  // }, [
  //   socket,
  //   eventBossId,
  //   playHurtSound,
  //   generateDamageNumber,
  //   playerLivesRemaining,
  //   joinCode, // **NEW: Add joinCode dependency**
  //   navigate, // **NEW: Add navigate dependency**
  //   heartbeatsAudioRef, // **NEW: Add heartbeatsAudioRef dependency**
  // ]);

  // const leaveBoss = () => {
  //   const currentEventBossId = eventBossId;
  //   if (socket && currentEventBossId) {
  //     socket.emit("leave-boss", { eventBossId: currentEventBossId });
  //   }
  //   navigate("/player");
  // };

  // const handleLeave = () => {
  //   // Clear the global boss join state
  //   leaveBoss();

  //   // Redirect back to boss preview with boss/event IDs if available
  //   if (eventBossId && joinCode) {
  //     navigate(`/boss-preview/${eventBossId}/${joinCode}`);
  //   } else {
  //     navigate("/");
  //   }
  // };

  const handleLiveLeaderboard = () => {
    setIsLeaderboardVisible((prev) => !prev);
    console.log("Toggling live leaderboard");
  };

  const toggleDarkMode = () => {
    setIsDarkModeEnabled((prev) => !prev);
    document.documentElement.classList.toggle("dark");
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

  // Timer countdown effect
  // useEffect(() => {
  //   // Don't run timer if player is knocked out, dead, boss is defeated, or waiting for result
  //   if (
  //     isCurrentPlayerKnockedOut ||
  //     isCurrentPlayerDead ||
  //     bossCurrentHealth === 0 ||
  //     !currentQuestionData ||
  //     isLoadingQuestion ||
  //     isWaitingForResult // **NEW: Stop timer when waiting for result**
  //   ) {
  //     return;
  //   }

  //   if (questionTimeRemaining > 0) {
  //     const timer = setTimeout(() => {
  //       setQuestionTimeRemaining((prev) => prev - 1);
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   } else if (questionTimeRemaining === 0 && !isLoadingQuestion) {
  //     // Time's up - submit timeout to backend (let backend handle heart deduction)
  //     if (socket && (eventBossId || fallbackEventId) && currentQuestionData) {
  //       const currentEventBossId = eventBossId || fallbackEventId;

  //       // Submit timeout as an invalid answer (choice index -1)
  //       socket.emit("submit-answer", {
  //         eventBossId: currentEventBossId,
  //         questionId: currentQuestionData.questionId,
  //         choiceIndex: -1, // Invalid choice to indicate timeout
  //         responseTime: currentQuestionData.timeLimitSeconds * 1000, // Full time limit
  //         isTimeout: true,
  //       });

  //       setIsLoadingQuestion(true);
  //       setIsWaitingForResult(true); // **NEW: Set waiting state for timeout**
  //     }
  //   }
  // }, [
  //   questionTimeRemaining,
  //   isCurrentPlayerKnockedOut,
  //   isCurrentPlayerDead,
  //   bossCurrentHealth,
  //   currentQuestionData,
  //   isLoadingQuestion,
  //   isWaitingForResult, // **NEW: Add waiting state dependency**
  //   socket,
  //   eventBossId,
  //   fallbackEventId,
  // ]);

  // Effect to handle boss defeat sequence
  // useEffect(() => {
  //   if (bossCurrentHealth === 0) {
  //     // ===== BOSS DEFEAT SEQUENCE TIMING ===== //
  //     // Show defeat message after configurable delay
  //     const defeatMessageTimer = setTimeout(() => {
  //       setIsBossDefeatMessageVisible(true);
  //     }, BOSS_DEFEAT_MESSAGE_DELAY_MS); // Easy to modify: currently 1 second

  //     // Show countdown after configurable delay
  //     const countdownTimer = setTimeout(() => {
  //       setIsBossDefeatCountdownVisible(true);

  //       // Start countdown from configurable duration
  //       let countdownSeconds = BOSS_DEFEAT_COUNTDOWN_DURATION_SECONDS; // Easy to modify: currently 6 seconds
  //       setBossDefeatCountdownNumber(countdownSeconds);

  //       const countdownInterval = setInterval(() => {
  //         countdownSeconds--;
  //         if (countdownSeconds > 0) {
  //           setBossDefeatCountdownNumber(countdownSeconds);
  //         } else {
  //           clearInterval(countdownInterval);
  //           setIsBossDefeatCountdownVisible(false);
  //           setIsBossDefeatMessageVisible(false);
  //           // Navigate to the victory podium page with leaderboard data
  //           navigate("/boss-podium", {
  //             state: {
  //               leaderboardData: finalLeaderboardData,
  //               eventBossId: eventBossId || fallbackEventId,
  //             },
  //           });
  //         }
  //       }, 1000); // 1 second intervals for countdown
  //     }, BOSS_DEFEAT_COUNTDOWN_DELAY_MS); // Easy to modify: currently 1 second total

  //     return () => {
  //       clearTimeout(defeatMessageTimer);
  //       clearTimeout(countdownTimer);
  //     };
  //   }
  // }, [
  //   bossCurrentHealth,
  //   navigate,
  //   eventBossId,
  //   fallbackEventId,
  //   finalLeaderboardData,
  // ]);

  // Get timer color based on time remaining
  const getTimerColor = () => {
    const timePercentage =
      (questionTimeRemaining / questionMaxTimeSeconds) * 100;
    if (timePercentage > 66) {
      return "text-green-500"; // Fast zone (green)
    } else if (timePercentage > 33) {
      return "text-yellow-500"; // Normal zone (yellow)
    } else {
      return "text-red-500"; // Slow zone (red)
    }
  };

  // ===== ===== ===== RENDER ===== ===== ===== //
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
                // onClick={handleLeave}
                variant="outline"
                size="sm"
                disabled={isPlayerKnockedOut}
                className={`flex items-center justify-center ${
                  isPlayerKnockedOut || isPlayerDead || isRevivalDialogVisible
                    ? "bg-[#464646] text-white border-[#464646] hover:bg-[#494949] dark:bg-background dark:text-foreground dark:border-border dark:hover:bg-accent"
                    : ""
                } ${isPlayerKnockedOut ? "opacity-50 cursor-not-allowed" : ""}`}
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
                onClick={toggleDarkMode}
                variant="outline"
                size="sm"
                className={`flex items-center justify-center ${
                  isPlayerKnockedOut || isPlayerDead || isRevivalDialogVisible
                    ? "bg-[#464646] text-white border-[#464646] hover:bg-[#494949] dark:bg-background dark:text-foreground dark:border-border dark:hover:bg-accent"
                    : ""
                }`}
              >
                {isDarkModeEnabled ? (
                  <Sun
                    className={`w-4 h-4 ${
                      isPlayerKnockedOut ||
                      isPlayerDead ||
                      isRevivalDialogVisible
                        ? "text-white dark:text-foreground"
                        : ""
                    }`}
                  />
                ) : (
                  <Moon
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
                  src={getBossImageUrl(eventBoss.image)}
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
                  {isDefeatCountdownVisible && (
                    <div className="text-center animate-fade-in">
                      <h3 className="text-lg text-muted-foreground py-2">
                        Redirecting to Podium
                      </h3>
                      <div className="text-3xl font-bold text-white">
                        {bossDefeatCountdownNumber}
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
                          (questionTimeRemaining / questionMaxTimeSeconds) *
                            100 || 0,
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
                    {questionTimeRemaining}
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
                {loading.question
                  ? loading.result
                    ? "Processing your answer..."
                    : "Loading question..."
                  : currentQuestion?.questionText}
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-2 flex-1 min-h-0 -mb-3">
              {loading.question
                ? // Loading state
                  [...Array(4)].map((_, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full p-2 h-full text-center whitespace-normal font-medium text-sm bg-muted animate-pulse"
                      disabled
                    >
                      {loading.result ? "Processing..." : "Loading..."}
                    </Button>
                  ))
                : // Normal answer options
                  currentQuestion?.answerChoices.map((choice, index) => {
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

                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className={`w-full p-2 h-full text-center whitespace-normal font-medium transition-all text-sm halftone-texture ${
                          choiceIndexSelected === choice.index
                            ? selectedColors[index]
                            : colors[index]
                        } ${
                          isPlayerKnockedOut ||
                          isPlayerDead ||
                          eventBossCurrentHP === 0 ||
                          loading.question ||
                          loading.result
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => handleAnswerSelect(choice.index)}
                        disabled={
                          isPlayerKnockedOut ||
                          isPlayerDead ||
                          eventBossCurrentHP === 0 ||
                          loading.question ||
                          loading.result
                        }
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
      <BattleLeaderboard
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
                {/* Force stop heartbeats when dead dialog is shown */}
                {
                  // (() => {
                  //   try {
                  //     if (heartbeatsAudioRef.current) {
                  //       heartbeatsAudioRef.current.pause();
                  //       heartbeatsAudioRef.current.currentTime = 0;
                  //       heartbeatsAudioRef.current.loop = false;
                  //     }
                  //   } catch (error) {
                  //     console.log(
                  //       "Error stopping heartbeats in dead dialog:",
                  //       error
                  //     );
                  //   }
                  //   return null;
                  // })()
                }

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
                    onClick={() =>
                      navigate(`/boss-preview/${eventBossId}/${joinCode}`)
                    }
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

      {/* ========== NOTIFICATIONS - Highest z-index ========== */}
      {/* Badge Notifications - z-30 (stays above most content but below toasts) */}
      {/* <div className="fixed top-4 right-4 z-30 space-y-2">
        {badgeNotifications.map((badge, index) => (
          <div
            key={badge.id}
            style={{
              transform: `translateY(${index * 0.5}rem)`,
            }}
          >
            <BadgeNotification
              badge={badge}
              onClose={() => removeBadgeNotification(badge.id)}
              duration={5000}
            />
          </div>
        ))}
      </div> */}
    </main>
  );
};

export default BossBattle;
