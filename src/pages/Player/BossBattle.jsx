// ===== LIBRARIES ===== //
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  useNavigate,
  useSearchParams,
  useParams,
  data,
} from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Heart,
  Timer,
  Trophy,
  LogOut,
  Sun,
  Moon,
  Smartphone,
  Ambulance,
  Skull,
} from "lucide-react";

// ===== HOOKS ===== //
// import { useBossJoin } from "@/context/BossJoinContext";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { apiClient } from "@/api";
import BattleLeaderboard from "@/layouts/BossBattleLeaderboard";
import BadgeNotification from "@/components/BadgeNotification";
import useBossBattle from "@/hooks/useBossBattle";
import { toast } from "sonner";
import { useAuth } from "@/context/useAuth";
import { getGuestUser } from "@/utils/guestUtils";

// ===== STYLES ===== //
import "@/index.css";

// ===== AUDIOS ===== //
import punchSound from "@/assets/Audio/punch1.mp3";
import hurtSound1 from "@/assets/Audio/hurt1.mp3";
import hurtSound2 from "@/assets/Audio/hurt2.mp3";
import heartbeatsSound from "@/assets/Audio/heartbeats.mp3";

const BossBattle = () => {
  const { eventBossId, joinCode } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { socket } = useBossBattle(); // Get socket from context
  const { user } = useAuth();
  // **FIXED: Removed useMessage, using toast directly**
  // const { leaveBoss } = useBossJoin();

  // Get boss/event IDs from URL params
  const bossId = searchParams.get("bossId");
  const eventId = searchParams.get("eventId");

  // Temporary fallback for testing - you can set these manually
  const fallbackEventId = eventBossId || "test-event-boss-123";

  // ===== TIMING CONFIGURATION ===== //
  const BOSS_DEFEAT_MESSAGE_DELAY_MS = 1000;
  const BOSS_DEFEAT_COUNTDOWN_DELAY_MS = 1000;
  const BOSS_DEFEAT_COUNTDOWN_DURATION_SECONDS = 5;

  // ===== BOSS CONFIGURATION (Backend Integration Ready) ===== //
  // This will be replaced with data from the bosses API endpoint
  // Example API call: GET /api/bosses/{bossId}
  // Response will match the database schema you provided
  const bossDataFromBackend = useMemo(
    () => ({
      id: "boss_001",
      name: "CS Boss",
      image: "/src/assets/Placeholder/Falcon.png", // Will use boss.image from backend
      description: "A challenging computer science boss battle",
      cooldown_duration: 300, // 5 minutes in seconds
      number_of_teams: 4,
      creator_id: "admin_001",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    []
  );

  // TODO: Replace mock data with actual API call
  const [bossData, setBossData] = useState(null);
  const [isLoadingBoss, setIsLoadingBoss] = useState(true);

  // Get user info from localStorage/auth context
  const getUserInfo = useCallback(() => {
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
  }, [user]);

  useEffect(() => {
    const fetchBossData = async () => {
      try {
        const response = await apiClient.get(`/event-bosses/${eventBossId}`);
        setBossData(response.data);
        setIsLoadingBoss(false);
      } catch (error) {
        console.error("Error fetching event boss: ", error);
        setIsLoadingBoss(true);
      }
    };

    fetchBossData();
  }, [eventBossId]);

  // Use backend data for configuration
  const BOSS_NAME = bossDataFromBackend.name;
  const BOSS_IMAGE_URL = bossDataFromBackend.image;
  const BOSS_DESCRIPTION = bossDataFromBackend.description;
  const BOSS_COOLDOWN_DURATION = bossDataFromBackend.cooldown_duration;
  const BOSS_NUMBER_OF_TEAMS = bossDataFromBackend.number_of_teams;

  // ===== GAME STATE ===== //
  const [playerSelectedAnswer, setPlayerSelectedAnswer] = useState("");
  const [playerLivesRemaining, setPlayerLivesRemaining] = useState(3);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(30);
  const [bossCurrentHealth, setBossCurrentHealth] = useState(10); // Will be updated from backend
  const [bossMaxHealth, setBossMaxHealth] = useState(10); // Will be updated from backend

  // ===== UI ANIMATION STATES ===== //
  const [isBossTakingDamage, setIsBossTakingDamage] = useState(false);
  const [isPlayerHurt, setIsPlayerHurt] = useState(false);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [damageNumbersArray, setDamageNumbersArray] = useState([]);

  // ===== BOSS DEFEAT STATES ===== //
  const [isBossDefeatMessageVisible, setIsBossDefeatMessageVisible] =
    useState(false);
  const [isBossDefeatCountdownVisible, setIsBossDefeatCountdownVisible] =
    useState(false);
  const [bossDefeatCountdownNumber, setBossDefeatCountdownNumber] = useState(3);

  // ===== PLAYER REVIVAL SYSTEM ===== //
  const [teamKnockedOutPlayers, setTeamKnockedOutPlayers] = useState([]); // Array of {playerId, playerName, revivalCode, timeLeftSeconds}
  const [isCurrentPlayerKnockedOut, setIsCurrentPlayerKnockedOut] =
    useState(false);
  const [isCurrentPlayerDead, setIsCurrentPlayerDead] = useState(false);
  const [currentPlayerRevivalCode, setCurrentPlayerRevivalCode] = useState("");
  const [currentPlayerRevivalTimeLeft, setCurrentPlayerRevivalTimeLeft] =
    useState(60);
  const [revivalCodeInputText, setRevivalCodeInputText] = useState("");
  const [isRevivalDialogVisible, setIsRevivalDialogVisible] = useState(false);
  const [revivalOtpInput, setRevivalOtpInput] = useState("");

  // ===== TEAM INFORMATION ===== //
  const [currentPlayerTeam, setCurrentPlayerTeam] = useState(null); // {teamId, teamName}

  // ===== BADGE NOTIFICATIONS ===== //
  const [badgeNotifications, setBadgeNotifications] = useState([]); // Array of badge notification objects

  // ===== QUESTION DATA (Backend Integration) ===== //
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isWaitingForResult, setIsWaitingForResult] = useState(false); // **NEW: Track when answer submitted**
  const [sessionData, setSessionData] = useState(null);
  const [isReconnected, setIsReconnected] = useState(false); // Track reconnection status

  // Default fallback question for UI testing
  const fallbackQuestionData = {
    questionId: 1,
    categoryId: 1,
    questionText: "What does PIU stand for?",
    timeLimitSeconds: 30, // Individual time limit for this question
    authorId: 1,
    answerOptions: [
      "Paragon International University",
      "Programmers in Uniform",
      "Placeholder In Underway",
      "Pain In Utopia",
    ],
    correctAnswerText: "Paragon International University",
  };

  const questionMaxTimeSeconds =
    currentQuestionData?.timeLimitSeconds ||
    fallbackQuestionData.timeLimitSeconds;

  // Audio refs to persist across renders
  const punchAudioRef = useRef(null);
  const hurtAudio1Ref = useRef(null);
  const hurtAudio2Ref = useRef(null);
  const heartbeatsAudioRef = useRef(null);

  // Initialize audio objects once
  useEffect(() => {
    punchAudioRef.current = new Audio(punchSound);
    hurtAudio1Ref.current = new Audio(hurtSound1);
    hurtAudio2Ref.current = new Audio(hurtSound2);
    heartbeatsAudioRef.current = new Audio(heartbeatsSound);

    punchAudioRef.current.volume = 0.2;
    hurtAudio1Ref.current.volume = 0.1;
    hurtAudio2Ref.current.volume = 0.1;
    heartbeatsAudioRef.current.volume = 0.4;

    // Cleanup function to stop all audio when component unmounts
    return () => {
      try {
        if (punchAudioRef.current) {
          punchAudioRef.current.pause();
          punchAudioRef.current = null;
        }
        if (hurtAudio1Ref.current) {
          hurtAudio1Ref.current.pause();
          hurtAudio1Ref.current = null;
        }
        if (hurtAudio2Ref.current) {
          hurtAudio2Ref.current.pause();
          hurtAudio2Ref.current = null;
        }
        if (heartbeatsAudioRef.current) {
          heartbeatsAudioRef.current.pause();
          heartbeatsAudioRef.current.currentTime = 0;
          heartbeatsAudioRef.current.loop = false;
          heartbeatsAudioRef.current = null;
        }
        console.log("All audio cleaned up on component unmount");
      } catch (error) {
        console.log("Error during audio cleanup:", error);
      }
    };
  }, []);

  // Function to play random hurt sound - moved before Socket.IO useEffect
  const playHurtSound = useCallback(() => {
    const hurtSounds = [hurtAudio1Ref.current, hurtAudio2Ref.current];
    const randomHurtSound =
      hurtSounds[Math.floor(Math.random() * hurtSounds.length)];
    if (randomHurtSound) {
      randomHurtSound.currentTime = 0; // Reset audio to start
      randomHurtSound.play().catch((error) => {
        console.log("Hurt audio play failed:", error);
      });
    }
  }, []);

  // Function to generate floating damage numbers
  const generateDamageNumber = useCallback((damage, responseCategory) => {
    const damageId = Date.now() + Math.random(); // Unique ID
    const randomX = 20 + Math.random() * 60; // Random X position between 20% and 80%
    const randomY = 30 + Math.random() * 40; // Random Y position between 30% and 70%

    // Color based on response category
    const colors = {
      FAST: "text-green-400", // Green for fast responses
      NORMAL: "text-yellow-400", // Yellow for normal responses
      SLOW: "text-orange-400", // Orange for slow responses
    };

    const newDamageNumber = {
      id: damageId,
      damage: damage,
      x: randomX,
      y: randomY,
      responseCategory: responseCategory,
      color: colors[responseCategory] || "text-red-500",
    };

    setDamageNumbersArray((prev) => [...prev, newDamageNumber]);

    // Remove damage number after animation completes
    setTimeout(() => {
      setDamageNumbersArray((prev) =>
        prev.filter((dmg) => dmg.id !== damageId)
      );
    }, 2000); // Match animation duration
  }, []);

  // ===== SOCKET.IO INTEGRATION ===== //
  useEffect(() => {
    if (socket && eventBossId && joinCode && !isReconnected) {
      const userInfo = getUserInfo();
      socket.emit("boss-fight:reconnect", { eventBossId, joinCode, userInfo });

      // Handle successful reconnection
      const handleReconnected = (data) => {
        console.log("🔄 =============== RECONNECTION DEBUG ===============");
        console.log("🔄 Reconnection Data Received:", data);
        console.log("🔄 Session Data:", data.session);
        console.log("🔄 Player Data:", data.session?.playerData);
        console.log("🔄 Boss Data:", data.session?.bossData);

        // Update state from reconnection data
        if (data.session) {
          setSessionData(data.session);
          setBossCurrentHealth(data.session?.bossData?.currentHp || 100);
          setBossMaxHealth(data.session?.bossData?.maxHp || 100);
          setPlayerLivesRemaining(data.session?.playerData?.hearts || 3);
          setCurrentPlayerTeam({
            teamId: data.session?.playerData?.teamId,
            teamName:
              data.session?.playerData?.teamName ||
              `Team ${data.session?.playerData?.teamId}`,
          });
        }
        setIsReconnected(true);
      };

      // Handle failed reconnection
      const handleReconnectFailed = (error) => {
        console.error("Reconnection failed:", error);
      };

      // Handle battle already started (for mid-game joins)
      const handleBattleAlreadyStarted = (data) => {
        console.log(
          "🎮 =============== BATTLE ALREADY STARTED DEBUG ==============="
        );
        console.log("🎮 Battle Already Started Data:", data);
        console.log("🎮 Session Data:", data.session);
        console.log("🎮 Boss Data:", data.session?.bossData);

        // Update state from battle already started data
        if (data.session) {
          setSessionData(data.session);
          setBossCurrentHealth(data.session?.bossData?.currentHp || 100);
          setBossMaxHealth(data.session?.bossData?.maxHp || 100);

          console.log("🎮 Boss HP updated from battle already started:", {
            currentHp: data.session?.bossData?.currentHp,
            maxHp: data.session?.bossData?.maxHp,
          });
        }

        console.log(
          "🎮 ==============================================================="
        );
      };

      socket.on("boss-fight:reconnected", handleReconnected);
      socket.on("boss-fight:reconnect-failed", handleReconnectFailed);
      socket.on("battle:already-started", handleBattleAlreadyStarted);

      return () => {
        socket.off("boss-fight:reconnected", handleReconnected);
        socket.off("boss-fight:reconnect-failed", handleReconnectFailed);
        socket.off("battle:already-started", handleBattleAlreadyStarted);
      };
    }
  }, [socket, eventBossId, joinCode, getUserInfo, isReconnected]);

  useEffect(() => {
    if (!socket) {
      console.error("No socket connection available");
      return;
    }

    // Set initial loading state
    setIsLoadingQuestion(true);

    socket.emit("question:request", {
      eventBossId,
    });

    socket.on("question:received", (data) => {
      console.log("📥 =============== QUESTION RECEIVED DEBUG ===============");
      console.log("📥 QUESTION RECEIVED DEBUG:");
      console.log("   Full Data:", data);
      console.log("   Question Object:", data.question);
      console.log("   Choices Array:", data.question?.choices);
      console.log(
        "   Choice Details:",
        JSON.stringify(data.question?.choices, null, 2)
      );
      console.log(
        "   Correct Answer Index:",
        data.question?.correctAnswerIndex
      );
      console.log("📥 Question flow controlled by backend - no auto-request");
      console.log("📥 =======================================================");

      // Update question data with new format
      if (data.question) {
        // Keep the original choice structure with indices
        const choicesWithIndices = data.question.choices.map(
          (choice, arrayIndex) => ({
            originalIndex: choice.index, // The index from backend after shuffling
            displayIndex: arrayIndex, // The display position (0, 1, 2, 3)
            text: choice.text,
          })
        );

        console.log("   Choices with indices:", choicesWithIndices);
        console.log(
          "   Expected Correct Answer:",
          choicesWithIndices.find(
            (c) => c.originalIndex === data.question.correctAnswerIndex
          )?.text
        );

        setCurrentQuestionData({
          questionId: data.question.id,
          categoryId: data.question.categoryId,
          categoryName: data.question.categoryName,
          questionText: data.question.text,
          timeLimitSeconds: data.question.timeLimit, // Already in seconds
          answerOptions: choicesWithIndices.map((c) => c.text), // For display
          choicesWithIndices: choicesWithIndices, // Keep full structure for submission
          correctAnswerIndex: data.question.correctAnswerIndex,
          questionNumber: data.question.questionNumber,
        });

        // Reset question timer and states
        setQuestionTimeRemaining(data.question.timeLimit);
        setCurrentQuestionNumber(data.question.questionNumber);
        setIsLoadingQuestion(false);
        setIsWaitingForResult(false); // **NEW: Clear waiting state for new question**
        setPlayerSelectedAnswer(""); // **NEW: Clear previous selection**
      }

      // Update battle status
      if (data.battleStatus) {
        console.log(
          "💔 =============== BATTLE STATUS HEARTS DEBUG ==============="
        );
        console.log("💔 Current Frontend Hearts:", playerLivesRemaining);
        console.log(
          "💔 New Hearts from Backend:",
          data.battleStatus.playerHearts
        );
        console.log("💔 Battle Status Data:", data.battleStatus);
        console.log(
          "💔 Heart Change:",
          playerLivesRemaining,
          "→",
          data.battleStatus.playerHearts
        );
        console.log(
          "💔 ==========================================================="
        );

        // Update boss health with dynamic max HP
        setBossCurrentHealth(data.battleStatus.bossCurrentHp);
        setBossMaxHealth(data.battleStatus.bossMaxHp);
        setPlayerLivesRemaining(data.battleStatus.playerHearts);
        setCurrentPlayerTeam({
          teamId: data.battleStatus.playerTeamId,
          teamName:
            data.battleStatus.playerTeamName ||
            `Team ${data.battleStatus.playerTeamId}`, // **FIXED: Use actual team name or fallback**
        });

        // Update knocked out status
        if (data.battleStatus.isKnockedOut) {
          console.log("💀 Player marked as knocked out from battle status");
          setIsCurrentPlayerKnockedOut(true);
        }
      }
    });

    // Listen for answer result feedback
    socket.on("answer-result", (data) => {
      console.log("📤 =============== ANSWER RESULT DEBUG ===============");
      console.log("📤 Answer Result Data:", data);
      console.log("📤 Is Correct:", data.isCorrect);
      console.log("📤 Battle Status:", data.battleStatus);
      console.log("📤 Current Frontend Hearts:", playerLivesRemaining);
      console.log(
        "📤 New Hearts from Result:",
        data.battleStatus?.playerHearts
      );
      console.log("📤 ===================================================");

      // Always clear loading and waiting states when we get a result
      setIsLoadingQuestion(false);
      setIsWaitingForResult(false); // **NEW: Clear waiting state**

      if (data.isCorrect) {
        // Correct answer - play sound effect and show damage number
        if (punchAudioRef.current) {
          punchAudioRef.current.currentTime = 0;
          punchAudioRef.current.play().catch((error) => {
            console.log("Audio play failed:", error);
          });
        }

        // Generate floating damage number if damage was dealt
        if (data.damage && data.damage > 0) {
          console.log(
            `🎯 Player answer result - generating damage number: ${data.damage} (${data.responseCategory})`
          );
          generateDamageNumber(data.damage, data.responseCategory || "NORMAL");

          // Show boss taking damage animation
          setIsBossTakingDamage(true);
          setTimeout(() => setIsBossTakingDamage(false), 500);
        }
      } else {
        // Wrong answer - play hurt sound and show feedback
        playHurtSound();
        setIsPlayerHurt(true);
        setTimeout(() => {
          setIsPlayerHurt(false);
        }, 500);
      }

      // Update battle status if provided
      if (data.battleStatus) {
        console.log(
          "💔 =============== ANSWER RESULT BATTLE STATUS DEBUG ==============="
        );
        console.log("💔 Current Frontend Hearts:", playerLivesRemaining);
        console.log(
          "💔 New Hearts from Answer Result:",
          data.battleStatus.playerHearts
        );
        console.log("💔 Answer was correct:", data.isCorrect);
        console.log("💔 Battle Status:", data.battleStatus);
        console.log(
          "💔 ================================================================"
        );

        setBossCurrentHealth(data.battleStatus.bossCurrentHp);
        setBossMaxHealth(data.battleStatus.bossMaxHp);
        setPlayerLivesRemaining(data.battleStatus.playerHearts);
        if (data.battleStatus.isKnockedOut) {
          console.log("💀 Player marked as knocked out from answer result");
          setIsCurrentPlayerKnockedOut(true);
        }
      }

      // **FIXED: Request next question after processing answer result**
      // Only request if player is not knocked out and boss is still alive
      if (!data.battleStatus?.isKnockedOut && data.battleStatus?.bossCurrentHp > 0) {
        console.log("📝 Answer result processed, requesting next question...");
        
        // Add a small delay to ensure all state updates are processed
        setTimeout(() => {
          if (socket && (eventBossId || fallbackEventId)) {
            const currentEventBossId = eventBossId || fallbackEventId;
            console.log("📤 Requesting next question for event boss:", currentEventBossId);
            
            socket.emit("question:request", {
              eventBossId: currentEventBossId,
            });
          }
        }, 100);
      } else {
        console.log("📝 Not requesting next question - player knocked out or boss defeated");
      }
    });

    // Listen for player attack broadcasts (other players' attacks)
    socket.on("player-attacked", (data) => {
      // Update boss health
      setBossCurrentHealth(data.bossCurrentHp);

      // Generate floating damage number for other players' attacks
      if (data.damage && data.damage > 0) {
        console.log(
          `🎯 Other player attack - generating damage number: ${data.damage} (${data.responseCategory})`
        );
        generateDamageNumber(data.damage, data.responseCategory || "NORMAL");
      }

      // Show damage animation
      setIsBossTakingDamage(true);
      setTimeout(() => setIsBossTakingDamage(false), 500);

      console.log(`💥 ${data.playerNickname} dealt ${data.damage} damage!`);
    });

    // Listen for boss defeated
    socket.on("boss-defeated", (data) => {
      console.log("🏆 Boss Defeated!", data);
      setBossCurrentHealth(0);

      // Play victory sound
      if (punchAudioRef.current) {
        punchAudioRef.current.currentTime = 0;
        punchAudioRef.current.play().catch((error) => {
          console.log("Audio play failed:", error);
        });
      }
    });

    // **NEW: Listen for badge notifications**
    socket.on("badge-earned", (data) => {
      console.log("🎖️ Badge Earned!", data);

      // Add badge notification to the array
      const badgeNotification = {
        id: Date.now() + Math.random(), // Unique ID
        type: data.type,
        message: data.message,
        milestone: data.milestone,
        badgeId: data.badgeId,
        eventBossId: data.eventBossId,
        timestamp: new Date(),
      };

      setBadgeNotifications((prev) => [...prev, badgeNotification]);

      // Auto-remove after 6 seconds as backup
      setTimeout(() => {
        setBadgeNotifications((prev) =>
          prev.filter(
            (notification) => notification.id !== badgeNotification.id
          )
        );
      }, 6000);
    });

    // Listen for battle state updates
    socket.on("battle-state-updated", (data) => {
      if (data.session?.bossData) {
        setBossCurrentHealth(data.session.bossData.currentHp);
        setBossMaxHealth(data.session.bossData.maxHp);
      }
    });

    // Listen for battle status updates (after heart processing)
    socket.on("battle-status-update", (data) => {
      console.log(
        "🔄 =============== BATTLE STATUS UPDATE DEBUG ==============="
      );
      console.log("🔄 Battle Status Update Data:", data);
      console.log("🔄 Current Frontend Hearts:", playerLivesRemaining);
      console.log(
        "🔄 New Hearts from Update:",
        data.battleStatus?.playerHearts
      );
      console.log(
        "🔄 ============================================================"
      );

      if (data.battleStatus) {
        setBossCurrentHealth(data.battleStatus.bossCurrentHp);
        setBossMaxHealth(data.battleStatus.bossMaxHp);
        setPlayerLivesRemaining(data.battleStatus.playerHearts);
        if (data.battleStatus.isKnockedOut) {
          console.log(
            "💀 Player marked as knocked out from battle status update"
          );
          setIsCurrentPlayerKnockedOut(true);
        }
      }
    });

    // Listen for battle status sync (immediate HP sync for new/rejoining players)
    socket.on("battle-status-sync", (data) => {
      console.log(
        "🔄 =============== BATTLE STATUS SYNC DEBUG ==============="
      );
      console.log("🔄 Battle Status Sync Data:", data);
      console.log("🔄 Boss HP Sync:", {
        currentHp: data.bossCurrentHp,
        maxHp: data.bossMaxHp,
        percentage: data.bossHpPercentage,
      });
      console.log(
        "🔄 ========================================================="
      );

      setBossCurrentHealth(data.bossCurrentHp);
      setBossMaxHealth(data.bossMaxHp);
    });

    // Listen for team information updates
    socket.on("player:team-info", (data) => {
      console.log("👥 =============== TEAM INFO DEBUG ===============");
      console.log("👥 Team Info Data:", data);
      console.log("👥 Team ID:", data.teamId);
      console.log("👥 Team Name:", data.teamName);
      console.log("👥 Show Toast:", data.showToast);
      console.log("👥 Reason:", data.reason);
      console.log("👥 ==============================================");

      if (data.teamId && data.teamName) {
        setCurrentPlayerTeam({
          teamId: data.teamId,
          teamName: data.teamName, // Use actual team name from backend
        });

        // **NEW: Show toast message when showToast is true**
        if (data.showToast && data.message) {
          toast.info(data.message);
        }
      }
    });

    // **NEW: Listen for new player joining battle notifications**
    socket.on("player:joined-battle", (data) => {
      console.log(
        "🔥 =============== PLAYER JOINED BATTLE DEBUG ==============="
      );
      console.log("🔥 Player Joined Data:", data);
      console.log("🔥 Player:", data.playerNickname);
      console.log("🔥 Team:", data.teamName);
      console.log(
        "🔥 Boss HP Updated:",
        data.bossCurrentHp,
        "/",
        data.bossMaxHp
      );
      console.log(
        "🔥 ========================================================="
      );

      // Update boss health
      setBossCurrentHealth(data.bossCurrentHp);
      setBossMaxHealth(data.bossMaxHp);

      // Show toast notification
      toast.info(data.message);
    });

    // **NEW: Listen for teammate knockout notifications**
    socket.on("teammate:knocked-out", (data) => {
      console.log("💀 =============== TEAMMATE KNOCKOUT DEBUG ===============");
      console.log("💀 Teammate Knockout Data:", data);
      console.log("💀 Knocked Out Player:", data.knockedOutPlayerNickname);
      console.log("💀 Knocked Out Player ID:", data.knockedOutPlayerId);
      console.log("💀 Team:", data.teamName);
      console.log("💀 Revival Needed:", data.revivalNeeded);
      console.log(
        "💀 ============================================================"
      );

      // **FIXED: Add knocked out teammate to the array so revival button shows**
      setTeamKnockedOutPlayers((prev) => {
        console.log("💀 Current knocked out players before update:", prev);

        // Check if this player is already in the list
        const existingPlayer = prev.find(
          (p) => p.playerName === data.knockedOutPlayerNickname
        );

        if (!existingPlayer) {
          const newPlayer = {
            playerId: data.knockedOutPlayerId || `temp_${Date.now()}`,
            playerName: data.knockedOutPlayerNickname,
            revivalCode: null, // Will be provided when player gets revival code
            timeLeftSeconds: 60,
          };

          console.log("💀 Adding new knocked out player:", newPlayer);
          const updatedArray = [...prev, newPlayer];
          console.log("💀 Updated knocked out players array:", updatedArray);

          return updatedArray;
        } else {
          console.log("💀 Player already in knocked out list:", existingPlayer);
        }
        return prev;
      });

      // **FIXED: Show toast notification using the data message**
      toast.error(
        data.message || `${data.knockedOutPlayerNickname} has been knocked out!`
      );
    });

    // **NEW: Listen for player knockout events (when current player gets knocked out)**
    socket.on("player-knocked-out", (data) => {
      console.log("💀 =============== PLAYER KNOCKOUT DEBUG ===============");
      console.log("💀 Player Knockout Data:", data);
      console.log("💀 Revival Code:", data.reviveCode);
      console.log("💀 Formatted Revival Code:", data.formattedReviveCode);
      console.log(
        "💀 ============================================================"
      );

      // **FIXED: Show toast notification when knocked out**
      toast.error(
        "You have been knocked out! Share your revival code with teammates."
      );

      // Set the revival code for display
      setCurrentPlayerRevivalCode(data.reviveCode);
      setCurrentPlayerRevivalTimeLeft(60); // 60 seconds
      setIsCurrentPlayerKnockedOut(true);

      // Play heartbeats sound when knocked out
      if (heartbeatsAudioRef.current) {
        heartbeatsAudioRef.current.currentTime = 0;
        heartbeatsAudioRef.current.loop = true;
        heartbeatsAudioRef.current.play().catch((error) => {
          console.log("Heartbeats audio play failed:", error);
        });
      }
    });

    // **NEW: Listen for player death events**
    socket.on("player-died", (data) => {
      console.log("☠️ =============== PLAYER DEATH DEBUG ===============");
      console.log("☠️ Player Death Data:", data);
      console.log("☠️ Should Redirect:", data.shouldRedirect);
      console.log("☠️ Redirect To:", data.redirectTo);
      console.log("☠️ =======================================================");

      // Stop heartbeats sound
      if (heartbeatsAudioRef.current) {
        heartbeatsAudioRef.current.pause();
        heartbeatsAudioRef.current.currentTime = 0;
        heartbeatsAudioRef.current.loop = false;
      }

      // Show death message
      toast.error(data.message);

      // Mark player as dead
      setIsCurrentPlayerDead(true);
      setIsCurrentPlayerKnockedOut(false);

      // Auto-redirect after 3 seconds
      if (data.shouldRedirect) {
        setTimeout(() => {
          if (eventBossId && joinCode) {
            navigate(`/boss-preview/${eventBossId}/${joinCode}`);
          } else {
            navigate("/player");
          }
        }, 3000);
      }
    });

    // **NEW: Listen for teammate death events**
    socket.on("teammate-died", (data) => {
      console.log("☠️ =============== TEAMMATE DEATH DEBUG ===============");
      console.log("☠️ Teammate Death Data:", data);
      console.log("☠️ Dead Player:", data.deadPlayerNickname);
      console.log("☠️ Team:", data.teamName);
      console.log(
        "☠️ ========================================================"
      );

      // **FIXED: Remove dead player from knocked out list**
      setTeamKnockedOutPlayers((prev) => {
        const updatedArray = prev.filter(
          (p) => p.playerName !== data.deadPlayerNickname
        );
        console.log(
          "☠️ Removed dead player from knocked out list:",
          updatedArray
        );
        return updatedArray;
      });

      // Show death notification
      toast.error(data.message);
    });

    // **NEW: Listen for successful revival events**
    socket.on("player-revived", (data) => {
      console.log("💚 =============== PLAYER REVIVAL DEBUG ===============");
      console.log("💚 Player Revival Data:", data);
      console.log("💚 Revived By:", data.revivedBy);
      console.log("💚 Hearts Restored:", data.hearts);
      console.log(
        "💚 ========================================================="
      );

      // Stop heartbeats sound
      if (heartbeatsAudioRef.current) {
        heartbeatsAudioRef.current.pause();
        heartbeatsAudioRef.current.currentTime = 0;
        heartbeatsAudioRef.current.loop = false;
      }

      // Update player state
      setIsCurrentPlayerKnockedOut(false);
      setIsCurrentPlayerDead(false);
      setPlayerLivesRemaining(data.hearts);
      setCurrentPlayerRevivalCode("");
      setCurrentPlayerRevivalTimeLeft(60);

      // Show revival success message
      toast.success(data.message);
    });

    // **NEW: Listen for teammate revival events**
    socket.on("teammate-revived", (data) => {
      console.log("💚 =============== TEAMMATE REVIVAL DEBUG ===============");
      console.log("💚 Teammate Revival Data:", data);
      console.log("💚 Revived Player:", data.revivedPlayer);
      console.log("💚 Reviver Player:", data.reviverPlayer);
      // **REMOVED: Logging teamKnockedOutPlayers directly to avoid useEffect dependency issue**
      console.log(
        "💚 ============================================================"
      );

      // **FIXED: Remove revived player from knocked out list**
      setTeamKnockedOutPlayers((prev) => {
        const updatedArray = prev.filter(
          (p) => p.playerName !== data.revivedPlayer
        );
        console.log(
          "💚 Updated knocked out players after revival:",
          updatedArray
        );
        console.log(
          "💚 Revival button should",
          updatedArray.length > 0 ? "stay visible" : "disappear"
        );
        return updatedArray;
      });

      // Show revival notification
      toast.success(data.message);
    });

    return () => {
      socket.off("question:received");
      socket.off("answer-result");
      socket.off("player-attacked");
      socket.off("boss-defeated");
      socket.off("badge-earned");
      socket.off("battle-state-updated");
      socket.off("battle-status-update");
      socket.off("battle-status-sync");
      socket.off("player:team-info");
      socket.off("player:joined-battle"); // **NEW**
      socket.off("teammate:knocked-out"); // **NEW**
      socket.off("player-knocked-out"); // **NEW**
      socket.off("player-died"); // **NEW**
      socket.off("teammate-died"); // **NEW**
      socket.off("player-revived"); // **NEW**
      socket.off("teammate-revived"); // **NEW**
    };
  }, [
    socket,
    eventBossId,
    fallbackEventId, // **NEW: Add fallbackEventId dependency**
    playHurtSound,
    generateDamageNumber,
    playerLivesRemaining,
    // **REMOVED: teamKnockedOutPlayers - was causing infinite re-renders**
    joinCode, // **NEW: Add joinCode dependency**
    navigate, // **NEW: Add navigate dependency**
    heartbeatsAudioRef, // **NEW: Add heartbeatsAudioRef dependency**
  ]);

  const leaveBoss = () => {
    const currentEventBossId = eventBossId || fallbackEventId;
    if (socket && currentEventBossId) {
      socket.emit("leave-boss", { eventBossId: currentEventBossId });
    }
    navigate("/player");
  };

  const handleAnswerSelect = (choiceIndex) => {
    // Prevent interactions if player is knocked out, dead, boss is defeated, loading, or waiting
    if (
      isCurrentPlayerKnockedOut ||
      isCurrentPlayerDead ||
      bossCurrentHealth === 0 ||
      !currentQuestionData ||
      isLoadingQuestion ||
      isWaitingForResult // **NEW: Prevent double-clicking**
    ) {
      console.log("🚫 Answer selection blocked:", {
        isKnockedOut: isCurrentPlayerKnockedOut,
        isDead: isCurrentPlayerDead,
        bossDefeated: bossCurrentHealth === 0,
        noQuestion: !currentQuestionData,
        isLoading: isLoadingQuestion,
        isWaiting: isWaitingForResult, // **NEW: Add waiting state to debug**
      });
      return;
    }

    const selectedAnswerText = currentQuestionData.answerOptions[choiceIndex];

    // Get the original index from the choice structure
    const selectedChoice =
      currentQuestionData.choicesWithIndices?.[choiceIndex];
    const originalChoiceIndex = selectedChoice?.originalIndex ?? choiceIndex;

    // ======= ENHANCED INDEX DEBUGGING =======
    console.log("🎯 ================== ANSWER CLICK DEBUG ==================");
    console.log(
      "📍 CLICKED INDEX:",
      choiceIndex,
      "(This is what the user clicked - position 0, 1, 2, or 3)"
    );
    console.log("🎯 ORIGINAL INDEX (sending to backend):", originalChoiceIndex);
    console.log(
      "✅ CORRECT ANSWER INDEX (from backend):",
      currentQuestionData.correctAnswerIndex
    );
    console.log("📋 FULL INDEX MAPPING:");
    currentQuestionData.choicesWithIndices?.forEach((choice, index) => {
      const isSelected = index === choiceIndex ? " ⭐ SELECTED" : "";
      const isCorrect =
        choice.originalIndex === currentQuestionData.correctAnswerIndex
          ? " ✅ CORRECT"
          : "";
      console.log(
        `      [${index}] Display → Original: ${choice.displayIndex} → ${choice.originalIndex} | Text: "${choice.text}"${isSelected}${isCorrect}`
      );
    });
    console.log("🎯 ========================================================");
    // ======= END ENHANCED DEBUGGING =======

    console.log(
      "👆 Answer selected:",
      selectedAnswerText,
      "at display index",
      choiceIndex
    );
    console.log("� CHOICE INDEX MAPPING:");
    console.log("   Display Index (what user clicked):", choiceIndex);
    console.log(
      "   Original Index (what backend expects):",
      originalChoiceIndex
    );
    console.log("   Selected Choice Structure:", selectedChoice);
    console.log("   All Choices:", currentQuestionData.choicesWithIndices);

    setPlayerSelectedAnswer(selectedAnswerText);

    // Send answer to backend
    if (socket && (eventBossId || fallbackEventId) && currentQuestionData) {
      const currentEventBossId = eventBossId || fallbackEventId;
      const responseTime =
        (questionMaxTimeSeconds - questionTimeRemaining) * 1000; // Convert to ms

      console.log("📤 SUBMITTING ANSWER:");
      console.log("   Answer Text:", selectedAnswerText);
      console.log("   Display Choice Index:", choiceIndex);
      console.log(
        "   Original Choice Index (sending to backend):",
        originalChoiceIndex
      );
      console.log("   Response Time:", responseTime + "ms");
      console.log("   Question ID:", currentQuestionData.questionId);
      console.log("   Event Boss ID:", currentEventBossId);

      socket.emit("submit-answer", {
        eventBossId: currentEventBossId,
        questionId: currentQuestionData.questionId,
        choiceIndex: originalChoiceIndex, // Send the original index, not the display index
        responseTime: responseTime,
      });

      console.log("✅ submit-answer event sent with original index!");

      // Set waiting states while waiting for result
      setIsLoadingQuestion(true);
      setIsWaitingForResult(true); // **NEW: Prevent double-clicking**
    }

    // **REMOVED: Don't clear selection immediately - keep it for visual feedback**
    // The selection will be cleared when the next question arrives
  };

  const handleLeave = () => {
    // Clear the global boss join state
    leaveBoss();

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

  const toggleDarkMode = () => {
    setIsDarkModeEnabled((prev) => !prev);
    // Toggle dark class on document element
    document.documentElement.classList.toggle("dark");
  };

  // ===== REVIVAL SYSTEM FUNCTIONS ===== //
  // **REMOVED: Manual revival code generation - now handled by backend**
  // const generatePlayerRevivalCode = () => {
  //   return Math.random().toString(36).substring(2, 8).toUpperCase();
  // };

  // **REMOVED: Manual knockout handling - now handled by backend**
  // const handlePlayerKnockout = useCallback(() => {
  //   // This is now handled by the backend when hearts reach 0
  // }, []);

  const handleRevivalCodeSubmission = (inputCode) => {
    const sanitizedCode = inputCode.trim().toUpperCase();

    if (!sanitizedCode) {
      toast.error("Please enter a revival code");
      return;
    }

    if (sanitizedCode.length !== 6) {
      toast.error("Revival code must be 6 characters");
      return;
    }

    // **NEW: Send revival request to backend via socket**
    if (socket && eventBossId) {
      console.log("🔄 =============== REVIVAL ATTEMPT DEBUG ===============");
      console.log("🔄 Attempting to revive with code:", sanitizedCode);
      console.log("🔄 Event Boss ID:", eventBossId);
      console.log("🔄 ====================================================");

      socket.emit("revive-teammate", {
        eventBossId: eventBossId,
        reviveCode: sanitizedCode,
      });

      // Listen for revival responses
      socket.once("revive-successful", (data) => {
        console.log("✅ Revival successful:", data);
        toast.success(data.message);
        setIsRevivalDialogVisible(false);
        setRevivalOtpInput("");
      });

      socket.once("revive-failed", (data) => {
        console.log("❌ Revival failed:", data);
        toast.error(data.message);
      });
    } else {
      toast.error("Connection error. Please try again.");
    }
  };

  // Handle OTP completion
  const handleRevivalOtpComplete = (otpValue) => {
    handleRevivalCodeSubmission(otpValue);
    setIsRevivalDialogVisible(false);
    setRevivalOtpInput("");
  };

  // Timer countdown effect
  useEffect(() => {
    // Don't run timer if player is knocked out, dead, boss is defeated, or waiting for result
    if (
      isCurrentPlayerKnockedOut ||
      isCurrentPlayerDead ||
      bossCurrentHealth === 0 ||
      !currentQuestionData ||
      isLoadingQuestion ||
      isWaitingForResult // **NEW: Stop timer when waiting for result**
    ) {
      return;
    }

    if (questionTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setQuestionTimeRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (questionTimeRemaining === 0 && !isLoadingQuestion) {
      // Time's up - submit timeout to backend (let backend handle heart deduction)
      console.log("⏰ Time's up! Submitting timeout to backend...");

      if (socket && (eventBossId || fallbackEventId) && currentQuestionData) {
        const currentEventBossId = eventBossId || fallbackEventId;

        console.log("📤 SUBMITTING TIMEOUT:");
        console.log("   Question ID:", currentQuestionData.questionId);
        console.log("   Event Boss ID:", currentEventBossId);
        console.log("   Timeout - no choice selected");

        // Submit timeout as an invalid answer (choice index -1)
        socket.emit("submit-answer", {
          eventBossId: currentEventBossId,
          questionId: currentQuestionData.questionId,
          choiceIndex: -1, // Invalid choice to indicate timeout
          responseTime: currentQuestionData.timeLimitSeconds * 1000, // Full time limit
          isTimeout: true,
        });

        setIsLoadingQuestion(true);
        setIsWaitingForResult(true); // **NEW: Set waiting state for timeout**
        console.log(
          "✅ Timeout submitted to backend - should deduct only 1 heart!"
        );
      }
    }
  }, [
    questionTimeRemaining,
    isCurrentPlayerKnockedOut,
    isCurrentPlayerDead,
    bossCurrentHealth,
    currentQuestionData,
    isLoadingQuestion,
    isWaitingForResult, // **NEW: Add waiting state dependency**
    socket,
    eventBossId,
    fallbackEventId,
  ]);

  // Revive timer countdown effect for knocked out team players
  useEffect(() => {
    const interval = setInterval(() => {
      setTeamKnockedOutPlayers(
        (prev) =>
          prev
            .map((player) => ({
              ...player,
              timeLeftSeconds: Math.max(0, player.timeLeftSeconds - 1),
            }))
            .filter((player) => player.timeLeftSeconds > 0) // Remove players whose time expired
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Effect to handle when current player revival time expires
  useEffect(() => {
    let timer;
    if (isCurrentPlayerKnockedOut && currentPlayerRevivalTimeLeft > 0) {
      timer = setTimeout(() => {
        setCurrentPlayerRevivalTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (
      isCurrentPlayerKnockedOut &&
      currentPlayerRevivalTimeLeft === 0
    ) {
      // If player is still knocked out after 60 seconds, they're permanently dead
      setIsCurrentPlayerKnockedOut(false);
      setIsCurrentPlayerDead(true);
      setCurrentPlayerRevivalTimeLeft(60);

      // Stop heartbeats sound when countdown reaches 0 (player dies)
      try {
        if (heartbeatsAudioRef.current) {
          heartbeatsAudioRef.current.pause();
          heartbeatsAudioRef.current.currentTime = 0;
          heartbeatsAudioRef.current.loop = false;
          console.log(
            "Heartbeats stopped - player died (revival timer expired)"
          );
        }
      } catch (error) {
        console.log("Error stopping heartbeats audio:", error);
      }

      // Trigger hurt animation and sound when player dies
      setIsPlayerHurt(true);
      playHurtSound();

      // Remove hurt animation after effect
      setTimeout(() => {
        setIsPlayerHurt(false);
      }, 500);

      console.log("Revival time expired - player is dead! Heartbeats stopped.");
    }

    return () => clearTimeout(timer);
  }, [isCurrentPlayerKnockedOut, currentPlayerRevivalTimeLeft, playHurtSound]);

  // **REMOVED: Manual knockout detection - now handled by backend**
  // useEffect(() => {
  //   if (playerLivesRemaining === 0 && !isCurrentPlayerKnockedOut) {
  //     handlePlayerKnockout();
  //   }
  // }, [playerLivesRemaining, isCurrentPlayerKnockedOut]);

  // Effect to handle boss defeat sequence
  useEffect(() => {
    if (bossCurrentHealth === 0) {
      // ===== BOSS DEFEAT SEQUENCE TIMING ===== //
      // Show defeat message after configurable delay
      const defeatMessageTimer = setTimeout(() => {
        setIsBossDefeatMessageVisible(true);
      }, BOSS_DEFEAT_MESSAGE_DELAY_MS); // Easy to modify: currently 1 second

      // Show countdown after configurable delay
      const countdownTimer = setTimeout(() => {
        setIsBossDefeatCountdownVisible(true);

        // Start countdown from configurable duration
        let countdownSeconds = BOSS_DEFEAT_COUNTDOWN_DURATION_SECONDS; // Easy to modify: currently 6 seconds
        setBossDefeatCountdownNumber(countdownSeconds);

        const countdownInterval = setInterval(() => {
          countdownSeconds--;
          if (countdownSeconds > 0) {
            setBossDefeatCountdownNumber(countdownSeconds);
          } else {
            clearInterval(countdownInterval);
            setIsBossDefeatCountdownVisible(false);
            setIsBossDefeatMessageVisible(false);
            // Navigate to the victory podium page
            console.log("Boss defeated! Going to podium...");
            navigate("/boss-podium");
          }
        }, 1000); // 1 second intervals for countdown
      }, BOSS_DEFEAT_COUNTDOWN_DELAY_MS); // Easy to modify: currently 1 second total

      return () => {
        clearTimeout(defeatMessageTimer);
        clearTimeout(countdownTimer);
      };
    }
  }, [bossCurrentHealth, navigate]);

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

  // Cleanup effect to stop heartbeats sound when component unmounts or player becomes dead
  useEffect(() => {
    return () => {
      // Stop heartbeats sound when component unmounts (e.g., navigating away)
      try {
        if (heartbeatsAudioRef.current) {
          heartbeatsAudioRef.current.pause();
          heartbeatsAudioRef.current.currentTime = 0;
          heartbeatsAudioRef.current.loop = false;
          console.log("Heartbeats stopped - component cleanup");
        }
      } catch (error) {
        console.log("Error stopping heartbeats audio during cleanup:", error);
      }
    };
  }, []);

  // Effect to stop heartbeats sound when player becomes dead
  useEffect(() => {
    if (isCurrentPlayerDead) {
      // Force stop heartbeats sound with error handling
      try {
        if (heartbeatsAudioRef.current) {
          heartbeatsAudioRef.current.pause();
          heartbeatsAudioRef.current.currentTime = 0;
          heartbeatsAudioRef.current.loop = false;
          console.log("Heartbeats stopped - player is dead");
        }
      } catch (error) {
        console.log("Error stopping heartbeats audio when player died:", error);
      }
    }
  }, [isCurrentPlayerDead]);

  // Function to remove badge notification
  const removeBadgeNotification = useCallback((badgeId) => {
    setBadgeNotifications((prev) =>
      prev.filter((notification) => notification.id !== badgeId)
    );
  }, []);

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

      {/* Full Screen Wrong Answer Flash */}
      {isPlayerHurt && (
        <div className="absolute inset-0 bg-red-500/60 z-50 animate-pulse"></div>
      )}

      <div className="h-full flex flex-col p-3 max-w-md mx-auto relative z-10">
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0 relative">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLeave}
              variant="outline"
              size="sm"
              className="flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 rotate-180" />
            </Button>
          </div>

          {/* Boss Name - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h2 className="text-lg font-bold">{BOSS_NAME}</h2>
            {/* Team Information */}
            {currentPlayerTeam && (
              <div className="text-xs text-center text-muted-foreground">
                {currentPlayerTeam.teamName}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="sm"
              className="flex items-center justify-center"
            >
              {isDarkModeEnabled ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={handleLiveLeaderboard}
              variant="outline"
              size="sm"
              className="flex items-center justify-center"
            >
              <Trophy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Boss Health Section */}
        <div className="mb-3 flex-shrink-0">
          {/* Boss Image with Overlay */}
          <div className="relative">
            <div
              className={`aspect-square bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-600 transition-all duration-500 ${
                isBossTakingDamage ? "bg-red-500/50 shake" : ""
              }`}
            >
              <img
                src={BOSS_IMAGE_URL}
                alt={BOSS_NAME}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isBossTakingDamage ? "opacity-70" : ""
                } ${
                  bossCurrentHealth === 0
                    ? "grayscale brightness-50 blur-sm"
                    : ""
                }`}
              />

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
                        bossMaxHealth > 0
                          ? (bossCurrentHealth / bossMaxHealth) * 100
                          : 0
                      }
                      className="h-6 [&>div]:bg-red-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white drop-shadow-lg">
                        {bossCurrentHealth}/{bossMaxHealth} HP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boss Defeat Message */}
              {isBossDefeatMessageVisible && (
                <div className="absolute inset-0 items-center justify-center z-30 animate-fade-in">
                  <div className="mt-30 sm:mt-40 text-center bg-black/80 p-4">
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2 flex items-center justify-center gap-2">
                      <Skull className="w-6 h-6" />
                      {BOSS_NAME} has been defeated!
                    </h2>
                  </div>
                  {/* Show countdown under defeat message */}
                  {isBossDefeatCountdownVisible && (
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
              {teamKnockedOutPlayers.length > 0 &&
                !isCurrentPlayerKnockedOut && (
                  <>
                    <span className="text-xs font-bold text-muted-foreground">
                      {teamKnockedOutPlayers.length} Player
                      {teamKnockedOutPlayers.length > 1 ? "s" : ""} Down
                    </span>
                    {/* Revive button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-9 h-9 p-0 flex items-center justify-center text-green-500 border-background-500 border-3 hover:bg-green-500 hover:text-white rounded-full animate-pulse"
                      onClick={() => {
                        console.log("🚑 Revival button clicked!");
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
                        (questionTimeRemaining / questionMaxTimeSeconds) * 100,
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
                  Q
                  {currentQuestionData?.questionNumber || currentQuestionNumber}
                </Badge>
                {currentQuestionData?.categoryName && (
                  <Badge variant="secondary" className="text-xs">
                    {currentQuestionData.categoryName}
                  </Badge>
                )}
              </div>
              {currentQuestionData?.totalQuestions && (
                <span className="text-xs text-muted-foreground">
                  {currentQuestionData.questionNumber} /{" "}
                  {currentQuestionData.totalQuestions}
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="mb-3 flex-shrink-0">
              <p className="text-sm font-medium">
                {isLoadingQuestion
                  ? isWaitingForResult
                    ? "Processing your answer..."
                    : "Loading question..."
                  : currentQuestionData?.questionText ||
                    fallbackQuestionData.questionText}
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-2 flex-1 min-h-0 -mb-3">
              {isLoadingQuestion
                ? // Loading state
                  [...Array(4)].map((_, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full p-2 h-full text-center whitespace-normal font-medium text-sm bg-muted animate-pulse"
                      disabled
                    >
                      {isWaitingForResult ? "Processing..." : "Loading..."}
                    </Button>
                  ))
                : // Normal answer options
                  (
                    currentQuestionData || fallbackQuestionData
                  ).answerOptions.map((option, index) => {
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
                          playerSelectedAnswer === option
                            ? selectedColors[index]
                            : colors[index]
                        } ${
                          isCurrentPlayerKnockedOut ||
                          isCurrentPlayerDead ||
                          bossCurrentHealth === 0 ||
                          isLoadingQuestion ||
                          isWaitingForResult // **NEW: Disable during waiting**
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={
                          isCurrentPlayerKnockedOut ||
                          isCurrentPlayerDead ||
                          bossCurrentHealth === 0 ||
                          isLoadingQuestion ||
                          isWaitingForResult // **NEW: Disable during waiting**
                        }
                      >
                        {option}
                      </Button>
                    );
                  })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Battle Leaderboard */}
      <BattleLeaderboard
        isOpen={isLeaderboardVisible}
        onClose={() => setIsLeaderboardVisible(false)}
      />

      {/* Knocked Out Alert Dialog */}
      <AlertDialog open={isCurrentPlayerKnockedOut || isCurrentPlayerDead}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            {isCurrentPlayerDead ? (
              // Dead state - show death message
              <div className="text-center space-y-4">
                {/* Force stop heartbeats when dead dialog is shown */}
                {(() => {
                  try {
                    if (heartbeatsAudioRef.current) {
                      heartbeatsAudioRef.current.pause();
                      heartbeatsAudioRef.current.currentTime = 0;
                      heartbeatsAudioRef.current.loop = false;
                      console.log("Heartbeats stopped - dead dialog shown");
                    }
                  } catch (error) {
                    console.log(
                      "Error stopping heartbeats in dead dialog:",
                      error
                    );
                  }
                  return null;
                })()}

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
                    onClick={() => navigate("/boss-preview")}
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
                  {currentPlayerRevivalTimeLeft}s
                </div>

                {/* Main message */}
                <AlertDialogTitle className="text-center text-foreground text-lg font-semibold">
                  You are down!
                </AlertDialogTitle>

                {/* Instructions */}
                <AlertDialogDescription className="text-center text-muted-foreground">
                  Show this code to a teammate to get revived!
                </AlertDialogDescription>

                {/* Revival code - only show if code exists */}
                {currentPlayerRevivalCode ? (
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <span className="text-2xl font-mono font-bold text-foreground tracking-wider">
                      {currentPlayerRevivalCode.slice(0, 3)}-
                      {currentPlayerRevivalCode.slice(3)}
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

      {/* OTP Input Dialog for Revival Code */}
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

      {/* Answer Grid Overlay - Disable interactions when knocked out or dead */}
      {(isCurrentPlayerKnockedOut || isCurrentPlayerDead) && (
        <div className="absolute inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="text-white text-center">
            {isCurrentPlayerDead ? (
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
                  Share your code: {currentPlayerRevivalCode}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Badge Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
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
      </div>
    </main>
  );
};

export default BossBattle;
