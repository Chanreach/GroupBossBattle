import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const StatusOverlay = ({
  message = "Loading...",
  type = "loading",
  onRetry = null,
  className = "",
}) => {
  const content = (
      <div className="text-center">
        {type === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-semibold text-foreground">{message}</p>
          </div>
        )}
        {type === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">Error</p>
              <p className="text-medium text-foreground">{message}</p>
            </div>
            {onRetry && (
              <Button onClick={onRetry} className="mt-2">
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
  );

  return (
    <div
        className={`flex items-center justify-center min-h-[400px] ${className}`}
      >
        {content}
      </div>
  );
};
