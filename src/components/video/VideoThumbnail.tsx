import { Play, Loader } from 'lucide-react';
import { useVideoThumbnail } from '../../hooks/useVideoThumbnail';
import { getVideoUrl, getThumbnailUrl } from '../../data/videoUrlMap';

interface VideoThumbnailProps {
  videoId: string;
  /** Override the extracted thumbnail with a manual URL */
  manualThumbnail?: string;
}

/**
 * Displays a 16:9 video thumbnail.
 *
 * Priority:
 * 1. `manualThumbnail` prop (if provided)
 * 2. Pre-extracted static thumbnail (from getThumbnailUrl)
 * 3. Auto-extracted first frame from the video (CORS must be configured)
 * 4. Fallback: Play icon placeholder
 */
export default function VideoThumbnail({ videoId, manualThumbnail }: VideoThumbnailProps) {
  const staticThumbnail = getThumbnailUrl(videoId);
  const videoUrl = manualThumbnail || staticThumbnail ? undefined : getVideoUrl(videoId);
  const { thumbnail, loading } = useVideoThumbnail(videoUrl, { seekSeconds: 1 });

  const src = manualThumbnail ?? staticThumbnail ?? thumbnail;

  if (src) {
    return (
      <div className="aspect-video bg-slate-100 overflow-hidden relative">
        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="aspect-video bg-slate-100 flex items-center justify-center">
        <Loader size={22} className="text-slate-300 animate-spin" />
      </div>
    );
  }

  // tainted or error both fall back to Play icon — the video is reachable
  // but canvas can't read pixels (cross-origin without matching CORS)
  return (
    <div className="aspect-video bg-slate-100 flex items-center justify-center">
      <Play size={28} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
    </div>
  );
}
