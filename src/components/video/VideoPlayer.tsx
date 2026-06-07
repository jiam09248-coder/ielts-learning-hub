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
  isPlaying: boolean;
  playbackRate: number;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onSeek: (time: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayerInner(
  { videoUrl, isPlaying, playbackRate, onPlayPause, onTimeUpdate, onDurationChange, onSeek },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = time;
        setProgress(time);
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
    if (!video || isDragging) return;
    setProgress(video.currentTime);
    onTimeUpdate(video.currentTime);
  };

  const handleDurationChange = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    onDurationChange(video.duration);
    setIsReady(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setProgress(time);
    onSeek(time);
    const video = videoRef.current;
    if (video) video.currentTime = time;
  };

  const handleSeekStart = () => setIsDragging(true);
  const handleSeekEnd = () => setIsDragging(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
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
        onEnded={onPlayPause}
        onClick={onPlayPause}
        playsInline
      />

      {/* Loading */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}

      {/* Pause overlay */}
      {!isPlaying && isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity cursor-pointer" onClick={onPlayPause}>
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Play size={28} className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Progress bar only — no subtitle */}
      <div className="hidden lg:block absolute bottom-0 left-0 right-0">
        <div className="px-4 pt-2.5 pb-2 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-3 text-xs text-slate-300 font-medium tabular-nums">
            <span className="w-10 text-right">{formatTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
