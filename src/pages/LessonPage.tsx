import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Video, Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Maximize2, Sparkles, EyeOff, X, Menu } from 'lucide-react';
import { PLAYBACK_RATES } from '../constants';
import VideoPlayer from '../components/video/VideoPlayer';
import type { VideoPlayerHandle } from '../components/video/VideoPlayer';
import WordPopup from '../components/dictionary/WordPopup';
import ExpressionPopup from '../components/dictionary/ExpressionPopup';
import ParserSheet from '../components/parser/ParserSheet';
import { getVideoContent, isFreeVideo, VIDEO_LIBRARY } from '../data/videoLibrary';
import useIsDesktop from '../hooks/useIsDesktop';
import { getVideoUrl } from '../data/videoUrlMap';
import { getCurrentUser } from '../utils/storage';
import type { Paragraph, Expression } from '../types/video';
import type { VideoContent } from '../types/video';

type SubtitleDisplayMode = 'bilingual' | 'english' | 'chinese';
type MobileSubtitleView = 'single' | 'list';
type LoopMode = 'single' | 'list';

const SUBTITLE_MODE_LABELS: Record<SubtitleDisplayMode, string> = {
  bilingual: '中英',
  english: 'EN',
  chinese: '中',
};

const LOOP_MODE_LABELS: Record<LoopMode, string> = {
  single: '单句循环',
  list: '列表循环',
};

const MOBILE_PLAYBACK_RATES = [0.5, 1, 1.5, 2];
const NARROW_MOBILE_QUERY = '(max-width: 480px)';
const LESSON_HEADER_TITLES: Record<string, string> = {
  'pilot-001': '450平方英尺洛杉矶单间公寓参观',
  'part1-home-accommodation-001': '公寓阳台与居住空间样板',
  'part1-home-accommodation-002': '房子格局与日常房间介绍',
  'part1-home-accommodation-003': '小户型餐厨客一体与收纳',
  'video-003': '走进莉迪亚·米伦的经典乡村住宅',
  'video-004': '真实极简家居参观',
  'part1-study-work-001': 'Study or Work 话题 01',
};

