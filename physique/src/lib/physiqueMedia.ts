/** Private Physique media only. Never accepts football buckets or external URLs. */
export function ownedPhysiqueMediaPath(value: string, bucket: 'physique-photos' | 'physique-videos', athleteId: string, supabaseUrl: string): string | null {
  let path = value.trim();
  try {
    if (/^https?:\/\//i.test(path)) {
      const url = new URL(path);
      if (url.origin !== new URL(supabaseUrl).origin) return null;
      const prefix = /^\/storage\/v1\/object\/(?:sign|authenticated)\/(physique-photos|physique-videos)\//.exec(url.pathname);
      if (!prefix || prefix[1] !== bucket) return null;
      path = decodeURIComponent(url.pathname.slice(prefix[0].length));
    }
    if (path.includes('?') || path.includes('#') || path.includes('\\') || /[\x00-\x1f%]/.test(path)) return null;
    const segments = path.split('/');
    if (segments.length < 2 || segments[0] !== athleteId || segments.some(part => !part || part === '.' || part === '..')) return null;
    return path;
  } catch { return null; }
}
