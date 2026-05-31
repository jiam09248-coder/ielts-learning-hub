import { X, Sparkles } from 'lucide-react';

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

export default function ExpressionPopup({ expression, anchorEl, onClose }: ExpressionPopupProps) {
  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
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