function useIsNarrowMobile() {
  const [isNarrowMobile, setIsNarrowMobile] = useState(() => window.matchMedia(NARROW_MOBILE_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(NARROW_MOBILE_QUERY);
    const updateLayout = (event: MediaQueryList | MediaQueryListEvent) => setIsNarrowMobile(event.matches);
    updateLayout(media);
    media.addEventListener('change', updateLayout);
    return () => media.removeEventListener('change', updateLayout);
  }, []);

  return isNarrowMobile;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function DesktopCtrlBtn({ icon, label, active, onClick, title }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title || label}
      className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-w-[48px] ${active ? 'bg-teal-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
      <span>{icon}</span>
      <span className="text-[10px] leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}

function MobileCtrlBtn({ icon, label, active, onClick, title }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title || label}
      className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all min-w-[48px] ${active ? 'bg-teal-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
      <span>{icon}</span>
      <span className="text-xs leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}

function DesktopMenuBtn({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 min-w-[56px] transition-colors"
      title={label}
    >
      <span className="text-sm font-bold text-slate-600 whitespace-nowrap">{value}</span>
      <span className="text-[10px] leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}

function MobileMenuBtn({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 min-w-[56px] transition-colors"
      title={label}
    >
      <span className="text-base font-bold text-slate-600 whitespace-nowrap">{value}</span>
      <span className="text-xs leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}

function DesktopVideoUnavailableCard() {
  return (
    <div className="w-full h-full min-h-[220px] flex items-center justify-center bg-slate-100 text-slate-400 text-base">
      该视频暂未上传，敬请期待
    </div>
  );
}

function MobileVideoUnavailableCard() {
  return (
    <div className="w-full h-full min-h-[220px] flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
      该视频暂未上传，敬请期待
    </div>
  );
}

function DesktopProgressBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 text-xs text-slate-500 font-medium tabular-nums">
      <span className="w-10 text-right">{formatTime(currentTime)}</span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <span className="w-10">{formatTime(duration)}</span>
    </div>
  );
}

function MobileProgressBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-2 text-sm text-slate-500 font-medium tabular-nums">
      <span className="w-10 text-right">{formatTime(currentTime)}</span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <span className="w-10">{formatTime(duration)}</span>
    </div>
  );
}

function DesktopSingleSubtitleContent({
  paragraph,
  subtitleMode,
  renderHighlightedText,
  onOpenParser,
}: {
  paragraph: Paragraph | null;
  subtitleMode: SubtitleDisplayMode;
  renderHighlightedText: (p: Paragraph) => React.ReactNode;
  onOpenParser: (p: Paragraph) => void;
}) {
  if (!paragraph) return <p className="text-slate-300 text-xs">暂无字幕</p>;

  return (
    <div className="text-center w-full space-y-2">
      <div className="flex items-center justify-center gap-2">
        {subtitleMode !== 'chinese' && (
          <p className="text-2xl font-medium text-slate-900 leading-relaxed">
            {renderHighlightedText(paragraph)}
            {paragraph.parse && (
              <button
                onClick={() => onOpenParser(paragraph)}
                className="inline ml-2 text-sm px-2 py-0.5 text-teal-700 bg-teal-50/70 rounded-md hover:bg-teal-100 transition-colors align-middle"
              >
                解析
              </button>
            )}
          </p>
        )}
      </div>
      {subtitleMode !== 'english' && (
        <p className="text-lg text-slate-500 leading-relaxed">{paragraph.chinese}</p>
      )}
    </div>
  );
}

function MobileSingleSubtitleContent({
  paragraph,
  subtitleMode,
  renderHighlightedText,
  onOpenParser,
}: {
  paragraph: Paragraph | null;
  subtitleMode: SubtitleDisplayMode;
  renderHighlightedText: (p: Paragraph) => React.ReactNode;
  onOpenParser: (p: Paragraph) => void;
}) {
  if (!paragraph) return <p className="text-slate-300 text-sm">暂无字幕</p>;

  return (
    <div className="text-center w-full space-y-2">
      <div className="flex items-center justify-center gap-2">
        {subtitleMode !== 'chinese' && (
          <p className="text-[26px] font-medium text-slate-900 leading-relaxed">
            {renderHighlightedText(paragraph)}
            {paragraph.parse && (
              <button
                onClick={() => onOpenParser(paragraph)}
                className="inline ml-2 text-base px-2 py-0.5 text-teal-700 bg-teal-50/70 rounded-md hover:bg-teal-100 transition-colors align-middle"
              >
                解析
              </button>
            )}
          </p>
        )}
      </div>
      {subtitleMode !== 'english' && (
        <p className="text-[22px] text-slate-500 leading-relaxed">{paragraph.chinese}</p>
      )}
    </div>
  );
}

function escapeRegExp(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function extractMatchablePatternParts(pattern: string): string[] {
  return pattern
    .replace(/[()]/g, ' ')
    .split(/[\s/]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => /[a-zA-Z]/.test(token))
    .map((token) => token.replace(/^[^a-zA-Z]+|[^a-zA-Z-]+$/g, ''))
    .map((token) => token.replace(/^[+]+|[+]+$/g, ''))
    .filter((token) => {
      if (!token) return false;
      if (/^(sth\.?|sp\.?|sb\.?|something|someone|somebody|somewhere|someplace|noun|place|space|thing|one's|ones|someone's|somebody's)$/i.test(token)) return false;
      return token.length >= 2;
    });
}

function buildExpressionRegex(pattern: string): RegExp {
  if (!pattern) return /(?!)/;
  const parts = extractMatchablePatternParts(pattern);
  if (parts.length === 0) return new RegExp(escapeRegExp(pattern).replace(/\.\.\./g, '.+?').replace(/\+/g, '\\S+'), 'i');
  return new RegExp(parts.map((p: string) => escapeRegExp(p)).join('[\\s\\S]{0,40}?'), 'i');
}

function matchExpression(expr: Expression, text: string): { matchText: string; start: number; end: number } | null {
  if (!text) return null;
  const m = text.match(buildExpressionRegex(expr.pattern));
  if (m && m.index !== undefined) return { matchText: m[0], start: m.index, end: m.index + m[0].length };
  return null;
}

interface LessonViewProps {
  content: VideoContent;
  videoUrl: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  loopMode: LoopMode;
  subtitleMode: SubtitleDisplayMode;
  currentParagraphId: number | null;
  displayParagraph: Paragraph | null;
  selectedParagraph: Paragraph | null;
  showParser: boolean;
  showExpressions: boolean;
  expandedExpr: number | null;
  autoScroll: boolean;
  mobileSubtitleView: MobileSubtitleView;
  showSpeedMenu: boolean;
  paragraphs: Paragraph[];
  subtitleScrollRef: React.RefObject<HTMLDivElement | null>;
  activeSubRef: React.RefObject<HTMLDivElement | null>;
  videoPlayerRef: React.RefObject<VideoPlayerHandle | null>;
  renderHighlightedText: (p: Paragraph) => React.ReactNode;
  formatPlaybackRate: string;
  onToggleAutoScroll: () => void;
  onCycleLoopMode: () => void;
  onCycleSubtitleMode: () => void;
  onCycleMobilePlaybackRate: () => void;
  onToggleSpeedMenu: () => void;
  onSelectPlaybackRate: (rate: number) => void;
  onToggleSubtitleView: () => void;
  onProgressSeek: (time: number) => void;
  onPlayPause: () => void;
  onPrevParagraph: () => void;
  onNextParagraph: () => void;
  onVideoEnded: () => void;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onSeek: (time: number) => void;
  onOpenExpressions: () => void;
  onOpenParser: (p: Paragraph) => void;
  onParagraphClick: (p: Paragraph) => void;
  onToggleExpandedExpression: (index: number) => void;
  onCloseOverlay: () => void;
}

function DesktopLessonView({
  content,
  videoUrl,
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  loopMode,
  subtitleMode,
  currentParagraphId,
  displayParagraph,
  selectedParagraph,
  showParser,
  showExpressions,
  expandedExpr,
  autoScroll,
  showSpeedMenu,
  paragraphs,
  subtitleScrollRef,
  activeSubRef,
  videoPlayerRef,
  renderHighlightedText,
  formatPlaybackRate,
  onToggleAutoScroll,
  onCycleLoopMode,
  onCycleSubtitleMode,
  onToggleSpeedMenu,
  onSelectPlaybackRate,
  onProgressSeek,
  onPlayPause,
  onPrevParagraph,
  onNextParagraph,
  onVideoEnded,
  onTimeUpdate,
  onDurationChange,
  onSeek,
  onOpenExpressions,
  onOpenParser,
  onParagraphClick,
  onToggleExpandedExpression,
  onCloseOverlay,
}: LessonViewProps) {
  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
      <div className="flex-[6] flex flex-col min-w-0 p-3 gap-3 overflow-y-auto relative">
        {showParser && (
          <div className="absolute inset-0 z-40 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-3">
              <EyeOff size={32} className="text-slate-300 mx-auto" />
              <p className="text-sm text-slate-500 font-medium">关闭右侧句子解析后，继续观看视频</p>
            </div>
          </div>
        )}
        <div className="shrink-0 bg-black rounded-2xl overflow-hidden shadow-lg w-full" style={{ aspectRatio: '16/9', maxWidth: '640px', margin: '0 auto' }}>
          {videoUrl ? (
            <VideoPlayer ref={videoPlayerRef} variant="desktop" videoUrl={videoUrl} isPlaying={isPlaying} playbackRate={playbackRate} onPlayPause={onPlayPause} onEnded={onVideoEnded} onTimeUpdate={onTimeUpdate} onDurationChange={onDurationChange} onSeek={onSeek} />
          ) : (
            <DesktopVideoUnavailableCard />
          )}
        </div>
        <div className="flex-1 bg-slate-50 rounded-2xl flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-4 overflow-y-auto min-h-0">
            <DesktopSingleSubtitleContent paragraph={displayParagraph} subtitleMode={subtitleMode} renderHighlightedText={renderHighlightedText} onOpenParser={onOpenParser} />
          </div>
          <div className="shrink-0 border-t border-slate-200/80 bg-white/70">
            <DesktopProgressBar currentTime={currentTime} duration={duration} onSeek={onProgressSeek} />
          </div>
          <div className="shrink-0 grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5 gap-2 relative">
            <div className="flex items-center gap-1 justify-start">
              <DesktopCtrlBtn icon={loopMode === 'single' ? <Repeat1 size={17} /> : <Repeat size={17} />} label={LOOP_MODE_LABELS[loopMode]} active onClick={onCycleLoopMode} />
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <DesktopCtrlBtn icon={<SkipBack size={17} />} label="上一句" onClick={onPrevParagraph} />
              <button onClick={onPlayPause} className="flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                <span className="text-[10px]">{isPlaying ? '暂停' : '播放'}</span>
              </button>
              <DesktopCtrlBtn icon={<SkipForward size={17} />} label="下一句" onClick={onNextParagraph} />
            </div>
            <div className="flex items-center gap-1 justify-end">
              <div className="relative">
                <DesktopMenuBtn label="倍速" value={formatPlaybackRate} onClick={onToggleSpeedMenu} />
                {showSpeedMenu && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                    {PLAYBACK_RATES.map(r => (
                      <button key={r} onClick={() => onSelectPlaybackRate(r)} className={`block w-full text-center px-4 py-1.5 text-xs ${r === playbackRate ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:bg-slate-50'}`}>{r}x</button>
                    ))}
                  </div>
                )}
              </div>
              <DesktopMenuBtn label="中/英" value={SUBTITLE_MODE_LABELS[subtitleMode]} onClick={onCycleSubtitleMode} />
              <DesktopCtrlBtn icon={<Maximize2 size={17} />} label="全屏" onClick={() => videoPlayerRef.current?.getVideo()?.requestFullscreen()} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-[4] flex flex-col bg-white shrink-0 overflow-hidden min-w-0 relative">
        <div className="flex items-center px-5 py-3 shrink-0 border-b border-slate-100 gap-4 justify-end">
          <div className="flex items-center gap-2 cursor-pointer select-none shrink-0" onClick={onToggleAutoScroll}>
            <span className="text-xs font-medium text-slate-600">字幕跟随</span>
            <div className={`relative w-9 h-5 rounded-full transition-colors ${autoScroll ? 'bg-slate-800' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoScroll ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </div>

          <button onClick={onOpenExpressions} className="shrink-0 px-3 py-1.5 text-xs font-bold text-white bg-teal-500 rounded-lg hover:bg-teal-500 transition-colors">
            地道表达汇总
          </button>
        </div>

        <div className={`flex-1 flex flex-col min-h-0 ${(showParser || showExpressions) ? 'hidden' : ''}`}>
          <div ref={subtitleScrollRef} className="flex-1 overflow-y-auto p-2 min-h-0">
            <div className="mx-2 mb-3 p-4 bg-sky-50/60 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800">视频总结</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{content.summary}</p>
            </div>
            <div className="space-y-0.5 pb-4">
              {paragraphs.map(p => {
                const isActive = p.id === currentParagraphId;
                return (
                  <div key={p.id} ref={isActive ? activeSubRef : undefined} onClick={() => onParagraphClick(p)} className={`px-5 py-3.5 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? 'bg-teal-50/60 border-l-[3px] border-teal-400' : 'border-l-[3px] border-transparent'}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-xs font-mono font-bold ${isActive ? 'text-teal-600' : 'text-slate-300'}`}>{formatTime(p.startTime)}</span>
                      {p.parse && (
                        <button onClick={e => { e.stopPropagation(); onOpenParser(p); }} className="text-sm px-3 py-1 text-teal-700 bg-teal-50/60 rounded hover:bg-teal-100 hover:text-teal-700 transition-colors">
                          解析
                        </button>
                      )}
                    </div>
                    {(subtitleMode === 'english' || subtitleMode === 'bilingual') && <p className={`text-base leading-relaxed ${isActive ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>{renderHighlightedText(p)}</p>}
                    {(subtitleMode === 'chinese' || subtitleMode === 'bilingual') && <p className={`text-[15px] leading-relaxed mt-1 ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>{p.chinese}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {showParser && selectedParagraph?.parse && (
          <div className="absolute inset-0 top-[53px] flex flex-col bg-white z-10" onClick={onCloseOverlay}>
            <div className="flex items-center justify-between px-5 py-2 shrink-0 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">句子解析</span>
              <button onClick={onCloseOverlay} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0" onClick={e => e.stopPropagation()}>
              <div className="bg-teal-50 rounded-xl p-4">
                <h4 className="text-[11px] font-bold text-teal-500 uppercase tracking-wider mb-2">句子原文</h4>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{renderHighlightedText(selectedParagraph)}</p>
                <p className="text-xs text-slate-500 mt-1.5">{selectedParagraph.chinese}</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <h4 className="text-[11px] font-bold text-teal-500 uppercase tracking-wider mb-2">语法结构</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedParagraph.parse.grammar}</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <h4 className="text-[11px] font-bold text-teal-500 uppercase tracking-wider mb-2">固定搭配</h4>
                <div className="space-y-1.5">
                  {selectedParagraph.parse.collocations.map((col, i) => (
                    <div key={i} className="text-sm leading-relaxed">
                      <span className="font-semibold text-teal-700">{col.phrase}</span>
                      <span className="text-slate-500">：{col.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <h4 className="text-[11px] font-bold text-teal-500 uppercase tracking-wider mb-2">语境分析</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedParagraph.parse.contextAnalysis}</p>
              </div>
            </div>
          </div>
        )}

        {showExpressions && (
          <div className="absolute inset-0 top-[53px] flex flex-col bg-white z-10">
            <div className="flex items-center justify-between px-5 py-2 shrink-0 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">地道表达汇总</span>
              <button onClick={onCloseOverlay} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
              {content.expressions.map((expr, i) => (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => onToggleExpandedExpression(i)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-sm text-teal-700 truncate">{expr.pattern}</span>
                      <span className="text-xs text-slate-500 truncate">{expr.meaning}</span>
                    </div>
                    <span className="text-slate-300 text-xs shrink-0 ml-2">{expandedExpr === i ? '收起' : '展开'}</span>
                  </button>
                  {expandedExpr === i && (
                    <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
                      {expr.usage && <div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">用法说明</span><p className="text-sm text-slate-700 leading-relaxed mt-1">{expr.usage}</p></div>}
                      {expr.topic && <div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">雅思话题</span><p className="text-sm text-teal-700 bg-teal-50 p-2 rounded-lg leading-relaxed mt-1">{expr.topic}</p></div>}
                      {expr.example && <div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">仿写例句</span><p className="text-sm text-slate-600 italic bg-slate-50 p-2 rounded-lg leading-relaxed mt-1">"{expr.example}"</p></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileLessonView({
  videoUrl,
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  loopMode,
  subtitleMode,
  currentParagraphId,
  displayParagraph,
  mobileSubtitleView,
  paragraphs,
  subtitleScrollRef,
  activeSubRef,
  videoPlayerRef,
  renderHighlightedText,
  formatPlaybackRate,
  onCycleLoopMode,
  onCycleSubtitleMode,
  onCycleMobilePlaybackRate,
  onToggleSubtitleView,
  onProgressSeek,
  onPlayPause,
  onPrevParagraph,
  onNextParagraph,
  onVideoEnded,
  onTimeUpdate,
  onDurationChange,
  onSeek,
  onOpenExpressions,
  onOpenParser,
  onParagraphClick,
}: LessonViewProps) {
  const isNarrowMobile = useIsNarrowMobile();
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const mobileMoreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMobileMoreMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (mobileMoreMenuRef.current?.contains(event.target as Node)) return;
      setShowMobileMoreMenu(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [showMobileMoreMenu]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="border-b border-slate-200">
        <div className="bg-black overflow-hidden w-full relative">
          {videoUrl ? (
            <>
              <VideoPlayer ref={videoPlayerRef} variant="mobile" videoUrl={videoUrl} isPlaying={isPlaying} playbackRate={playbackRate} onPlayPause={onPlayPause} onEnded={onVideoEnded} onTimeUpdate={onTimeUpdate} onDurationChange={onDurationChange} onSeek={onSeek} />
              <button
                onClick={() => videoPlayerRef.current?.getVideo()?.requestFullscreen()}
                className="absolute right-3 bottom-3 z-20 p-2 rounded-full bg-black/45 backdrop-blur text-white"
                title="全屏"
              >
                <Maximize2 size={16} />
              </button>
            </>
          ) : (
            <MobileVideoUnavailableCard />
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full overflow-hidden flex flex-col">
          {mobileSubtitleView === 'single' ? (
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-5 overflow-y-auto min-h-0">
              <MobileSingleSubtitleContent paragraph={displayParagraph} subtitleMode={subtitleMode} renderHighlightedText={renderHighlightedText} onOpenParser={onOpenParser} />
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <div ref={subtitleScrollRef} className="flex-1 overflow-y-auto min-h-0">
                <div className="pb-4">
                  {paragraphs.map(p => {
                    const isActive = p.id === currentParagraphId;
                    return (
                      <div
                        key={p.id}
                        ref={isActive ? activeSubRef : undefined}
                        onClick={() => onParagraphClick(p)}
                        className={`px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors ${isActive ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-[13px] font-mono font-bold ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>{formatTime(p.startTime)}</span>
                          {p.parse && (
                            <button onClick={e => { e.stopPropagation(); onOpenParser(p); }} className="text-sm px-2.5 py-1 text-teal-700 bg-teal-50 rounded-md hover:bg-teal-100 transition-colors">
                              解析
                            </button>
                          )}
                        </div>
                        {(subtitleMode === 'english' || subtitleMode === 'bilingual') && (
                          <p className={`text-[19px] leading-relaxed ${isActive ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                            {renderHighlightedText(p)}
                          </p>
                        )}
                        {(subtitleMode === 'chinese' || subtitleMode === 'bilingual') && (
                          <p className={`text-[18px] leading-relaxed mt-1 ${isActive ? 'text-slate-600' : 'text-slate-500'}`}>{p.chinese}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 bg-white border-t border-slate-200 px-3 py-2.5 space-y-2">
        <MobileProgressBar currentTime={currentTime} duration={duration} onSeek={onProgressSeek} />
        <div className="relative" ref={mobileMoreMenuRef}>
          {isNarrowMobile && showMobileMoreMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-40 rounded-xl border border-slate-200 bg-white shadow-lg p-1.5 z-30">
              <button onClick={onCycleLoopMode} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                <span>循环模式</span>
                <span className="font-semibold">{LOOP_MODE_LABELS[loopMode]}</span>
              </button>
              <button onClick={onCycleMobilePlaybackRate} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                <span>倍速</span>
                <span className="font-semibold">{formatPlaybackRate}</span>
              </button>
              <button onClick={onToggleSubtitleView} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                <span>字幕视图</span>
                <span className="font-semibold">{mobileSubtitleView === 'single' ? '单句' : '列表'}</span>
              </button>
              <button onClick={onCycleSubtitleMode} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                <span>中英模式</span>
                <span className="font-semibold">{SUBTITLE_MODE_LABELS[subtitleMode]}</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-[minmax(48px,1fr)_auto_minmax(48px,1fr)] items-center gap-1.5">
            <div className="flex items-center gap-1.5 justify-self-start">
              <MobileCtrlBtn icon={<Sparkles size={17} />} label="地道表达" onClick={onOpenExpressions} />
              {!isNarrowMobile && <MobileMenuBtn label="倍速" value={formatPlaybackRate} onClick={onCycleMobilePlaybackRate} />}
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <MobileCtrlBtn icon={<SkipBack size={17} />} label="上一句" onClick={onPrevParagraph} />
              <button onClick={onPlayPause} className="flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                <span className="text-xs">{isPlaying ? '暂停' : '播放'}</span>
              </button>
              <MobileCtrlBtn icon={<SkipForward size={17} />} label="下一句" onClick={onNextParagraph} />
            </div>
            <div className="flex items-center gap-1.5 justify-self-end">
              {!isNarrowMobile && <MobileMenuBtn label="字幕" value={mobileSubtitleView === 'single' ? '单' : '列表'} onClick={onToggleSubtitleView} />}
              {!isNarrowMobile && <MobileMenuBtn label="中/英模式" value={SUBTITLE_MODE_LABELS[subtitleMode]} onClick={onCycleSubtitleMode} />}
              {isNarrowMobile && (
                <button
                  onClick={() => setShowMobileMoreMenu((value) => !value)}
                  className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 min-w-[48px]"
                  title="设置"
                >
                  <Menu size={18} />
                  <span className="text-xs leading-none whitespace-nowrap">设置</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const resolvedVideoId = videoId && VIDEO_LIBRARY[videoId] ? videoId : 'pilot-001';
  const baseContent: VideoContent = getVideoContent(resolvedVideoId);
  const content: VideoContent = {
    ...baseContent,
    paragraphs: baseContent.paragraphs ?? [],
    expressions: baseContent.expressions ?? [],
  };
  const videoUrl = getVideoUrl(resolvedVideoId);
  const headerTitle = LESSON_HEADER_TITLES[resolvedVideoId] ?? content.meta.title.replace(/^YouTube｜/, '');
  const currentUser = getCurrentUser();
  const isLocked = !isFreeVideo(resolvedVideoId) && !currentUser;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loopMode, setLoopMode] = useState<LoopMode>('list');
  const [subtitleMode, setSubtitleMode] = useState<SubtitleDisplayMode>('bilingual');
  const [selectedParagraph, setSelectedParagraph] = useState<Paragraph | null>(null);
  const [showParser, setShowParser] = useState(false);
  const [showExpressions, setShowExpressions] = useState(false);
  const [expandedExpr, setExpandedExpr] = useState<number | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [mobileSubtitleView, setMobileSubtitleView] = useState<MobileSubtitleView>('list');
  const isDesktop = useIsDesktop();
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  const [activeExpression, setActiveExpression] = useState<Expression | null>(null);
  const [expressionAnchor, setExpressionAnchor] = useState<HTMLElement | null>(null);
  const wasPlayingRef = useRef(false);
  const lastActiveParagraphRef = useRef<Paragraph | null>(null);
  const [loopTargetId, setLoopTargetId] = useState<number | null>(null);

  const [autoScroll, setAutoScroll] = useState(true);
  const subtitleScrollRef = useRef<HTMLDivElement>(null);
  const activeSubRef = useRef<HTMLDivElement>(null);

  const [lookupWord, setLookupWord] = useState('');
  const [lookupAnchor, setLookupAnchor] = useState<HTMLElement | null>(null);
  const wordLookupWasPlayingRef = useRef(false);
  const wordLookupWasAutoScrollRef = useRef(true);

  useEffect(() => {
    if (!isLocked) return;
    navigate('/login', { replace: true, state: { from: `/lesson/${resolvedVideoId}` } });
  }, [isLocked, navigate, resolvedVideoId]);

  const paragraphs = content.paragraphs;
  const findParagraphByTime = useCallback((time: number) => {
    return paragraphs.find((p) => time >= p.startTime && time < p.endTime) || null;
  }, [paragraphs]);
  const currentParagraph = useMemo(() => findParagraphByTime(currentTime), [currentTime, findParagraphByTime]);
  const loopTargetParagraph = useMemo(() => {
    if (loopTargetId === null) return null;
    return paragraphs.find((p) => p.id === loopTargetId) || null;
  }, [loopTargetId, paragraphs]);
  const displayParagraph = loopMode === 'single' ? (loopTargetParagraph ?? currentParagraph) : currentParagraph;
  const currentParagraphId = displayParagraph?.id ?? null;

  useEffect(() => {
    if (currentParagraph) {
      lastActiveParagraphRef.current = currentParagraph;
    }
  }, [currentParagraph]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setShowSpeedMenu(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isDesktop]);

  const syncActiveSubtitlePosition = useCallback((behavior?: ScrollBehavior) => {
    if (!autoScroll || !activeSubRef.current || !subtitleScrollRef.current) return;
    const el = activeSubRef.current;
    const container = subtitleScrollRef.current;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const topOffset = container.clientHeight * (isDesktop ? 0.3 : 0);
    const targetScrollTop = container.scrollTop + elRect.top - containerRect.top - topOffset;

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: behavior ?? 'smooth',
    });
  }, [autoScroll, isDesktop]);

  useEffect(() => {
    if (currentParagraphId === null) return;
    const frame = window.requestAnimationFrame(() => {
      syncActiveSubtitlePosition();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentParagraphId, autoScroll, mobileSubtitleView, subtitleMode, syncActiveSubtitlePosition]);

  const expressionMatches = useMemo(() => {
    const map: Record<number, { expr: Expression; match: NonNullable<ReturnType<typeof matchExpression>> }[]> = {};
    for (const p of paragraphs) {
      const ms: { expr: Expression; match: NonNullable<ReturnType<typeof matchExpression>> }[] = [];
      for (const expr of content.expressions) {
        const m = matchExpression(expr, p.english);
        if (m) ms.push({ expr, match: m });
      }
      if (ms.length) map[p.id] = ms;
    }
    return map;
  }, [paragraphs, content.expressions]);

  const handlePlayPause = useCallback(() => setIsPlaying(p => !p), []);
  const handleCycleLoopMode = useCallback(() => {
    setLoopMode((mode) => {
      const nextMode = mode === 'single' ? 'list' : 'single';
      if (nextMode === 'single') {
        const target = currentParagraph ?? lastActiveParagraphRef.current;
        setLoopTargetId(target?.id ?? null);
      } else {
        setLoopTargetId(null);
      }
      return nextMode;
    });
  }, [currentParagraph]);
  const handleCycleSubtitleMode = useCallback(() => {
    setSubtitleMode((mode) => {
      if (mode === 'bilingual') return 'english';
      if (mode === 'english') return 'chinese';
      return 'bilingual';
    });
  }, []);
  const handleCycleMobilePlaybackRate = useCallback(() => {
    setPlaybackRate((rate) => {
      const exactIndex = MOBILE_PLAYBACK_RATES.findIndex((item) => Math.abs(item - rate) < 0.001);
      if (exactIndex >= 0) return MOBILE_PLAYBACK_RATES[(exactIndex + 1) % MOBILE_PLAYBACK_RATES.length];

      const nextHigher = MOBILE_PLAYBACK_RATES.find((item) => item > rate);
      return nextHigher ?? MOBILE_PLAYBACK_RATES[0];
    });
  }, []);
  const handleSelectPlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  }, []);
  const handleToggleSubtitleView = useCallback(() => {
    setMobileSubtitleView((view) => (view === 'single' ? 'list' : 'single'));
  }, []);
  const handleToggleAutoScroll = useCallback(() => {
    setAutoScroll((value) => !value);
  }, []);
  const handleToggleSpeedMenu = useCallback(() => {
    setShowSpeedMenu((value) => !value);
  }, []);
  const handleToggleExpandedExpression = useCallback((index: number) => {
    setExpandedExpr((current) => current === index ? null : index);
  }, []);
  const handleTimeUpdate = useCallback((t: number) => {
    if (loopMode === 'single' && loopTargetParagraph && t >= loopTargetParagraph.endTime) {
      videoPlayerRef.current?.seekTo(loopTargetParagraph.startTime);
      setCurrentTime(loopTargetParagraph.startTime);
      return;
    }
    setCurrentTime(t);
  }, [loopMode, loopTargetParagraph]);
  const handleDurationChange = useCallback((d: number) => setDuration(d), []);
  const handleSeek = useCallback((t: number) => {
    setCurrentTime(t);
    if (loopMode === 'single') {
      const target = findParagraphByTime(t) ?? lastActiveParagraphRef.current;
      setLoopTargetId(target?.id ?? null);
    }
  }, [findParagraphByTime, loopMode]);
  const handleProgressSeek = useCallback((t: number) => {
    videoPlayerRef.current?.seekTo(t);
    setCurrentTime(t);
    if (loopMode === 'single') {
      const target = findParagraphByTime(t) ?? lastActiveParagraphRef.current;
      setLoopTargetId(target?.id ?? null);
    }
  }, [findParagraphByTime, loopMode]);
  const handleVideoEnded = useCallback(() => {
    if (loopMode === 'list') {
      videoPlayerRef.current?.seekTo(0);
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }
    const loopParagraph = loopTargetParagraph ?? currentParagraph ?? lastActiveParagraphRef.current;
    if (loopMode === 'single' && loopParagraph) {
      videoPlayerRef.current?.seekTo(loopParagraph.startTime);
      setCurrentTime(loopParagraph.startTime);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(false);
  }, [loopMode, currentParagraph, loopTargetParagraph]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (showParser || showExpressions || activeExpression) return;
      e.preventDefault();
      handlePlayPause();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePlayPause, showParser, showExpressions, activeExpression]);

  const jp = useCallback((offset: number) => {
    const idx = paragraphs.findIndex(p => p.id === currentParagraphId);
    const tgt = paragraphs[idx + offset];
    if (tgt) {
      videoPlayerRef.current?.seekTo(tgt.startTime);
      setCurrentTime(tgt.startTime);
      if (loopMode === 'single') setLoopTargetId(tgt.id);
    }
  }, [paragraphs, currentParagraphId, loopMode]);

  const handleParagraphClick = useCallback((p: Paragraph) => {
    videoPlayerRef.current?.seekTo(p.startTime);
    setCurrentTime(p.startTime);
    if (loopMode === 'single') setLoopTargetId(p.id);
    if (!isPlaying) setIsPlaying(true);
  }, [isPlaying, loopMode]);

  const handleOpenParser = useCallback((p: Paragraph) => {
    wasPlayingRef.current = isPlaying;
    if (isPlaying) setIsPlaying(false);
    setShowSpeedMenu(false);
    setSelectedParagraph(p);
    setShowParser(true);
  }, [isPlaying]);

  // Close parser from anywhere: clicking the X or clicking outside
  const closeOverlay = useCallback(() => {
    setShowParser(false);
    setShowExpressions(false);
    setShowSpeedMenu(false);
    if (wasPlayingRef.current) setIsPlaying(true);
    window.requestAnimationFrame(() => {
      syncActiveSubtitlePosition('smooth');
    });
  }, [syncActiveSubtitlePosition]);

  const handleOpenExpressions = useCallback(() => {
    if (!isDesktop) {
      navigate(`/lesson/${resolvedVideoId}/expressions`);
      return;
    }

    wasPlayingRef.current = isPlaying;
    if (isPlaying) setIsPlaying(false);
    setExpandedExpr(null);
    setShowSpeedMenu(false);
    setShowExpressions(true);
  }, [isDesktop, isPlaying, navigate, resolvedVideoId]);

  const handleExpressionClick = useCallback((expr: Expression, el: HTMLElement) => {
    wasPlayingRef.current = isPlaying;
    if (isPlaying) setIsPlaying(false);
    setActiveExpression(expr);
    setExpressionAnchor(el);
  }, [isPlaying]);

  const handleExpressionClose = useCallback(() => {
    setActiveExpression(null);
    setExpressionAnchor(null);
    if (wasPlayingRef.current) setIsPlaying(true);
  }, []);

  const handleWordClick = useCallback((word: string, el: HTMLElement) => {
    if (!lookupWord) {
      wordLookupWasPlayingRef.current = isPlaying;
      wordLookupWasAutoScrollRef.current = autoScroll;
    }

    if (isPlaying) setIsPlaying(false);
    if (autoScroll) setAutoScroll(false);
    setLookupWord(word);
    setLookupAnchor(el);
  }, [autoScroll, isPlaying, lookupWord]);

  const handleCloseWordPopup = useCallback(() => {
    setLookupWord('');
    setLookupAnchor(null);
    setAutoScroll(wordLookupWasAutoScrollRef.current);
    if (wordLookupWasPlayingRef.current) setIsPlaying(true);
  }, []);

  const renderHighlightedText = useCallback((p: Paragraph) => {
    const text = p.english;
    const matches = expressionMatches[p.id] || [];
    if (!matches.length || subtitleMode === 'chinese') {
      return text.split(/(\s+)/).map((token, idx) => {
        if (/^\s+$/.test(token)) return <span key={`ws-${idx}`}>{token}</span>;
        const clean = token.replace(/[^a-zA-Z]/g, '');
        return <span key={`w-${idx}`} className={clean ? 'hover:bg-blue-100 rounded px-0.5 cursor-pointer' : ''}
          onClick={e => { e.stopPropagation(); if (clean) handleWordClick(token, e.currentTarget as HTMLElement); }}>{token}</span>;
      });
    }
    const sorted = [...matches].sort((a, b) => a.match.start - b.match.start);
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;
    for (const { expr, match } of sorted) {
      if (match.start > lastEnd) {
        const plain = text.slice(lastEnd, match.start);
        parts.push(<span key={`pl-${lastEnd}`}>{plain.split(/(\s+)/).map((token, idx) => {
          if (/^\s+$/.test(token)) return <span key={`ws-${lastEnd}-${idx}`}>{token}</span>;
          const clean = token.replace(/[^a-zA-Z]/g, '');
          return <span key={`w-${lastEnd}-${idx}`} className={clean ? 'hover:bg-blue-100 rounded px-0.5 cursor-pointer' : ''}
            onClick={e => { e.stopPropagation(); if (clean) handleWordClick(token, e.currentTarget as HTMLElement); }}>{token}</span>;
        })}</span>);
      }
      parts.push(<span key={`expr-${match.start}`} className="bg-teal-50 text-teal-600 font-semibold rounded px-0.5 cursor-pointer hover:bg-teal-100 transition-colors border-b-2 border-teal-300"
        onClick={e => { e.stopPropagation(); handleExpressionClick(expr, e.currentTarget as HTMLElement); }}>{match.matchText}</span>);
      lastEnd = match.end;
    }
    if (lastEnd < text.length) {
      const plain = text.slice(lastEnd);
      parts.push(<span key={`pl-end`}>{plain.split(/(\s+)/).map((token, idx) => {
        if (/^\s+$/.test(token)) return <span key={`ws-end-${idx}`}>{token}</span>;
        const clean = token.replace(/[^a-zA-Z]/g, '');
        return <span key={`w-end-${idx}`} className={clean ? 'hover:bg-blue-100 rounded px-0.5 cursor-pointer' : ''}
          onClick={e => { e.stopPropagation(); if (clean) handleWordClick(token, e.currentTarget as HTMLElement); }}>{token}</span>;
      })}</span>);
    }
    return parts;
  }, [expressionMatches, subtitleMode, handleWordClick, handleExpressionClick]);

  if (isLocked) {
    return (
      <div className="h-dvh flex items-center justify-center bg-white px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-900">该视频需要登录后观看</p>
          <p className="mt-2 text-sm text-slate-500">正在跳转到登录页...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-white font-sans overflow-hidden">
      <header className={`${isDesktop ? 'h-11 px-4' : 'h-14 px-3'} bg-white flex items-center border-b border-slate-100 shrink-0 gap-2`}>
        <button
          onClick={() => navigate('/catalog')}
          className={`${isDesktop ? 'p-1.5' : 'p-2.5'} hover:bg-slate-100 rounded-xl`}
          aria-label="返回课程列表"
        >
          <ChevronLeft className={`${isDesktop ? 'w-4 h-4' : 'w-5 h-5'} text-slate-600`} />
        </button>
        <Video className={`${isDesktop ? 'w-4 h-4' : 'w-4.5 h-4.5'} text-slate-900`} />
        <h1 className={`font-semibold text-slate-900 truncate flex-1 ${isDesktop ? 'text-[13px]' : 'text-[15px]'}`}>{headerTitle}</h1>
      </header>

      {isDesktop ? (
        <DesktopLessonView
          content={content}
          videoUrl={videoUrl}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          playbackRate={playbackRate}
          loopMode={loopMode}
          subtitleMode={subtitleMode}
          currentParagraphId={currentParagraphId}
          displayParagraph={displayParagraph}
          selectedParagraph={selectedParagraph}
          showParser={showParser}
          showExpressions={showExpressions}
          expandedExpr={expandedExpr}
          autoScroll={autoScroll}
          mobileSubtitleView={mobileSubtitleView}
          showSpeedMenu={showSpeedMenu}
          paragraphs={paragraphs}
          subtitleScrollRef={subtitleScrollRef}
          activeSubRef={activeSubRef}
          videoPlayerRef={videoPlayerRef}
          renderHighlightedText={renderHighlightedText}
          formatPlaybackRate={`${playbackRate}x`}
          onToggleAutoScroll={handleToggleAutoScroll}
          onCycleLoopMode={handleCycleLoopMode}
          onCycleSubtitleMode={handleCycleSubtitleMode}
          onCycleMobilePlaybackRate={handleCycleMobilePlaybackRate}
          onToggleSpeedMenu={handleToggleSpeedMenu}
          onSelectPlaybackRate={handleSelectPlaybackRate}
          onToggleSubtitleView={handleToggleSubtitleView}
          onProgressSeek={handleProgressSeek}
          onPlayPause={handlePlayPause}
          onPrevParagraph={() => jp(-1)}
          onNextParagraph={() => jp(1)}
          onVideoEnded={handleVideoEnded}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onSeek={handleSeek}
          onOpenExpressions={handleOpenExpressions}
          onOpenParser={handleOpenParser}
          onParagraphClick={handleParagraphClick}
          onToggleExpandedExpression={handleToggleExpandedExpression}
          onCloseOverlay={closeOverlay}
        />
      ) : (
        <MobileLessonView
          content={content}
          videoUrl={videoUrl}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          playbackRate={playbackRate}
          loopMode={loopMode}
          subtitleMode={subtitleMode}
          currentParagraphId={currentParagraphId}
          displayParagraph={displayParagraph}
          selectedParagraph={selectedParagraph}
          showParser={showParser}
          showExpressions={showExpressions}
          expandedExpr={expandedExpr}
          autoScroll={autoScroll}
          mobileSubtitleView={mobileSubtitleView}
          showSpeedMenu={showSpeedMenu}
          paragraphs={paragraphs}
          subtitleScrollRef={subtitleScrollRef}
          activeSubRef={activeSubRef}
          videoPlayerRef={videoPlayerRef}
          renderHighlightedText={renderHighlightedText}
          formatPlaybackRate={`${playbackRate}x`}
          onToggleAutoScroll={handleToggleAutoScroll}
          onCycleLoopMode={handleCycleLoopMode}
          onCycleSubtitleMode={handleCycleSubtitleMode}
          onCycleMobilePlaybackRate={handleCycleMobilePlaybackRate}
          onToggleSpeedMenu={handleToggleSpeedMenu}
          onSelectPlaybackRate={handleSelectPlaybackRate}
          onToggleSubtitleView={handleToggleSubtitleView}
          onProgressSeek={handleProgressSeek}
          onPlayPause={handlePlayPause}
          onPrevParagraph={() => jp(-1)}
          onNextParagraph={() => jp(1)}
          onVideoEnded={handleVideoEnded}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onSeek={handleSeek}
          onOpenExpressions={handleOpenExpressions}
          onOpenParser={handleOpenParser}
          onParagraphClick={handleParagraphClick}
          onToggleExpandedExpression={handleToggleExpandedExpression}
          onCloseOverlay={closeOverlay}
        />
      )}

      {!isDesktop && <ParserSheet isOpen={showParser} onClose={closeOverlay} paragraph={selectedParagraph} />}
      {lookupWord && <WordPopup word={lookupWord} anchorEl={lookupAnchor} onClose={handleCloseWordPopup} />}
      {activeExpression && <ExpressionPopup expression={activeExpression} anchorEl={expressionAnchor} onClose={handleExpressionClose} />}
    </div>
  );
}
