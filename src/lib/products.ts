/**
 * Ada2AI product links shared by the landing page, the header and the footer.
 *
 * أدائي فيزيك (Ada2Physique) is a separate app on the same Supabase project
 * (accounts are shared). Set VITE_PHYSIQUE_URL to its final address, e.g.
 * https://physique.ada2ai.com, once that domain is connected.
 */
export const PHYSIQUE_URL = (import.meta.env.VITE_PHYSIQUE_URL as string | undefined)?.replace(/\/$/, '') || 'https://physique-three.vercel.app'

/** True for links that leave this app (full URL), which need <a>, not <Link>. */
export const isExternalPath = (path: string) => /^https?:\/\//.test(path)
