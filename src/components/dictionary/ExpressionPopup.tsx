import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import useIsDesktop from '../../hooks/useIsDesktop';

interface Expression {
  pattern: string;
  meaning: string;
  usage: string;
  topic: string;
  example: string;
}

interface ExpressionPopupProps {
  expression: Expression;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

function DesktopExpressionPopup({ expression, anchorEl, onClose }: ExpressionPopupProps) {
  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/45 transition-opacity duration-200 opacity-100" />
      <div
        className="absolute w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col"
        style={anchorEl ? {
          top: Math.min(anchorEl.getBoundingClientRect().bottom + 8, window.innerHeight - 580),
          left: Math.max(8, Math.min(anchorEl.getBoundingClientRect().left, window.innerWidth - 400)),
          position: 'fixed',
        } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-teal-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-teal-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">地道表达</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/80 transition-colors">
            <X size={14} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <span className="text-lg font-bold text-teal-600">{expression.pattern}</span>
            <div className="mt-2 text-sm text-slate-700 leading-relaxed">{expression.meaning}</div>
          </div>

          {expression.usage && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">用法说明</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{expression.usage}</p>
            </div>
          )}

          {expression.topic && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">雅思话题</h4>
              <p className="text-sm text-teal-700 bg-teal-50 p-2 rounded-lg leading-relaxed">{expression.topic}</p>
            </div>
          )}

          {expression.example && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">仿写例句</h4>
              <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-xl leading-relaxed border border-slate-100">
                {expression.example}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileExpressionPopup({ expression, onClose }: Omit<ExpressionPopupProps, 'anchorEl'>) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setClosing(false);
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

        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-teal-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-teal-500" />
            <span className="text-base font-bold text-slate-800">地道表达</span>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/80 transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div>
            <span className="text-[26px] font-bold text-teal-600 leading-snug">{expression.pattern}</span>
            <div className="mt-2.5 text-[21px] text-slate-700 leading-9">{expression.meaning}</div>
          </div>

          {expression.usage && (
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">用法说明</h4>
              <p className="text-[20px] text-slate-700 leading-9">{expression.usage}</p>
            </div>
          )}

          {expression.topic && (
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">雅思话题</h4>
              <p className="text-[20px] text-teal-700 bg-teal-50 px-3 py-3 rounded-xl leading-9">{expression.topic}</p>
            </div>
          )}

          {expression.example && (
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">仿写例句</h4>
              <p className="text-[20px] text-slate-600 italic bg-slate-50 p-4 rounded-2xl leading-9 border border-slate-100">
                {expression.example}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExpressionPopup({ expression, anchorEl, onClose }: ExpressionPopupProps) {
  const isDesktop = useIsDesktop();

  return isDesktop
    ? <DesktopExpressionPopup expression={expression} anchorEl={anchorEl} onClose={onClose} />
    : <MobileExpressionPopup expression={expression} onClose={onClose} />;
}
