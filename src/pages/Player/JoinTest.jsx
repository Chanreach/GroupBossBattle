import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const JoinTest = () => {
  return (
    <main className="flex-grow min-h-screen">
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Join Code Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Test the join code functionality:</p>
            
            <div className="space-y-2">
              <h3 className="font-semibold">QR Code Flow (New Format):</h3>
              <Button asChild variant="outline" className="w-full">
                <Link to="/boss-preview/join?code=TEST123">
                  Test QR Code Join (boss-preview/join?code=TEST123)
                </Link>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">QR Code Flow (Legacy Format):</h3>
              <Button asChild variant="outline" className="w-full">
                <Link to="/player/join?code=TEST123">
                  Test QR Code Join (player/join?code=TEST123)
                </Link>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Direct Boss Preview (with joinCode):</h3>
              <Button asChild variant="outline" className="w-full">
                <Link to="/boss-preview?joinCode=TEST123">
                  Test Boss Preview with Join Code
                </Link>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Direct Boss Preview (with bossId/eventId):</h3>
              <Button asChild variant="outline" className="w-full">
                <Link to="/boss-preview?bossId=1&eventId=1">
                  Test Boss Preview with IDs
                </Link>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">API Testing:</h3>
              <Button asChild variant="outline" className="w-full">
                <Link to="/api-test">
                  Test Join Code API Directly
                </Link>
              </Button>
            </div>

            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default JoinTest;
