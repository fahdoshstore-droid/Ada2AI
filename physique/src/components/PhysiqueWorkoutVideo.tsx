import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { ownedPhysiqueMediaPath } from '../lib/physiqueMedia';
import type { WorkoutLog, SignedUrlResponse } from '../lib/types';

export function PhysiqueWorkoutVideo({ log }: { log: Pick<WorkoutLog, 'id' | 'athlete_id' | 'video_url'> }) {
  const { userId } = useAuth();
  const path = log.video_url ? ownedPhysiqueMediaPath(log.video_url, 'physique-videos', log.athlete_id, import.meta.env.VITE_SUPABASE_URL) : null;
  const video = useQuery({
    queryKey: ['physique-workout-video', userId, log.athlete_id, log.id, path],
    enabled: !!userId && !!path,
    queryFn: () => api.post<SignedUrlResponse>('/uploads/signed-url', { bucket: 'physique-videos', path }),
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
  });
  if (!log.video_url) return null;
  if (!userId || !path || video.isError) return <span className="text-xs text-ada-muted">Private workout video unavailable</span>;
  if (!video.data) return <span className="text-xs text-ada-muted">Loading private video…</span>;
  return <a href={video.data.signed_url} target="_blank" rel="noopener noreferrer" className="text-ada-teal hover:underline">View workout video →</a>;
}
