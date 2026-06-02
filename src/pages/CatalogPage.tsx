import { useNavigate } from 'react-router-dom';
import {
  Clock, Play
} from 'lucide-react';

// ---- Mock Data ----
interface VideoCard {
  id: string;
  title: string;
  duration: number;
  progress: number;
  thumbnail?: string;
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
      { id: 'pilot-001', title: 'A 450-Square-Foot LA Studio Apartment Tour', duration: 1009, progress: 0, thumbnail: '/thumbnails/video-001.jpg' },
      { id: 'video-003', title: "Go Inside Lydia Millen's Timeless Country Home", duration: 653, progress: 0, thumbnail: '/thumbnails/video-003.jpg' },
    ],
  },
  {
    id: 'part1-study',
    part: 'Part 1',
    name: 'Study & Work',
    videos: [],
  },
  {
    id: 'part2-person',
    part: 'Part 2',
    name: 'Describe a Person',
    videos: [],
  },
  {
    id: 'part2-place',
    part: 'Part 2',
    name: 'Describe a Place',
    videos: [],
  },
  {
    id: 'part2-event',
    part: 'Part 2',
    name: 'Describe an Event',
    videos: [],
  },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
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
            IELTS Speaking mastery, one real conversation at a time
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

                {/* Video Cards — Grid */}
                {category.videos.length === 0 ? (
                  <p className="text-xs text-slate-300 italic py-4">即将上线</p>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                  {category.videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => navigate(`/lesson/${video.id}`)}
                      className="text-left group w-full"
                    >
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 overflow-hidden p-4">
                        {/* Cover / Thumbnail — 16:9 */}
                        <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden mb-3">
                          {video.thumbnail ? (
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            <Play size={36} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                          )}
                        </div>
                        {/* Info */}
                        <div className="px-1">
                          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2.5">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                              <Clock size={11} />
                              {formatDuration(video.duration)}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-600">{formatDuration(video.duration)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                )}
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
