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
  const [isReady, setIsReady] = useState(false);

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
    if (isPlaying) {
      video.play().catch(() => {});
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
        onEnded={onEnded}
        onClick={onPlayPause}
        playsInline
      />

      {/* Loading */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className={`${variant === 'desktop' ? 'w-6 h-6' : 'w-7 h-7'} border-2 border-white/20 border-t-white/60 rounded-full animate-spin`} />
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
