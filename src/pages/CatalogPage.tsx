import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import VideoThumbnail from '../components/video/VideoThumbnail';

interface VideoCard {
  id: string;
  titleEn: string;
  titleZh: string;
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
      {
        id: 'pilot-001',
        titleEn: 'A 450-Square-Foot LA Studio Apartment Tour',
        titleZh: '450平方英尺洛杉矶单间公寓参观',
        duration: 1009,
        progress: 0,
      },
      {
        id: 'video-003',
        titleEn: "Go Inside Lydia Millen's Timeless Country Home",
        titleZh: '走进莉迪亚·米伦的经典乡村住宅',
        duration: 653,
        progress: 0,
      },
      {
        id: 'video-004',
        titleEn: 'Realistic Minimalist Home Tour | Everything We Own',
        titleZh: '真实极简家居参观',
        duration: 532,
        progress: 0,
      },
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

type Filter = '全部' | 'Part 1' | 'Part 2&3';

function partMatch(part: string, filter: Filter): boolean {
  if (filter === '全部') return true;
  if (filter === 'Part 1') return part === 'Part 1';
  if (filter === 'Part 2&3') return part === 'Part 2' || part === 'Part 3';
  return true;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const FILTERS: Filter[] = ['全部', 'Part 1', 'Part 2&3'];

export default function CatalogPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>('全部');

  const filteredCategories = CATEGORIES.filter((c) => partMatch(c.part, activeFilter));

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center">
          <button onClick={() => navigate('/catalog')} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              I
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-xl">言之英语</span>
          </button>
        </div>
      </nav>

      {/* Content Canvas: max-w-6xl, everything left-aligned */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <section className="mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            看真实英语视频，学得分口语表达
          </h1>
          <p className="text-sm text-slate-400">
            地道表达提取 · 动态跟随字幕 · AI 语境解析
          </p>
        </section>

        {/* 体验视频 */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
              免费体验
            </span>
            <h2 className="text-base font-semibold text-slate-900">体验视频</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES[0].videos.map((video) => (
              <button
                key={video.id}
                onClick={() => navigate(`/lesson/${video.id}`)}
                className="text-left group w-full"
              >
                <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 overflow-hidden">
                  <div className="relative">
                    <VideoThumbnail videoId={video.id} />
                    <span className="absolute bottom-1.5 right-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-black/75 text-white tracking-tight">
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                  <div className="px-3 py-2.5">
                    <h3 className="text-[13px] font-semibold text-slate-900 line-clamp-1 mb-0.5">
                      {video.titleZh}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {video.titleEn}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs text-slate-400 font-medium">
              以下内容登录账号后解锁 —— 框架可见，具体视频登录后可学
            </span>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Category Sections */}
        <div className="space-y-10">
          {filteredCategories.map((category) => (
            <section key={category.id}>
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {category.part}
                </span>
                <span className="text-xs text-slate-300">·</span>
                <h2 className="text-base font-semibold text-slate-900">{category.name}</h2>
              </div>

              {/* Video Cards Grid */}
              {category.videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => navigate(`/lesson/${video.id}`)}
                      className="text-left group w-full"
                    >
                      <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 overflow-hidden">
                        <div className="relative">
                          <VideoThumbnail videoId={video.id} />
                          <span className="absolute bottom-1.5 right-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-black/75 text-white tracking-tight">
                            {formatDuration(video.duration)}
                          </span>
                        </div>
                        <div className="px-3 py-2.5">
                          <h3 className="text-[13px] font-semibold text-slate-900 line-clamp-1 mb-0.5">
                            {video.titleZh}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {video.titleEn}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-slate-300">
                  <Play size={28} className="mb-2 opacity-40" />
                  <span className="text-sm font-medium">即将上线</span>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-300 font-light flex items-center gap-3">
            <span>© 2024 言之英语</span>
            <span className="italic">雅思口语视频学习平台</span>
          </div>
          <div className="flex gap-8 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">使用协议</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">隐私政策</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
