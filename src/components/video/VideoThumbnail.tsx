import { Play, Loader } from 'lucide-react';
import { useState } from 'react';
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
  const [failedImage, setFailedImage] = useState<{ key: string; src: string } | null>(null);
  const preferredImage = manualThumbnail ?? staticThumbnail;
  const imageKey = `${videoId}:${preferredImage ?? ''}`;
  const preferredImageFailed = !!preferredImage
    && failedImage?.key === imageKey
    && failedImage.src === preferredImage;
  const shouldTryVideoFrame = !preferredImage || preferredImageFailed;
  const videoUrl = shouldTryVideoFrame ? getVideoUrl(videoId) : undefined;
  const { thumbnail, loading } = useVideoThumbnail(videoUrl, { seekSeconds: 1 });

  const src = preferredImage && !preferredImageFailed ? preferredImage : thumbnail;
  const [visibleSrc, setVisibleSrc] = useState(src ?? null);
  const pendingSrc = src && src !== visibleSrc ? src : null;

  if (src || visibleSrc) {
    return (
      <div className="aspect-video bg-slate-100 overflow-hidden relative">
        {visibleSrc && (
          <img
            src={visibleSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
            onError={() => {
              setFailedImage({ key: imageKey, src: visibleSrc });
              setVisibleSrc(null);
            }}
          />
        )}
        {pendingSrc && (
          <img
            src={pendingSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0"
            loading="eager"
            decoding="async"
            onLoad={() => setVisibleSrc(pendingSrc)}
            onError={() => setFailedImage({ key: imageKey, src: pendingSrc })}
          />
        )}
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
