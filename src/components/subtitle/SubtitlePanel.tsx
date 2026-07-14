import { useRef, useEffect, useState, useCallback } from 'react';
import { Captions, Sparkles } from 'lucide-react';
import WordPopup from '../dictionary/WordPopup';
import type { Paragraph } from '../../types/video';

type SubtitleDisplayMode = 'bilingual' | 'english' | 'chinese';

interface SubtitlePanelProps {
  paragraphs: Paragraph[];
  summary: string;
  currentParagraphId: number;
  subtitleMode: SubtitleDisplayMode;
  onModeChange: (mode: SubtitleDisplayMode) => void;
  onParseClick: (paragraph: Paragraph) => void;
  onParagraphClick: (paragraph: Paragraph) => void;
  onExpressionsClick: () => void;
  isMobile: boolean;
}

const MODE_LABELS: Record<SubtitleDisplayMode, string> = {
  bilingual: '双语',
  english: 'EN',
  chinese: '中',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SubtitlePanel({
  paragraphs,
  summary,
  currentParagraphId,
  subtitleMode,
  onModeChange,
  onParseClick,
  onParagraphClick,
  onExpressionsClick,
}: SubtitlePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // Word lookup state
  const [lookupWord, setLookupWord] = useState('');
  const [lookupAnchor, setLookupAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = activeRef.current;
      const containerHeight = container.clientHeight;
      const elementTop = element.offsetTop;
      const targetScroll = elementTop - containerHeight * 0.3;
      container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  }, [currentParagraphId]);

  const handleWordClick = useCallback((word: string, el: HTMLElement) => {
    setLookupWord(word);
    setLookupAnchor(el);
  }, []);

  const handleCloseLookup = useCallback(() => {
    setLookupWord('');
    setLookupAnchor(null);
  }, []);

  const renderEnglishWords = (text: string) => {
    return text.split(/(\s+)/).map((token, idx) => {
      if (/^\s+$/.test(token)) {
        return <span key={`ws-${idx}`}>{token}</span>;
      }
      const clean = token.replace(/[^a-zA-Z]/g, '');
      const isWord = clean.length > 0;
      return (
        <span
          key={`w-${idx}`}
          className={isWord ? 'hover:bg-blue-100 rounded px-0.5 transition-colors cursor-pointer' : ''}
          onClick={(e) => {
            e.stopPropagation();
            if (isWord) handleWordClick(token, e.currentTarget as HTMLElement);
          }}
        >
          {token}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Captions className="w-4 h-4 text-slate-900" />
          <h2 className="font-bold text-sm text-slate-800">字幕列表</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExpressionsClick}
            className="p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all"
            title="重点表达"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['english', 'chinese', 'bilingual'] as SubtitleDisplayMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                  subtitleMode === mode
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mx-4 mt-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <h3 className="text-xs font-bold text-slate-800">主题</h3>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">{summary}</p>
        </div>
      )}

      {/* Paragraph list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 pb-20 scroll-smooth">
        <div className="space-y-1 pb-[20vh]">
          {paragraphs.map((p) => {
            const isActive = p.id === currentParagraphId;
            return (
              <div
                key={p.id}
                ref={isActive ? activeRef : undefined}
                onClick={() => onParagraphClick(p)}
                className={`px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'bg-slate-100 border-l-[3px] border-teal-500'
                    : 'hover:bg-slate-50 border-l-[3px] border-transparent'
                }`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`text-[10px] font-mono ${isActive ? 'text-slate-500 font-bold' : 'text-slate-300'}`}>
                    {formatTime(p.startTime)}
                  </span>
                  {p.parse && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onParseClick(p); }}
                      className="text-[10px] px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-colors"
                    >
                      解析
                    </button>
                  )}
                </div>
                {(subtitleMode === 'english' || subtitleMode === 'bilingual') && (
                  <div className={`text-sm leading-snug ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                    {renderEnglishWords(p.english)}
                  </div>
                )}
                {(subtitleMode === 'chinese' || subtitleMode === 'bilingual') && (
                  <div className={`text-[11px] mt-0.5 ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                    {p.chinese}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Word Lookup Popup */}
      {lookupWord && (
        <WordPopup word={lookupWord} anchorEl={lookupAnchor} onClose={handleCloseLookup} />
      )}
    </div>
  );
}
