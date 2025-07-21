import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const BadgeNotification = ({ badge, onClose, index = 0 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Entry animation
    const entryTimer = setTimeout(() => {
      setIsEntering(false);
    }, 100);

    // Auto-close timer
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 4000); // Show for 4 seconds

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getBadgeIcon = (badgeData) => {
    // Use the icon from the badge data if available
    if (badgeData.badgeIcon) {
      return badgeData.badgeIcon;
    }

    // Fallback to type/name-based icons
    const badgeType = badgeData.type || badgeData.badgeName;
    switch (badgeType) {
      case "MVP":
        return "👑";
      case "Last Hit":
        return "🎯";
      case "Boss Defeated":
        return "⚔️";
      case "10 Questions":
        return "🏅";
      case "25 Questions":
        return "🥉";
      case "50 Questions":
        return "🥈";
      case "100 Questions":
        return "🥇";
      default:
        return "🏆";
    }
  };

  const getBadgeColor = (badgeData) => {
    const badgeType = badgeData.type || badgeData.badgeName;
    switch (badgeType) {
      case "MVP":
        return "from-yellow-400 to-yellow-600";
      case "Last Hit":
        return "from-red-400 to-red-600";
      case "Boss Defeated":
        return "from-purple-400 to-purple-600";
      case "10 Questions":
        return "from-blue-400 to-blue-600";
      case "25 Questions":
        return "from-orange-400 to-orange-600";
      case "50 Questions":
        return "from-green-400 to-green-600";
      case "100 Questions":
        return "from-pink-400 to-pink-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 w-80 p-4 rounded-lg shadow-2xl
        bg-gradient-to-r ${getBadgeColor(badge)}
        border border-white/20 backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${
          isEntering
            ? "translate-x-full opacity-0 scale-90"
            : "translate-x-0 opacity-100 scale-100"
        }
        ${!isVisible ? "translate-x-full opacity-0 scale-90" : ""}
      `}
      style={{
        top: `${1 + index * 5}rem`,
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/20 to-transparent opacity-50 pointer-events-none" />

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
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
            {badge.badgeName || badge.name || badge.type || "Badge Earned"}
          </h3>
          <p className="text-sm text-white/90 drop-shadow-sm">
            {badge.message ||
              badge.description ||
              "Congratulations on earning this badge!"}
          </p>
          {badge.value && (
            <p className="text-xs text-white/80 mt-1 font-semibold">
              {badge.value}
            </p>
          )}
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
      {badge.type?.startsWith("MILESTONE") && badge.progress && (
        <div className="mt-3 h-2 bg-black/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${badge.progress}%`,
              transitionDelay: "0.6s",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BadgeNotification;
