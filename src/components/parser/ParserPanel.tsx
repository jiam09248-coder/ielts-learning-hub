import { useState } from 'react';
import { MonitorPlay, BookOpen, Sparkles } from 'lucide-react';
import type { Paragraph, Expression } from '../../types/video';

interface ParserPanelProps {
  selectedParagraph: Paragraph | null;
  expressions: Expression[];
}

type Tab = 'grammar' | 'expressions';

export default function ParserPanel({ selectedParagraph, expressions }: ParserPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('grammar');

  return (
    <div className="flex flex-col h-full bg-white relative min-h-0">
      {/* Decorative Top Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 opacity-50 z-10" />

      {/* Tab bar */}
      <div className="flex items-center gap-6 px-6 py-3 border-b border-slate-50 shrink-0">
        <button
          onClick={() => setActiveTab('grammar')}
          className={`text-sm font-bold transition-colors relative ${
            activeTab === 'grammar'
              ? 'text-slate-800'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} />
            智能解析
          </span>
          {activeTab === 'grammar' && (
            <span className="absolute -bottom-3 left-0 w-full h-0.5 bg-yellow-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('expressions')}
          className={`text-sm font-bold transition-colors relative ${
            activeTab === 'expressions'
              ? 'text-slate-800'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} />
            地道表达
          </span>
          {activeTab === 'expressions' && (
            <span className="absolute -bottom-3 left-0 w-full h-0.5 bg-pink-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-4 min-h-0">
        {activeTab === 'grammar' ? (
          selectedParagraph?.parse ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Original Sentence */}
              <div>
                <div className="text-sm font-bold text-slate-900 border-l-4 border-yellow-400 pl-3 mb-2">
                  句子原文
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[15px] font-semibold text-slate-800 leading-relaxed">
                    {selectedParagraph.english}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {selectedParagraph.chinese}
                  </p>
                </div>
              </div>

              {/* Grammar */}
              <div>
                <div className="text-sm font-bold text-slate-900 border-l-4 border-yellow-400 pl-3 mb-2">
                  语法结构
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedParagraph.parse.grammar}
                </p>
              </div>

              {/* Collocations */}
              <div>
                <div className="text-sm font-bold text-slate-900 border-l-4 border-pink-400 pl-3 mb-2">
                  固定搭配
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedParagraph.parse.collocations.map((col, i: number) => (
                    <span key={i}>{typeof col === 'string' ? col : col.phrase}</span>
                  ))}
                </div>
              </div>

              {/* Context Analysis */}
              <div>
                <div className="text-sm font-bold text-slate-900 border-l-4 border-sky-300 pl-3 mb-2">
                  语境分析
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedParagraph.parse.contextAnalysis}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-12">
              <MonitorPlay className="w-10 h-10 mb-3 opacity-10" />
              <p className="text-xs">点击字幕旁的"解析"按钮查看句子解析</p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {expressions.length > 0 ? (
              expressions.map((expr, i) => (
                <div
                  key={i}
                  className="p-3 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-pink-400" />
                    <span className="text-base font-bold text-slate-800">{expr.pattern}</span>
                    <span className="text-sm text-slate-500">{expr.meaning}</span>
                  </div>
                  <div className="space-y-1 text-sm pl-4">
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">用法：</span>
                      {expr.usage}
                    </p>
                    {expr.topic && (
                      <p className="text-teal-700 bg-teal-50 p-2 rounded-lg leading-relaxed text-xs">
                        <span className="font-semibold text-teal-900">雅思话题：</span>
                        {expr.topic}
                      </p>
                    )}
                    <p className="text-slate-600 italic bg-slate-50 p-2 rounded-lg mt-2 text-xs">
                      "{expr.example}"
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-300 text-xs italic">
                <p>暂无收录的地道表达</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
