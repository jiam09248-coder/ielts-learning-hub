import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { X, Volume2, BookOpen } from 'lucide-react';
import useIsDesktop from '../../hooks/useIsDesktop';
import { lookupWord } from '../../services/dictionaryService';
import type { DictionaryEntry } from '../../types/dictionary';

interface WordPopupProps {
  word: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

function playWordAudio(word: string) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function canPlayAudio() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function DesktopWordPopupBody({ loading, error, data }: { loading: boolean; error: string; data: DictionaryEntry | null }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-4 text-slate-400 text-sm">{error}</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-slate-900">{data.word}</h3>
        {data.phonetic && (
          <span className="text-xs text-slate-500 font-mono">{data.phonetic}</span>
        )}
        {canPlayAudio() && (
          <button
            onClick={() => playWordAudio(data.word)}
            className="p-1 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
            title="播放发音"
          >
            <Volume2 size={14} />
          </button>
        )}
      </div>

      {data.meanings.map((meaning, i) => (
        <div key={i} className="space-y-1.5">
          {meaning.partOfSpeech && (
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              {meaning.partOfSpeech}
            </span>
          )}
          {meaning.definitions.map((def, j) => (
            <div key={j} className="text-sm">
              <p className="text-slate-700 leading-relaxed">{def.definition}</p>
              {def.example && (
                <p className="text-xs text-slate-400 mt-0.5 italic">"{def.example}"</p>
              )}
            </div>
          ))}
        </div>
      ))}

      {data.englishDefinitions?.length ? (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">English</p>
          {data.englishDefinitions.slice(0, 2).map((definition, index) => (
            <p key={index} className="text-xs text-slate-500 leading-relaxed">{definition}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileWordPopupBody({ loading, error, data }: { loading: boolean; error: string; data: DictionaryEntry | null }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-4 text-slate-400 text-base">{error}</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold text-slate-900">{data.word}</h3>
        {data.phonetic && (
          <span className="text-sm text-slate-500 font-mono">{data.phonetic}</span>
        )}
        {canPlayAudio() && (
          <button
            onClick={() => playWordAudio(data.word)}
            className="p-1 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
            title="播放发音"
          >
            <Volume2 size={14} />
          </button>
        )}
      </div>

      {data.meanings.map((meaning, i) => (
        <div key={i} className="space-y-1.5">
          {meaning.partOfSpeech && (
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {meaning.partOfSpeech}
            </span>
          )}
          {meaning.definitions.map((def, j) => (
            <div key={j} className="text-base">
              <p className="text-slate-700 leading-relaxed">{def.definition}</p>
              {def.example && (
                <p className="text-sm text-slate-400 mt-0.5 italic">"{def.example}"</p>
              )}
            </div>
          ))}
        </div>
      ))}

      {data.englishDefinitions?.length ? (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">English</p>
          {data.englishDefinitions.slice(0, 2).map((definition, index) => (
            <p key={index} className="text-sm text-slate-500 leading-relaxed">{definition}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DesktopWordPopup({
  anchorEl,
  onClose,
  loading,
  error,
  data,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  loading: boolean;
  error: string;
  data: DictionaryEntry | null;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [positioned, setPositioned] = useState(false);
  const placementRef = useRef<'above' | 'below' | null>(null);

  useLayoutEffect(() => {
    placementRef.current = null;
    if (!anchorEl || !popupRef.current) return;

    const positionPopup = () => {
      if (!anchorEl || !popupRef.current) return;

      const viewportPadding = 16;
      const gap = 8;
      const anchorRect = anchorEl.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = anchorRect.left;
      if (left + popupRect.width > viewportWidth - viewportPadding) {
        left = viewportWidth - popupRect.width - viewportPadding;
      }
      left = Math.max(viewportPadding, left);

      const spaceBelow = viewportHeight - anchorRect.bottom - viewportPadding - gap;
      const spaceAbove = anchorRect.top - viewportPadding - gap;
      const targetHeight = Math.min(360, viewportHeight - viewportPadding * 2);

      if (!placementRef.current) {
        placementRef.current = spaceBelow >= targetHeight || spaceBelow >= spaceAbove ? 'below' : 'above';
      }

      const maxHeight = placementRef.current === 'below'
        ? Math.max(160, viewportHeight - anchorRect.bottom - gap - viewportPadding)
        : Math.max(160, anchorRect.top - viewportPadding - gap);
      const height = Math.min(360, maxHeight);

      setStyle({
        top: placementRef.current === 'below' ? anchorRect.bottom + gap : undefined,
        bottom: placementRef.current === 'above' ? viewportHeight - anchorRect.top + gap : undefined,
        left,
        position: 'fixed',
        zIndex: 100,
        maxHeight,
        height,
      });
      setPositioned(true);
    };

    positionPopup();
    const frame = window.requestAnimationFrame(positionPopup);
    window.addEventListener('resize', positionPopup);
    window.addEventListener('scroll', positionPopup, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', positionPopup);
      window.removeEventListener('scroll', positionPopup, true);
    };
  }, [anchorEl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        if (anchorEl && !anchorEl.contains(e.target as Node)) {
          onClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [anchorEl, onClose]);

  return (
    <div
      ref={popupRef}
      style={style}
      className={`w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col ${positioned ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">词典</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto min-h-0">
        <DesktopWordPopupBody loading={loading} error={error} data={data} />
      </div>
    </div>
  );
}

function MobileWordPopup({
  onClose,
  loading,
  error,
  data,
}: {
  onClose: () => void;
  loading: boolean;
  error: string;
  data: DictionaryEntry | null;
}) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[100]" onClick={handleClose}>
      <div className={`absolute inset-0 bg-black/45 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`} />

      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[78vh] flex flex-col shadow-2xl shadow-black/25 ${closing ? 'animate-sheet-out' : 'animate-sheet-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-slate-500" />
            <span className="text-base font-bold text-slate-800">词典</span>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/80 transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <MobileWordPopupBody loading={loading} error={error} data={data} />
        </div>
      </div>
    </div>
  );
}

export default function WordPopup({ word, anchorEl, onClose }: WordPopupProps) {
  const isDesktop = useIsDesktop();
  const [data, setData] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWord = useCallback(async () => {
    setLoading(true);
    setError('');

    const result = await lookupWord(word);
    if (result) setData(result);
    else setError('该词汇暂未收录');

    setLoading(false);
  }, [word]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchWord();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchWord]);

  return isDesktop
    ? <DesktopWordPopup anchorEl={anchorEl} onClose={onClose} loading={loading} error={error} data={data} />
    : <MobileWordPopup onClose={onClose} loading={loading} error={error} data={data} />;
}
