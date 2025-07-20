import React, { useState, useEffect } from "react";

/**
 * BadgeNotification Component
 *
 * Displays animated notifications when players earn badges
 * Shows badge icon, name, and congratulatory message
 */
const BadgeNotification = ({ badge, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 50);

    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!badge) return null;

  const getBadgeEmoji = (badgeName) => {
    switch (badgeName) {
      case "MVP":
        return "🏆";
      case "Last Hit":
        return "🎯";
      case "Boss Defeated":
        return "🏅";
      case "10 Questions":
        return "📊";
      case "25 Questions":
        return "📈";
      case "50 Questions":
        return "📊";
      case "100 Questions":
        return "🎓";
      default:
        return "🎖️";
    }
  };

  const getBadgeMessage = (badgeName) => {
    switch (badgeName) {
      case "MVP":
        return "Most Valuable Player!";
      case "Last Hit":
        return "Delivered the final blow!";
      case "Boss Defeated":
        return "Boss Defeated!";
      case "10 Questions":
        return "10 Correct Answers!";
      case "25 Questions":
        return "25 Correct Answers!";
      case "50 Questions":
        return "50 Correct Answers!";
      case "100 Questions":
        return "100 Correct Answers!";
      default:
        return "Achievement Unlocked!";
    }
  };

  return (
    <>
      <div
        className={`fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-2xl p-4 max-w-sm transition-all duration-300 ease-out transform ${
          isVisible && !isLeaving
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 -translate-y-4"
        }`}
        style={{
          animation:
            isVisible && !isLeaving
              ? "badgeWiggle 0.6s ease-out 0.2s"
              : undefined,
        }}
      >
        {/* Close button */}
        <button
          onClick={() => {
            setIsLeaving(true);
            setTimeout(onClose, 300);
          }}
          className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>

        {/* Badge content */}
        <div className="flex items-center space-x-3">
          {/* Badge icon */}
          <div
            className={`text-4xl transition-transform duration-500 ${
              isVisible ? "animate-pulse" : ""
            }`}
          >
            {getBadgeEmoji(badge.name)}
          </div>

          {/* Badge info */}
          <div className="flex-1">
            <h3
              className={`font-bold text-lg transition-all duration-300 delay-300 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4"
              }`}
            >
              Badge Earned!
            </h3>
            <p
              className={`text-sm opacity-90 transition-all duration-300 delay-400 ${
                isVisible
                  ? "opacity-90 translate-x-0"
                  : "opacity-0 translate-x-4"
              }`}
            >
              {badge.name}
            </p>
            <p
              className={`text-xs opacity-75 transition-all duration-300 delay-500 ${
                isVisible
                  ? "opacity-75 translate-x-0"
                  : "opacity-0 translate-x-4"
              }`}
            >
              {getBadgeMessage(badge.name)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-white bg-opacity-50 transition-all ease-linear"
            style={{
              width: "100%",
              animation: `progressBar ${duration / 1000}s linear`,
            }}
          />
        </div>
      </div>

      {/* Global styles for animations */}
      <style>{`
        @keyframes badgeWiggle {
          0%, 20%, 50%, 80%, 100% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(5deg);
          }
          30% {
            transform: rotate(-5deg);
          }
          40% {
            transform: rotate(3deg);
          }
          60% {
            transform: rotate(-3deg);
          }
          70% {
            transform: rotate(2deg);
          }
          90% {
            transform: rotate(-1deg);
          }
        }

        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  );
};

/**
 * BadgeNotificationManager Component
 *
 * Manages multiple badge notifications and stacks them
 */
export const BadgeNotificationManager = ({ badges, onRemoveBadge }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {badges.map((badge, index) => (
        <div
          key={`${badge.id}-${badge.timestamp || index}`}
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index,
          }}
        >
          <BadgeNotification
            badge={badge}
            onClose={() => onRemoveBadge(badge.id)}
            duration={5000 + index * 1000} // Stagger durations
          />
        </div>
      ))}
    </div>
  );
};

export default BadgeNotification;
