/** Ada2Physique icon set — 1.6px stroke, inline SVG, no dependency. */
import type { SVGProps } from 'react';

const paths = {
  home: 'M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6h-6v6H4.5a1 1 0 0 1-1-1z',
  dumbbell: 'M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11',
  nutrition: 'M12 21c-4.4 0-7-3.4-7-7.5C5 9 8 6.5 12 7c4-.5 7 2 7 6.5 0 4.1-2.6 7.5-7 7.5zM12 7c0-2 1-3.5 3-4',
  progress: 'M3.5 20.5h17M6 16l4-5 3.5 3 5-7',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.9-3.3 3.4-5 6.5-5s5.6 1.7 6.5 5M16 4.3a3.5 3.5 0 0 1 0 6.4M18 15.2c1.8.6 3 2.2 3.5 4.8',
  layers: 'M12 3 2.5 8 12 13l9.5-5zM2.5 12.5 12 17.5l9.5-5M2.5 16.5 12 21.5l9.5-5',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
  play: 'M7 4.5v15l12-7.5z',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  arrow: 'M4.5 12h15M13.5 6l6 6-6 6',
  chevron: 'M9 5.5 15.5 12 9 18.5',
  chevronDown: 'M5.5 9 12 15.5 18.5 9',
  video: 'M3.5 7a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 15.5 7v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17zM15.5 10.5l5-3v9l-5-3z',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M9.5 2.5h5',
  flame: 'M12 21c-3.9 0-6.5-2.7-6.5-6.3 0-3.4 2.4-5.2 3.6-8.2.4 1.8 1.4 3 2.6 3.5.3-2.8 1.8-5.4 4.3-7 0 3.9 2.5 5.6 2.5 10.2 0 4.6-2.6 7.8-6.5 7.8z',
  drop: 'M12 21a6.5 6.5 0 0 0 6.5-6.5C18.5 10 12 3 12 3S5.5 10 5.5 14.5A6.5 6.5 0 0 0 12 21z',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  bolt: 'M13 2.5 4.5 13.5H12l-1 8 8.5-11H12z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z',
  search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM16 16l4.5 4.5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.5 5.6 3.5 9s-1 6.4-3.5 9c-2.5-2.6-3.5-5.6-3.5-9s1-6.4 3.5-9z',
  alert: 'M12 3.5 2.5 20h19zM12 10v4.5M12 17.2v.3',
  message: 'M4 5.5h16v11H9l-5 4z',
  copy: 'M8 8h11v12H8zM5 16V4h11',
  trash: 'M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13',
  grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3.5V7M16 3.5V7',
  camera: 'M4 8h3l2-2.5h6L17 8h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  scan: 'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M4 12h16',
  close: 'M6 6l12 12M18 6 6 18',
  send: 'M4 12 20 4l-5 16-3.5-6.5z',
  trend: 'M3.5 16.5 9 11l4 4 7.5-8M15 7h5.5v5.5',
  checkin: 'M5 4.5h14v16H5zM8.5 3v3M15.5 3v3M8.5 12.5l2.5 2.5 4.5-5',
  logout: 'M14 4.5h4.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H14M10 16.5 5.5 12 10 7.5M5.5 12h10',
  shield: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z',
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, className, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  const filled = name === 'play';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
