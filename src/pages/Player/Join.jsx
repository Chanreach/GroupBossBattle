// ===== LIBRARIES ===== //
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// ===== COMPONENTS ===== //
import { Card, CardContent } from "@/components/ui/card";

/**
 * Join component - Handles QR code redirects
 * Redirects users from QR scan to boss preview with join code
 */
const Join = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      // Redirect to boss preview with join code
      navigate(`/boss-preview?joinCode=${encodeURIComponent(code)}`, {
        replace: true,
      });
    } else {
      // No code provided, redirect to home
      navigate("/", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <main className="flex-grow min-h-screen">
      <div className="container mx-auto p-6 max-w-md">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Joining boss battle...</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Join;
