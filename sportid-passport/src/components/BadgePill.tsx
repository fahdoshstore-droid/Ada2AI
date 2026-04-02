'use client';

type Grade = 'Elite' | 'Strong' | 'Good';

interface BadgePillProps {
  grade: Grade;
  className?: string;
}

const config: Record<Grade, { color: string; bg: string }> = {
  Elite:  { color: '#00DCC8', bg: 'rgba(0,220,200,0.12)' },
  Strong: { color: '#007ABA', bg: 'rgba(37,99,235,0.12)' },
  Good:   { color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
};

export function BadgePill({ grade, className = '' }: BadgePillProps) {
  const { color, bg } = config[grade];
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${className}`}
      style={{ color, background: bg }}
    >
      {grade}
    </span>
  );
}
