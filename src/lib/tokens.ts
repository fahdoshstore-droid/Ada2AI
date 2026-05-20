export const statusColors = {
  queued:     { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  text: '#F59E0B' },
  processing: { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  text: '#3B82F6' },
  completed:  { bg: 'rgba(0,194,168,0.1)',    border: 'rgba(0,194,168,0.2)',   text: '#00C2A8' },
  failed:     { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   text: '#EF4444' },
  pending:    { bg: 'rgba(160,180,204,0.1)', border: 'rgba(160,180,204,0.2)', text: '#a0b4cc' },
} as const

export type StatusKey = keyof typeof statusColors

export const statusLabels: Record<StatusKey, string> = {
  queued:     'في الانتظار',
  processing: 'جارٍ التحليل',
  completed:  'مكتمل',
  failed:     'فشل',
  pending:    'معلق',
}