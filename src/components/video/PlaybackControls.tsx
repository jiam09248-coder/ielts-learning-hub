import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Gauge, Maximize2, Sparkles } from 'lucide-react';
import { PLAYBACK_RATES } from '../../constants';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevParagraph: () => void;
  onNextParagraph: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  playbackRate: number;
  onRateChange: (rate: number) => void;
  onFullscreen: () => void;
  onExpressions: () => void;
}

export default function PlaybackControls({
  isPlaying,
  onPlayPause,
  onPrevParagraph,
  onNextParagraph,
  isLooping,
  onToggleLoop,
  playbackRate,
  onRateChange,
  onFullscreen,
  onExpressions,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-slate-200 gap-2">
      {/* Left: Prev + Play + Next */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onPrevParagraph}
          className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-600"
          title="上一句"
        >
          <SkipBack size={18} />
        </button>
        <button
          onClick={onPlayPause}
          className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          title={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={onNextParagraph}
          className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-600"
          title="下一句"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleLoop}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
            isLooping ? 'bg-teal-500 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="单句循环"
        >
          {isLooping ? <Repeat1 size={14} /> : <Repeat size={14} />}
        </button>
        <div className="flex items-center gap-0.5 px-2 py-2 rounded-lg bg-slate-100 text-slate-600">
          <Gauge size={13} className="text-slate-400" />
          <select
            value={playbackRate}
            onChange={(e) => onRateChange(Number(e.target.value))}
            className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
          >
            {PLAYBACK_RATES.map((rate) => (
              <option key={rate} value={rate} className="bg-white">{rate}x</option>
            ))}
          </select>
        </div>
        <button
          onClick={onExpressions}
          className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"
          title="地道表达"
        >
          <Sparkles size={14} />
        </button>
        <button
          onClick={onFullscreen}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          title="全屏"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}
