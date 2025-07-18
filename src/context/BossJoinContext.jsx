import { createContext, useContext, useState, useEffect } from "react";
import { getGuestToken } from "@/utils/guestUtils";
import { useAuth } from "@/context/useAuth";

const BossJoinContext = createContext();

export const BossJoinProvider = ({ children }) => {
  const { user } = useAuth();
  const [joinedBoss, setJoinedBoss] = useState(null); // { bossId, eventId, nickname }
  const [isJoinedToAnyBoss, setIsJoinedToAnyBoss] = useState(false);

  // Get user token (guest or authenticated)
  const getUserToken = () => {
    if (user) {
      return user.token || user.id?.toString();
    }
    return getGuestToken();
  };

  // Join a boss
  const joinBoss = (bossId, eventId, nickname) => {
    const joinData = { bossId, eventId, nickname };
    setJoinedBoss(joinData);
    setIsJoinedToAnyBoss(true);
    
    // Store in localStorage for persistence across tabs/page refreshes
    const token = getUserToken();
    localStorage.setItem(`boss_join_${token}`, JSON.stringify(joinData));
  };

  // Leave current boss
  const leaveBoss = () => {
    setJoinedBoss(null);
    setIsJoinedToAnyBoss(false);
    
    // Remove from localStorage
    const token = getUserToken();
    localStorage.removeItem(`boss_join_${token}`);
  };

  // Check if user can join a specific boss
  const canJoinBoss = (bossId) => {
    if (!isJoinedToAnyBoss) return true;
    return joinedBoss?.bossId === bossId;
  };

  // Load join state from localStorage on mount and token change
  useEffect(() => {
    const token = getUserToken();
    if (token) {
      const storedJoin = localStorage.getItem(`boss_join_${token}`);
      if (storedJoin) {
        try {
          const joinData = JSON.parse(storedJoin);
          setJoinedBoss(joinData);
          setIsJoinedToAnyBoss(true);
        } catch (error) {
          console.error("Failed to parse stored boss join data:", error);
          localStorage.removeItem(`boss_join_${token}`);
        }
      }
    }
  }, [user]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      const token = getUserToken();
      const key = `boss_join_${token}`;
      
      if (e.key === key) {
        if (e.newValue) {
          try {
            const joinData = JSON.parse(e.newValue);
            setJoinedBoss(joinData);
            setIsJoinedToAnyBoss(true);
          } catch (error) {
            console.error("Failed to parse boss join data from storage event:", error);
          }
        } else {
          // Join data was removed
          setJoinedBoss(null);
          setIsJoinedToAnyBoss(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const value = {
    joinedBoss,
    isJoinedToAnyBoss,
    joinBoss,
    leaveBoss,
    canJoinBoss,
  };

  return (
    <BossJoinContext.Provider value={value}>
      {children}
    </BossJoinContext.Provider>
  );
};

export const useBossJoin = () => {
  const context = useContext(BossJoinContext);
  if (!context) {
    throw new Error("useBossJoin must be used within a BossJoinProvider");
  }
  return context;
};
