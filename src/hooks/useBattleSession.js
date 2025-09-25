// ===== LIBRARIES ===== //
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";
import { useAuth } from "@/context/useAuth";

// ===== SERVICES ===== //
import { fetchEventBossById } from "@/services/eventBossService";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";
import { getUserInfo } from "@/utils/userUtils";

// ===== AUDIOS ===== //
import punchSound from "@/assets/Audio/punch1.mp3";
import hurtSound1 from "@/assets/Audio/hurt1.mp3";
import hurtSound2 from "@/assets/Audio/hurt2.mp3";
import heartbeatsSound from "@/assets/Audio/heartbeats.mp3";

const useBattleSession = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();
  const { user } = useAuth();

  const [eventBoss, setEventBoss] = useState(null);
  const [eventBossCurrentHP, setEventBossCurrentHP] = useState(0);
  const [eventBossMaxHP, setEventBossMaxHP] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(0);
  const [playerLivesRemaining, setPlayerLivesRemaining] = useState(3);
  const [playerTeam, setPlayerTeam] = useState(null);

  const [isBossTakingDamage, setIsBossTakingDamage] = useState(false);
  const [isPlayerHurt, setIsPlayerHurt] = useState(false);
  const [choiceIndexSelected, setChoiceIndexSelected] = useState(null);
  const [damageNumbersArray, setDamageNumbersArray] = useState([]);

  const [isPlayerKnockedOut, setIsPlayerKnockedOut] = useState(false);
  const [isPlayerDead, setIsPlayerDead] = useState(false);
  const [playerRevivalCode, setPlayerRevivalCode] = useState("");
  const [revivalTimer, setRevivalTimer] = useState(null);
  const [revivalEndTime, setRevivalEndTime] = useState(null);
  const [teammateKnockedOutCount, setTeammateKnockedOutCount] = useState(0);
  const [isEventBossDefeated, setIsEventBossDefeated] = useState(false);
  const [isDefeatMessageVisible, setIsDefeatMessageVisible] = useState(false);
  const [isPodiumCountdownVisible, setIsPodiumCountdownVisible] =
    useState(false);
  const [podiumTimer, setPodiumTimer] = useState(null);
  const [podiumEndTime, setPodiumEndTime] = useState(null);

  const [playerBadges, setPlayerBadges] = useState([]);
  const [currentPlayerBadge, setCurrentPlayerBadge] = useState(null);
  const [isBadgeDisplaying, setIsBadgeDisplaying] = useState(false);

  const [loading, setLoading] = useState({
    eventBoss: false,
    question: false,
    result: false,
  });
  const [hasJoinedSession, setHasJoinedSession] = useState(false);
  const [isReconnected, setIsReconnected] = useState(false);
  const [isPlayerNotFound, setIsPlayerNotFound] = useState(false);

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
      } catch (error) {
        console.log("Error during audio cleanup:", error);
      }
    };
  }, []);

  // Function to play random hurt sound
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

  // Join the battle session
  const joinSession = useCallback(
    (playerId) => {
      if (!socket || !eventBossId || !joinCode || !playerId) return;

      setLoading((prev) => ({ ...prev, eventBoss: true }));
      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.JOIN, {
        eventBossId,
        joinCode,
        playerId,
      });
    },
    [socket, eventBossId, joinCode]
  );

  // Leave the battle session
  const leaveSession = useCallback(
    (playerId) => {
      if (!socket || eventBossId || !playerId) return;

      setLoading((prev) => ({ ...prev, eventBoss: true }));
      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.LEAVE, {
        eventBossId,
        playerId,
      });
    },
    [socket, eventBossId]
  );

  // Reconnect to the battle session
  const reconnectSession = useCallback(
    (playerId) => {
      if (!socket || !eventBossId || !playerId) return;
      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.RECONNECT, {
        eventBossId,
        playerId,
      });
    },
    [socket, eventBossId]
  );

  // Request the next question
  const requestNextQuestion = useCallback(
    (playerId) => {
      if (!socket || !eventBossId || !playerId) return;

      setLoading((prev) => ({ ...prev, question: true }));
      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.QUESTION.REQUEST, {
        eventBossId,
        playerId,
      });
    },
    [socket, eventBossId]
  );

  // Submit an answer to the current question
  const submitAnswer = useCallback(
    (playerId, choiceIndex, responseTime) => {
      if (
        !socket ||
        !eventBossId ||
        !playerId ||
        choiceIndex === null ||
        !responseTime
      )
        return;

      setChoiceIndexSelected(choiceIndex);
      setLoading((prev) => ({ ...prev, result: true }));
      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.ANSWER.SUBMIT, {
        eventBossId,
        playerId,
        choiceIndex,
        responseTime,
      });
    },
    [socket, eventBossId]
  );

  // Submit revival code
  const submitRevivalCode = useCallback(
    (revivalCode) => {
      if (!socket || !eventBossId || !revivalCode) return;

      const userInfo = getUserInfo(user);
      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.REVIVAL_CODE.SUBMIT, {
        eventBossId,
        playerId: userInfo.id || null,
        revivalCode,
      });
    },
    [socket, eventBossId, user]
  );

  // Function to generate floating damage numbers
  const generateDamageNumber = useCallback((damage, responseCategory) => {
    const damageId = Date.now() + Math.random();
    const randomX = 20 + Math.random() * 60;
    const randomY = 30 + Math.random() * 40;

    const newDamageNumber = {
      id: damageId,
      damage: damage,
      x: randomX,
      y: randomY,
      responseCategory: responseCategory,
      color: "text-red-500",
    };

    setDamageNumbersArray((prev) => [...prev, newDamageNumber]);

    // Remove damage number after animation completes
    setTimeout(() => {
      setDamageNumbersArray((prev) =>
        prev.filter((dmg) => dmg.id !== damageId)
      );
    }, 2000);
  }, []);

  const addPlayerBadgeToQueue = useCallback((badge, message) => {
    const badgeNotification = {
      id: Date.now() + Math.random(),
      badgeId: badge.id,
      name: badge.name,
      code: badge.code,
      type: badge.type,
      threshold: badge.threshold,
      message,
    };
    setPlayerBadges((prev) => [...prev, badgeNotification]);
  }, []);

  const removeCurrentBadge = useCallback(() => {
    setCurrentPlayerBadge(null);
    setIsBadgeDisplaying(false);
  }, []);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode || hasJoinedSession) return;

    const userInfo = getUserInfo(user);
    joinSession(userInfo.id || null);
    setHasJoinedSession(true);
  }, [socket, eventBossId, joinCode, hasJoinedSession, user, joinSession]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode || isReconnected) return;
    const userInfo = getUserInfo(user);
    reconnectSession(userInfo.id || null);
  }, [socket, eventBossId, joinCode, isReconnected, user, reconnectSession]);

  useEffect(() => {
    if (playerBadges.length === 0 || isBadgeDisplaying) return;

    setCurrentPlayerBadge(playerBadges[0]);
    setPlayerBadges((prev) => prev.slice(1));
    setIsBadgeDisplaying(true);
  }, [playerBadges, isBadgeDisplaying]);

  useEffect(() => {
    if (
      isPlayerKnockedOut ||
      isPlayerDead ||
      isEventBossDefeated ||
      !currentQuestion ||
      loading.question ||
      loading.result
    ) {
      return;
    }
    if (questionTimeRemaining > 0) {
      const timer = setInterval(() => {
        setQuestionTimeRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (questionTimeRemaining === 0 && currentQuestion) {
      const userInfo = getUserInfo(user);
      submitAnswer(userInfo.id || null, -1, currentQuestion.timeLimit);
    }
  }, [
    isPlayerKnockedOut,
    isPlayerDead,
    isEventBossDefeated,
    loading.question,
    loading.result,
    questionTimeRemaining,
    currentQuestion,
    user,
    submitAnswer,
  ]);

  useEffect(() => {
    if (!revivalEndTime) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((revivalEndTime - Date.now()) / 1000)
      );
      setRevivalTimer(timeLeft);
    }, 1000);

    if (revivalTimer === 0) {
      const userInfo = getUserInfo(user);
      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.REVIVAL_CODE.EXPIRED, {
        eventBossId,
        playerId: userInfo.id || null,
      });
    }

    return () => clearInterval(interval);
  }, [revivalEndTime, socket, eventBossId, user, revivalTimer]);

  useEffect(() => {
    if (!podiumEndTime) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((podiumEndTime - Date.now()) / 1000)
      );
      setPodiumTimer(timeLeft);
      console.log("Podium countdown:", timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [podiumEndTime]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode) return;

    const handleJoinedSession = (payload) => {
      setLoading((prev) => ({ ...prev, eventBoss: false }));
      setEventBoss(payload.data.eventBoss);
      setEventBossCurrentHP(payload.data.eventBoss.currentHP);
      setEventBossMaxHP(payload.data.eventBoss.maxHP);
      setPlayerLivesRemaining(payload.data.player.hearts);
      setPlayerTeam(payload.data.player.teamName);
      toast.success(payload.message);
    };

    const handleReconnected = (payload) => {
      setIsReconnected(true);
      setCurrentQuestion(payload.data.currentQuestion);
      setCurrentQuestionNumber(payload.data.currentQuestionNumber);
      setQuestionTimeRemaining(payload.data.questionTimeRemaining);
      setLoading((prev) => ({ ...prev, question: false, result: false }));

      if (!payload.data.currentQuestion) {
        const userInfo = getUserInfo(user);
        requestNextQuestion(userInfo.id || null);
      }
    };

    const handleReconnectFailed = (payload) => {
      toast.error(payload.message || "Reconnection to battle session failed.");
      setIsReconnected(false);
      setIsPlayerNotFound(true);
      console.log(payload.message);
    };

    const handleNextQuestion = (payload) => {
      setLoading((prev) => ({ ...prev, question: false, result: false }));
      setCurrentQuestion(payload.data);
      setCurrentQuestionNumber((prev) => prev + 1);
      setChoiceIndexSelected(null);
      setQuestionTimeRemaining(payload.data.timeLimit / 1000 || 0);
    };

    const handleAnswerResult = (payload) => {
      const {
        isCorrect,
        damage,
        responseCategory,
        playerHearts,
        eventBossCurrentHP,
      } = payload.data;
      setEventBossCurrentHP(eventBossCurrentHP);
      setPlayerLivesRemaining(playerHearts);
      if (damage > 0) {
        setIsBossTakingDamage(true);
        generateDamageNumber(damage, responseCategory);
        if (punchAudioRef.current) {
          punchAudioRef.current.currentTime = 0;
          punchAudioRef.current.play().catch((error) => {
            console.log("Audio play failed:", error);
          });
        }
        setTimeout(() => setIsBossTakingDamage(false), 500);
      }
      if (!isCorrect) {
        setIsPlayerHurt(true);
        playHurtSound();
        setTimeout(() => setIsPlayerHurt(false), 500);
      }

      if (playerHearts > 0 && !isEventBossDefeated) {
        const userInfo = getUserInfo(user);
        setTimeout(() => requestNextQuestion(userInfo.id || null), 500);
      }
    };

    const handleBossDamaged = (payload) => {
      const { damage, eventBossCurrentHP } = payload.data;
      setEventBossCurrentHP(eventBossCurrentHP);
      setIsBossTakingDamage(true);
      generateDamageNumber(damage, null);
      setTimeout(() => setIsBossTakingDamage(false), 500);
    };

    const handlePlayerJoined = (payload) => {
      toast.success(payload.message);
    };

    const handleBossHPUpdated = (payload) => {
      setEventBossCurrentHP(payload.data.eventBoss.currentHP);
      setEventBossMaxHP(payload.data.eventBoss.maxHP);
    };

    const handleTeammateKnockedOutCount = (payload) => {
      setTeammateKnockedOutCount(payload.data.knockedOutPlayersCount);
      toast.info(payload.message || "A teammate has been knocked out!");
    };

    const handlePlayerKnockedOut = (payload) => {
      const { revivalCode, revivalEndTime } = payload.data;
      setIsPlayerKnockedOut(true);
      setPlayerRevivalCode(revivalCode);
      setRevivalEndTime(revivalEndTime);
      setRevivalTimer(Math.ceil((revivalEndTime - Date.now()) / 1000));
      toast.info(
        payload.message ||
          "You have been knocked out! Share your revival code with teammates."
      );
      if (heartbeatsAudioRef.current) {
        heartbeatsAudioRef.current.currentTime = 0;
        heartbeatsAudioRef.current.loop = true;
        heartbeatsAudioRef.current.play().catch((error) => {
          console.log("Heartbeats audio play failed:", error);
        });
      }
    };

    const handlePlayerDead = (payload) => {
      if (heartbeatsAudioRef.current) {
        heartbeatsAudioRef.current.pause();
        heartbeatsAudioRef.current.currentTime = 0;
        heartbeatsAudioRef.current.loop = false;
      }
      setIsPlayerDead(true);
      setIsPlayerKnockedOut(false);
      setPlayerRevivalCode("");
      toast.info(payload.message || "You have died! Better luck next time.");

      playHurtSound();
      setTimeout(() => setIsPlayerHurt(false), 500);
    };

    const handleTeammateKnockedOut = (payload) => {
      setTeammateKnockedOutCount((prev) => prev + 1);
      toast.info(payload.message || "A teammate has been knocked out!");
    };

    const handleTeammateDead = (payload) => {
      setTeammateKnockedOutCount((prev) => Math.max(0, prev - 1));
      toast.info(payload.message || "A teammate has died!");
    };

    const handleRevivalCodeExpired = (payload) => {
      setIsPlayerKnockedOut(false);
      setPlayerRevivalCode("");
      setRevivalEndTime(null);
      setRevivalTimer(null);
      toast.info(payload.message || "Your revival code has expired.");
    };

    const handleRevivalCodeSuccess = (payload) => {
      setTeammateKnockedOutCount((prev) => Math.max(0, prev - 1));
      toast.success(payload.message || "You have revived a teammate!");
    };

    const handleRevivalCodeFailure = (payload) => {
      toast.error(payload.message || "Failed to revive teammate.");
    };

    const handleRevived = (payload) => {
      setIsPlayerKnockedOut(false);
      setPlayerRevivalCode("");
      setRevivalEndTime(null);
      setRevivalTimer(null);
      setPlayerLivesRemaining(payload.data.playerHearts);
      toast.success(payload.message || "You have been revived!");
      if (!isEventBossDefeated) {
        const userInfo = getUserInfo(user);
        setTimeout(() => requestNextQuestion(userInfo.id || null), 500);
      }
      // Stop heartbeats sound
      if (heartbeatsAudioRef.current) {
        heartbeatsAudioRef.current.pause();
        heartbeatsAudioRef.current.currentTime = 0;
        heartbeatsAudioRef.current.loop = false;
      }
    };

    const handleSessionEnded = (payload) => {
      setIsEventBossDefeated(true);
      setTimeout(() => setIsDefeatMessageVisible(true), 1000);
      setIsPodiumCountdownVisible(true);
      toast.info(payload.message || "The battle has ended.");
      setPodiumEndTime(payload.data.podiumEndTime);
      setPodiumTimer(
        Math.ceil((payload.data.podiumEndTime - Date.now()) / 1000)
      );

      // Play victory sound
      if (punchAudioRef.current) {
        punchAudioRef.current.currentTime = 0;
        punchAudioRef.current.play().catch((error) => {
          console.log("Audio play failed:", error);
        });
      }
    };

    const handleBadgeEarned = (payload) => {
      addPlayerBadgeToQueue(payload.data.playerBadge.badge, payload.message);
    };

    const handlePlayerNotFound = (payload) => {
      toast.error(payload.message || "Player not found in this session.");
      setIsPlayerNotFound(true);
    };

    const handleSocketError = (error) => {
      toast.error(`Socket error: ${error.message}`);
      console.error("Socket error:", error);
    };

    socket.on(SOCKET_EVENTS.BATTLE_SESSION.JOINED, handleJoinedSession);
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.PLAYER.RECONNECTED,
      handleReconnected
    );
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.PLAYER.RECONNECT_FAILED,
      handleReconnectFailed
    );
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.QUESTION.NEXT, handleNextQuestion);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.ANSWER.RESULT, handleAnswerResult);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.BOSS.DAMAGED, handleBossDamaged);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.JOINED, handlePlayerJoined);
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.BOSS.HP_UPDATED,
      handleBossHPUpdated
    );
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.TEAMMATE.KNOCKED_OUT_COUNT,
      handleTeammateKnockedOutCount
    );
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.PLAYER.KNOCKED_OUT,
      handlePlayerKnockedOut
    );
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.DEAD, handlePlayerDead);
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.TEAMMATE.KNOCKED_OUT,
      handleTeammateKnockedOut
    );
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.TEAMMATE.DEAD, handleTeammateDead);
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.REVIVAL_CODE.EXPIRED_RESPONSE,
      handleRevivalCodeExpired
    );
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.REVIVAL_CODE.SUCCESS,
      handleRevivalCodeSuccess
    );
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.REVIVAL_CODE.FAILURE,
      handleRevivalCodeFailure
    );
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.REVIVED, handleRevived);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.ENDED, handleSessionEnded);
    socket.on(SOCKET_EVENTS.BADGE.EARNED, handleBadgeEarned);
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.PLAYER.NOT_FOUND,
      handlePlayerNotFound
    );
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

    return () => {
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.JOINED, handleJoinedSession);
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.PLAYER.RECONNECTED,
        handleReconnected
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.PLAYER.RECONNECT_FAILED,
        handleReconnectFailed
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.QUESTION.NEXT,
        handleNextQuestion
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.ANSWER.RESULT,
        handleAnswerResult
      );
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.BOSS.DAMAGED, handleBossDamaged);
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.BOSS.HP_UPDATED,
        handleBossHPUpdated
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.PLAYER.JOINED,
        handlePlayerJoined
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.PLAYER.KNOCKED_OUT,
        handlePlayerKnockedOut
      );
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.DEAD, handlePlayerDead);
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.TEAMMATE.KNOCKED_OUT,
        handleTeammateKnockedOut
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.TEAMMATE.DEAD,
        handleTeammateDead
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.REVIVAL_CODE.EXPIRED_RESPONSE,
        handleRevivalCodeExpired
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.REVIVAL_CODE.SUCCESS,
        handleRevivalCodeSuccess
      );
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.REVIVAL_CODE.FAILURE,
        handleRevivalCodeFailure
      );
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.REVIVED, handleRevived);
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.ENDED, handleSessionEnded);
      socket.off(SOCKET_EVENTS.BADGE.EARNED, handleBadgeEarned);
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.PLAYER.NOT_FOUND,
        handlePlayerNotFound
      );
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
    };
  }, [
    socket,
    eventBossId,
    joinCode,
    hasJoinedSession,
    currentQuestion,
    isPlayerKnockedOut,
    isPlayerDead,
    isEventBossDefeated,
    isReconnected,
    playHurtSound,
    joinSession,
    requestNextQuestion,
    generateDamageNumber,
    reconnectSession,
    addPlayerBadgeToQueue,
  ]);

  useEffect(() => {
    if (!eventBoss && !loading.eventBoss && eventBossId && hasJoinedSession) {
      const fallbackTimer = setTimeout(() => {
        console.warn("Using HTTP fallback event boss data");
        fetchEventBossById(eventBossId)
          .then((eventBoss) => {
            if (eventBoss) {
              setEventBoss(eventBoss);
            }
          })
          .catch((error) => {
            console.error("Error fetching fallback event boss data:", error);
          });
      }, 1000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [eventBoss, loading, eventBossId, hasJoinedSession]);

  // Cleanup effect to stop heartbeats sound when component unmounts or player becomes dead
  useEffect(() => {
    return () => {
      try {
        if (heartbeatsAudioRef.current) {
          heartbeatsAudioRef.current.pause();
          heartbeatsAudioRef.current.currentTime = 0;
          heartbeatsAudioRef.current.loop = false;
        }
      } catch (error) {
        console.log("Error stopping heartbeats audio during cleanup:", error);
      }
    };
  }, []);

  // Effect to stop heartbeats sound when player becomes dead
  useEffect(() => {
    if (isPlayerDead) {
      try {
        if (heartbeatsAudioRef.current) {
          heartbeatsAudioRef.current.pause();
          heartbeatsAudioRef.current.currentTime = 0;
          heartbeatsAudioRef.current.loop = false;
        }
      } catch (error) {
        console.log("Error stopping heartbeats audio when player died:", error);
      }
    }
  }, [isPlayerDead]);

  return {
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
    podiumTimer,
    playerBadges,
    currentPlayerBadge,
    isBadgeDisplaying,
    loading,
    hasJoinedSession,
    isPlayerNotFound,
    joinSession,
    leaveSession,
    requestNextQuestion,
    submitAnswer,
    submitRevivalCode,
    removeCurrentBadge,
  };
};

export default useBattleSession;
