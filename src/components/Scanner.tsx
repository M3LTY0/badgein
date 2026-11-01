import { useEffect, useRef, useState } from "react";
import { parseBadgeLink, type SharedProfile } from "../lib/badgeLink";

type Props = {
  /** Called once per valid badge. `encoded` is the raw payload, handy for linking to the profile page. */
  onProfile: (shared: SharedProfile, encoded: string) => void;
};

type CamState = "idle" | "starting" | "scanning" | "denied" | "unsupported";
type QRDetector = {
  detect: (source: HTMLCanvasElement) => Promise<Array<{ rawValue: string }>>;
};

/** Paste a badge link to connect. Camera QR scanning is opt-in when the browser supports it. */
export default function Scanner({ onProfile }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onProfileRef = useRef(onProfile);
  onProfileRef.current = onProfile;

  const [cam, setCam] = useState<CamState>("idle");
  const [error, setError] = useState("");
  const [pasted, setPasted] = useState("");

  const handleText = (text: string): boolean => {
    const parsed = parseBadgeLink(text);
    if (!parsed) {
      setError("That isn't a badgeIn code.");
      return false;
    }
    setError("");
    onProfileRef.current(parsed.shared, parsed.encoded);
    return true;
  };

  useEffect(() => {
    if (cam !== "starting" && cam !== "scanning") return;

    const Detector = (
      window as Window & {
        BarcodeDetector?: new (options: { formats: string[] }) => QRDetector;
      }
    ).BarcodeDetector;
    if (!navigator.mediaDevices?.getUserMedia || !Detector) {
      setCam("unsupported");
      return;
    }
    const detector = new Detector({ formats: ["qr_code"] });
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    let lastBad = 0;

    const tick = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (cancelled || !video || !canvas) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        // Downscale big frames: decoding is much faster and still reads a QR held at normal distance.
        const scale = Math.min(1, 640 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            const codes = await detector.detect(canvas);
            if (cancelled) return;
            const value = codes[0]?.rawValue;
            if (value) {
              const parsed = parseBadgeLink(value);
              if (parsed) {
                stream?.getTracks().forEach((t) => t.stop());
                onProfileRef.current(parsed.shared, parsed.encoded);
                return;
              }
              if (Date.now() - lastBad > 2000) {
                lastBad = Date.now();
                setError("That isn't a badgeIn code.");
              }
            }
          } catch {
            // Ignore frames that the browser cannot decode.
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        video.play().catch(() => {});
        setCam("scanning");
        raf = requestAnimationFrame(tick);
      })
      .catch(() => !cancelled && setCam("denied"));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [cam === "starting" || cam === "scanning"]);

  const showCam = cam === "starting" || cam === "scanning";

  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (pasted.trim() && handleText(pasted.trim())) setPasted("");
        }}
      >
        <input
          aria-label="Badge link"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder="Paste a badge link"
          className="min-w-0 flex-1 rounded-lg border border-line bg-transparent px-2 py-1.5 text-[9.5px] text-white outline-none placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-2.5 text-[9.5px] font-bold text-white hover:brightness-110"
        >
          Add
        </button>
      </form>

      <p
        role="status"
        className="min-h-[12px] text-center text-[9px] text-red-400"
      >
        {error}
      </p>

      {showCam ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-line bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          {cam === "scanning" && (
            <div
              className="pointer-events-none absolute inset-6 rounded-lg border-2 border-brand/80"
              aria-hidden
            />
          )}
          {cam === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[9.5px] text-slate-300">
              Starting camera…
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-[8.5px] text-slate-400">
          {cam === "denied" && "Camera blocked. Paste a badge link instead."}
          {cam === "unsupported" && "Camera scanning isn't available here."}
          {cam === "idle" && (
            <button
              type="button"
              onClick={() => setCam("starting")}
              className="text-slate-400 underline hover:text-white"
            >
              Try camera instead
            </button>
          )}
        </p>
      )}
    </div>
  );
}
