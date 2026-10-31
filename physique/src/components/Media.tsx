import type { ReactNode } from "react";

/* ── Ada2Physique brand photography ──
 * Files live in /public/images/physique as `<name>.webp` (full) and
 * `<name>-800.webp` (mobile). Served statically (vercel.json excludes /images). */

export type PhotoName =
  | "coach-spot-incline"
  | "incline-press-tracking"
  | "squat-tracking"
  | "coach-portrait"
  | "nutrition-prep";

const PHOTOS: Record<PhotoName, { w: number; h: number }> = {
  "coach-spot-incline": { w: 1672, h: 941 },
  "incline-press-tracking": { w: 1122, h: 1402 },
  "squat-tracking": { w: 1672, h: 941 },
  "coach-portrait": { w: 1122, h: 1402 },
  "nutrition-prep": { w: 1672, h: 941 },
};

export function Photo({
  name,
  alt,
  className = "",
  position = "center",
  priority = false,
  sizes = "100vw",
}: {
  name: PhotoName;
  alt: string;
  className?: string;
  position?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const { w, h } = PHOTOS[name];
  return (
    <img
      src={`/images/physique/${name}.webp`}
      srcSet={`/images/physique/${name}-800.webp 800w, /images/physique/${name}.webp ${w}w`}
      sizes={sizes}
      width={w}
      height={h}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      style={{ objectPosition: position }}
    />
  );
}

/**
 * Full-bleed photographic banner: image + layered gradients so text on the
 * left stays legible, with a subtle teal light leak. Content renders on top.
 */
export function HeroBanner({
  photo,
  alt,
  position = "center",
  children,
  className = "",
  priority = true,
}: {
  photo: PhotoName;
  alt: string;
  position?: string;
  children: ReactNode;
  className?: string;
  priority?: boolean;
}) {
  return (
    <section
      className={`relative isolate overflow-hidden rounded-[var(--radius-panel)] shadow-[var(--shadow-elev-3)] ${className}`}
    >
      <Photo
        name={photo}
        alt={alt}
        position={position}
        priority={priority}
        sizes="(min-width: 768px) 1200px, 100vw"
        className="absolute inset-0 -z-20 h-full w-full scale-[1.02] object-cover"
      />
      {/* legibility layers */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ada-navy via-ada-navy/80 to-ada-navy/10" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ada-navy/90 via-transparent to-ada-navy/30" />
      <div aria-hidden className="absolute -left-20 -top-24 -z-10 h-72 w-72 rounded-full bg-ada-teal/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[var(--radius-panel)] ada-hairline" />
      <div className="relative flex min-h-[280px] flex-col justify-end px-5 py-8 sm:min-h-[340px] sm:px-10 sm:py-10 lg:[&>header]:flex-col lg:[&>header]:items-start [&>header>div:first-child]:max-w-xl">{children}</div>
    </section>
  );
}
