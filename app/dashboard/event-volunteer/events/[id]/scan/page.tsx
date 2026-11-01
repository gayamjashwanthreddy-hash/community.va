"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import jsQR from "jsqr";
import { 
  ArrowLeft, 
  Camera, 
  Flashlight, 
  FlashlightOff, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Keyboard, 
  Loader2, 
  ShieldAlert, 
  Sparkles,
  Volume2,
  VolumeX,
  UserCheck
} from "lucide-react";

interface ScanOutcome {
  success: boolean;
  result: string;
  message: string;
  participantName?: string;
  registrationNumber?: string;
  checkedInAt?: string;
}

export default function VolunteerScannerPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();

  // Video & Stream references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Authorization & Event state
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [eventTitle, setEventTitle] = useState("Event Check-In");
  const [authError, setAuthError] = useState<string | null>(null);

  // Scanner UI State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scanning & Processing
  const [scanningPaused, setScanningPaused] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<ScanOutcome | null>(null);
  const [stats, setStats] = useState({ successful: 0, total: 0 });

  // Manual Input State
  const [manualToken, setManualToken] = useState("");
  const [manualOpen, setManualOpen] = useState(false);

  // Audio Beep
  const playBeep = useCallback((success: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio context not allowed or not supported
    }
  }, [soundEnabled]);

  // 1. Verify Scanner Authorization
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch(`/api/events/volunteer-events`);
        if (res.status === 401) {
          router.push(`/login?redirect=/dashboard/event-volunteer/events/${eventId}/scan`);
          return;
        }

        const data = await res.json();
        if (!data.success) {
          setAuthorized(false);
          setAuthError(data.message || "Failed to verify volunteer status.");
          return;
        }

        const currentEvt = (data.events || []).find((e: any) => e.id === eventId);
        if (!currentEvt) {
          setAuthorized(false);
          setAuthError("Event not found or not active.");
          return;
        }

        setEventTitle(currentEvt.title);

        // Check if admin or approved volunteer with QR_SCANNING role
        const isAdmin = data.profile?.role === "ADMIN";
        const myApp = currentEvt.myApplication;
        const isApprovedScanner =
          myApp?.status === "APPROVED" &&
          Array.isArray(myApp.assigned_responsibilities) &&
          myApp.assigned_responsibilities.includes("QR_SCANNING");

        if (isAdmin || isApprovedScanner) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          setAuthError(
            "Access Denied: You must be an approved volunteer assigned the 'QR_SCANNING' role for this event."
          );
        }
      } catch (err) {
        console.error("[Scanner Auth Check Error]", err);
        setAuthorized(false);
        setAuthError("Network error verifying scanning permissions.");
      }
    }

    if (eventId) {
      verifyAuth();
    }
  }, [eventId, router]);

  // 2. Server-side token verification and check-in
  const handleCheckInToken = useCallback(
    async (token: string, scanMethod: "CAMERA" | "MANUAL" = "CAMERA") => {
      if (processing || scanningPaused) return;

      setProcessing(true);
      setScanningPaused(true);

      try {
        const res = await fetch(`/api/events/${eventId}/check-in`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrToken: token.trim(),
            scanMethod,
          }),
        });

        const data: ScanOutcome = await res.json();
        setLastOutcome(data);
        setStats((prev) => ({
          total: prev.total + 1,
          successful: data.success ? prev.successful + 1 : prev.successful,
        }));

        playBeep(data.success);
      } catch (err) {
        console.error("[Check In Submit Error]", err);
        const errOutcome: ScanOutcome = {
          success: false,
          result: "NETWORK_ERROR",
          message: "Network error communicating with check-in server.",
        };
        setLastOutcome(errOutcome);
        playBeep(false);
      } finally {
        setProcessing(false);
        // Pause for 2.2 seconds before enabling the scanner for the next attendee
        setTimeout(() => {
          setScanningPaused(false);
        }, 2200);
      }
    },
    [eventId, playBeep, processing, scanningPaused]
  );

  // 3. Scanner Camera Lifecycle
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Request rear camera with optimal resolution
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraActive(true);

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
        setHasTorch(Boolean(capabilities.torch));
      }
    } catch (err: any) {
      console.error("[Camera Start Error]", err);
      setCameraActive(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
      } else {
        setCameraError("Unable to access rear camera. You can still check in attendees using manual token entry.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  }, []);

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn("[Torch Toggle Error]", err);
    }
  };

  // 4. Real-time Video Frame Decoder Loop using jsQR
  useEffect(() => {
    if (!cameraActive || scanningPaused || processing) return;

    let active = true;

    const scanFrame = () => {
      if (!active) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (qrCode && qrCode.data) {
            handleCheckInToken(qrCode.data, "CAMERA");
            return;
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);

    return () => {
      active = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cameraActive, handleCheckInToken, processing, scanningPaused]);

  // Start camera once authorized
  useEffect(() => {
    if (authorized) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [authorized, startCamera, stopCamera]);

  // Manual token submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleCheckInToken(manualToken.trim(), "MANUAL");
    setManualToken("");
    setManualOpen(false);
  };

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 text-brand-red animate-spin mx-auto mb-3" />
          <p className="font-mono text-xs uppercase tracking-wider text-white/70">
            Validating scanner permissions...
          </p>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-between p-4 sm:p-8">
        <div className="max-w-md mx-auto my-auto bg-white rounded-3xl p-8 border border-brand-border text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-brand-red flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-brand-dark uppercase">
            Access Unauthorized
          </h2>
          <p className="text-xs font-mono text-brand-dark/70 mt-2 leading-relaxed">
            {authError || "You must be an approved volunteer with QR_SCANNING role for this event."}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/dashboard/volunteer/events"
              className="px-5 py-2.5 rounded-full bg-brand-dark text-white font-mono text-xs font-bold uppercase hover:bg-black transition-colors"
            >
              Back to Volunteer Opportunities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="p-4 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/volunteer/events"
            onClick={stopCamera}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-red flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              Live Scanner
            </span>
            <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
              {eventTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-full transition-colors ${
                torchOn ? "bg-amber-400 text-black font-bold" : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
              title="Toggle Flashlight"
            >
              {torchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            title="Toggle Beep"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          <button
            onClick={() => setManualOpen(true)}
            className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            title="Manual Token Entry"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Camera Viewfinder Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center overflow-hidden bg-neutral-950">
        <canvas ref={canvasRef} className="hidden" />

        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          autoPlay
          playsInline
        />

        {/* Viewfinder Target Reticle */}
        <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 border-2 border-white/30 rounded-3xl overflow-hidden flex flex-col items-center justify-between p-4 pointer-events-none shadow-2xl">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-red rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-red rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-red rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-red rounded-br-2xl" />

          {/* Animated Scanning Laser */}
          {!scanningPaused && cameraActive && (
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-red to-transparent animate-pulse shadow-[0_0_15px_#ED2424] top-1/2" />
          )}

          <div className="text-[10px] font-mono tracking-widest uppercase bg-black/60 px-3 py-1 rounded-full text-white/80">
            Align QR Pass
          </div>

          <div className="text-[10px] font-mono tracking-wider uppercase bg-black/60 px-3 py-1 rounded-full text-white/80">
            {processing ? "Verifying Token..." : scanningPaused ? "Processing Next..." : "Scanner Active"}
          </div>
        </div>

        {/* Camera Permission / Error Overlay */}
        {cameraError && (
          <div className="absolute inset-0 bg-neutral-900/90 z-20 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-10 h-10 text-brand-red mb-3" />
            <p className="text-xs font-mono text-white/80 max-w-sm mb-4">{cameraError}</p>
            <div className="flex gap-3">
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-full bg-brand-red text-white text-xs font-mono font-bold uppercase flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
              </button>
              <button
                onClick={() => setManualOpen(true)}
                className="px-4 py-2 rounded-full bg-white text-black text-xs font-mono font-bold uppercase flex items-center gap-2"
              >
                <Keyboard className="w-3.5 h-3.5" /> Manual Entry
              </button>
            </div>
          </div>
        )}

        {/* Scan Outcome Pop-Up Card */}
        {lastOutcome && (
          <div className="absolute bottom-6 inset-x-4 max-w-md mx-auto z-30 animate-in slide-in-from-bottom duration-200">
            <div
              className={`p-5 rounded-3xl border shadow-2xl backdrop-blur-xl ${
                lastOutcome.success
                  ? "bg-emerald-950/90 border-emerald-500 text-white"
                  : lastOutcome.result === "ALREADY CHECKED IN"
                  ? "bg-amber-950/90 border-amber-500 text-white"
                  : "bg-rose-950/90 border-rose-500 text-white"
              }`}
            >
              <div className="flex items-start gap-3">
                {lastOutcome.success ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : lastOutcome.result === "ALREADY CHECKED IN" ? (
                  <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider">
                      {lastOutcome.result}
                    </span>
                    <button
                      onClick={() => setLastOutcome(null)}
                      className="text-white/60 hover:text-white text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {lastOutcome.participantName && (
                    <h3 className="font-display text-lg font-bold truncate mt-0.5">
                      {lastOutcome.participantName}
                    </h3>
                  )}

                  {lastOutcome.registrationNumber && (
                    <p className="font-mono text-xs opacity-80 mt-0.5">
                      ID: {lastOutcome.registrationNumber}
                    </p>
                  )}

                  <p className="text-xs opacity-90 mt-1 leading-snug">
                    {lastOutcome.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Bar: Stats & Quick Actions */}
      <footer className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs font-mono z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <UserCheck className="w-4 h-4" />
            <span>{stats.successful} Checked In</span>
          </div>
          <span className="text-neutral-600">•</span>
          <div className="text-neutral-400">Total Scans: {stats.total}</div>
        </div>

        <button
          onClick={() => setManualOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Manual Entry</span>
        </button>
      </footer>

      {/* Manual Token Entry Modal */}
      {manualOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="font-display text-lg font-bold uppercase">
                Manual Token Entry
              </h3>
              <button
                onClick={() => setManualOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Enter Registration QR Token or Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. cva_qr_..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-mono hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5"
                >
                  {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Verify Pass</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
