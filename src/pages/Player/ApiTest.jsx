import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { bossPreviewAPI } from "@/services/api";

const ApiTest = () => {
  const [joinCode, setJoinCode] = useState("W7S2VW");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testJoinCodeAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      console.log("Testing join code API with:", joinCode);
      const response = await bossPreviewAPI.getEventBossByJoinCode(joinCode);
      console.log("API Response:", response);
      setResult(response);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "API call failed");
    } finally {
      setLoading(false);
    }
  };

  const testDebugAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      console.log("Testing debug API...");
      const response = await fetch('http://localhost:3000/api/boss-preview/debug');
      const data = await response.json();
      console.log("Debug API Response:", data);
      setResult(data);
    } catch (err) {
      console.error("Debug API Error:", err);
      setError(err.message || "Debug API call failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow min-h-screen">
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>API Test - Join Code Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="joinCode" className="text-sm font-medium">
                Join Code:
              </label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter join code (e.g., W7S2VW)"
              />
            </div>

            <Button onClick={testJoinCodeAPI} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Test Join Code API"}
            </Button>

            <Button onClick={testDebugAPI} disabled={loading} variant="outline" className="w-full">
              {loading ? "Testing..." : "Debug: Check Database"}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <strong>API Result:</strong>
                <pre className="mt-2 text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Expected Database Structure:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• EventBoss table should have records with joinCode</p>
                <p>• Example: INSERT INTO event_bosses (eventId, bossId, joinCode) VALUES (1, 1, 'W7S2VW')</p>
                <p>• Boss and Event tables should have corresponding records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ApiTest;
