import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock, LogIn, LogOut, Play, User, X } from 'lucide-react';
import VideoThumbnail from '../components/video/VideoThumbnail';
import { validatePresetAccount } from '../data/accounts';
import { FREE_VIDEO_IDS, isFreeVideo } from '../data/videoLibrary';
import useIsDesktop from '../hooks/useIsDesktop';
import { clearCurrentUser, getCurrentUser, setCurrentUser as setStoredCurrentUser } from '../utils/storage';
import type { CurrentUser } from '../types/auth';

interface VideoCard {
  id: string;
  titleZh: string;
  description: string;
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
    id: 'part1-home-accommodation',
    part: 'Part 1',
    name: 'Home/accommodation',
    videos: [
      {
        id: 'part1-home-accommodation-001',
        titleZh: '公寓阳台与居住空间样板',
        description: '学习描述住所、最喜欢的家中区域和舒适的居住感受。',
        duration: 227,
        progress: 0,
      },
      {
        id: 'part1-home-accommodation-002',
        titleZh: '房子格局与日常房间介绍',
        description: '学习描述玄关、客厅、餐厨、浴室、卧室和收纳空间。',
        duration: 299,
        progress: 0,
      },
      {
        id: 'part1-home-accommodation-003',
        titleZh: '小户型餐厨客一体与收纳',
        description: '学习表达小空间、收纳、功能性和灵活的居住动线。',
        duration: 223,
        progress: 0,
      },
    ],
  },
  {
    id: 'part1-hometown',
    part: 'Part 1',
    name: 'Hometown',
    videos: [
      {
        id: 'pilot-001',
        titleZh: '450平方英尺洛杉矶单间公寓参观',
        description: '学习描述小空间、居住感受和房间布置。',
        duration: 1009,
        progress: 0,
      },
      {
        id: 'video-003',
        titleZh: '走进莉迪亚·米伦的经典乡村住宅',
        description: '学习描述理想住宅、乡村生活和个人审美。',
        duration: 653,
        progress: 0,
      },
      {
        id: 'video-004',
        titleZh: '真实极简家居参观',
        description: '学习表达生活方式、物品取舍和家的优缺点。',
        duration: 532,
        progress: 0,
      },
    ],
  },
  {
    id: 'part1-study',
    part: 'Part 1',
    name: 'Study & Work',
    videos: [
      {
        id: 'part1-study-work-001',
        titleZh: 'Study or Work 话题 01',
        description: '学习说明专业选择、职业规划和未来方向。',
        duration: 0,
        progress: 0,
      },
    ],
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

function AccountAvatarMenu({
  currentUser,
  onLogout,
  size = 'desktop',
}: {
  currentUser: CurrentUser;
  onLogout: () => void;
  size?: 'desktop' | 'mobile';
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarSize = size === 'desktop' ? 'w-9 h-9' : 'w-10 h-10';

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className={`${avatarSize} rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm`}
        title="账号菜单"
      >
        <User size={size === 'desktop' ? 17 : 18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-lg p-1.5 z-50">
          <div className="px-3 py-2 text-xs font-medium text-slate-400 truncate">
            {currentUser.username}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={15} />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}

function DesktopCatalogNav({
  currentUser,
  onHome,
  onLogin,
  onLogout,
}: {
  currentUser: CurrentUser | null;
  onHome: () => void;
  onLogin: () => void;
  onLogout: () => void;
}) {
  return (
    <nav className="bg-[#f8f5ee]">
      <div className="mx-auto flex max-w-[1328px] items-center justify-between gap-4 px-8 py-5">
        <button onClick={onHome} className="flex items-center gap-3">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[#17453d] text-xl font-bold text-[#fff8e8]">
            I
          </div>
          <span className="text-[22px] font-bold tracking-tight text-[#10201d]">言之英语</span>
        </button>
        {currentUser ? (
          <AccountAvatarMenu currentUser={currentUser} onLogout={onLogout} />
        ) : (
          <button onClick={onLogin} className="inline-flex items-center gap-1.5 rounded-[18px] bg-[#10201d] px-4 py-2.5 text-sm font-bold text-white">
            <LogIn size={15} />
            登录
          </button>
        )}
      </div>
    </nav>
  );
}

function MobileCatalogNav({
  currentUser,
  onHome,
  onLogin,
  onLogout,
}: {
  currentUser: CurrentUser | null;
  onHome: () => void;
  onLogin: () => void;
  onLogout: () => void;
}) {
  return (
    <nav className="bg-[#f8f5ee]">
      <div className="px-4 py-3.5 flex items-center justify-between gap-3">
        <button onClick={onHome} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#17453d] flex items-center justify-center text-[#fff8e8] font-bold text-lg shadow-sm">
            I
          </div>
          <span className="font-bold tracking-tight text-[#10201d] text-[21px]">言之英语</span>
        </button>
        {currentUser ? (
          <AccountAvatarMenu currentUser={currentUser} onLogout={onLogout} size="mobile" />
        ) : (
          <button onClick={onLogin} className="inline-flex items-center gap-1 rounded-[18px] bg-[#10201d] px-3 py-2 text-xs font-semibold text-white shadow-sm">
            <LogIn size={14} />
            登录
          </button>
        )}
      </div>
    </nav>
  );
}

function DesktopVideoCard({ video, locked, onOpen }: { video: VideoCard; locked?: boolean; onOpen: (id: string) => void }) {
  return (
    <button onClick={() => onOpen(video.id)} className="text-left group w-full">
      <div className="h-full overflow-hidden rounded-[14px] bg-white shadow-[0_8px_18px_rgba(30,55,51,0.08)] transition-transform duration-200 group-hover:-translate-y-0.5">
        <div className="relative">
          <div className="[&>div]:aspect-[16/10]">
            <VideoThumbnail videoId={video.id} />
          </div>
          <span className="absolute bottom-2 right-2 inline-flex items-center rounded-[10px] bg-[#10201d]/80 px-2 py-1 text-[11px] font-bold text-white tracking-tight">
            {formatDuration(video.duration)}
          </span>
          {locked && (
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-[10px] bg-white/95 px-2 py-1 text-[11px] font-bold text-[#17453d] shadow-sm">
              <Lock size={12} />
              登录解锁
            </span>
          )}
        </div>
        <div className="flex min-h-[92px] flex-col px-3 py-3">
          <h3 className="mb-1.5 min-h-[38px] text-[15px] font-bold leading-[1.28] text-[#10201d] line-clamp-2">
            {video.titleZh}
          </h3>
          <p className="line-clamp-2 text-[12px] leading-[1.5] text-[#7a8580]">
            {video.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function DesktopFreeCarousel({
  videos,
  onOpen,
}: {
  videos: VideoCard[];
  onOpen: (id: string) => void;
}) {
  const carouselVideos = videos.slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = carouselVideos[activeIndex % Math.max(carouselVideos.length, 1)] ?? carouselVideos[0];

  useEffect(() => {
    if (carouselVideos.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % carouselVideos.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [carouselVideos.length]);

  if (!activeVideo) return null;

  return (
    <section className="mx-auto w-full max-w-[500px] min-w-0">
      <button onClick={() => onOpen(activeVideo.id)} className="block w-full text-left">
        <div className="overflow-hidden rounded-[12px] bg-[#10201d] text-white shadow-[0_8px_18px_rgba(30,55,51,0.08)]">
          <div className="relative [&>div]:aspect-video">
            <VideoThumbnail videoId={activeVideo.id} />
            <span className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-[#f0b86e] px-5 py-3 text-sm font-bold text-[#10201d] shadow-[0_12px_24px_rgba(16,32,29,0.22)]">
              免费体验
              <Play size={18} fill="currentColor" />
            </span>
            <span className="absolute bottom-3 right-3 rounded-[10px] bg-[#10201d]/80 px-2.5 py-1.5 text-[12px] font-bold text-white">
              {formatDuration(activeVideo.duration)}
            </span>
          </div>
          <div className="px-4 py-2.5">
            <h3 className="mb-0.5 text-[16px] font-bold leading-snug">{activeVideo.titleZh}</h3>
            <p className="line-clamp-1 text-[12px] leading-5 text-white/72">{activeVideo.description}</p>
          </div>
        </div>
      </button>

      <div className="mt-3 flex justify-center">
        <div className="flex items-center gap-2">
          {carouselVideos.map((video, index) => (
            <span
              key={video.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-7 bg-[#17453d]' : 'w-2 bg-[#17453d]/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MobileVideoCard({ video, locked, onOpen }: { video: VideoCard; locked?: boolean; onOpen: (id: string) => void }) {
  return (
    <button onClick={() => onOpen(video.id)} className="text-left group w-full">
      <div className="h-full overflow-hidden rounded-[14px] bg-white shadow-[0_8px_18px_rgba(30,55,51,0.08)]">
        <div className="relative">
          <div className="[&>div]:aspect-[16/10]">
            <VideoThumbnail videoId={video.id} />
          </div>
          <span className="absolute bottom-1.5 right-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/75 text-white tracking-tight">
            {formatDuration(video.duration)}
          </span>
          {locked && (
            <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 rounded-[10px] bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-[#17453d] shadow-sm">
              <Lock size={10} />
              解锁
            </span>
          )}
        </div>
        <div className="flex min-h-[88px] flex-col px-2.5 py-2.5">
          <h3 className="mb-1.5 min-h-[36px] text-[14px] font-bold leading-[1.28] text-[#10201d] line-clamp-2">
            {video.titleZh}
          </h3>
          <p className="line-clamp-2 text-[11px] leading-[1.45] text-[#7a8580]">
            {video.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function MobileFeaturedVideoCard({ video, onOpen }: { video: VideoCard; onOpen: (id: string) => void }) {
  return (
    <button onClick={() => onOpen(video.id)} className="text-left w-full">
      <div className="overflow-hidden rounded-[14px] bg-[#10201d] text-white shadow-[0_12px_24px_rgba(30,55,51,0.13)]">
        <div className="relative">
          <VideoThumbnail videoId={video.id} />
          <span className="absolute left-1/2 top-1/2 flex h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f0b86e] text-[#10201d] shadow-[0_10px_22px_rgba(16,32,29,0.22)]">
            <Play size={17} fill="currentColor" />
          </span>
          <span className="absolute bottom-2.5 right-2.5 rounded-[9px] bg-[#10201d]/80 px-2 py-1 text-[11px] font-bold text-white">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="px-3.5 py-2.5">
          <h3 className="mb-1 text-[16px] font-bold leading-snug">{video.titleZh}</h3>
          <p className="line-clamp-1 text-[12px] leading-5 text-white/72">{video.description}</p>
        </div>
      </div>
    </button>
  );
}

function MobileFreeCarousel({ videos, onOpen }: { videos: VideoCard[]; onOpen: (id: string) => void }) {
  const touchStartXRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = videos.length > 0 ? activeIndex % videos.length : 0;
  const activeVideo = videos[safeActiveIndex] ?? videos[0];

  useEffect(() => {
    if (videos.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % videos.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [videos.length]);

  const showPrevious = () => {
    if (videos.length === 0) return;
    setActiveIndex((index) => (index - 1 + videos.length) % videos.length);
  };
  const showNext = () => {
    if (videos.length === 0) return;
    setActiveIndex((index) => (index + 1) % videos.length);
  };
  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (event: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const distance = endX - startX;
    if (Math.abs(distance) < 36) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

  if (!activeVideo) return null;

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div
        className="transition-opacity duration-200"
        key={activeVideo.id}
      >
        <MobileFeaturedVideoCard video={activeVideo} onOpen={onOpen} />
      </div>

      {videos.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`切换到第 ${index + 1} 个免费体验视频`}
              className={`h-1.5 rounded-full transition-all ${
                index === safeActiveIndex ? 'w-5 bg-[#17453d]' : 'w-1.5 bg-[#17453d]/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileZoneHeader({
  label,
  title,
  note,
  tone = 'free',
}: {
  label: string;
  title: string;
  note: string;
  tone?: 'free' | 'formal';
}) {
  return (
    <>
      <span className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${
        tone === 'free'
          ? 'rounded-[10px] bg-[#f0b86e]/25 text-[#8a5a1f]'
          : 'rounded-[10px] bg-[#2f8473]/15 text-[#2f776b]'
      }`}
      >
        {label}
      </span>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[19px] font-bold tracking-tight text-[#10201d]">{title}</h2>
        <span className="shrink-0 text-[12px] font-semibold text-[#7d8984]">{note}</span>
      </div>
    </>
  );
}

function DesktopLoginModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (user: CurrentUser) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入账号和密码');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsLoading(false);

    const normalizedUsername = username.trim().toLowerCase();
    const valid = validatePresetAccount({
      username: normalizedUsername,
      password,
    });

    if (!valid) {
      setError('账号或密码错误');
      return;
    }

    const user = {
      username: normalizedUsername,
      loginAt: Date.now(),
    };
    setStoredCurrentUser(user);
    onSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10201d]/42 px-6 py-8 backdrop-blur-sm">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="关闭登录弹窗" />
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[18px] bg-[#f8f5ee] p-7 shadow-[0_28px_80px_rgba(16,32,29,0.28)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#61706a] shadow-[0_8px_18px_rgba(30,55,51,0.08)]"
          aria-label="关闭"
        >
          <X size={18} />
        </button>

        <span className="inline-flex rounded-[10px] bg-[#2f8473]/15 px-2.5 py-1 text-[12px] font-bold text-[#2f776b]">
          LOGIN
        </span>
        <h2 className="mt-3 text-[28px] font-bold leading-tight text-[#10201d]">登录学习账号</h2>
        <p className="mt-2 text-[14px] font-medium leading-6 text-[#61706a]">
          登录后解锁正式视频，继续学习完整课程。
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#61706a]">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入用户名"
              autoFocus
              autoComplete="username"
              className="w-full rounded-[14px] border border-white bg-white px-4 py-3 text-sm font-semibold text-[#10201d] shadow-[0_8px_18px_rgba(30,55,51,0.06)] outline-none transition focus:ring-2 focus:ring-[#2f8473]/25"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#61706a]">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                className="w-full rounded-[14px] border border-white bg-white px-4 py-3 pr-11 text-sm font-semibold text-[#10201d] shadow-[0_8px_18px_rgba(30,55,51,0.06)] outline-none transition focus:ring-2 focus:ring-[#2f8473]/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8984]"
                tabIndex={-1}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-[12px] border border-[#e3c08b]/40 bg-[#f0b86e]/18 px-3 py-2 text-xs font-bold text-[#8a5a1f]">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-[16px] bg-[#10201d] px-4 py-3 text-sm font-bold text-white transition active:scale-[0.99] disabled:opacity-55"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DesktopEmptyState() {
  return (
    <div className="border border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-slate-300">
      <Play size={28} className="mb-2 opacity-40" />
      <span className="text-sm font-medium">即将上线</span>
    </div>
  );
}

function MobileEmptyState() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#d8ddd8] bg-white/45 px-4 py-4 text-[#b3bdb8]">
      <Play size={18} className="opacity-50" />
      <span className="text-[13px] font-bold">即将上线</span>
    </div>
  );
}

interface CatalogViewProps {
  currentUser: CurrentUser | null;
  activeFilter: Filter;
  activeTopic: string;
  topicOptions: string[];
  freeVideos: VideoCard[];
  filteredCategories: CategorySection[];
  onHome: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onOpenVideo: (id: string) => void;
  onFilterChange: (filter: Filter) => void;
  onTopicChange: (topic: string) => void;
}

function DesktopCatalogView({
  currentUser,
  activeFilter,
  activeTopic,
  topicOptions,
  freeVideos,
  filteredCategories,
  onHome,
  onLogin,
  onLogout,
  onOpenVideo,
  onFilterChange,
  onTopicChange,
}: CatalogViewProps) {
  const displayCategories = useMemo(
    () => activeTopic === '全部主题'
      ? filteredCategories
      : filteredCategories.filter((category) => category.name === activeTopic),
    [activeTopic, filteredCategories],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f5ee] font-sans text-[#10201d] antialiased">
      <DesktopCatalogNav currentUser={currentUser} onHome={onHome} onLogin={onLogin} onLogout={onLogout} />
      <main className="mx-auto max-w-[1328px] px-8 py-7">
        <section className="mb-5 grid grid-cols-[minmax(0,0.9fr)_minmax(440px,0.82fr)] items-center gap-8">
          <div>
            <span className="inline-flex rounded-[10px] bg-[#2f8473]/15 px-2.5 py-1 text-[12px] font-bold text-[#2f776b]">
              IELTS Speaking Lab
            </span>
            <h1 className="mt-4 mb-4 text-[48px] font-bold leading-[1.08] tracking-tight text-[#10201d]">
              看真实英语视频
              <br />
              学得分口语表达
            </h1>
            <p className="max-w-[540px] text-[17px] leading-8 text-[#61706a]">
              地道表达提取、动态跟随字幕、AI 语境解析。先体验免费课程，再决定是否登录学习正式视频。
            </p>
          </div>

          <DesktopFreeCarousel videos={freeVideos} onOpen={onOpenVideo} />
        </section>

        <div className="space-y-8">
          <div className="mb-4">
            <span className="inline-flex rounded-[10px] bg-[#2f8473]/15 px-2.5 py-1 text-[12px] font-bold tracking-wide text-[#2f776b]">
              FULL COURSE
            </span>
            <h2 className="mt-1.5 text-[28px] font-bold leading-tight text-[#10201d]">正式课程</h2>
            {!currentUser && (
              <p className="mt-2 text-[14px] font-medium leading-6 text-[#61706a]">
                以下为正式视频区，可浏览课程框架，登录后解锁完整学习。
              </p>
            )}

            <div className="mt-4 flex items-center gap-2.5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => onFilterChange(f)}
                  className={`rounded-[18px] px-4 py-2 text-sm font-bold transition-colors ${
                    activeFilter === f
                      ? 'bg-[#17453d] text-[#fff8e8] shadow-sm'
                      : 'border border-white bg-white text-[#66716c] shadow-[0_8px_18px_rgba(30,55,51,0.08)]'
                  }`}
                >
                  {f}
                </button>
              ))}
              <label className="relative">
                <select
                  value={activeTopic}
                  onChange={(event) => onTopicChange(event.target.value)}
                  className="appearance-none rounded-[18px] border border-white bg-white py-2 pl-4 pr-9 text-sm font-bold text-[#10201d] shadow-[0_8px_18px_rgba(30,55,51,0.08)] outline-none"
                >
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic}>
                      主题：{topic}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7a8580]">
                  ▾
                </span>
              </label>
            </div>
          </div>

          {displayCategories.map((category) => (
            <section key={category.id}>
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-[#7d8984]">
                  {category.part}
                </span>
                <h3 className="text-[22px] font-bold leading-tight text-[#10201d]">{category.name}</h3>
              </div>

              {category.videos.length > 0 ? (
                <div className="overflow-x-auto pb-2">
                  <div className="grid grid-flow-col auto-cols-[31.5%] gap-4">
                    {category.videos.map((video) => (
                      <DesktopVideoCard key={video.id} video={video} locked={!currentUser} onOpen={onOpenVideo} />
                    ))}
                  </div>
                </div>
              ) : (
                <DesktopEmptyState />
              )}
            </section>
          ))}
        </div>

        <footer className="mt-16 flex items-center justify-between gap-4 border-t border-[#17453d]/10 pt-8">
          <div className="flex items-center gap-3 text-xs font-light text-[#7d8984]">
            <span>© 2024 言之英语</span>
            <span className="italic">雅思口语视频学习平台</span>
          </div>
          <div className="flex gap-8 text-[10px] font-semibold uppercase tracking-widest text-[#7d8984]">
            <span className="cursor-pointer transition-colors hover:text-[#10201d]">使用协议</span>
            <span className="cursor-pointer transition-colors hover:text-[#10201d]">隐私政策</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function MobileCatalogView({
  currentUser,
  activeFilter,
  activeTopic,
  topicOptions,
  freeVideos,
  onHome,
  onLogin,
  onLogout,
  onOpenVideo,
  onFilterChange,
  onTopicChange,
}: CatalogViewProps) {
  const mobileFreeVideos = useMemo(
    () => freeVideos.filter((video) => video.id !== 'pilot-001'),
    [freeVideos],
  );
  const displayCategories = useMemo(
    () => CATEGORIES
      .filter((category) => partMatch(category.part, activeFilter))
      .filter((category) => activeTopic === '全部主题' || category.name === activeTopic)
      .map((category) => {
        const videos = currentUser
          ? category.videos
          : category.videos.filter((video) => !isFreeVideo(video.id) || video.id === 'pilot-001');

        return {
          ...category,
          videos,
          shouldShow: videos.length > 0 || category.videos.length === 0,
        };
      })
      .filter((category) => category.shouldShow),
    [activeFilter, activeTopic, currentUser],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f5ee] font-sans text-[#10201d]">
      <MobileCatalogNav currentUser={currentUser} onHome={onHome} onLogin={onLogin} onLogout={onLogout} />
      <main className="px-4 pt-5 pb-10">
        <section className="mb-5">
          <span className="mb-3 inline-flex rounded-full bg-[#2f8473]/15 px-2.5 py-1 text-[11px] font-bold text-[#2f776b]">
            IELTS Speaking Lab
          </span>
          <h1 className="text-[31px] font-bold text-[#10201d] tracking-tight leading-[1.08] mb-2.5">
            看真实英语视频
            <br />
            学得分口语表达
          </h1>
          <p className="text-[13px] text-[#64716c] leading-6 mb-1">
            地道表达提取 · 动态跟随字幕 · AI 语境解析
          </p>
          {!currentUser && (
            <p className="text-[12px] text-[#7d8984] leading-5">
              先看免费体验视频，再决定是否登录学习正式视频。
            </p>
          )}
        </section>

        {!currentUser && (
          <section className="mb-4 rounded-[20px] bg-white/75 p-3 shadow-[0_14px_28px_rgba(30,55,51,0.08)]">
            <MobileZoneHeader label="FREE TRIAL" title="免费体验视频" note="可直接观看" />
            <MobileFreeCarousel videos={mobileFreeVideos} onOpen={onOpenVideo} />
          </section>
        )}

        {!currentUser && (
          <div className="mx-auto mt-5 inline-flex w-full justify-center">
            <span className="whitespace-nowrap rounded-[14px] bg-[#17453d]/10 px-3.5 py-2 text-center text-[11px] font-bold leading-none text-[#477069]">
              正式视频区：登录后解锁完整学习
            </span>
          </div>
        )}

        <div className="space-y-3 px-0 pb-1 pt-4">
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === f
                    ? 'rounded-[18px] bg-[#17453d] text-[#fff8e8] shadow-sm'
                    : 'rounded-[18px] border border-white bg-white text-[#66716c] shadow-[0_8px_18px_rgba(30,55,51,0.08)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="relative block">
            <select
              value={activeTopic}
              onChange={(event) => onTopicChange(event.target.value)}
              className="w-full appearance-none rounded-[16px] border border-white bg-white px-3.5 py-2.5 pr-9 text-[13px] font-bold text-[#10201d] shadow-[0_8px_18px_rgba(30,55,51,0.08)] outline-none"
            >
              {topicOptions.map((topic) => (
                <option key={topic} value={topic}>
                  主题：{topic}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7a8580]">
              ▾
            </span>
          </label>
        </div>

        <section className="mt-8">
          <span className="mb-1.5 inline-flex rounded-[10px] bg-[#2f8473]/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#2f776b]">
            {currentUser ? 'COURSES' : 'FULL COURSE'}
          </span>
          <h2 className="mb-5 text-[23px] font-bold leading-tight tracking-tight text-[#10201d]">
            {currentUser ? '全部课程' : '正式视频区'}
          </h2>

          <div className="space-y-9">
            {displayCategories.map((category) => (
              <section key={category.id}>
                <div className="mb-3.5 flex items-baseline gap-2">
                  <div className="text-[12px] font-bold text-[#7d8984] uppercase tracking-wide">
                    {category.part}
                  </div>
                  <h3 className="text-[20px] font-bold leading-tight text-[#10201d]">{category.name}</h3>
                </div>

                {category.videos.length > 0 ? (
                  <div className="overflow-x-auto pb-1.5">
                    <div className="grid min-w-[328px] grid-cols-[repeat(2,minmax(158px,1fr))] items-stretch gap-3.5">
                      {category.videos.map((video) => (
                        <MobileVideoCard key={video.id} video={video} locked={!currentUser} onOpen={onOpenVideo} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <MobileEmptyState />
                )}
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [activeFilter, setActiveFilter] = useState<Filter>('全部');
  const [activeTopic, setActiveTopic] = useState('全部主题');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getCurrentUser());
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingVideoId, setPendingVideoId] = useState<string | null>(null);

  const topicOptions = useMemo(
    () => ['全部主题', ...CATEGORIES.map((category) => category.name)],
    [],
  );
  const freeVideos = useMemo(
    () => CATEGORIES.flatMap((category) => category.videos).filter((video) => FREE_VIDEO_IDS.includes(video.id)),
    [],
  );
  const filteredCategories = useMemo(
    () => CATEGORIES
      .filter((c) => partMatch(c.part, activeFilter))
      .filter((category) => currentUser || category.videos.length === 0 || category.videos.some((video) => !isFreeVideo(video.id)))
      .map((category) => ({
        ...category,
        videos: currentUser
          ? category.videos
          : category.videos.filter((video) => !isFreeVideo(video.id)),
      })),
    [activeFilter, currentUser],
  );
  const handleHome = () => navigate('/catalog');
  const handleLogin = () => {
    if (isDesktop) {
      setPendingVideoId(null);
      setLoginModalOpen(true);
      return;
    }

    navigate('/login');
  };
  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };
  const handleOpenVideo = (id: string) => {
    const requiresMobileLogin = !isDesktop && id === 'pilot-001';

    if ((!isFreeVideo(id) || requiresMobileLogin) && !currentUser) {
      if (isDesktop) {
        setPendingVideoId(id);
        setLoginModalOpen(true);
        return;
      }

      navigate('/login', { state: { from: `/lesson/${id}` } });
      return;
    }

    navigate(`/lesson/${id}`);
  };
  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    setLoginModalOpen(false);

    if (pendingVideoId) {
      navigate(`/lesson/${pendingVideoId}`);
      setPendingVideoId(null);
    }
  };
  const handleCloseLoginModal = () => {
    setLoginModalOpen(false);
    setPendingVideoId(null);
  };

  return isDesktop ? (
    <>
      <DesktopCatalogView
        currentUser={currentUser}
        activeFilter={activeFilter}
        activeTopic={activeTopic}
        topicOptions={topicOptions}
        freeVideos={freeVideos}
        filteredCategories={filteredCategories}
        onHome={handleHome}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenVideo={handleOpenVideo}
        onFilterChange={setActiveFilter}
        onTopicChange={setActiveTopic}
      />
      {loginModalOpen && (
        <DesktopLoginModal
          onClose={handleCloseLoginModal}
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  ) : (
    <MobileCatalogView
      currentUser={currentUser}
      activeFilter={activeFilter}
      activeTopic={activeTopic}
      topicOptions={topicOptions}
      freeVideos={freeVideos}
      filteredCategories={filteredCategories}
      onHome={handleHome}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onOpenVideo={handleOpenVideo}
      onFilterChange={setActiveFilter}
      onTopicChange={setActiveTopic}
    />
  );
}
