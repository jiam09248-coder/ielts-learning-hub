import { useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle2, Circle, Play,
  ChevronRight
} from 'lucide-react';

// ---- Mock Data ----
interface VideoCard {
  id: string;
  title: string;
  duration: number;
  progress: number;
}

interface CategorySection {
  id: string;
  part: string;
  name: string;
  videos: VideoCard[];
}

const CATEGORIES: CategorySection[] = [
  {
    id: 'part1-hometown',
    part: 'Part 1',
    name: 'Hometown',
    videos: [
      { id: 'pilot-001', title: 'Describing Your Hometown', duration: 180, progress: 100 },
      { id: 'p1-002', title: 'What Do You Like About Your City?', duration: 240, progress: 65 },
      { id: 'p1-003', title: 'Changes in Your Hometown', duration: 210, progress: 0 },
    ],
  },
  {
    id: 'part1-study',
    part: 'Part 1',
    name: 'Study & Work',
    videos: [
      { id: 'p1-004', title: 'Talking About Your Studies', duration: 195, progress: 30 },
      { id: 'p1-005', title: 'Your Ideal Job', duration: 225, progress: 0 },
    ],
  },
  {
    id: 'part2-person',
    part: 'Part 2',
    name: 'Describe a Person',
    videos: [
      { id: 'p2-001', title: 'A Person You Admire', duration: 300, progress: 0 },
      { id: 'p2-002', title: 'A Helpful Neighbor', duration: 280, progress: 0 },
      { id: 'p2-003', title: 'A Famous Person You Like', duration: 310, progress: 0 },
    ],
  },
  {
    id: 'part2-place',
    part: 'Part 2',
    name: 'Describe a Place',
    videos: [
      { id: 'p2-004', title: 'A Quiet Place You Enjoy', duration: 290, progress: 0 },
      { id: 'p2-005', title: 'A Beautiful City You Visited', duration: 320, progress: 0 },
    ],
  },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ProgressBadge({ progress }: { progress: number }) {
  if (progress === 100) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
        <CheckCircle2 size={10} />
        已完成
      </span>
    );
  }
  if (progress > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-600 uppercase tracking-wider">
        <Circle size={10} />
        {progress}%
      </span>
    );
  }
  return null;
}

export default function CatalogPage() {
  const navigate = useNavigate();

  const totalVideos = CATEGORIES.reduce((sum, c) => sum + c.videos.length, 0);
  const completedVideos = CATEGORIES.reduce(
    (sum, c) => sum + c.videos.filter((v) => v.progress === 100).length,
    0
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-gradient-to-br from-blue-50 via-white to-cyan-50 antialiased relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="w-full px-8 md:px-12 py-6 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('/catalog')} className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-2xl group-hover:rotate-12 transition-transform duration-300 shadow-sm">
              I
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-2xl">IELTS · Hub</span>
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-6 pt-32 pb-16 w-full">
        {/* Hero Section */}
        <header className="text-center mb-12 space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 pb-2">
            Watch · Learn · Speak
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            IELTS Speaking mastery, from native video models
          </p>
        </header>

        {/* Stats Bar */}
        <div className="flex items-center gap-8 mb-14">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">{totalVideos}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">视频课程</div>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">{completedVideos}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">已完成</div>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">{CATEGORIES.length}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">话题分类</div>
          </div>
        </div>

        {/* Category Sections */}
        <section className="max-w-4xl w-full space-y-10">
          {CATEGORIES.map((category) => {
            const completedCount = category.videos.filter((v) => v.progress === 100).length;
            return (
              <div key={category.id}>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      {category.part}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">{category.name}</h2>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {completedCount}/{category.videos.length} 完成
                  </span>
                </div>

                {/* Video Cards */}
                <div className="space-y-2">
                  {category.videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => navigate(`/lesson/${video.id}`)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200">
                        {/* Thumbnail */}
                        <div className="shrink-0 w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
                          <Play size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                              <Clock size={11} />
                              {formatDuration(video.duration)}
                            </span>
                            <ProgressBadge progress={video.progress} />
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight
                          size={16}
                          className="shrink-0 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Features Legend */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-[11px] font-bold text-slate-300 uppercase tracking-[0.25em]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-teal-500/30 rounded-full"></span>
            <span>双语字幕</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-teal-500/30 rounded-full"></span>
            <span>语法实时解析</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-teal-500/30 rounded-full"></span>
            <span>地道表达库</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[13px] text-slate-300 font-light flex items-center gap-4">
            <span>© 2024 IELTS · Hub</span>
            <span className="italic">雅思口语视频学习平台</span>
          </div>
          <div className="flex gap-10 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="hover:text-teal-500 transition-colors cursor-pointer">使用协议</span>
            <span className="hover:text-teal-500 transition-colors cursor-pointer">隐私政策</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
