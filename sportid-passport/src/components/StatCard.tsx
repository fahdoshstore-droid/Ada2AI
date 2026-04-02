'use client';

interface StatCardProps {
  icon?: string;
  value: string;
  label: string;
  sub?: string;
  color?: string;
  className?: string;
}

export function StatCard({ icon, value, label, sub, color = 'text-[#00DCC8]', className = '' }: StatCardProps) {
  return (
    <div className={`sport-card p-4 text-center ${className}`}>
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-white/60 text-xs mt-1">{label}</div>
      {sub && <div className="text-white/30 text-xs mt-0.5">{sub}</div>}
    </div>
  );
}
