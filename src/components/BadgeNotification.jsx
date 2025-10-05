import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

const BadgeNotification = ({ badge, onClose, duration = 3000 }) => {
  const BADGE_CODES = {
    ACHIEVEMENT: {
      MVP: "mvp",
      LAST_HIT: "last-hit",
      BOSS_DEFEATED: "boss-defeated",
    },
    MILESTONE: {
      QUESTIONS_10: "questions_10",
      QUESTIONS_25: "questions_25",
      QUESTIONS_50: "questions_50",
      QUESTIONS_100: "questions_100",
      HERO: "hero",
    },
  };

  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => handleClose(), duration);
    return () => clearTimeout(timer);
  }, [handleClose, duration]);

  const getBadgeIcon = (badge) => {
    // Use the icon from the badge data if available
    if (badge.icon) {
      return badge.icon;
    }

    // Fallback to code-based icons
    switch (badge.code) {
      case BADGE_CODES.ACHIEVEMENT.MVP:
        return "👑";
      case BADGE_CODES.ACHIEVEMENT.LAST_HIT:
        return "🎯";
      case BADGE_CODES.ACHIEVEMENT.BOSS_DEFEATED:
        return "⚔️";
      case BADGE_CODES.MILESTONE.QUESTIONS_10:
        return "🏅";
      case BADGE_CODES.MILESTONE.QUESTIONS_25:
        return "🥉";
      case BADGE_CODES.MILESTONE.QUESTIONS_50:
        return "🥈";
      case BADGE_CODES.MILESTONE.QUESTIONS_100:
        return "🥇";
      case BADGE_CODES.MILESTONE.HERO:
        return "🦸";
      default:
        return "🏆";
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge.code) {
      case BADGE_CODES.ACHIEVEMENT.MVP:
        return "from-yellow-400 to-yellow-600";
      case BADGE_CODES.ACHIEVEMENT.LAST_HIT:
        return "from-red-400 to-red-600";
      case BADGE_CODES.ACHIEVEMENT.BOSS_DEFEATED:
        return "from-purple-400 to-purple-600";
      case BADGE_CODES.MILESTONE.QUESTIONS_10:
        return "from-blue-400 to-blue-600";
      case BADGE_CODES.MILESTONE.QUESTIONS_25:
        return "from-orange-400 to-orange-600";
      case BADGE_CODES.MILESTONE.QUESTIONS_50:
        return "from-green-400 to-green-600";
      case BADGE_CODES.MILESTONE.QUESTIONS_100:
        return "from-pink-400 to-pink-600";
      case BADGE_CODES.MILESTONE.HERO:
        return "from-indigo-400 to-indigo-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 w-80 p-4 rounded-lg shadow-2xl
        bg-gradient-to-r ${getBadgeColor(badge)}
        border border-white/20 backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${
          isExiting
            ? "translate-x-full opacity-0 scale-90"
            : "translate-x-0 opacity-100 scale-100"
        }
      `}
      style={{
        // top: "3.5rem",
        // transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/20 to-transparent opacity-50 pointer-events-none" />

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors z-10 cursor-pointer"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* Badge content */}
      <div className="flex items-center space-x-3">
        {/* Badge icon */}
        <div className="text-4xl drop-shadow-lg animate-bounce">
          {getBadgeIcon(badge)}
        </div>

        {/* Badge info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white drop-shadow-md">
            {badge.name || "Badge Earned"}
          </h3>
          <p className="text-sm text-white/90 drop-shadow-sm">
            {badge.message || "Congratulations on earning this badge!"}
          </p>
        </div>
      </div>

      {/* Sparkle effects using CSS animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random()}s`,
            }}
          />
        ))}
      </div>

      {/* Progress bar for milestones */}
      {badge.type === "milestone" && (
        <div className="mt-3 h-2 bg-black/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${badge.threshold ? badge.threshold : 100}%`,
              transitionDelay: "0.6s",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BadgeNotification;
