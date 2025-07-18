// ===== LIBRARIES ===== //
import jsQR from "jsqr";
import QrScannerLib from "qr-scanner";

export class QRScanner {
  constructor() {
    this.isCameraActive = false;
    this.isProcessing = false;
    this.isRequestingPermission = false;
    this.scanningActive = false;
    this.needsUserInteraction = false;

    // Refs will be set from the component
    this.videoRef = null;
    this.canvasRef = null;
    this.displayCanvasRef = null;

    // Internal refs
    this.scanIntervalRef = null;
    this.drawIntervalRef = null;
    this.cameraStartTimeoutRef = null;
    this.qrScannerRef = null;

    // Timer messages to troll people lol
    this.messageTimerRef = null;
    this.cameraStartTime = null;
    this.currentMessage = "Point camera at a QR Code";

    // Callbacks
    this.onStateChange = null;
    this.onResult = null;
    this.onError = null;
  }

  // Set callbacks
  setCallbacks(onStateChange, onResult, onError) {
    this.onStateChange = onStateChange;
    this.onResult = onResult;
    this.onError = onError;
  }

  // Set refs from component
  setRefs(videoRef, canvasRef, displayCanvasRef) {
    this.videoRef = videoRef;
    this.canvasRef = canvasRef;
    this.displayCanvasRef = displayCanvasRef;
  }

  // Update state and notify component
  updateState(updates) {
    Object.assign(this, updates);
    if (this.onStateChange) {
      this.onStateChange({
        isCameraActive: this.isCameraActive,
        isProcessing: this.isProcessing,
        isRequestingPermission: this.isRequestingPermission,
        scanningActive: this.scanningActive,
        needsUserInteraction: this.needsUserInteraction,
        currentMessage: this.currentMessage,
      });
    }
  }

  // Handler for continuous detection
  onDetected = (result) => {
    this.stopCamera();
    if (this.onResult) {
      this.onResult(result);
    }
  };

