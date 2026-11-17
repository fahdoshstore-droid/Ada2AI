/** Reject references to private Physique buckets in every football video path. */
export function isPhysiqueMediaReference(value: string): boolean {
  try {
    const path = decodeURIComponent(value.trim());
    return /(?:^|\/)(?:physique-videos|physique-photos)(?:\/|$)/i.test(path);
  } catch { return true }
}
