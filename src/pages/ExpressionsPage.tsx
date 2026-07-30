import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Lightbulb, ChevronDown, Check, Copy } from 'lucide-react';
import { getContentManifestEntry, isFreeVideo } from '../data/videoLibrary';
import useVideoContent from '../hooks/useVideoContent';
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
            <p className="text-xs text-slate-500">重点表达</p>
            </div>
            <Sparkles size={20} className="text-teal-400 shrink-0" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <Lightbulb size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-800 font-semibold">本视频重点表达</p>
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
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">雅思问题</span>
                  <div className="mt-1 rounded-lg bg-teal-50 p-2 leading-relaxed">
                    <p className="break-words text-teal-700">{expr.topic}</p>
                    {expr.topicZh && <p className="mt-1 break-words text-teal-800/70">{expr.topicZh}</p>}
                  </div>
                </div>
              )}
              {expr.example && (
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">仿写例句</span>
                  <div className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-3 leading-relaxed">
                    <p className="break-words text-sm italic text-slate-600">“{expr.example}”</p>
                    {expr.exampleZh && <p className="mt-1 break-words text-sm text-slate-500">{expr.exampleZh}</p>}
                  </div>
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyExpression = async (pattern: string, index: number) => {
    try {
      await navigator.clipboard.writeText(pattern);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1600);
    } catch {
      // Clipboard access can be unavailable in embedded or non-secure previews.
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="px-4">
          <div className="flex items-center gap-3 h-14">
            <button type="button" aria-label="返回课程" onClick={onBack} className="-ml-2 p-2 rounded-xl active:bg-slate-100 transition-colors shrink-0">
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold tracking-wide text-teal-600">地道表达</p>
              <h1 className="text-[15px] font-bold text-slate-900 truncate">{content.meta.title}</h1>
            </div>
            <div className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 shrink-0">{content.expressions.length} 条</div>
          </div>
        </div>
      </header>

      <main className="px-4 pt-5 space-y-3">
        <div className="rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3.5 flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-white p-1.5 shadow-sm"><Lightbulb size={16} className="text-teal-600" /></div>
          <div>
            <p className="text-sm text-slate-900 font-bold">先记表达，再展开看怎么用</p>
            <p className="text-[13px] text-slate-600 mt-0.5 leading-5">
              点开任意卡片，可查看使用场景、适用话题和仿写例句。
            </p>
          </div>
        </div>

        {content.expressions.map((expr, i) => (
          <article key={i} className={`overflow-hidden rounded-2xl border bg-white transition-shadow ${expandedIndex === i ? 'border-teal-200 shadow-md shadow-teal-900/[0.06]' : 'border-slate-200 shadow-sm'}`}>
            <button
              type="button"
              aria-expanded={expandedIndex === i}
              aria-controls={`expression-detail-${i}`}
              onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              className="flex w-full items-start gap-3 p-4 text-left active:bg-slate-50"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block break-words text-[18px] font-bold leading-6 text-slate-900">{expr.pattern}</span>
                <span className="mt-1 block text-[14px] leading-5 text-slate-500">{expr.meaning}</span>
              </span>
              <ChevronDown size={19} className={`mt-0.5 shrink-0 text-slate-400 transition-transform duration-200 ${expandedIndex === i ? 'rotate-180 text-teal-600' : ''}`} />
            </button>

            {expandedIndex === i && (
              <div id={`expression-detail-${i}`} className="border-t border-slate-100 px-4 pb-4 pt-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">表达详情</span>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); void copyExpression(expr.pattern, i); }}
                    className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-teal-700 active:bg-teal-50"
                    aria-label={`复制表达 ${expr.pattern}`}
                  >
                    {copiedIndex === i ? <Check size={15} /> : <Copy size={14} />}
                    {copiedIndex === i ? '已复制' : '复制'}
                  </button>
                </div>

                <div className="mt-2.5 space-y-3">
                  {expr.usage && (
                    <section>
                      <h2 className="text-xs font-bold text-slate-700">怎么用</h2>
                      <p className="mt-1 text-[14px] leading-6 text-slate-600">{expr.usage}</p>
                    </section>
                  )}
                  {expr.topic && (
                    <section className="rounded-xl bg-teal-50 px-3 py-2.5">
                      <h2 className="text-xs font-bold text-teal-800">雅思问题</h2>
                      <p className="mt-1 break-words text-[13px] leading-5 text-teal-800/80">{expr.topic}</p>
                      {expr.topicZh && <p className="mt-1 break-words text-[13px] leading-5 text-teal-800/60">{expr.topicZh}</p>}
                    </section>
                  )}
                  {expr.example && (
                    <section className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <h2 className="text-xs font-bold text-slate-700">仿写例句</h2>
                      <p className="mt-1 break-words text-[14px] italic leading-6 text-slate-600">“{expr.example}”</p>
                      {expr.exampleZh && <p className="mt-1 break-words text-[14px] leading-6 text-slate-500">{expr.exampleZh}</p>}
                    </section>
                  )}
                </div>
              </div>
            )}
          </article>
        ))}
      </main>
    </div>
  );
}

export default function ExpressionsPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const contentEntry = getContentManifestEntry(videoId);
  const resolvedVideoId = contentEntry?.id ?? 'pilot-001';
  const { content: loadedContent, error: contentError, isLoading: contentLoading } = useVideoContent(resolvedVideoId);
  const content: VideoContent = loadedContent ? {
    ...loadedContent,
    meta: {
      ...loadedContent.meta,
      title: contentEntry?.titleZh ?? loadedContent.meta.title,
    },
  } : {
    meta: { id: '', title: '', duration: 0, videoUrl: '', dataUrl: '', tags: { difficulty: 'easy', speed: 'normal', durationTag: 'short' } },
    summary: '', paragraphs: [], expressions: [],
  };
  const isNotFound = !contentEntry;
  const isLocked = !isNotFound && !isFreeVideo(resolvedVideoId) && !getCurrentUser();

  useEffect(() => {
    if (!isLocked) return;
    navigate('/login', { replace: true, state: { from: `/lesson/${resolvedVideoId}/expressions` } });
  }, [isLocked, navigate, resolvedVideoId]);

  if (isNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-900">课程不存在或已下线</p>
          <button type="button" onClick={() => navigate('/catalog')} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">返回课程列表</button>
        </div>
      </div>
    );
  }

  if (contentLoading || contentError) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-sm text-slate-500">{contentError ? '课程内容加载失败，请刷新重试。' : '正在加载课程内容…'}</div>;
  }

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
