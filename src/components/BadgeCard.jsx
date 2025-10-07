import { Card, CardContent } from "@/components/ui/card";
import {
  Gift,
  Lock,
  Calendar,
  Trophy,
  Medal,
  Skull,
  Target,
  Crown,
} from "lucide-react";
import CheckMark from "./CheckMark";

const BadgeCard = ({ badge, isMilestone = false }) => {
  // Default icon fallback if badge.icon is not provided
  const getDefaultIcon = () => {
    if (isMilestone) {
      if (!badge.threshold) return Trophy;
      return Medal;
    }

    if (badge.code === "boss-defeated") return Skull;
    if (badge.code === "last-hit") return Target;
    return Crown;
  };

  const IconComponent = badge.icon || getDefaultIcon();

  return (
    <Card
      className={`py-0 relative overflow-hidden ${
        badge.earned ? "border-border bg-muted" : "border-border bg-muted"
      }`}
    >
      <CardContent className="p-3 sm:p-4">
        {/* Badge Icon */}
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 ring-1 ring-inset relative ${
            badge.isEarned
              ? "bg-gradient-to-tr from-emerald-500 to-green-400 text-white ring-emerald-300/70"
              : "bg-gradient-to-tr from-gray-200 to-gray-300 text-gray-600 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 ring-gray-300/60 dark:ring-gray-500/50"
          } ${badge.isRedeemed ? "opacity-70" : ""}`}
        >
          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
          {badge.isRedeemed && (
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
              <span className="text-white/70 text-[6px] font-bold whitespace-nowrap bg-green-900 ms-[2px] px-[7px] py-[1px] rounded-[1px] rotate-[45deg]">
                REDEEMED
              </span>
            </div>
          )}
        </div>

        {/* Badge Info */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base leading-tight">
            {badge.name}
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 leading-relaxed line-clamp-3">
          {badge.description}
        </p>

        {/* Progress Bar for Milestones */}
        {isMilestone && badge.target && (
          <div className="mb-2 sm:mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>
                {badge.target - badge.progress <= 0
                  ? badge.target
                  : badge.progress}
                /{badge.target}
              </span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (badge.progress / badge.target) * 100,
                    100
                  )}%`,
                }}
              />
              <div className="absolute -top-4 right-0 text-[10px] sm:text-xs text-muted-foreground">
                {Math.min(
                  Math.round((badge.progress / badge.target) * 100),
                  100
                )}
                %
              </div>
            </div>
          </div>
        )}

        {/* Earned Status / Date */}
        <div className="flex items-center justify-between">
          {badge.isRedeemed ? (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
              <Gift className="h-3 w-3" />
              Redeemed
            </span>
          ) : badge.isEarned ? (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
              <CheckMark className="h-3 w-3 me-0" />
              Earned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
              <Lock className="h-3 w-3" />
              {isMilestone && badge.target
                ? `${badge.target - badge.progress} more needed`
                : "Locked"}
            </span>
          )}

          {badge.isEarned && badge.earnedAt && (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(badge.earnedAt).toISOString().split("T")[0]}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeCard;
