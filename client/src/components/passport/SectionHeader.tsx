import { ReactNode } from 'react';

interface SectionHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  iconBg?: string;
  iconBorder?: string;
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  right,
  iconBg = 'bg-[#00DCC8]/12',
  iconBorder = 'border-[#00DCC8]/25',
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl ${iconBg} border ${iconBorder} flex items-center justify-center text-lg`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
