import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Play } from 'lucide-react';

export interface VideoPlayerHandle {
  seekTo: (time: number) => void;
  togglePlay: () => void;
  getCurrentTime: () => number;
  getVideo: () => HTMLVideoElement | null;
}

interface VideoPlayerProps {
  videoUrl: string;
  variant?: 'desktop' | 'mobile';
  isPlaying: boolean;
  playbackRate: number;
  onPlayPause: () => void;
  onEnded: () => void;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onSeek: (time: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayerInner(
  { videoUrl, variant = 'desktop', isPlaying, playbackRate, onPlayPause, onEnded, onTimeUpdate, onDurationChange, onSeek },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = time;
        onSeek(time);
      }
    },
    togglePlay: () => {
      onPlayPause();
    },
    getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    getVideo: () => videoRef.current,
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setIsReady(false);
    setHasError(false);
    retryCountRef.current = 0;
    video.setAttribute('referrerpolicy', 'no-referrer');
    video.load();
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {
        setHasError(true);
      });
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    onTimeUpdate(video.currentTime);
  };

  const handleDurationChange = () => {
    const video = videoRef.current;
    if (!video) return;
    onDurationChange(video.duration);
    setIsReady(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsReady(true);
    setHasError(false);
  };

  const handleError = () => {
    const video = videoRef.current;
    if (!video) return;

    if (retryCountRef.current < 1) {
      retryCountRef.current += 1;
      window.setTimeout(() => {
        video.load();
      }, 250);
      return;
    }

    setIsReady(false);
    setHasError(true);
  };

  return (
    <div ref={containerRef} className="relative w-full bg-black group" style={{ aspectRatio: '16/9' }}>
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onLoadedMetadata={handleDurationChange}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={onEnded}
        onClick={onPlayPause}
        preload="metadata"
        playsInline
      />

      {/* Loading */}
      {!isReady && !hasError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className={`${variant === 'desktop' ? 'w-6 h-6' : 'w-7 h-7'} border-2 border-white/20 border-t-white/60 rounded-full animate-spin`} />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10 text-center px-5">
          <div>
            <p className="text-sm font-medium text-white">视频暂时无法播放</p>
            <button
              type="button"
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                retryCountRef.current = 0;
                setHasError(false);
                video.load();
                if (isPlaying) video.play().catch(() => setHasError(true));
              }}
              className="mt-3 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-100"
            >
              重新加载
            </button>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {!isPlaying && isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity cursor-pointer" onClick={onPlayPause}>
          <div className={`${variant === 'desktop' ? 'w-16 h-16' : 'w-[72px] h-[72px]'} rounded-full bg-white/20 backdrop-blur flex items-center justify-center`}>
            <Play size={variant === 'desktop' ? 28 : 30} className="text-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer;