  // Start camera
  async startCamera() {
    if (this.isRequestingPermission) return;

    if (this.onError) this.onError("");
    this.updateState({ isRequestingPermission: true });

    if (this.cameraStartTimeoutRef) {
      clearTimeout(this.cameraStartTimeoutRef);
    }

    // Stop any existing camera first to prevent conflicts
    this.stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Camera not supported on this device/browser. Please use a secure (HTTPS) connection."
        );
      }

      // A small delay can help prevent race conditions on some devices
      await new Promise((resolve) => setTimeout(resolve, 100));

      let stream;
      // Prefer back camera, square aspect ratio
      const videoConstraints = {
        facingMode: "environment",
        width: { ideal: 720 },
        height: { ideal: 720 },
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
        });
      } catch (envError) {
        // Fallback to any camera if the back camera fails
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 720 },
            height: { ideal: 720 },
          },
        });
      }

      if (this.videoRef?.current && stream) {
        const video = this.videoRef.current;
        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play().catch((err) => {
            this.updateState({ needsUserInteraction: true });
          });

          this.cameraStartTimeoutRef = setTimeout(() => {
            if (this.isCameraActive && video.videoWidth > 0) {
              this.startQRScanning();
            }
          }, 500);
        };

        video.onerror = (error) => {
          if (this.onError)
            this.onError("Video playback error. Please try again.");
          this.updateState({ isCameraActive: false });
        };

        await video.play();
        this.updateState({
          needsUserInteraction: false,
          isCameraActive: true,
        });
        if (this.onError) this.onError("");

        // Initialize QR-Scanner for live detection
        if (this.qrScannerRef) {
          this.qrScannerRef.destroy();
        }
        this.qrScannerRef = new QrScannerLib(video, this.onDetected);
        this.qrScannerRef.start();
      }
    } catch (error) {
      this.updateState({ isCameraActive: false });

      let errorMessage = "";
      if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera permission denied. Please allow camera access in your browser settings and try again.";
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMessage = "No camera found on this device.";
      } else if (error.name === "NotSupportedError") {
        errorMessage =
          "Camera access is not supported on this browser. Please use a modern browser like Chrome or Firefox.";
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        errorMessage =
          "Camera is busy or being used by another application. Please close other apps and try again.";
      } else if (
        error.name === "OverconstrainedError" ||
        error.name === "ConstraintNotSatisfiedError"
      ) {
        errorMessage =
          "The selected camera does not support the required settings. Trying with basic settings.";
        setTimeout(() => this.startBasicCamera(), 500);
      } else {
        errorMessage = `An unexpected camera error occurred: ${error.message}. Please refresh the page.`;
      }

      if (this.onError) this.onError(errorMessage);
    } finally {
      this.updateState({ isRequestingPermission: false });
    }
  }

  async startBasicCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.videoRef?.current && stream) {
        const video = this.videoRef.current;
        video.srcObject = stream;
        await video.play();
        this.updateState({ isCameraActive: true });
        if (this.onError) this.onError("");
        setTimeout(() => {
          if (this.isCameraActive) this.startQRScanning();
        }, 2000); // Scan QR every specified interval | EDITED BY CHANSOVISOTH (14/07/2025)
      }
    } catch (error) {
      if (this.onError)
        this.onError(
          "Unable to access any camera. Please check permissions and ensure your camera is working."
        );
    }
  }

  stopCamera() {
    // Stop QR-Scanner
    if (this.qrScannerRef) {
      this.qrScannerRef.stop();
      this.qrScannerRef.destroy();
      this.qrScannerRef = null;
    }
    if (this.cameraStartTimeoutRef) {
      clearTimeout(this.cameraStartTimeoutRef);
      this.cameraStartTimeoutRef = null;
    }

    this.stopQRScanning();

    if (this.videoRef?.current && this.videoRef.current.srcObject) {
      const stream = this.videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      this.videoRef.current.srcObject = null;
    }

    this.updateState({ isCameraActive: false });
    if (this.onError) this.onError("");
  }

  startQRScanning() {
    if (!this.isCameraActive || this.scanningActive) return;

    this.updateState({ scanningActive: true });

    // Start message timer for humorous messages
    this.startMessageTimer();

    // Use requestAnimationFrame for smooth 60fps video rendering
    this.startVideoRendering();
    // Slower automatic scanning to keep video smooth - scan every 500ms
    this.scanIntervalRef = setInterval(() => {
      if (!this.isProcessing) {
        this.updateState({ isProcessing: true });
        this.scanQRCode();
      }
    }, 1000);
  }

  stopQRScanning() {
    this.updateState({ scanningActive: false });

    this.stopMessageTimer();
    this.stopVideoRendering();
    if (this.scanIntervalRef) {
      clearInterval(this.scanIntervalRef);
      this.scanIntervalRef = null;
    }
  }

  // Message timer methods for a little bit of trolling
  startMessageTimer() {
    this.stopMessageTimer(); // Clear any existing timer
    this.cameraStartTime = Date.now();
    this.currentMessage = "Point camera at a QR Code";
    this.updateState({});

    // Schedule message updates
    this.messageTimerRef = setTimeout(() => {
      if (this.scanningActive) {
        this.currentMessage = "Hmm, can't seem to find the QR code.";
        this.updateState({});

        this.messageTimerRef = setTimeout(() => {
          if (this.scanningActive) {
            this.currentMessage = "Are you sure this is a QR code?";
            this.updateState({});

            this.messageTimerRef = setTimeout(() => {
              if (this.scanningActive) {
                this.currentMessage = "ចុមយូរម៉េស 🤨";
                this.updateState({});

                this.messageTimerRef = setTimeout(() => {
                  if (this.scanningActive) {
                    this.currentMessage = "Still waiting for a QR code...";
                    this.updateState({});

                    this.messageTimerRef = setTimeout(() => {
                      if (this.scanningActive) {
                        this.currentMessage =
                          "Aigh, imma just stop the camera to save your battery. You're welcome.";
                        this.updateState({});

                        // Stop the camera after trolling player
                        this.messageTimerRef = setTimeout(() => {
                          if (this.scanningActive) {
                            this.stopCamera();
                          }
                        }, 4000);
                      }
                    }, 10000);
                  }
                }, 10000);
              }
            }, 8000);
          }
        }, 8000);
      }
    }, 8000);
  }

  stopMessageTimer() {
    if (this.messageTimerRef) {
      clearTimeout(this.messageTimerRef);
      this.messageTimerRef = null;
    }
    this.currentMessage = "Point camera at a QR Code";
  }

  // Video rendering methods for smooth 60fps
  startVideoRendering() {
    this.stopVideoRendering(); // Stop any existing rendering
    this.renderVideo();
  }

  stopVideoRendering() {
    if (this.drawIntervalRef) {
      cancelAnimationFrame(this.drawIntervalRef);
      this.drawIntervalRef = null;
    }
  }

  renderVideo = () => {
    if (this.scanningActive && this.isCameraActive) {
      this.drawVideoToCanvas();
      this.drawIntervalRef = requestAnimationFrame(this.renderVideo);
    }
  };

  drawVideoToCanvas() {
    if (
      !this.videoRef?.current ||
      !this.displayCanvasRef?.current ||
      this.videoRef.current.videoWidth === 0
    )
      return;

    const canvas = this.displayCanvasRef.current;
    const video = this.videoRef.current;
    const context = canvas.getContext("2d");

    // Only resize canvas if dimensions changed
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Clear and draw video frame
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw scanning guide box
    if (this.scanningActive) {
      // GREEN GUIDE LINES
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = Math.min(canvas.width, canvas.height) * 0.7;

      context.strokeStyle = "rgba(0, 255, 0, 0.8)";
      context.lineWidth = 6; // Made thicker from 3 to 6
      context.setLineDash([12, 8]);
      context.strokeRect(centerX - size / 2, centerY - size / 2, size, size);

      // Add corner indicators for better visibility
      const cornerSize = 20;
      const offset = size / 2;
      context.setLineDash([]);
      context.lineWidth = 6; // Made green line thiccccer :p

      // Top-left corner
      context.beginPath();
      context.moveTo(centerX - offset, centerY - offset + cornerSize);
      context.lineTo(centerX - offset, centerY - offset);
      context.lineTo(centerX - offset + cornerSize, centerY - offset);
      context.stroke();

      // Top-right corner
      context.beginPath();
      context.moveTo(centerX + offset - cornerSize, centerY - offset);
      context.lineTo(centerX + offset, centerY - offset);
      context.lineTo(centerX + offset, centerY - offset + cornerSize);
      context.stroke();

      // Bottom-left corner
      context.beginPath();
      context.moveTo(centerX - offset, centerY + offset - cornerSize);
      context.lineTo(centerX - offset, centerY + offset);
      context.lineTo(centerX - offset + cornerSize, centerY + offset);
      context.stroke();

      // Bottom-right corner
      context.beginPath();
      context.moveTo(centerX + offset - cornerSize, centerY + offset);
      context.lineTo(centerX + offset, centerY + offset);
      context.lineTo(centerX + offset, centerY + offset - cornerSize);
      context.stroke();
    }
  }

  scanQRCode(isManualCapture = false) {
    if (
      !this.videoRef?.current ||
      !this.canvasRef?.current ||
      this.videoRef.current.videoWidth === 0
    ) {
      this.updateState({ isProcessing: false });
      return;
    }

    const canvas = this.canvasRef.current;
    const video = this.videoRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Use different scanning strategies based on whether it's automatic or manual
    let scanStrategies;

    if (isManualCapture) {
      // Full scanning strategies for manual capture (when user clicks capture)
      scanStrategies = [
        // Standard strategies
        { type: "crop", size: 0.7, angle: 0, name: "center-70" },
        { type: "crop", size: 0.85, angle: 0, name: "center-85" },
        { type: "crop", size: 0.55, angle: 0, name: "center-55" },

        // Angled strategies for tilted QR codes
        { type: "crop", size: 0.7, angle: 15, name: "center-70-15deg" },
        { type: "crop", size: 0.7, angle: -15, name: "center-70-minus15deg" },
        { type: "crop", size: 0.7, angle: 30, name: "center-70-30deg" },
        { type: "crop", size: 0.7, angle: -30, name: "center-70-minus30deg" },
        { type: "crop", size: 0.85, angle: 45, name: "center-85-45deg" },
        { type: "crop", size: 0.85, angle: -45, name: "center-85-minus45deg" },

        // Full frame with angles as fallback
        { type: "full", angle: 0, name: "full-frame" },
        { type: "full", angle: 90, name: "full-frame-90deg" },
        { type: "full", angle: 180, name: "full-frame-180deg" },
        { type: "full", angle: 270, name: "full-frame-270deg" },
      ];
    } else {
      // Lightweight scanning strategies for automatic detection
      scanStrategies = [
        { type: "crop", size: 0.7, angle: 0, name: "center-70" },
        { type: "crop", size: 0.85, angle: 0, name: "center-85" },
        { type: "full", angle: 0, name: "full-frame" },
      ];
    }

    for (const strategy of scanStrategies) {
      try {
        let imageData, width, height;

        if (strategy.type === "full") {
          // Full frame with rotation
          if (strategy.angle === 0) {
            imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            width = canvas.width;
            height = canvas.height;
          } else {
            const rotatedCanvas = document.createElement("canvas");
            const rotatedContext = rotatedCanvas.getContext("2d");

            if (strategy.angle === 90 || strategy.angle === 270) {
              rotatedCanvas.width = canvas.height;
              rotatedCanvas.height = canvas.width;
            } else {
              rotatedCanvas.width = canvas.width;
              rotatedCanvas.height = canvas.height;
            }

            rotatedContext.translate(
              rotatedCanvas.width / 2,
              rotatedCanvas.height / 2
            );
            rotatedContext.rotate((strategy.angle * Math.PI) / 180);
            rotatedContext.drawImage(
              canvas,
              -canvas.width / 2,
              -canvas.height / 2
            );

            imageData = rotatedContext.getImageData(
              0,
              0,
              rotatedCanvas.width,
              rotatedCanvas.height
            );
            width = rotatedCanvas.width;
            height = rotatedCanvas.height;
          }
        } else {
          // Cropped with rotation
          const size = Math.floor(
            Math.min(canvas.width, canvas.height) * strategy.size
          );
          const sx = Math.floor((canvas.width - size) / 2);
          const sy = Math.floor((canvas.height - size) / 2);

          if (strategy.angle === 0) {
            imageData = context.getImageData(sx, sy, size, size);
            width = height = size;
          } else {
            // Create rotated cropped image
            const cropCanvas = document.createElement("canvas");
            const cropContext = cropCanvas.getContext("2d");
            cropCanvas.width = size;
            cropCanvas.height = size;

            const cropImageData = context.getImageData(sx, sy, size, size);
            cropContext.putImageData(cropImageData, 0, 0);

            const rotatedCanvas = document.createElement("canvas");
            const rotatedContext = rotatedCanvas.getContext("2d");
            rotatedCanvas.width = size;
            rotatedCanvas.height = size;

            rotatedContext.translate(size / 2, size / 2);
            rotatedContext.rotate((strategy.angle * Math.PI) / 180);
            rotatedContext.drawImage(cropCanvas, -size / 2, -size / 2);

            imageData = rotatedContext.getImageData(0, 0, size, size);
            width = height = size;
          }
        }

        const code = jsQR(imageData.data, width, height, {
          inversionAttempts: "attemptBoth",
          canOverwriteText: true,
          greyScaleWeights: {
            red: 0.299,
            green: 0.587,
            blue: 0.114,
          },
        });

        if (code) {
          this.stopQRScanning();
          this.stopCamera();
          const url = code.data;
          this.updateState({ isProcessing: false });
          if (this.onResult) {
            this.onResult(url);
          }
          return; // Exit early on success
        }
      } catch (error) {
        continue; // Try next strategy
      }
    }

    // If no strategy worked
    this.updateState({ isProcessing: false });
  }

  captureImage() {
    if (this.isCameraActive && !this.isProcessing) {
      this.updateState({ isProcessing: true });
      if (this.onError) this.onError("");
      // Give a short delay for the UI to update to "Processing..."
      setTimeout(() => {
        this.scanQRCode(true); // Pass true for manual capture with full scanning
      }, 50);
    }
  }

  toggleCamera() {
    if (this.isCameraActive) {
      this.stopCamera();
    } else {
      this.startCamera();
    }
  }

  async playVideoManually() {
    if (this.videoRef?.current && this.videoRef.current.paused) {
      try {
        await this.videoRef.current.play();
        this.updateState({ needsUserInteraction: false });
        if (this.onError) this.onError("");
      } catch (err) {
        if (this.onError)
          this.onError(
            "Failed to start video playback. Please try refreshing the page."
          );
      }
    }
  }

  // Cleanup method
  cleanup() {
    this.stopCamera();
    this.stopMessageTimer();
  }
}
