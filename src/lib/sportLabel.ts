const SPORT_LABELS: Record<string, string> = {
  football: 'كرة القدم', soccer: 'كرة القدم', basketball: 'كرة السلة', volleyball: 'كرة الطائرة',
  swimming: 'سباحة', athletics: 'ألعاب القوى', other: 'أخرى',
}

/** Stored sport values are sometimes English keys; show them in Arabic. */
export function sportLabel(sport: string): string {
  return SPORT_LABELS[sport.trim().toLowerCase()] ?? sport
}
