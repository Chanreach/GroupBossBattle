// ===== LIBRARIES ===== //
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";
import { useAuth } from "@/context/useAuth";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";

// ===== AUDIOS ===== //
import punchSound from "@/assets/Audio/punch1.mp3";
import hurtSound1 from "@/assets/Audio/hurt1.mp3";
import hurtSound2 from "@/assets/Audio/hurt2.mp3";
import heartbeatsSound from "@/assets/Audio/heartbeats.mp3";

const useBattleSession = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();
  const { auth } = useAuth();

  const [eventBoss, setEventBoss] = useState(null);
  const [eventBossCurrentHP, setEventBossCurrentHP] = useState(0);
  const [eventBossMaxHP, setEventBossMaxHP] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [questionEndAt, setQuestionEndAt] = useState(null);
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
  const [revivalEndAt, setRevivalEndAt] = useState(null);
  const [teammateKnockedOutCount, setTeammateKnockedOutCount] = useState(0);
  const [isEventBossDefeated, setIsEventBossDefeated] = useState(false);
  const [isDefeatMessageVisible, setIsDefeatMessageVisible] = useState(false);
  const [isPodiumCountdownVisible, setIsPodiumCountdownVisible] =
    useState(false);
  const [podiumTimer, setPodiumTimer] = useState(null);
  const [podiumEndAt, setPodiumEndAt] = useState(null);

  const [playerBadges, setPlayerBadges] = useState([]);
  const [currentPlayerBadge, setCurrentPlayerBadge] = useState(null);
  const [isBadgeDisplaying, setIsBadgeDisplaying] = useState(false);

  const [hasJoinedSession, setHasJoinedSession] = useState(false);
  const [removedPlayerMessage, setRemovedPlayerMessage] = useState("");
  const [isDataNotFound, setIsDataNotFound] = useState(false);
  const [NotFoundMessage, setNotFoundMessage] = useState("");
  const hasSubmittedAnswerRef = useRef(false);
  const hasInitiatedJoinRef = useRef(false);
  const hasRequestedFirstQuestionRef = useRef(false);

  const [loading, setLoading] = useState({
    eventBoss: false,
    question: false,
    result: false,
  });

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
        responseTime === undefined
      )
        return;

      setLoading((prev) => ({ ...prev, result: true }));
      setChoiceIndexSelected(choiceIndex);
      hasSubmittedAnswerRef.current = true;
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

      socket.emit(SOCKET_EVENTS.BATTLE_SESSION.REVIVAL_CODE.SUBMIT, {
        eventBossId,
        playerId: auth?.user?.id || null,
        revivalCode,
      });
    },
    [socket, eventBossId, auth]
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
    if (!socket || !eventBossId || !joinCode || hasInitiatedJoinRef.current)
      return;

    hasInitiatedJoinRef.current = true;
    joinSession(auth?.user?.id || null);
    setHasJoinedSession(true);

    return () => {
      hasInitiatedJoinRef.current = false;
    };
  }, [socket, eventBossId, joinCode, auth, joinSession]);

  useEffect(() => {
    if (playerBadges.length === 0 || isBadgeDisplaying) return;

    setCurrentPlayerBadge(playerBadges[0]);
    setPlayerBadges((prev) => prev.slice(1));
    setIsBadgeDisplaying(true);
  }, [playerBadges, isBadgeDisplaying]);

  useEffect(() => {
    hasSubmittedAnswerRef.current = false;
  }, [currentQuestion]);

  useEffect(() => {
    if (
      isPlayerKnockedOut ||
      isPlayerDead ||
      isEventBossDefeated ||
      !currentQuestion ||
      !questionEndAt ||
      loading.question ||
      loading.result
    )
      return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(0, questionEndAt - Date.now());
      setQuestionTimeRemaining(timeLeft);
      if (timeLeft <= 0 && !hasSubmittedAnswerRef.current) {
        submitAnswer(auth?.user?.id || null, -1, currentQuestion.timeLimit);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    isPlayerKnockedOut,
    isPlayerDead,
    isEventBossDefeated,
    currentQuestion,
    questionEndAt,
    loading,
    auth,
    submitAnswer,
  ]);

  useEffect(() => {
    if (!podiumEndAt) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((podiumEndAt - Date.now()) / 1000)
      );
      setPodiumTimer(timeLeft);
      console.log("Podium countdown:", timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [podiumEndAt]);

  useEffect(() => {
    if (!socket || !eventBossId || !joinCode) return;

    const handleEventEnded = (payload) => {
      console.log("Event ended payload:", payload);
      setIsEventBossDefeated(true);
      setTimeout(() => setIsDefeatMessageVisible(true), 1000);
      setIsPodiumCountdownVisible(true);
      if (payload.data.podiumEndAt > Date.now()) {
        setPodiumEndAt(payload.data.podiumEndAt);
        setPodiumTimer(
          Math.ceil((payload.data.podiumEndAt - Date.now()) / 1000)
        );
      } else {
        setPodiumEndAt(Date.now() + 3000);
        setPodiumTimer(3);
      }
      toast.info(
        payload.message || "The event has ended. Thank you for participating!"
      );

      // Play victory sound
      if (punchAudioRef.current) {
        punchAudioRef.current.currentTime = 0;
        punchAudioRef.current.play().catch((error) => {
          console.log("Audio play failed:", error);
        });
      }
    };

    const handleJoinedSession = (payload) => {
      setLoading({ eventBoss: false, question: false, result: false });
      setHasJoinedSession(true);
      setEventBoss(payload.data.eventBoss);
      setEventBossCurrentHP(payload.data.eventBoss.currentHP);
      setEventBossMaxHP(payload.data.eventBoss.maxHP);
      setPlayerLivesRemaining(payload.data.player.hearts);
      setPlayerTeam(payload.data.player.teamName);
      setCurrentQuestion(payload.data.question.currentQuestion);
      setCurrentQuestionNumber(payload.data.question.currentQuestionNumber);
      setQuestionEndAt(payload.data.question.questionEndAt);
      setQuestionTimeRemaining(
        Math.max(0, payload.data.question.questionEndAt - Date.now())
      );
      toast.success(payload.message);

      if (
        !payload.data.question.currentQuestion &&
        !hasRequestedFirstQuestionRef.current
      ) {
        hasRequestedFirstQuestionRef.current = true;
        requestNextQuestion(auth?.user?.id || null);
      }
    };

    const handleDataNotFound = (payload) => {
      setIsDataNotFound(true);
      setNotFoundMessage(payload.message || "Requested data not found.");
      console.error(payload.message || "Requested data not found.");
    };

    const handleNextQuestion = (payload) => {
      setLoading((prev) => ({ ...prev, question: false, result: false }));
      setCurrentQuestion(payload.data.currentQuestion);
      // Use the question number from the payload if available, otherwise increment
      if (payload.data.questionNumber !== undefined) {
        setCurrentQuestionNumber(payload.data.questionNumber);
      } else {
        setCurrentQuestionNumber((prev) => prev + 1);
      }
      setChoiceIndexSelected(null);
      setQuestionEndAt(payload.data.currentQuestion.endAt);
      setQuestionTimeRemaining(
        Math.max(0, payload.data.currentQuestion.endAt - Date.now())
      );
    };

    const handleAnswerResult = (payload) => {
      const {
        isCorrect,
        damage,
        responseCategory,
        playerHearts,
        eventBossCurrentHP,
      } = payload.data.answerResult;
      setLoading((prev) => ({ ...prev, result: false }));
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
        setTimeout(() => requestNextQuestion(auth?.user?.id || null), 500);
      }
    };

    const handleBossDamaged = (payload) => {
      const { damage, eventBossCurrentHP } = payload.data.answerResult;
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
      setIsPlayerKnockedOut(true);
      setPlayerRevivalCode(payload.data.knockoutInfo.revivalCode);
      setRevivalEndAt(payload.data.knockoutInfo.revivalEndAt);
      setRevivalTimer(
        Math.ceil((payload.data.knockoutInfo.revivalEndAt - Date.now()) / 1000)
      );
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
      setRevivalEndAt(null);
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
      setRevivalEndAt(null);
      setRevivalTimer(null);
      setPlayerLivesRemaining(payload.data.playerHearts);
      toast.success(payload.message || "You have been revived!");
      if (!isEventBossDefeated) {
        setTimeout(() => requestNextQuestion(auth?.user?.id || null), 500);
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
      if (payload.data.podiumEndAt > Date.now()) {
        setPodiumEndAt(payload.data.podiumEndAt);
        setPodiumTimer(
          Math.ceil((payload.data.podiumEndAt - Date.now()) / 1000)
        );
      } else {
        setPodiumEndAt(Date.now() + 3000);
        setPodiumTimer(3);
      }
      toast.info(payload.message || "The battle has ended.");

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

    const handleLeftSession = (payload) => {
      console.log("Left session:", payload.message);
    };

    const handlePlayerRemoved = (payload) => {
      setHasJoinedSession(false);
      setRemovedPlayerMessage(payload.message || "You have been removed.");
    };

    const handleSocketError = (error) => {
      setLoading({ eventBoss: false, question: false, result: false });
      console.error("Socket error:", error);
    };

    socket.on(SOCKET_EVENTS.EVENT.ENDED, handleEventEnded);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.JOINED, handleJoinedSession);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.NOT_FOUND, handleDataNotFound);
    socket.on(SOCKET_EVENTS.BOSS.NOT_FOUND, handleDataNotFound);
    socket.on(
      SOCKET_EVENTS.BATTLE_SESSION.PLAYER.NOT_FOUND,
      handleDataNotFound
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
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.LEFT, handleLeftSession);
    socket.on(SOCKET_EVENTS.BATTLE_SESSION.PLAYER.REMOVED, handlePlayerRemoved);
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

    return () => {
      socket.off(SOCKET_EVENTS.EVENT.ENDED, handleEventEnded);
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.JOINED, handleJoinedSession);
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.NOT_FOUND, handleDataNotFound);
      socket.off(SOCKET_EVENTS.BOSS.NOT_FOUND, handleDataNotFound);
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.PLAYER.NOT_FOUND,
        handleDataNotFound
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
      socket.off(SOCKET_EVENTS.BATTLE_SESSION.LEFT, handleLeftSession);
      socket.off(
        SOCKET_EVENTS.BATTLE_SESSION.PLAYER.REMOVED,
        handlePlayerRemoved
      );
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
    };
  }, [
    socket,
    eventBossId,
    joinCode,
    auth,
    hasJoinedSession,
    currentQuestion,
    isPlayerKnockedOut,
    isPlayerDead,
    isEventBossDefeated,
    playHurtSound,
    joinSession,
    requestNextQuestion,
    generateDamageNumber,
    addPlayerBadgeToQueue,
  ]);

  useEffect(() => {
    if (!revivalEndAt) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.ceil((revivalEndAt - Date.now()) / 1000)
      );
      setRevivalTimer(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [revivalEndAt, socket, eventBossId, auth]);

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
    isEventBossDefeated,
    isDefeatMessageVisible,
    isPodiumCountdownVisible,
    podiumTimer,
    playerBadges,
    currentPlayerBadge,
    isBadgeDisplaying,
    hasJoinedSession,
    removedPlayerMessage,
    isDataNotFound,
    NotFoundMessage,
    hasSubmittedAnswerRef,
    loading,
    joinSession,
    leaveSession,
    requestNextQuestion,
    submitAnswer,
    submitRevivalCode,
    removeCurrentBadge,
  };
};

export default useBattleSession;
