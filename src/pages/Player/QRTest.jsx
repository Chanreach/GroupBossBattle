// ===== LIBRARIES ===== //
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode } from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ===== STYLES ===== //
import "@/index.css";

const QRTest = () => {
  const navigate = useNavigate();
  const [bossId, setBossId] = useState("");
  const [eventId, setEventId] = useState("");

  const handleBack = () => {
    navigate("/");
  };

  const handleJoinBoss = () => {
    if (bossId.trim() && eventId.trim()) {
      navigate(`/boss-preview?bossId=${bossId.trim()}&eventId=${eventId.trim()}`);
    }
  };

  // Sample test data
  const sampleBosses = [
    { id: "boss_001", name: "CS Python Master", eventId: "event_001" },
    { id: "boss_002", name: "JavaScript Guru", eventId: "event_001" },
    { id: "boss_003", name: "React Champion", eventId: "event_002" },
  ];

  const handleQuickTest = (boss) => {
    setBossId(boss.id);
    setEventId(boss.eventId);
    navigate(`/boss-preview?bossId=${boss.id}&eventId=${boss.eventId}`);
  };

  return (
    <main className="flex-grow min-h-screen">
      <div className="container mx-auto p-3 sm:p-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button onClick={handleBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-center">QR Code Test</h1>
              <p className="text-muted-foreground text-center">Test boss preview functionality</p>
            </div>
          </div>
        </div>

        {/* Manual Entry */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Manual Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bossId">Boss ID:</Label>
              <Input
                id="bossId"
                type="text"
                value={bossId}
                onChange={(e) => setBossId(e.target.value)}
                placeholder="Enter boss ID (e.g., boss_001)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventId">Event ID:</Label>
              <Input
                id="eventId"
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Enter event ID (e.g., event_001)"
              />
            </div>
            <Button 
              onClick={handleJoinBoss} 
              className="w-full"
              disabled={!bossId.trim() || !eventId.trim()}
            >
              Join Boss Preview
            </Button>
          </CardContent>
        </Card>

        {/* Quick Test Options */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Test Options</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click any boss to quickly test the preview functionality
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {sampleBosses.map((boss) => (
              <div 
                key={boss.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleQuickTest(boss)}
              >
                <div>
                  <h3 className="font-medium">{boss.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Boss: {boss.id} • Event: {boss.eventId}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Test
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-2">
              <li>Open multiple browser tabs/windows</li>
              <li>Use the same Boss ID and Event ID in each tab</li>
              <li>Enter different nicknames in each tab</li>
              <li>Click "Join Boss Preview" and then "Join Boss Fight"</li>
              <li>Watch real-time updates across all tabs</li>
              <li>When 2+ players are ready, battle will start automatically</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                💡 Tip: Open developer console to see socket events in real-time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default QRTest;
