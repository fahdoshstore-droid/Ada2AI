export const statusColors = {
  queued:     { bg: 'rgba(245,166,35,0.1)',  border: 'rgba(245,166,35,0.25)',  text: '#f5a623' },
  processing: { bg: 'rgba(0,122,186,0.1)',   border: 'rgba(0,122,186,0.25)',   text: '#007aba' },
  completed:  { bg: 'rgba(0,194,168,0.1)',   border: 'rgba(0,194,168,0.25)',   text: '#00c2a8' },
  failed:     { bg: 'rgba(231,76,60,0.1)',   border: 'rgba(231,76,60,0.25)',   text: '#e74c3c' },
  pending:    { bg: 'rgba(160,180,204,0.1)', border: 'rgba(160,180,204,0.2)',  text: '#a0b4cc' },
} as const

export type StatusKey = keyof typeof statusColors

export const statusLabels: Record<StatusKey, string> = {
  queued:     'في الانتظار',
  processing: 'جارٍ التحليل',
  completed:  'مكتمل',
  failed:     'فشل',
  pending:    'معلق',
}