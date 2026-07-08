import { useEffect, useState } from 'react';
import { X, BookOpen, MonitorPlay } from 'lucide-react';
import WordPopup from '../dictionary/WordPopup';
import type { Paragraph } from '../../types/video';

interface ParserSheetProps {
  isOpen: boolean;
  onClose: () => void;
  paragraph: Paragraph | null;
}

export default function ParserSheet({ isOpen, onClose, paragraph }: ParserSheetProps) {
  const [closing, setClosing] = useState(false);
  const [lookupWord, setLookupWord] = useState('');
  const [lookupAnchor, setLookupAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
      setLookupWord('');
      setLookupAnchor(null);
    }, 250);
  };

  if (!isOpen) return null;

  const parse = paragraph?.parse;
  const renderEnglishWords = (text: string) => {
    return text.split(/(\s+)/).map((token, idx) => {
      if (/^\s+$/.test(token)) return <span key={`ws-${idx}`}>{token}</span>;

      const clean = token.replace(/[^a-zA-Z]/g, '');
      const isWord = clean.length > 0;

      return (
        <span
          key={`w-${idx}`}
          className={isWord ? 'hover:bg-blue-100 rounded px-0.5 transition-colors cursor-pointer' : ''}
          onClick={(event) => {
            event.stopPropagation();
            if (!isWord) return;
            setLookupWord(token);
            setLookupAnchor(event.currentTarget as HTMLElement);
          }}
        >
          {token}
        </span>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[75vh] flex flex-col shadow-2xl shadow-black/20 ${closing ? 'animate-sheet-out' : 'animate-sheet-in'}`}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-yellow-500" />
            <h3 className="text-lg font-bold text-slate-900">语境语法解析</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {parse ? (
            <div className="space-y-5">
              <div>
                <div className="text-base font-bold text-slate-900 border-l-4 border-yellow-400 pl-3 mb-2">
                  句子原文
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[19px] font-semibold text-slate-800 leading-relaxed">
                    {paragraph?.english ? renderEnglishWords(paragraph.english) : null}
                  </p>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    {paragraph?.chinese}
                  </p>
                </div>
              </div>

              <div>
                <div className="text-base font-bold text-slate-900 border-l-4 border-yellow-400 pl-3 mb-2">
                  语法结构
                </div>
                <p className="text-base text-slate-700 leading-relaxed">{parse.grammar}</p>
              </div>

              <div>
                <div className="text-base font-bold text-slate-900 border-l-4 border-pink-400 pl-3 mb-2">
                  固定搭配
                </div>
                <div className="flex flex-wrap gap-2">
                  {parse.collocations.map((col, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-base font-medium rounded-lg border border-slate-100">{col.phrase}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-base font-bold text-slate-900 border-l-4 border-sky-300 pl-3 mb-2">
                  语境分析
                </div>
                <p className="text-base text-slate-700 leading-relaxed">{parse.contextAnalysis}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300 gap-3">
              <MonitorPlay size={32} className="opacity-10" />
              <p className="text-base">该段落暂无解析</p>
            </div>
          )}
        </div>
        {lookupWord && (
          <WordPopup
            word={lookupWord}
            anchorEl={lookupAnchor}
            onClose={() => {
              setLookupWord('');
              setLookupAnchor(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
