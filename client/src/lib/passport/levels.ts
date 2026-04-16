/**
 * Sport ID level system — pure calculation, no mock data.
 */
export function getLevelInfo(points: number) {
  if (points >= 2000) return { level: 'Platinum' as const, color: '#E5E4E2', next: null, needed: 0 };
  if (points >= 1000) return { level: 'Gold' as const, color: '#FFD700', next: 'Platinum', needed: 2000 - points };
  if (points >= 500) return { level: 'Silver' as const, color: '#C0C0C0', next: 'Gold', needed: 1000 - points };
  return { level: 'Bronze' as const, color: '#CD7F32', next: 'Silver', needed: 500 - points };
}
