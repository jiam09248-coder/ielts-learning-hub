import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Video, Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Maximize2, Sparkles, EyeOff, X } from 'lucide-react';
import { PLAYBACK_RATES } from '../constants';
import VideoPlayer from '../components/video/VideoPlayer';
import type { VideoPlayerHandle } from '../components/video/VideoPlayer';
import WordPopup from '../components/dictionary/WordPopup';
import ExpressionPopup from '../components/dictionary/ExpressionPopup';
import { mockVideoContent } from '../data/mockVideo';
import { videoData as video003 } from '../data/video-003';
import { videoData as video004 } from '../data/video-004';
import { getVideoUrl } from '../data/videoUrlMap';
import type { Paragraph, Expression } from '../types/video';
import type { VideoContent } from '../types/video';

type SubtitleDisplayMode = 'bilingual' | 'english' | 'chinese';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function CtrlBtn({ icon, label, active, onClick, title }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title || label}
      className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-w-[48px] ${active ? 'bg-teal-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
      <span>{icon}</span>
      <span className="text-[10px] leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}

function escapeRegExp(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function buildExpressionRegex(pattern: string): RegExp {
  if (!pattern) return /(?!)/;
  const parts = pattern.replace(/[()]/g, ' ').split(/[\s\/]+/).filter((t: string) => {
    const clean = t.replace(/[.+]/g, '').trim();
    if (/^(sth\.?|sp\.?|something|somewhere|noun|place|space|two things|时间段|形容词)$/i.test(clean)) return false;
    return clean.length >= 2;
  });
  if (parts.length === 0) return new RegExp(escapeRegExp(pattern).replace(/\.\.\./g, '.+?').replace(/\+/g, '\\S+'), 'i');
  return new RegExp(parts.map((p: string) => escapeRegExp(p)).join('[\\s\\S]{0,40}?'), 'i');
}

function matchExpression(expr: Expression, text: string): { matchText: string; start: number; end: number } | null {
  if (!text) return null;
  const m = text.match(buildExpressionRegex(expr.pattern));
  if (m && m.index !== undefined) return { matchText: m[0], start: m.index, end: m.index + m[0].length };
  return null;
}

export default function LessonPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  void videoId;
  const VIDEO_MAP: Record<string, VideoContent> = {
    'pilot-001': mockVideoContent,
    'video-003': video003 as unknown as VideoContent,
    'video-004': video004 as unknown as VideoContent,
  };
  const content: VideoContent = VIDEO_MAP[videoId || 'pilot-001'] || mockVideoContent;
  if (!content.paragraphs) content.paragraphs = [];
  if (!content.expressions) content.expressions = [];

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [subtitleMode, setSubtitleMode] = useState<SubtitleDisplayMode>('bilingual');
  const [selectedParagraph, setSelectedParagraph] = useState<Paragraph | null>(null);
  const [showParser, setShowParser] = useState(false);
  const [showExpressions, setShowExpressions] = useState(false);
  const [expandedExpr, setExpandedExpr] = useState<number | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  const [activeExpression, setActiveExpression] = useState<Expression | null>(null);
  const [expressionAnchor, setExpressionAnchor] = useState<HTMLElement | null>(null);
  const wasPlayingRef = useRef(false);

  const [autoScroll, setAutoScroll] = useState(true);
  const subtitleScrollRef = useRef<HTMLDivElement>(null);
  const activeSubRef = useRef<HTMLDivElement>(null);

  const [lookupWord, setLookupWord] = useState('');
  const [lookupAnchor, setLookupAnchor] = useState<HTMLElement | null>(null);

  const paragraphs = content.paragraphs;
  const currentParagraph = useMemo(() => paragraphs.find(p => currentTime >= p.startTime && currentTime < p.endTime) || null, [currentTime, paragraphs]);
  const currentParagraphId = currentParagraph?.id || 0;

  useEffect(() => {
    if (!autoScroll || !activeSubRef.current || !subtitleScrollRef.current) return;
    const el = activeSubRef.current;
    const container = subtitleScrollRef.current;
    container.scrollTo({ top: Math.max(0, el.offsetTop - container.clientHeight * 0.3), behavior: 'smooth' });
  }, [currentParagraphId, autoScroll]);

  const expressionMatches = useMemo(() => {
    const map: Record<number, any[]> = {};
    for (const p of paragraphs) {
      const ms: any[] = [];
      for (const expr of content.expressions) {
        const m = matchExpression(expr, p.english);
        if (m) ms.push({ expr, match: m });
      }
      if (ms.length) map[p.id] = ms;
    }
    return map;
  }, [paragraphs, content.expressions]);

  useEffect(() => {
    if (!isLooping || !currentParagraph) return;
    if (currentTime >= currentParagraph.endTime) {
      videoPlayerRef.current?.seekTo(currentParagraph.startTime);
      setCurrentTime(currentParagraph.startTime);
    }
  }, [currentTime, isLooping, currentParagraph]);

  const handlePlayPause = useCallback(() => setIsPlaying(p => !p), []);
  const handleTimeUpdate = useCallback((t: number) => setCurrentTime(t), []);
  const handleSeek = useCallback((t: number) => setCurrentTime(t), []);

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
    if (tgt) { videoPlayerRef.current?.seekTo(tgt.startTime); setCurrentTime(tgt.startTime); }
  }, [paragraphs, currentParagraphId]);

  const handleParagraphClick = useCallback((p: Paragraph) => {
    videoPlayerRef.current?.seekTo(p.startTime);
    setCurrentTime(p.startTime);
    if (!isPlaying) setIsPlaying(true);
  }, [isPlaying]);

  const handleOpenParser = useCallback((p: Paragraph) => {
    wasPlayingRef.current = isPlaying;
    if (isPlaying) setIsPlaying(false);
    setSelectedParagraph(p);
    setShowParser(true);
  }, [isPlaying]);

  // Close parser from anywhere: clicking the X or clicking outside
  const closeOverlay = useCallback(() => {
    setShowParser(false);
    setShowExpressions(false);
    if (wasPlayingRef.current) setIsPlaying(true);
    if (autoScroll && activeSubRef.current && subtitleScrollRef.current) {
      const el = activeSubRef.current;
      const container = subtitleScrollRef.current;
      container.scrollTo({ top: Math.max(0, el.offsetTop - container.clientHeight * 0.3), behavior: 'smooth' });
    }
  }, [autoScroll]);

  const handleOpenExpressions = useCallback(() => {
    wasPlayingRef.current = isPlaying;
    if (isPlaying) setIsPlaying(false);
    setShowExpressions(true);
  }, [isPlaying]);

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

  const handleWordClick = useCallback((word: string, el: HTMLElement) => { setLookupWord(word); setLookupAnchor(el); }, []);

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

  return (
    <div className="h-dvh flex flex-col bg-white font-sans overflow-hidden">
      {/* Header */}
      <header className="h-11 bg-white flex items-center px-4 border-b border-slate-100 shrink-0 gap-2">
        <button onClick={() => navigate('/catalog')} className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
        <Video className="w-4 h-4 text-slate-900" />
        <h1 className="font-semibold text-slate-900 truncate text-[13px] flex-1">{content.meta.title}</h1>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT */}
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
            <VideoPlayer ref={videoPlayerRef} videoUrl={content.meta.videoUrl || getVideoUrl(videoId || 'pilot-001')} isPlaying={isPlaying} playbackRate={playbackRate}
              onPlayPause={handlePlayPause} onTimeUpdate={handleTimeUpdate} onDurationChange={() => {}} onSeek={handleSeek} />
          </div>
          <div className="flex-1 bg-slate-50 rounded-2xl flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-4 overflow-y-auto min-h-0">
              {currentParagraph ? (
                <div className="text-center w-full space-y-1.5">
                  <div className="flex items-center justify-center gap-2">
                    {subtitleMode !== 'chinese' && (
                      <p className="text-xl lg:text-2xl font-medium text-slate-900 leading-relaxed">
                        {(() => {
                          const p = currentParagraph;
                          if (!p) return null;
                          const matches = expressionMatches[p.id];
                          if (!matches || matches.length === 0) return p.english;
                          // Highlight expressions inline
                          const text = p.english;
                          const sorted = [...matches].sort((a, b) => a.match.start - b.match.start);
                          const parts: React.ReactNode[] = [];
                          let lastEnd = 0;
                          for (const { expr, match } of sorted) {
                            if (match.start > lastEnd) {
                              parts.push(<span key={`bl-${lastEnd}`}>{text.slice(lastEnd, match.start)}</span>);
                            }
                            parts.push(
                              <span key={`be-${match.start}`} className="bg-teal-50 text-teal-600 font-semibold rounded px-0.5 cursor-pointer hover:bg-teal-100 transition-colors border-b-2 border-teal-300"
                                onClick={e => { e.stopPropagation(); handleExpressionClick(expr, e.currentTarget as HTMLElement); }}>
                                {match.matchText}
                              </span>
                            );
                            lastEnd = match.end;
                          }
                          if (lastEnd < text.length) parts.push(<span key={`bl-end`}>{text.slice(lastEnd)}</span>);
                          return parts;
                        })()}
                        {currentParagraph.parse && (
                          <button onClick={() => handleOpenParser(currentParagraph)}
                            className="inline ml-2 text-sm px-2 py-0.5 text-teal-700 bg-teal-50/60 rounded hover:bg-teal-200 transition-colors align-middle">
                            解析
                          </button>
                        )}
                      </p>
                    )}
                  </div>
                  {subtitleMode !== 'english' && <p className="text-lg text-slate-500 leading-relaxed">{currentParagraph.chinese}</p>}
                </div>
              ) : <p className="text-slate-300 text-xs">点击右侧字幕开始学习</p>}
            </div>
            <div className="shrink-0 flex items-center justify-center px-4 py-2.5 gap-2 relative">
              <CtrlBtn icon={isLooping ? <Repeat1 size={17} /> : <Repeat size={17} />} label="单句循环" active={isLooping} onClick={() => setIsLooping(p => !p)} />
              <div className="flex items-center gap-1.5 mx-auto">
                <CtrlBtn icon={<SkipBack size={17} />} label="上一句" onClick={() => jp(-1)} />
                <button onClick={handlePlayPause} className="flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  <span className="text-[10px]">{isPlaying ? '暂停' : '播放'}</span>
                </button>
                <CtrlBtn icon={<SkipForward size={17} />} label="下一句" onClick={() => jp(1)} />
              </div>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 min-w-[48px]">
                    <span className="text-sm font-bold text-slate-600">{playbackRate}x</span>
                    <span className="text-[10px]">倍速</span>
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                      {PLAYBACK_RATES.map(r => (
                        <button key={r} onClick={() => { setPlaybackRate(r); setShowSpeedMenu(false); }}
                          className={`block w-full text-center px-4 py-1.5 text-xs ${r === playbackRate ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:bg-slate-50'}`}>{r}x</button>
                      ))}
                    </div>
                  )}
                </div>
                <CtrlBtn icon={<Maximize2 size={17} />} label="全屏" onClick={() => videoPlayerRef.current?.getVideo()?.requestFullscreen()} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hidden lg:flex flex-[4] flex-col bg-white shrink-0 overflow-hidden min-w-0 relative">
          {/* Fixed toolbar — always visible */}
          <div className="flex items-center px-5 py-3 shrink-0 border-b border-slate-100 gap-4 justify-end">
            {/* Left: scroll follow toggle */}
            <div className="flex items-center gap-2 cursor-pointer select-none shrink-0" onClick={() => setAutoScroll(!autoScroll)}>
              <span className="text-xs font-medium text-slate-600">字幕跟随</span>
              <div className={`relative w-9 h-5 rounded-full transition-colors ${autoScroll ? 'bg-slate-800' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoScroll ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </div>

            {/* Center: language switch */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              {(['bilingual', 'english', 'chinese'] as SubtitleDisplayMode[]).map(m => (
                <button key={m} onClick={() => setSubtitleMode(m)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${subtitleMode === m ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-400'}`}>
                  {{ bilingual: '中英', english: 'EN', chinese: '中' }[m]}
                </button>
              ))}
            </div>

            {/* Right: expressions */}
            <button onClick={handleOpenExpressions}
              className="shrink-0 px-3 py-1.5 text-xs font-bold text-white bg-teal-500 rounded-lg hover:bg-teal-500 transition-colors">
              地道表达汇总
            </button>
          </div>

          {/* Subtitle — always mounted, hidden by CSS when parser is open */}
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
                    <div key={p.id} ref={isActive ? activeSubRef : undefined} onClick={() => handleParagraphClick(p)}
                      className={`px-5 py-3.5 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? 'bg-teal-50/60 border-l-[3px] border-teal-400' : 'border-l-[3px] border-transparent'}`}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-xs font-mono font-bold ${isActive ? 'text-teal-600' : 'text-slate-300'}`}>{formatTime(p.startTime)}</span>
                        {p.parse && (
                          <button onClick={e => { e.stopPropagation(); handleOpenParser(p); }}
                            className="text-sm px-3 py-1 text-teal-700 bg-teal-50/60 rounded hover:bg-teal-100 hover:text-teal-700 transition-colors">
                            解析
                          </button>
                        )}
                      </div>
                      {(subtitleMode === 'english' || subtitleMode === 'bilingual') && (
                        <p className={`text-base leading-relaxed ${isActive ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>{renderHighlightedText(p)}</p>
                      )}
                      {(subtitleMode === 'chinese' || subtitleMode === 'bilingual') && (
                        <p className={`text-[15px] leading-relaxed mt-1 ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>{p.chinese}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Parser — absolute overlay on top of subtitle */}
          {showParser && selectedParagraph?.parse && (
            <div className="absolute inset-0 top-[53px] flex flex-col bg-white z-10" onClick={closeOverlay}>
              <div className="flex items-center justify-between px-5 py-2 shrink-0 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800">句子解析</span>
                <button onClick={closeOverlay} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0" onClick={e => e.stopPropagation()}>
                <div className="bg-teal-50 rounded-xl p-4">
                  <h4 className="text-[11px] font-bold text-teal-500 uppercase tracking-wider mb-2">句子原文</h4>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">{selectedParagraph.english}</p>
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

          {/* Expressions — absolute overlay */}
          {showExpressions && (
            <div className="absolute inset-0 top-[53px] flex flex-col bg-white z-10">
              <div className="flex items-center justify-between px-5 py-2 shrink-0 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800">地道表达汇总</span>
                <button onClick={closeOverlay} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
                {content.expressions.map((expr, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedExpr(expandedExpr === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-sm text-teal-700 truncate">{expr.pattern}</span>
                        <span className="text-xs text-slate-500 truncate">{expr.meaning}</span>
                      </div>
                      <span className="text-slate-300 text-xs shrink-0 ml-2">{expandedExpr === i ? '收起' : '展开'}</span>
                    </button>
                    {expandedExpr === i && (
                      <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
                        {expr.usage && (
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">用法说明</span>
                            <p className="text-sm text-slate-700 leading-relaxed mt-1">{expr.usage}</p>
                          </div>
                        )}
                        {expr.topic && (
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">雅思话题</span>
                            <p className="text-sm text-teal-700 bg-teal-50 p-2 rounded-lg leading-relaxed mt-1">{expr.topic}</p>
                          </div>
                        )}
                        {expr.example && (
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">仿写例句</span>
                            <p className="text-sm text-slate-600 italic bg-slate-50 p-2 rounded-lg leading-relaxed mt-1">"{expr.example}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {lookupWord && <WordPopup word={lookupWord} anchorEl={lookupAnchor} onClose={() => { setLookupWord(''); setLookupAnchor(null); }} />}
      {activeExpression && <ExpressionPopup expression={activeExpression} anchorEl={expressionAnchor} onClose={handleExpressionClose} />}
    </div>
  );
}
