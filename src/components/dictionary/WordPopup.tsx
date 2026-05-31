import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Volume2, BookOpen } from 'lucide-react';

interface WordData {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

interface WordPopupProps {
  word: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const FREE_DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Local fallback vocabulary (IELTS core words)
const LOCAL_VOCAB: Record<string, { meaning: string; phonetic?: string; example?: string }> = {
  'coastal': { meaning: '沿海的；海岸的', phonetic: '/ˈkoʊstəl/', example: 'a coastal town' },
  'iconic': { meaning: '标志性的；符号化的', phonetic: '/aɪˈkɒnɪk/', example: 'an iconic building' },
  'vibrant': { meaning: '充满活力的；鲜艳的', phonetic: '/ˈvaɪbrənt/', example: 'a vibrant arts scene' },
  'commercialized': { meaning: '商业化的', phonetic: '/kəˈmɜːrʃəlaɪzd/', example: 'The area has become too commercialized.' },
  'skyrocketed': { meaning: '飞涨；猛增', phonetic: '/ˈskaɪrɒkɪtɪd/', example: 'Prices have skyrocketed.' },
  'belonging': { meaning: '归属感', phonetic: '/bɪˈlɒŋɪŋ/', example: 'a sense of belonging' },
};

function playWordAudio(word: string) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function WordPopup({ word, anchorEl, onClose }: WordPopupProps) {
  const [data, setData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);

  const cleanWord = word.replace(/[.,!?;:'"]/g, '').toLowerCase();

  const fetchWord = useCallback(async () => {
    if (!cleanWord) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${FREE_DICT_API}/${encodeURIComponent(cleanWord)}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          const entry = json[0];
          const meanings = entry.meanings?.map((m: any) => ({
            partOfSpeech: m.partOfSpeech || '',
            definitions: (m.definitions || []).slice(0, 3).map((d: any) => ({
              definition: d.definition || '',
              example: d.example || '',
            })),
          })) || [];
          setData({
            word: entry.word || cleanWord,
            phonetic: entry.phonetic || '',
            meanings,
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      // API failed, try local fallback
    }

    // Fallback to local vocab
    const local = LOCAL_VOCAB[cleanWord];
    if (local) {
      setData({
        word: cleanWord,
        phonetic: local.phonetic,
        meanings: [
          {
            partOfSpeech: '',
            definitions: [{ definition: local.meaning, example: local.example || '' }],
          },
        ],
      });
    } else {
      setError('该词汇暂未收录');
    }
    setLoading(false);
  }, [cleanWord]);

  useEffect(() => {
    fetchWord();
  }, [fetchWord]);

  // Position popup near anchor
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!anchorEl || !popupRef.current) return;

    const anchorRect = anchorEl.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = anchorRect.bottom + 8;
    let left = anchorRect.left;

    // Prevent overflow right
    if (left + popupRect.width > viewportWidth - 16) {
      left = viewportWidth - popupRect.width - 16;
    }
    // Prevent overflow bottom
    if (top + popupRect.height > viewportHeight - 16) {
      top = anchorRect.top - popupRect.height - 8;
    }

    setStyle({ top, left, position: 'fixed', zIndex: 100 });
  }, [anchorEl]);

  // Close on outside click
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
      className="w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header */}
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

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-slate-400 text-sm">{error}</div>
        ) : data ? (
          <div className="space-y-3">
            {/* Word + Phonetic + Audio */}
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{data.word}</h3>
              {data.phonetic && (
                <span className="text-xs text-slate-500 font-mono">{data.phonetic}</span>
              )}
              <button
                onClick={() => playWordAudio(data.word)}
                className="p-1 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                title="播放发音"
              >
                <Volume2 size={14} />
              </button>
            </div>

            {/* Meanings */}
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
