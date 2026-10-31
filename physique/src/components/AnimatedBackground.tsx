import { useEffect, useRef } from "react";

export type BackgroundVariant = "athlete" | "coach" | "ai";

const palettes: Record<BackgroundVariant, [string, string, string]> = {
  // [primary light, secondary light, tertiary]
  athlete: ["rgba(0,220,200,0.14)", "rgba(0,122,186,0.12)", "rgba(139,124,255,0.06)"],
  coach: ["rgba(0,122,186,0.14)", "rgba(0,220,200,0.10)", "rgba(139,124,255,0.07)"],
  ai: ["rgba(139,124,255,0.20)", "rgba(0,220,200,0.10)", "rgba(0,122,186,0.08)"],
};

const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * Ambient, GPU-cheap background: graphite base, three slowly drifting
 * blurred light sources (transform-only), masked grid, light sweep,
 * pointer spotlight (fine pointers only), film grain and vignette.
 * No WebGL. Honors prefers-reduced-motion via index.css.
 */
export function AnimatedBackground({ variant = "athlete" }: { variant?: BackgroundVariant }) {
  const spot = useRef<HTMLDivElement>(null);
  const [a, b, c] = palettes[variant];

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let x = 50, y = 30, tx = 50, ty = 30;
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      spot.current?.style.setProperty("--x", `${x}%`);
      spot.current?.style.setProperty("--y", `${y}%`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ada-navy">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 50% -10%, #0F1619 0%, #05080A 55%, #030506 100%)" }}
      />
      <div
        className="ada-orb-a absolute -left-[10%] -top-[20%] h-[70vmax] w-[70vmax] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${a}, transparent 70%)`, filter: "blur(40px)" }}
      />
      <div
        className="ada-orb-b absolute -right-[20%] top-[10%] h-[60vmax] w-[60vmax] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${b}, transparent 70%)`, filter: "blur(50px)" }}
      />
      <div
        className="ada-orb-c absolute -bottom-[30%] left-[20%] h-[55vmax] w-[55vmax] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${c}, transparent 70%)`, filter: "blur(60px)" }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[70vh] opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(70% 60% at 50% 0%, black 10%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(70% 60% at 50% 0%, black 10%, transparent 75%)",
        }}
      />
      <div
        className="ada-sweep absolute -inset-x-1/2 -top-[20%] h-[40vh]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.035), transparent)", filter: "blur(20px)" }}
      />
      <div
        ref={spot}
        className="absolute inset-0"
        style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,30%), rgba(255,255,255,0.035), transparent 60%)" }}
      />
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: grain }} />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.65) 100%)" }}
      />
    </div>
  );
}
