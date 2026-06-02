import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Lightbulb } from 'lucide-react';
import { mockVideoContent } from '../data/mockVideo';
import { videoData as video003 } from '../data/video-003';
import type { VideoContent } from '../types/video';

export default function ExpressionsPage() {
  const { videoId } = useParams();
  void videoId;
  const navigate = useNavigate();
  const DATA_MAP: Record<string, VideoContent> = { 'pilot-001': mockVideoContent, 'video-003': video003 as unknown as VideoContent };
  const content: VideoContent = DATA_MAP[videoId || 'pilot-001'] || mockVideoContent;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 h-14">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0">
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-slate-900 truncate">{content.meta.title}</h1>
              <p className="text-xs text-slate-500">地道表达精选</p>
            </div>
            <Sparkles size={20} className="text-teal-400 shrink-0" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <Lightbulb size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-800 font-semibold">精选地道表达</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              以下表达均精选自本视频，为母语者真实高频用法，对雅思口语 6-8 分水平有加分价值。
            </p>
          </div>
        </div>

        {content.expressions.map((expr, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-baseline gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span className="text-lg font-bold text-teal-600">{expr.pattern}</span>
              <span className="text-base text-slate-500">{expr.meaning}</span>
            </div>

            <div className="space-y-3 text-sm">
              {expr.usage && (
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">用法说明</span>
                  <p className="text-slate-700 mt-1 leading-relaxed">{expr.usage}</p>
                </div>
              )}
              {expr.topic && (
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">雅思话题</span>
                  <p className="text-teal-700 bg-teal-50 p-2 rounded-lg leading-relaxed mt-1">{expr.topic}</p>
                </div>
              )}
              {expr.example && (
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">仿写例句</span>
                  <p className="text-slate-600 italic bg-slate-50 p-3 rounded-lg leading-relaxed border border-slate-100 mt-1 text-sm">
                    "{expr.example}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
