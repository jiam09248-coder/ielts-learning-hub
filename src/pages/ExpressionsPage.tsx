import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Lightbulb } from 'lucide-react';
import { getVideoContent, isFreeVideo, VIDEO_LIBRARY } from '../data/videoLibrary';
import { getCurrentUser } from '../utils/storage';
import type { VideoContent } from '../types/video';
import useIsDesktop from '../hooks/useIsDesktop';

interface ExpressionPageViewProps {
  content: VideoContent;
  onBack: () => void;
}

function DesktopExpressionsView({ content, onBack }: ExpressionPageViewProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 h-14">
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0">
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
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
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

function MobileExpressionsView({ content, onBack }: ExpressionPageViewProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
        <div className="px-4">
          <div className="flex items-center gap-3 h-14">
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0">
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[15px] font-bold text-slate-900 truncate">{content.meta.title}</h1>
              <p className="text-xs text-slate-500">地道表达精选</p>
            </div>
            <Sparkles size={18} className="text-teal-400 shrink-0" />
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-4">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
          <Lightbulb size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-base text-slate-800 font-semibold">精选地道表达</p>
            <p className="text-sm text-slate-500 mt-1 leading-7">
              以下表达均精选自本视频，为母语者真实高频用法，对雅思口语 6-8 分水平有加分价值。
            </p>
          </div>
        </div>

        {content.expressions.map((expr, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0" />
                <span className="text-[22px] font-bold text-teal-600 leading-snug">{expr.pattern}</span>
              </div>
              <div className="text-[18px] text-slate-500 leading-8">{expr.meaning}</div>
            </div>

            <div className="space-y-4">
              {expr.usage && (
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">用法说明</span>
                  <p className="text-[17px] text-slate-700 mt-1.5 leading-8">{expr.usage}</p>
                </div>
              )}
              {expr.topic && (
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">雅思话题</span>
                  <p className="text-[17px] text-teal-700 bg-teal-50 px-3 py-3 rounded-xl leading-8 mt-1.5">{expr.topic}</p>
                </div>
              )}
              {expr.example && (
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">仿写例句</span>
                  <p className="text-[17px] text-slate-600 italic bg-slate-50 px-3 py-3 rounded-xl leading-8 border border-slate-100 mt-1.5">
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

export default function ExpressionsPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const resolvedVideoId = videoId && VIDEO_LIBRARY[videoId] ? videoId : 'pilot-001';
  const content: VideoContent = getVideoContent(resolvedVideoId);
  const isLocked = !isFreeVideo(resolvedVideoId) && !getCurrentUser();

  useEffect(() => {
    if (!isLocked) return;
    navigate('/login', { replace: true, state: { from: `/lesson/${resolvedVideoId}/expressions` } });
  }, [isLocked, navigate, resolvedVideoId]);

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-900">该表达页需要登录后查看</p>
          <p className="mt-2 text-sm text-slate-500">正在跳转到登录页...</p>
        </div>
      </div>
    );
  }

  return isDesktop
    ? <DesktopExpressionsView content={content} onBack={() => navigate(-1)} />
    : <MobileExpressionsView content={content} onBack={() => navigate(-1)} />;
}
