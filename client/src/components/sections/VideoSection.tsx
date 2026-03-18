/**
 * VideoSection — Ada2ai Promo Video
 * Design: Saudi Tech Noir — Dark cinematic video showcase
 * Placement: After HeroSection, before ProblemSection
 * Features: Autoplay muted loop, play/pause toggle, fullscreen, cinematic overlay
 */

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Maximize2, Volume2, VolumeX } from "lucide-react";

const VIDEO_URL =
  "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/115062705/fgWPNJSEdMZeRqbF.mp4?Expires=1804876422&Signature=KhA1M5QZFDYK1NaXDtIfPpbYEFNeP9DgjIB1QnEAJ1gx234uN9UhgfxDURf0Cyl17HUj-veP6ANpFgtZ4~WPfT2PWLIzR8X-f6iEeBVDUzRXcXtnhF~BYLK3J~j617ZBFzNdsBTKXhEU4n~DJRqXwKd2TBeNEbmIbU6f5A4CKqDZIlo37rp~h1R8OEOzFE0eqscaLT8jcPduds7NqWVqvgREuMt-feLr~fk-8A02zqO8Bm4ehnYBxXblEiJ7SxXhQLYzi-ij3~ah9Y6pbSa8XhDHVztBHTrUNLUv8yH~R2r43Ugu4inqRs~wahshK1CdEk-zxz68m2G~HQq16cD65g__&Key-Pair-Id=K2HSFNDJXOU9YS";

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Intersection observer — autoplay when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Progress bar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const update = () => setProgress((video.currentTime / video.duration) * 100 || 0);
    video.addEventListener("timeupdate", update);
    return () => video.removeEventListener("timeupdate", update);
  }, []);

  // Auto-hide controls
  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
      resetControlsTimer();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = ratio * videoRef.current.duration;
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 overflow-hidden"
      style={{ background: "linear-gradient(180deg, oklch(0.08 0.02 240) 0%, oklch(0.06 0.025 230) 50%, oklch(0.08 0.02 240) 100%)" }}
      onMouseMove={resetControlsTimer}
    >
      {/* Section label */}
      <div className="container mx-auto px-4 mb-8 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{
            background: "rgba(0,194,168,0.08)",
            border: "1px solid rgba(0,194,168,0.25)",
            color: "#00C2A8",
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] animate-pulse" />
          عرض المنصة
        </div>
        <h2
          className="text-2xl md:text-3xl font-black text-white mb-2"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          شاهد Ada2ai في العمل
        </h2>
        <p
          className="text-white/45 text-sm max-w-lg mx-auto"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          منصة رياضية متكاملة تجمع تحليل المواهب بالذكاء الاصطناعي مع جواز السفر الرياضي الرقمي
        </p>
      </div>

      {/* Video container */}
      <div className="container mx-auto px-4">
        <div
          className="relative mx-auto rounded-2xl overflow-hidden cursor-pointer group"
          style={{
            maxWidth: "900px",
            background: "#000",
            boxShadow: "0 0 80px rgba(0,194,168,0.12), 0 0 0 1px rgba(0,194,168,0.15), 0 40px 80px rgba(0,0,0,0.6)",
          }}
          onClick={togglePlay}
        >
          {/* Glow border effect */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none z-10"
            style={{
              background: "linear-gradient(135deg, rgba(0,194,168,0.08) 0%, transparent 50%, rgba(29,185,84,0.05) 100%)",
            }}
          />

          {/* Video element */}
          <video
            ref={videoRef}
            src={VIDEO_URL}
            className="w-full block"
            style={{ aspectRatio: "16/9", objectFit: "cover" }}
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
          />

          {/* Cinematic letterbox bars */}
          <div
            className="absolute top-0 left-0 right-0 h-8 pointer-events-none z-20"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-20"
            style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
          />

          {/* Big play button — center */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  background: "rgba(0,194,168,0.15)",
                  border: "2px solid rgba(0,194,168,0.6)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 0 40px rgba(0,194,168,0.3)",
                }}
              >
                <Play size={32} className="text-[#00C2A8] ml-1" fill="#00C2A8" />
              </div>
            </div>
          )}

          {/* Controls overlay — bottom */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-30 px-5 pb-4 pt-8 transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}
            style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div
              className="w-full h-1 rounded-full mb-3 cursor-pointer group/progress"
              style={{ background: "rgba(255,255,255,0.15)" }}
              onClick={handleProgressClick}
            >
              <div
                className="h-full rounded-full relative transition-all"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #00C2A8, oklch(0.65 0.2 145))",
                }}
              >
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
                  style={{ background: "#00C2A8", transform: "translate(50%, -50%)" }}
                />
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                >
                  {isPlaying
                    ? <Pause size={16} className="text-white" fill="white" />
                    : <Play size={16} className="text-white ml-0.5" fill="white" />
                  }
                </button>

                {/* Mute */}
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                >
                  {isMuted
                    ? <VolumeX size={15} className="text-white/60" />
                    : <Volume2 size={15} className="text-white" />
                  }
                </button>

                {/* Ada2ai badge */}
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                  style={{
                    background: "rgba(0,194,168,0.12)",
                    border: "1px solid rgba(0,194,168,0.25)",
                    color: "#00C2A8",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] animate-pulse" />
                  Ada2ai
                </div>
              </div>

              {/* Fullscreen */}
              <button
                onClick={handleFullscreen}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              >
                <Maximize2 size={15} className="text-white/70" />
              </button>
            </div>
          </div>

          {/* Corner badge — top right */}
          <div
            className="absolute top-4 right-4 z-30 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(0,194,168,0.3)",
              color: "#00C2A8",
              fontFamily: "'Space Grotesk', sans-serif",
              backdropFilter: "blur(8px)",
            }}
          >
            ⚽ Ada2ai Demo
          </div>
        </div>

        {/* Below video — feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {[
            { icon: "🤖", label: "تحليل AI فوري" },
            { icon: "🪪", label: "جواز السفر الرياضي" },
            { icon: "🗺️", label: "10 أكاديميات محلية" },
            { icon: "📊", label: "Radar Chart تفاعلي" },
            { icon: "💬", label: "تكامل واتساب" },
          ].map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.55)",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              <span>{pill.icon}</span>
              {pill.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
