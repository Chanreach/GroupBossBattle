// ===== LIBRARIES ===== //
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Heart, Timer, Trophy, LogOut, Sun, Moon, Smartphone, Ambulance, Skull } from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import BattleLeaderboard from "@/layouts/BossBattleLeaderboard";

// ===== STYLES ===== //
import "@/index.css";

// ===== AUDIOS ===== //
import punchSound from "@/assets/Audio/punch1.mp3";
import hurtSound1 from "@/assets/Audio/hurt1.mp3";
import hurtSound2 from "@/assets/Audio/hurt2.mp3";
import heartbeatsSound from "@/assets/Audio/heartbeats.mp3";

const BossBattle = () => {
  const navigate = useNavigate();
  
  // ===== TIMING CONFIGURATION ===== //
  const BOSS_DEFEAT_MESSAGE_DELAY_MS = 1000;
  const BOSS_DEFEAT_COUNTDOWN_DELAY_MS = 1000;
  const BOSS_DEFEAT_COUNTDOWN_DURATION_SECONDS = 5;
  
  // ===== BOSS CONFIGURATION (Backend Integration Ready) ===== //
  // This will be replaced with data from the bosses API endpoint
  // Example API call: GET /api/bosses/{bossId}
  // Response will match the database schema you provided
  const bossDataFromBackend = {
    id: "boss_001",
    name: "CS Boss",
    image: "/src/assets/Placeholder/Falcon.png", // Will use boss.image from backend
    description: "A challenging computer science boss battle",
    cooldown_duration: 300, // 5 minutes in seconds
    number_of_teams: 4,
    creator_id: "admin_001",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  /* 
  // TODO: Replace mock data with actual API call
  const [bossData, setBossData] = useState(null);
  const [isLoadingBoss, setIsLoadingBoss] = useState(true);
  
  useEffect(() => {
    const fetchBossData = async () => {
      try {
        const response = await fetch(`/api/bosses/${bossId}`);
        const boss = await response.json();
        setBossData(boss);
        setIsLoadingBoss(false);
      } catch (error) {
        console.error('Failed to fetch boss data:', error);
      }
    };
    
    fetchBossData();
  }, [bossId]);
  */
  
  // Use backend data for configuration
  const BOSS_NAME = bossDataFromBackend.name;
  const BOSS_IMAGE_URL = bossDataFromBackend.image;
  const BOSS_DESCRIPTION = bossDataFromBackend.description;
  const BOSS_COOLDOWN_DURATION = bossDataFromBackend.cooldown_duration;
  const BOSS_NUMBER_OF_TEAMS = bossDataFromBackend.number_of_teams;
  const BOSS_MAX_HEALTH = 10; // This might come from game settings or be calculated
  
  // ===== GAME STATE ===== //
  const [playerSelectedAnswer, setPlayerSelectedAnswer] = useState("");
  const [playerLivesRemaining, setPlayerLivesRemaining] = useState(3);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(30);
  const [bossCurrentHealth, setBossCurrentHealth] = useState(BOSS_MAX_HEALTH);
  
  // ===== UI ANIMATION STATES ===== //
  const [isBossTakingDamage, setIsBossTakingDamage] = useState(false);
  const [isPlayerHurt, setIsPlayerHurt] = useState(false);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [damageNumbersArray, setDamageNumbersArray] = useState([]);
  
  // ===== BOSS DEFEAT STATES ===== //
  const [isBossDefeatMessageVisible, setIsBossDefeatMessageVisible] = useState(false);
  const [isBossDefeatCountdownVisible, setIsBossDefeatCountdownVisible] = useState(false);
  const [bossDefeatCountdownNumber, setBossDefeatCountdownNumber] = useState(3);
  
  // ===== PLAYER REVIVAL SYSTEM ===== //
  const [teamKnockedOutPlayers, setTeamKnockedOutPlayers] = useState([]); // Array of {playerId, playerName, revivalCode, timeLeftSeconds}
  const [isCurrentPlayerKnockedOut, setIsCurrentPlayerKnockedOut] = useState(false);
  const [isCurrentPlayerDead, setIsCurrentPlayerDead] = useState(false);
  const [currentPlayerRevivalCode, setCurrentPlayerRevivalCode] = useState("");
  const [currentPlayerRevivalTimeLeft, setCurrentPlayerRevivalTimeLeft] = useState(60);
  const [revivalCodeInputText, setRevivalCodeInputText] = useState("");
  const [isRevivalDialogVisible, setIsRevivalDialogVisible] = useState(false);
  const [revivalOtpInput, setRevivalOtpInput] = useState("");

  // ===== QUESTION DATA (Backend Integration) ===== //
  const currentQuestionData = {
    questionId: 1,
    categoryId: 1,
    questionText: "What does PIU stand for?",
    timeLimitSeconds: 30, // Individual time limit for this question
    authorId: 1,
    answerOptions: [
      "Paragon International University",
      "Programmers in Uniform", 
      "Placeholder In Underway",
      "Pain In Utopia"
    ],
    correctAnswerText: "Paragon International University"
  };

  const questionMaxTimeSeconds = currentQuestionData.timeLimitSeconds; // Use question's specific time limit

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

  // Function to play random hurt sound
  const playHurtSound = () => {
    const hurtSounds = [hurtAudio1Ref.current, hurtAudio2Ref.current];
    const randomHurtSound = hurtSounds[Math.floor(Math.random() * hurtSounds.length)];
    if (randomHurtSound) {
      randomHurtSound.currentTime = 0; // Reset audio to start
      randomHurtSound.play().catch(error => {
        console.log("Hurt audio play failed:", error);
      });
    }
  };

  const goBack = () => {
    navigate("/qr"); // Go to QR page
  };

  const handleAnswerSelect = (answerText) => {
    // Prevent interactions if player is knocked out, dead, or boss is defeated
    if (isCurrentPlayerKnockedOut || isCurrentPlayerDead || bossCurrentHealth === 0) {
      return;
    }

    setPlayerSelectedAnswer(answerText);

    // Submit answer immediately
    if (answerText === currentQuestionData.correctAnswerText) {
      // Calculate damage based on response speed
      const timeElapsedSeconds = questionMaxTimeSeconds - questionTimeRemaining;
      const fastResponseThreshold = questionMaxTimeSeconds * 0.33; // First 33% of time (fast)
      const normalResponseThreshold = questionMaxTimeSeconds * 0.66; // Second 33% of time (normal)

      let damageAmount;
      if (timeElapsedSeconds <= fastResponseThreshold) {
        damageAmount = 1.5; // Fast response
      } else if (timeElapsedSeconds <= normalResponseThreshold) {
        damageAmount = 1.0; // Normal pace
      } else {
        damageAmount = 0.5; // Slow response
      }

      // Correct answer - damage boss
      setBossCurrentHealth(prev => Math.max(0, prev - damageAmount));
      setIsBossTakingDamage(true);

      // Add damage number animation
      const damageAnimationId = Date.now() + Math.random();
      setDamageNumbersArray(prev => [...prev, {
        id: damageAnimationId,
        damage: damageAmount,
        x: Math.random() * 60 + 20, // Random position between 20% and 80% from left (more constrained)
        y: Math.random() * 40 + 30  // Random position between 30% and 70% from top (more constrained)
      }]);

      // Remove damage number after animation
      setTimeout(() => {
        setDamageNumbersArray(prev => prev.filter(dmg => dmg.id !== damageAnimationId));
      }, 2000);

      // Play punch sound effect
      if (punchAudioRef.current) {
        punchAudioRef.current.currentTime = 0; // Reset audio to start
        punchAudioRef.current.play().catch(error => {
          console.log("Audio play failed:", error);
        });
      }

      console.log(`Correct! Boss takes ${damageAmount} damage.`);

      // Remove damage effect after animation
      setTimeout(() => {
        setIsBossTakingDamage(false);
      }, 500);
    } else {
      // Wrong answer - lose life
      const newLivesCount = Math.max(0, playerLivesRemaining - 1);
      setPlayerLivesRemaining(newLivesCount);
      setIsPlayerHurt(true);

      // Check if player is knocked out
      if (newLivesCount === 0) {
        handlePlayerKnockout();
      }

      // Play random hurt sound effect
      playHurtSound();

      console.log("Wrong! Lost a life.");

      // Remove wrong answer effect after animation
      setTimeout(() => {
        setIsPlayerHurt(false);
      }, 500);
    }

    // Reset timer and selection after a brief delay to show the selection
    setTimeout(() => {
      setPlayerSelectedAnswer("");
      setQuestionTimeRemaining(currentQuestionData.timeLimitSeconds); // Reset to question's specific time limit
      setCurrentQuestionNumber(prev => prev + 1); // Move to next question
    }, 1000);
  };

  const handleLeave = () => {
    navigate("/boss-preview");
  };

  const handleLiveLeaderboard = () => {
    setIsLeaderboardVisible(prev => !prev);
    console.log("Toggling live leaderboard");
  };

  const toggleDarkMode = () => {
    setIsDarkModeEnabled(prev => !prev);
    // Toggle dark class on document element
    document.documentElement.classList.toggle('dark');
  };

  // ===== REVIVAL SYSTEM FUNCTIONS ===== //
  const generatePlayerRevivalCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handlePlayerKnockout = () => {
    if (playerLivesRemaining === 0) {
      const generatedCode = generatePlayerRevivalCode();
      setIsCurrentPlayerKnockedOut(true);
      setCurrentPlayerRevivalCode(generatedCode);
      setCurrentPlayerRevivalTimeLeft(60);
      
      // Play heartbeats sound when knocked out
      if (heartbeatsAudioRef.current) {
        heartbeatsAudioRef.current.currentTime = 0; // Reset audio to start
        heartbeatsAudioRef.current.loop = true; // Loop the heartbeats sound
        heartbeatsAudioRef.current.play().catch(error => {
          console.log("Heartbeats audio play failed:", error);
        });
      }
      
      console.log(`Player knocked out! Revival code: ${generatedCode}`);
    }
  };

  const handleRevivalCodeSubmission = (inputCode) => {
    const sanitizedCode = inputCode.trim().toUpperCase();
    if (sanitizedCode) {
      // Check if this matches any knocked out player's code
      const foundKnockedOutPlayer = teamKnockedOutPlayers.find(player => player.revivalCode === sanitizedCode);
      
      if (foundKnockedOutPlayer) {
        // Remove the knocked out player with this code
        setTeamKnockedOutPlayers(prev => 
          prev.filter(player => player.revivalCode !== sanitizedCode)
        );
        
        console.log(`Successfully revived player with code: ${sanitizedCode}`);
      } else {
        console.log(`Invalid revival code: ${sanitizedCode}`);
      }
      
      // If this player was knocked out and the code matches, revive them
      if (currentPlayerRevivalCode === sanitizedCode) {
        setIsCurrentPlayerKnockedOut(false);
        setIsCurrentPlayerDead(false);
        setPlayerLivesRemaining(3); // Restore full lives
        setCurrentPlayerRevivalCode("");
        setCurrentPlayerRevivalTimeLeft(60);
        
        // Stop heartbeats sound when revived
        if (heartbeatsAudioRef.current) {
          heartbeatsAudioRef.current.pause();
          heartbeatsAudioRef.current.currentTime = 0;
          heartbeatsAudioRef.current.loop = false;
        }
        
        console.log("Player revived!");
      }
    }
  };

  // Handle OTP completion
  const handleRevivalOtpComplete = (otpValue) => {
    handleRevivalCodeSubmission(otpValue);
    setIsRevivalDialogVisible(false);
    setRevivalOtpInput("");
  };

  // Simulate multiple teammates getting knocked out (for testing)
  const simulateMultiplePlayerKnockouts = () => {
    const mockKnockedOutPlayers = [
      { playerId: 1, playerName: "Player1", revivalCode: generatePlayerRevivalCode(), timeLeftSeconds: 60 },
      { playerId: 2, playerName: "Player2", revivalCode: generatePlayerRevivalCode(), timeLeftSeconds: 60 }
    ];
    setTeamKnockedOutPlayers(mockKnockedOutPlayers);
  };

  // Timer countdown effect
  useEffect(() => {
    // Don't run timer if player is knocked out, dead, or boss is defeated
    if (isCurrentPlayerKnockedOut || isCurrentPlayerDead || bossCurrentHealth === 0) {
      return;
    }

    if (questionTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setQuestionTimeRemaining(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Time's up - lose a life
      const newLivesCount = Math.max(0, playerLivesRemaining - 1);
      setPlayerLivesRemaining(newLivesCount);
      setIsPlayerHurt(true); // Trigger screen shake and red flash

      // Check if player is knocked out
      if (newLivesCount === 0) {
        handlePlayerKnockout();
      }

      // Play random hurt sound effect
      playHurtSound();

      console.log("Time's up! Lost a life.");

      // Remove wrong answer effect after animation
      setTimeout(() => {
        setIsPlayerHurt(false);
      }, 500);

      // Reset timer for next question
      setQuestionTimeRemaining(currentQuestionData.timeLimitSeconds); // Reset to question's specific time limit
      setCurrentQuestionNumber(prev => prev + 1); // Move to next question
    }
  }, [questionTimeRemaining, isCurrentPlayerKnockedOut, isCurrentPlayerDead, bossCurrentHealth]);

  // Revive timer countdown effect for knocked out team players
  useEffect(() => {
    const interval = setInterval(() => {
      setTeamKnockedOutPlayers(prev => 
        prev.map(player => ({
          ...player,
          timeLeftSeconds: Math.max(0, player.timeLeftSeconds - 1)
        })).filter(player => player.timeLeftSeconds > 0) // Remove players whose time expired
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Effect to handle when current player revival time expires
  useEffect(() => {
    let timer;
    if (isCurrentPlayerKnockedOut && currentPlayerRevivalTimeLeft > 0) {
      timer = setTimeout(() => {
        setCurrentPlayerRevivalTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isCurrentPlayerKnockedOut && currentPlayerRevivalTimeLeft === 0) {
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
          console.log("Heartbeats stopped - player died (revival timer expired)");
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
  }, [isCurrentPlayerKnockedOut, currentPlayerRevivalTimeLeft]);

  // Effect to handle player knockout when lives reach 0
  useEffect(() => {
    if (playerLivesRemaining === 0 && !isCurrentPlayerKnockedOut) {
      handlePlayerKnockout();
    }
  }, [playerLivesRemaining, isCurrentPlayerKnockedOut]);

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
  }, [bossCurrentHealth]);

  // Get timer color based on time remaining
  const getTimerColor = () => {
    const timePercentage = (questionTimeRemaining / questionMaxTimeSeconds) * 100;
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

  // ===== ===== ===== RENDER ===== ===== ===== //
  return (
    <main className={`h-screen overflow-hidden bg-background relative ${isPlayerHurt ? 'player-shake' : ''} portrait-only`}>
      {/* Landscape Rotation Warning */}
      <div className="landscape-warning fixed inset-0 bg-background z-[100] flex items-center justify-center p-4 md:hidden">
        <div className="text-center">
          <div className="mb-4">
            <Smartphone className="w-16 h-16 mx-auto text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Rotate Your Device</h2>
          <p className="text-muted-foreground">Please rotate your device to portrait mode to play.</p>
        </div>
      </div>

      {/* Full Screen Wrong Answer Flash */}
      {isPlayerHurt && (
        <div className="absolute inset-0 bg-red-500/60 z-50 animate-pulse"></div>
      )}

      <div className="h-full flex flex-col p-3 max-w-md mx-auto relative z-10">

        {/* Top Controls */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0 relative">
          <Button onClick={handleLeave} variant="outline" size="sm" className="flex items-center justify-center">
            <LogOut className="w-4 h-4 rotate-180" />
          </Button>

          {/* Boss Name - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h2 className="text-lg font-bold">{BOSS_NAME}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={toggleDarkMode} variant="outline" size="sm" className="flex items-center justify-center">
              {isDarkModeEnabled ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button onClick={handleLiveLeaderboard} variant="outline" size="sm" className="flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Boss Health Section */}
        <div className="mb-3 flex-shrink-0">
          {/* Boss Image with Overlay */}
          <div className="relative">
            <div className={`aspect-square bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-600 transition-all duration-500 ${isBossTakingDamage ? 'bg-red-500/50 shake' : ''
              }`}>
              <img
                src={BOSS_IMAGE_URL}
                alt={BOSS_NAME}
                className={`w-full h-full object-cover transition-all duration-500 ${isBossTakingDamage ? 'opacity-70' : ''} ${bossCurrentHealth === 0 ? 'grayscale brightness-50 blur-sm' : ''}`}
              />

              {/* Damage Flash Overlay */}
              {isBossTakingDamage && (
                <div className="absolute inset-0 bg-red-500/40 animate-pulse"></div>
              )}

              {/* Damage Numbers */}
              {damageNumbersArray.map((dmg) => (
                <div
                  key={dmg.id}
                  className="absolute text-red-500 font-bold text-4xl pointer-events-none z-20 animate-pulse"
                  style={{
                    left: `${dmg.x}%`,
                    top: `${dmg.y}%`,
                    transform: 'translate(-50%, -50%)',
                    animation: 'damage-float 2s ease-out forwards',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  -{dmg.damage}
                </div>
              ))}

              {/* Boss Info Overlay */}
              <div className="absolute top-3 left-0 right-0 z-10">
                <div className="px-3">
                  <div className="relative">
                    <Progress value={(bossCurrentHealth / BOSS_MAX_HEALTH) * 100} className="h-6 [&>div]:bg-red-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white drop-shadow-lg">{bossCurrentHealth}/{BOSS_MAX_HEALTH} HP</span>
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
                  className={`w-6 h-6 ${index < playerLivesRemaining ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
                />
              ))}
            </div>
            
            {/* Right side - Revive section and Timer */}
            <div className="flex items-center gap-2">
              {/* Revive section - show when any teammates are knocked out */}
              {teamKnockedOutPlayers.length > 0 && !isCurrentPlayerKnockedOut && (
                <>
                  <span className="text-xs font-bold text-muted-foreground">
                    {teamKnockedOutPlayers.length} Player{teamKnockedOutPlayers.length > 1 ? 's' : ''} Down
                  </span>
                  {/* Revive button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-9 h-9 p-0 flex items-center justify-center text-green-500 border-background-500 border-3 hover:bg-green-500 hover:text-white rounded-full animate-pulse"
                    onClick={() => {
                      setIsRevivalDialogVisible(true);
                    }}
                  >
                    <Ambulance className="text-lg font-bold" />
                  </Button>
                </>
              )}
              
              {/* Test button to simulate multiple knockouts (for development) */}
              {teamKnockedOutPlayers.length === 0 && !isCurrentPlayerKnockedOut && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs text-muted-foreground"
                  onClick={simulateMultiplePlayerKnockouts}
                >
                  Test Multi KO
                </Button>
              )}
              
              {/* Circular Timer */}
              <div className="relative flex items-center justify-center w-9 h-9 p-0">
                <svg className="w-12 h-12 transform rotate-0" viewBox="0 0 36 36">
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
                    strokeDasharray: '100, 100',
                    strokeDashoffset: 100 - (questionTimeRemaining / questionMaxTimeSeconds) * 100
                  }}
                  d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              {/* Timer text in center */}
              <div className={`absolute inset-0 flex items-center justify-center ${getTimerColor()}`}>
                <span className="text-xs font-mono font-bold">{questionTimeRemaining}</span>
              </div>
            </div>
            </div>
      
          </div>

          <CardContent className="px-3 pt-0 flex flex-col h-full">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0 pt-1">
              <Badge variant="outline" className="text-xs">
                {currentQuestionNumber}. {currentQuestionData.questionText}
              </Badge>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-2 flex-1 min-h-0 -mb-3">
              {currentQuestionData.answerOptions.map((option, index) => {
                const colors = [
                  "!bg-red-500 hover:!bg-red-600 !text-white !border-red-500", // Option A - Red
                  "!bg-purple-500 hover:!bg-purple-600 !text-white !border-purple-500", // Option B - Purple  
                  "!bg-yellow-500 hover:!bg-yellow-600 !text-white !border-yellow-500", // Option C - Yellow
                  "!bg-blue-500 hover:!bg-blue-600 !text-white !border-blue-500" // Option D - Blue
                ];

                const selectedColors = [
                  "!bg-red-700 !text-white !border-red-700", // Selected Red
                  "!bg-purple-700 !text-white !border-purple-700", // Selected Purple
                  "!bg-yellow-700 !text-white !border-yellow-700", // Selected Yellow  
                  "!bg-blue-700 !text-white !border-blue-700" // Selected Blue
                ];

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full p-2 h-full text-center whitespace-normal font-medium transition-all text-sm halftone-texture ${playerSelectedAnswer === option
                        ? selectedColors[index]
                        : colors[index]
                      }`}
                    onClick={() => handleAnswerSelect(option)}
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
                    console.log("Error stopping heartbeats in dead dialog:", error);
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
                  <Heart 
                    className="w-8 h-8 text-red-500 fill-red-500 mb-4 mx-auto heartbeat"
                  />
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
                
                {/* Revival code */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <span className="text-2xl font-mono font-bold text-foreground tracking-wider">
                    {currentPlayerRevivalCode.slice(0, 3)}-{currentPlayerRevivalCode.slice(3)}
                  </span>
                </div>
              </div>
            )}
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      {/* OTP Input Dialog for Revival Code */}
      <AlertDialog open={isRevivalDialogVisible} onOpenChange={setIsRevivalDialogVisible}>
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
                <p className="text-sm opacity-75">You are permanently out of this round</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold mb-2">Waiting for Revival...</p>
                <p className="text-sm opacity-75">Share your code: {currentPlayerRevivalCode}</p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default BossBattle;
