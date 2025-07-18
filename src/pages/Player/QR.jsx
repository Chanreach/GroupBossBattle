// ===== LIBRARIES ===== //
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Camera, X, ArrowLeft, CheckCircle } from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ===== API ===== //
import { apiClient } from "@/api";

// ===== QR SCANNER LOGIC ===== //
import { QRScanner } from "@/lib/QR.js";

// ===== STYLES ===== //
import "@/index.css";

const QR = () => {
  const navigate = useNavigate();
  const [qrResult, setQrResult] = useState("");
  const [detectedUrl, setDetectedUrl] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [bossCode, setBossCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [validationStatus, setValidationStatus] = useState(""); // "success", "error", or ""
  const [scannerState, setScannerState] = useState({
    isCameraActive: false,
    isProcessing: false,
    isRequestingPermission: false,
    scanningActive: false,
    needsUserInteraction: false,
    currentMessage: "Point camera at a QR Code"
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const displayCanvasRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Initialize QR Scanner
  useEffect(() => {
    qrScannerRef.current = new QRScanner();
    
    // Set callbacks
    qrScannerRef.current.setCallbacks(
      // onStateChange
      (newState) => setScannerState(newState),
      // onResult
      (result) => {
        setQrResult(result);
        if (result.startsWith('http://') || result.startsWith('https://')) {
          setDetectedUrl(result);
        } else {
          setDetectedUrl("");
          setCameraError('QR code does not contain a valid link.');
        }
      },
      // onError
      (error) => setCameraError(error)
    );

    return () => {
      qrScannerRef.current?.cleanup();
    };
  }, []);

  // Set refs when they're available
  useEffect(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.setRefs(videoRef, canvasRef, displayCanvasRef);
    }
  }, []);

  // ===== HANDLERS ===== //
  const goBack = () => {
    qrScannerRef.current?.stopCamera();
    navigate("/");
  };

  const handleStartCamera = () => {
    qrScannerRef.current?.startCamera();
  };

  const handleStopCamera = () => {
    qrScannerRef.current?.stopCamera();
  };

  const handleToggleCamera = () => {
    qrScannerRef.current?.toggleCamera();
  };

  const handleCaptureImage = () => {
    qrScannerRef.current?.captureImage();
  };

  const handlePlayVideoManually = () => {
    qrScannerRef.current?.playVideoManually();
  };

  const handleScanAgain = () => {
    setQrResult("");
    setDetectedUrl("");
    setCameraError("");
    setScannerState(prev => ({ ...prev, isProcessing: false }));
    qrScannerRef.current?.startCamera();
  };

  const handleDismissError = () => {
    setCameraError("");
  };

  const handleJoinWithCode = async () => {
    if (!bossCode || !bossCode.trim()) return;
    
    setIsValidating(true);
    setValidationMessage("");
    setValidationStatus("");
    
    try {
      // Try multiple validation approaches
      let validationResponse = null;
      
      // Method 1: Check if dedicated validation endpoint exists
      try {
        validationResponse = await apiClient.get(`/events/bosses/validate-code/${encodeURIComponent(bossCode.trim())}`);
      } catch (error) {
        if (error.response?.status !== 404) {
          throw error; // Re-throw if it's not a 404 (endpoint not found)
        }
      }
      
      // Method 2: If validation endpoint doesn't exist, try to find the boss by searching events
      if (!validationResponse) {
        try {
          // Try to find boss by searching through all events
          const eventsResponse = await apiClient.get('/events');
          const allEvents = eventsResponse.data || [];
          
          let foundBoss = null;
          for (const event of allEvents) {
            if (event.eventBosses) {
              const matchingBoss = event.eventBosses.find(eb => eb.joinCode === bossCode.trim());
              if (matchingBoss) {
                foundBoss = matchingBoss;
                break;
              }
            }
          }
          
          if (foundBoss) {
            validationResponse = { 
              data: { 
                success: true, 
                boss: foundBoss.boss || { name: 'Boss Battle' } 
              } 
            };
          }
        } catch (searchError) {
          console.error('Error searching for boss:', searchError);
        }
      }
      
      // If no validation response found, the code is invalid
      if (!validationResponse) {
        setValidationStatus("error");
        setValidationMessage("This boss code is invalid");
        return;
      }
      
      // Process successful validation
      if (validationResponse.data && validationResponse.data.success) {
        setValidationStatus("success");
        setValidationMessage(`Boss found: ${validationResponse.data.boss.name}`);
        
        // Navigate to boss preview after a short delay to show success message
        setTimeout(() => {
          navigate(`/boss-preview?joinCode=${encodeURIComponent(bossCode.trim())}`);
        }, 1000);
      } else {
        setValidationStatus("error");
        setValidationMessage("This boss code is invalid");
      }
    } catch (error) {
      console.error('Error validating boss code:', error);
      setValidationStatus("error");
      if (error.response?.status === 404) {
        setValidationMessage("This boss code is invalid");
      } else {
        setValidationMessage("Failed to validate boss code. Please try again.");
      }
    } finally {
      setIsValidating(false);
    }
  };

  // ===== RENDER ===== //
  return (
    <>
      {/* Main container for the entire page */}
      {/* <main className="flex-grow min-h-screen bg-background"> */}
      <main className="flex-grow min-h-screen">
        <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Button onClick={goBack} variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-center">QR Scanner</h1>
                <p className="text-muted-foreground text-center">Scan QR codes to join boss battles and events</p>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative w-full max-w-xs aspect-square bg-black rounded-xl overflow-hidden border-2 border-border shadow-lg">
                    {/* Video and Overlay Container */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transition-opacity duration-300 ${scannerState.isCameraActive ? 'opacity-100' : 'opacity-0'}`}
                      onClick={handlePlayVideoManually}
                    />
                    
                    <canvas
                      ref={displayCanvasRef}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {!scannerState.isCameraActive && !scannerState.isRequestingPermission && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4">
                        <QrCode className="w-16 h-16 text-white/60 mb-4" />
                        <p className="text-white/80 font-medium">Camera is off</p>
                      </div>
                    )}

                    {scannerState.isRequestingPermission && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/80 mb-4"></div>
                        <p className="text-white/80 font-medium">Starting Camera...</p>
                      </div>
                    )}
                    
                    {scannerState.isCameraActive && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Camera is active"></div>
                    )}
                    
                    {scannerState.isCameraActive && scannerState.needsUserInteraction && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-center p-4 cursor-pointer" onClick={handlePlayVideoManually}>
                        <div>
                          <div className="text-4xl mb-2">▶️</div>
                          <p className="text-lg font-medium">Click to Start Video</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <CardTitle className="text-foreground text-xl">Join with QR</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {qrResult ? "QR Found!" : 
                   scannerState.isCameraActive ? 
                     (scannerState.isProcessing ? "Scanning..." : scannerState.currentMessage) : 
                     "Use your camera to scan"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {cameraError && (
                  <div className="text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-destructive font-medium text-sm">{cameraError}</p>
                    <Button onClick={handleDismissError} variant="ghost" size="sm" className="mt-2">Dismiss</Button>
                  </div>
                )}
                
                {qrResult ? (
                  <div className="text-center p-6 bg-green-500/10 rounded-lg border border-green-500/20 space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <p className="text-green-800 dark:text-green-200 font-medium text-lg">{qrResult}</p>
                    <div className="flex flex-col space-y-2">
                      <Button onClick={handleScanAgain} variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Scan Again
                      </Button>
                      {detectedUrl && (
                        <Button onClick={() => window.location.href = detectedUrl}>
                          Go to Link
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {scannerState.isCameraActive ? (
                      <div className="space-y-3">
                        <Button onClick={handleCaptureImage} disabled={scannerState.isProcessing} size="lg" className="w-full">
                          <Camera className="w-5 h-5 mr-2" /> 
                          {scannerState.isProcessing ? "Processing..." : "Capture Code"}
                        </Button>
                        <Button onClick={handleToggleCamera} variant="destructive" size="lg" className="w-full">
                          <X className="w-5 h-5 mr-2" /> Stop Camera
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button onClick={handleToggleCamera} disabled={scannerState.isRequestingPermission || scannerState.isProcessing} size="lg" className="w-full">
                          <Camera className="w-5 h-5 mr-2" />
                          {scannerState.isRequestingPermission ? "Requesting..." : "Start Camera Scan"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* INPUT BOSS CODE */}
            <Card className="mt-6">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground text-xl">Join with Code</CardTitle>
                <CardDescription className="text-muted-foregrounad">
                  If you have a boss code instead, enter it below to join the battle.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter Boss Code"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={bossCode}
                  onChange={(e) => {
                    setBossCode(e.target.value);
                    // Clear validation message when user starts typing
                    if (validationMessage) {
                      setValidationMessage("");
                      setValidationStatus("");
                    }
                  }}
                  disabled={isValidating}
                />
                
                {/* Validation Message */}
                {validationMessage && (
                  <div className={`text-center p-3 rounded-lg border text-sm font-medium ${
                    validationStatus === "success" 
                      ? "bg-green-500/10 border-green-500/20 text-green-800 dark:text-green-200" 
                      : "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-200"
                  }`}>
                    {validationMessage}
                  </div>
                )}
                
                <Button 
                  onClick={handleJoinWithCode} 
                  className="w-full" 
                  disabled={!bossCode.trim() || isValidating}
                >
                  {isValidating ? "Validating..." : "Join Battle"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default QR;
