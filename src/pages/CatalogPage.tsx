import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  LogOut,
  Menu,
  Play,
  Search,
  User,
  X,
} from 'lucide-react';
import VideoThumbnail from '../components/video/VideoThumbnail';
import { validatePresetAccount } from '../data/accounts';
import { CONTENT_MANIFEST } from '../data/contentManifest';
import { getThumbnailUrl } from '../data/videoUrlMap';
import { FREE_VIDEO_IDS, isFreeVideo } from '../data/videoLibrary';
import { TOPIC_COUNT, TOPIC_TAXONOMY } from '../data/topicTaxonomy';
import { clearCurrentUser, getCurrentUser, setCurrentUser as setStoredCurrentUser } from '../utils/storage';
import type { CurrentUser } from '../types/auth';

interface CatalogVideo {
  id: string;
  parts: Array<'Part 1' | 'Part 2' | 'Part 3'>;
  abilityTags: string[];
  themeId: string;
  topic: string;
  titleZh: string;
  description: string;
  duration: number;
}

const VIDEOS: CatalogVideo[] = CONTENT_MANIFEST.map((entry) => ({
  id: entry.id,
  parts: entry.parts,
  abilityTags: entry.abilityTags,
  themeId: entry.themeId,
  topic: entry.topic,
  titleZh: entry.titleZh,
  description: entry.description,
  duration: entry.duration,
}));

interface SearchSuggestion {
  type: '主题' | '话题';
  value: string;
  themeId: string;
  themeName: string;
}

const SEARCH_OPTIONS: SearchSuggestion[] = TOPIC_TAXONOMY.flatMap((theme) => [
  { type: '主题', value: theme.name, themeId: theme.id, themeName: theme.name } as SearchSuggestion,
  ...theme.topics.map((topic) => ({
    type: '话题' as const,
    value: topic,
    themeId: theme.id,
    themeName: theme.name,
  })),
]);

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

function getTopicAnchorId(themeId: string, topic: string): string {
  const theme = TOPIC_TAXONOMY.find((item) => item.id === themeId);
  return `topic-${themeId}-${Math.max(theme?.topics.indexOf(topic) ?? 0, 0)}`;
}

function DesktopFreeCarousel({
  videos,
  onOpen,
}: {
  videos: CatalogVideo[];
  onOpen: (id: string) => void;
}) {
  const carouselVideos = videos.slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = carouselVideos[activeIndex % Math.max(carouselVideos.length, 1)] ?? carouselVideos[0];

  useEffect(() => {
    if (carouselVideos.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % carouselVideos.length);
    }, 3000);
    return () => window.clearInterval(timer);
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
            <button
              key={video.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`切换到第 ${index + 1} 个免费体验视频`}
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

function MobileFreeCarousel({
  videos,
  onOpen,
}: {
  videos: CatalogVideo[];
  onOpen: (id: string) => void;
}) {
  const touchStartXRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = videos.length > 0 ? activeIndex % videos.length : 0;
  const activeVideo = videos[safeActiveIndex] ?? videos[0];

  useEffect(() => {
    if (videos.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % videos.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [videos.length]);

  useEffect(() => {
    videos.forEach((video) => {
      const thumbnailUrl = getThumbnailUrl(video.id);
      if (!thumbnailUrl) return;
      const image = new Image();
      image.decoding = 'async';
      image.src = thumbnailUrl;
    });
  }, [videos]);

  if (!activeVideo) return null;

  const showPrevious = () => setActiveIndex((index) => (index - 1 + videos.length) % videos.length);
  const showNext = () => setActiveIndex((index) => (index + 1) % videos.length);

  return (
    <div
      onTouchStart={(event) => {
        touchStartXRef.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartXRef.current;
        touchStartXRef.current = null;
        if (startX === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? startX) - startX;
        if (Math.abs(distance) < 36) return;
        if (distance > 0) showPrevious();
        else showNext();
      }}
    >
      <button onClick={() => onOpen(activeVideo.id)} className="w-full text-left">
        <div className="overflow-hidden rounded-[14px] bg-[#10201d] text-white shadow-[0_12px_24px_rgba(30,55,51,0.13)]">
          <div className="relative">
            <VideoThumbnail videoId={activeVideo.id} />
            <span className="absolute left-1/2 top-1/2 flex h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f0b86e] text-[#10201d] shadow-[0_10px_22px_rgba(16,32,29,0.22)]">
              <Play size={17} fill="currentColor" />
            </span>
            <span className="absolute bottom-2.5 right-2.5 rounded-[9px] bg-[#10201d]/80 px-2 py-1 text-[11px] font-bold text-white">
              {formatDuration(activeVideo.duration)}
            </span>
          </div>
          <div className="px-3.5 py-2.5">
            <h3 className="mb-1 text-[16px] font-bold leading-snug">{activeVideo.titleZh}</h3>
            <p className="line-clamp-1 text-[12px] leading-5 text-white/72">{activeVideo.description}</p>
          </div>
        </div>
      </button>
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

function AccountMenu({ currentUser, onLogout }: { currentUser: CurrentUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#163f38] text-white"
        aria-label="打开账号菜单"
      >
        <User size={17} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-2xl border border-[#163f38]/10 bg-white p-2 shadow-xl">
          <div className="truncate px-3 py-2 text-xs font-semibold text-[#78837e]">{currentUser.username}</div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#46534e] hover:bg-[#f3f1ea]"
          >
            <LogOut size={15} />退出登录
          </button>
        </div>
      )}
    </div>
  );
}

function LoginModal({
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

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();
    if (!validatePresetAccount({ username: normalizedUsername, password })) {
      setError('账号或密码错误');
      return;
    }
    const user = { username: normalizedUsername, loginAt: Date.now() };
    setStoredCurrentUser(user);
    onSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10201d]/45 px-5 backdrop-blur-sm">
      <button className="absolute inset-0" onClick={onClose} aria-label="关闭登录弹窗" />
      <div className="relative w-full max-w-[410px] rounded-[24px] bg-[#f8f5ee] p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#61706a]"
          aria-label="关闭"
        >
          <X size={18} />
        </button>
        <span className="text-xs font-extrabold tracking-[0.16em] text-[#2f776b]">LOGIN</span>
        <h2 className="mt-2 text-2xl font-bold text-[#10201d]">登录学习账号</h2>
        <p className="mt-2 text-sm leading-6 text-[#68756f]">登录后即可打开全部正式视频。</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#68756f]">用户名</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoFocus
              autoComplete="username"
              className="w-full rounded-2xl border border-[#163f38]/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2f8473]/25"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#68756f]">密码</span>
            <span className="relative block">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full rounded-2xl border border-[#163f38]/10 bg-white px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-[#2f8473]/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78837e]"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-[#f0b86e]/20 px-3 py-2 text-xs font-bold text-[#8a5a1f]">
              <AlertCircle size={14} />{error}
            </div>
          )}
          <button className="w-full rounded-2xl bg-[#163f38] px-4 py-3 text-sm font-bold text-white">登录</button>
        </form>
      </div>
    </div>
  );
}

function VideoCard({
  video,
  locked,
  onOpen,
}: {
  video: CatalogVideo;
  locked: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <button onClick={() => onOpen(video.id)} className="group w-full text-left">
      <article className="h-full overflow-hidden rounded-[18px] bg-white shadow-[0_10px_28px_rgba(30,55,51,0.08)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_16px_36px_rgba(30,55,51,0.12)]">
        <div className="relative">
          <div className="[&>div]:aspect-[16/10]"><VideoThumbnail videoId={video.id} /></div>
          <span className="absolute left-2.5 top-2.5 flex gap-1">
            {video.parts.map((part) => (
              <span key={part} className="rounded-full bg-[#f8f5ee]/95 px-2.5 py-1 text-[10px] font-extrabold text-[#17453d] shadow-sm">
                {part}
              </span>
            ))}
          </span>
          {locked && (
            <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#10201d]/85 px-2.5 py-1 text-[10px] font-bold text-white">
              <Lock size={10} />登录解锁
            </span>
          )}
          <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-[#10201d]/82 px-2 py-1 text-[10px] font-bold text-white">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="p-4">
          <h4 className="line-clamp-2 text-[15px] font-bold leading-[1.4] text-[#10201d]">{video.titleZh}</h4>
          <dl className="mt-3 space-y-2 text-xs leading-5">
            <div className="flex gap-2">
              <dt className="shrink-0 font-bold text-[#78837e]">适用 Part</dt>
              <dd className="font-semibold text-[#33443e]">{video.parts.join(' / ')}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 font-bold text-[#78837e]">能力标签</dt>
              <dd className="flex flex-wrap gap-1.5">
                {video.abilityTags.map((tag) => (
                  <span key={tag} className="rounded-md bg-[#eaf2ee] px-1.5 py-0.5 font-semibold text-[#2f776b]">{tag}</span>
                ))}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 font-bold text-[#78837e]">内容简介</dt>
              <dd className="line-clamp-3 text-[#66736d]">{video.description}</dd>
            </div>
          </dl>
        </div>
      </article>
    </button>
  );
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getCurrentUser());
  const [selectedThemeId, setSelectedThemeId] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedThemeIds, setExpandedThemeIds] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedParts, setSelectedParts] = useState<Array<'Part 1' | 'Part 2' | 'Part 3'>>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingVideoId, setPendingVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    return SEARCH_OPTIONS
      .filter((option) => option.value.toLocaleLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        const aStarts = a.value.toLocaleLowerCase().startsWith(normalizedQuery) ? 0 : 1;
        const bStarts = b.value.toLocaleLowerCase().startsWith(normalizedQuery) ? 0 : 1;
        return aStarts - bStarts || a.value.localeCompare(b.value, 'zh-CN');
      })
      .slice(0, 8);
  }, [normalizedQuery]);

  const visibleThemes = useMemo(() => {
    return TOPIC_TAXONOMY
      .map((theme) => {
        const themeMatches = normalizedQuery
          ? `${theme.name} ${theme.shortName}`.toLocaleLowerCase().includes(normalizedQuery)
          : false;
        const topics = theme.topics
          .map((topic) => {
            const allVideos = VIDEOS.filter((video) => video.themeId === theme.id && video.topic === topic);
            const videos = allVideos.filter(
              (video) => selectedParts.length === 0 || selectedParts.some((part) => video.parts.includes(part)),
            );
            const topicMatches = topic.toLocaleLowerCase().includes(normalizedQuery);
            return {
              name: topic,
              videos,
              matches: !normalizedQuery || themeMatches || topicMatches,
            };
          })
          .filter((topic) => topic.matches);
        return { ...theme, topics };
      })
      .filter((theme) => theme.topics.length > 0);
  }, [normalizedQuery, selectedParts]);

  const resultTopicCount = visibleThemes.reduce((count, theme) => count + theme.topics.length, 0);
  const resultVideoCount = visibleThemes.reduce(
    (count, theme) => count + theme.topics.reduce((sum, topic) => sum + topic.videos.length, 0),
    0,
  );

  const chooseTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    setSelectedTopic(null);
    setQuery('');
    window.setTimeout(() => {
      document
        .getElementById(themeId === 'all' ? 'formal-course' : `theme-${themeId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const chooseTopic = (themeId: string, topic: string) => {
    setSelectedThemeId(themeId);
    setSelectedTopic(topic);
    setQuery('');
    window.setTimeout(() => {
      document
        .getElementById(getTopicAnchorId(themeId, topic))
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const toggleThemeExpansion = (themeId: string) => {
    setExpandedThemeIds((current) => {
      const next = new Set(current);
      if (next.has(themeId)) next.delete(themeId);
      else next.add(themeId);
      return next;
    });
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    setSelectedThemeId(suggestion.themeId);
    setSelectedTopic(suggestion.type === '话题' ? suggestion.value : null);
    setExpandedThemeIds((current) => new Set(current).add(suggestion.themeId));
    setSearchFocused(false);
  };

  const togglePart = (part: 'Part 1' | 'Part 2' | 'Part 3') => {
    setSelectedParts((current) => (
      current.includes(part) ? current.filter((item) => item !== part) : [...current, part]
    ));
  };

  const openVideo = (id: string) => {
    if (!isFreeVideo(id) && !currentUser) {
      setPendingVideoId(id);
      setLoginModalOpen(true);
      return;
    }
    navigate(`/lesson/${id}`);
  };

  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  const loginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    setLoginModalOpen(false);
    if (pendingVideoId) navigate(`/lesson/${pendingVideoId}`);
    setPendingVideoId(null);
  };

  return (
    <div className="min-h-screen bg-[#f8f5ee] text-[#10201d]">
      <header className="sticky top-0 z-40 border-b border-[#163f38]/8 bg-[#f8f5ee]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-3.5 sm:px-8">
          <button onClick={() => navigate('/catalog')} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#17453d] text-lg font-extrabold text-[#fff8e8]">I</span>
            <span className="text-xl font-bold tracking-tight">言之英语</span>
          </button>
          {currentUser ? (
            <AccountMenu currentUser={currentUser} onLogout={logout} />
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#10201d] px-4 py-2.5 text-xs font-bold text-white"
            >
              <LogIn size={14} />登录
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="border-b border-[#163f38]/8">
          <div className="mx-auto max-w-[1328px] px-4 py-6 sm:px-8 sm:py-8">
            <div className="hidden items-center gap-8 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(440px,0.82fr)]">
              <div>
                <span className="inline-flex rounded-[10px] bg-[#2f8473]/15 px-2.5 py-1 text-[12px] font-bold text-[#2f776b]">
                  IELTS Speaking Lab
                </span>
                <h1 className="mb-4 mt-4 text-[48px] font-bold leading-[1.08] tracking-tight text-[#10201d]">
                  看真实英语视频
                  <br />
                  学得分口语表达
                </h1>
                <p className="max-w-[540px] text-[17px] leading-8 text-[#61706a]">
                  重点表达提取、动态跟随字幕、AI 语境解析。先体验免费内容，再决定是否登录查看正式视频。
                </p>
              </div>
              <DesktopFreeCarousel videos={VIDEOS.filter((video) => FREE_VIDEO_IDS.includes(video.id))} onOpen={openVideo} />
            </div>

            <div className="lg:hidden">
              <span className="mb-3 inline-flex rounded-full bg-[#2f8473]/15 px-2.5 py-1 text-[11px] font-bold text-[#2f776b]">
                IELTS Speaking Lab
              </span>
              <h1 className="mb-2.5 text-[31px] font-bold leading-[1.08] tracking-tight text-[#10201d]">
                看真实英语视频
                <br />
                学得分口语表达
              </h1>
              <p className="mb-4 text-[13px] leading-6 text-[#64716c]">
                重点表达提取 · 动态跟随字幕 · AI 语境解析
              </p>
              <section className="rounded-[20px] bg-white/75 p-3 shadow-[0_14px_28px_rgba(30,55,51,0.08)]">
                <span className="mb-2 inline-flex rounded-[10px] bg-[#f0b86e]/25 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#8a5a1f]">
                  FREE TRIAL
                </span>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 className="text-[19px] font-bold tracking-tight">免费体验视频</h2>
                  <span className="shrink-0 text-[12px] font-semibold text-[#7d8984]">可直接观看</span>
                </div>
                <MobileFreeCarousel videos={VIDEOS.filter((video) => FREE_VIDEO_IDS.includes(video.id))} onOpen={openVideo} />
              </section>
            </div>
          </div>
        </section>

        <section id="formal-course" className="mx-auto max-w-[1360px] px-4 py-8 sm:px-8 sm:py-11">
          <div className="mb-7 hidden lg:block">
            <span className="inline-flex rounded-[10px] bg-[#2f8473]/15 px-2.5 py-1 text-[12px] font-bold tracking-wide text-[#2f776b]">
              FULL COURSE
            </span>
            <h2 className="mt-1.5 text-[28px] font-bold leading-tight">正式视频</h2>
            <p className="mt-2 text-sm leading-6 text-[#68756f]">
              按主题和话题查找课程；Part 仅作为视频标签和辅助筛选。
            </p>
          </div>

          <div className="sticky top-[68px] z-30 -mx-4 mb-5 border-y border-[#17453d]/8 bg-[#f8f5ee]/95 px-4 py-3 shadow-[0_8px_20px_rgba(30,55,51,0.06)] backdrop-blur-xl sm:-mx-8 sm:px-8 lg:hidden">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="inline-flex rounded-lg bg-[#2f8473]/15 px-2 py-1 text-[10px] font-extrabold tracking-wide text-[#2f776b]">
                FULL COURSE
              </span>
              <h2 className="text-[21px] font-bold leading-none">正式视频</h2>
            </div>
            <div className="flex items-start gap-2">
              <div className="relative min-w-0 flex-1">
                <label className="relative block">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2f776b]" size={18} />
                  <input
                    value={query}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSelectedThemeId('all');
                      setSelectedTopic(null);
                    }}
                    placeholder="搜索主题或话题"
                    autoComplete="off"
                    className="h-[46px] w-full rounded-[15px] border border-[#163f38]/10 bg-white pl-10 pr-10 text-sm font-semibold shadow-[0_7px_18px_rgba(30,55,51,0.07)] outline-none placeholder:font-normal placeholder:text-[#9aa39f] focus:ring-2 focus:ring-[#2f8473]/20"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78837e]"
                      aria-label="清空搜索"
                    >
                      <X size={16} />
                    </button>
                  )}
                </label>
                {searchFocused && normalizedQuery && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[44vh] overflow-y-auto rounded-2xl border border-[#163f38]/10 bg-white p-1.5 shadow-[0_18px_45px_rgba(30,55,51,0.18)]">
                    {suggestions.length > 0 ? suggestions.map((suggestion) => (
                      <button
                        key={`mobile-${suggestion.type}-${suggestion.themeId}-${suggestion.value}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectSuggestion(suggestion)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left hover:bg-[#f3f6f3]"
                      >
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                          suggestion.type === '主题' ? 'bg-[#17453d] text-white' : 'bg-[#2f8473]/12 text-[#2f776b]'
                        }`}>
                          {suggestion.type}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#263a34]">{suggestion.value}</span>
                        {suggestion.type === '话题' && (
                          <span className="max-w-[34%] truncate text-[10px] text-[#89938e]">{suggestion.themeName}</span>
                        )}
                      </button>
                    )) : (
                      <div className="px-3 py-5 text-center text-sm text-[#89938e]">没有匹配的主题或话题</div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setMobileNavOpen(true)}
                className="flex h-[46px] shrink-0 items-center gap-1.5 rounded-[15px] bg-[#17453d] px-3.5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(23,69,61,0.18)]"
                aria-haspopup="dialog"
              >
                <Menu size={17} />
                目录
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-[#17453d]/8 pt-3" aria-label="移动端 Part 多选筛选">
              <span className="shrink-0 text-[11px] font-bold text-[#68756f]">适用 Part（可多选）</span>
              <div className="flex min-w-0 flex-1 gap-1.5">
                {(['Part 1', 'Part 2', 'Part 3'] as const).map((part) => (
                  <button
                    key={`mobile-${part}`}
                    onClick={() => togglePart(part)}
                    aria-pressed={selectedParts.includes(part)}
                    className={`min-w-0 flex-1 rounded-full border px-1.5 py-2 text-[11px] font-bold transition ${
                      selectedParts.includes(part)
                        ? 'border-[#17453d] bg-[#17453d] text-white'
                        : 'border-[#17453d]/12 bg-white text-[#52605a]'
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>
              {selectedParts.length > 0 && (
                <button
                  onClick={() => setSelectedParts([])}
                  className="shrink-0 text-[11px] font-bold text-[#2f776b]"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          <div className="mb-8 hidden items-start gap-4 lg:grid lg:grid-cols-[minmax(0,620px)_1fr]">
            <div className="relative z-30">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2f776b]" size={19} />
                <input
                  value={query}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedThemeId('all');
                    setSelectedTopic(null);
                  }}
                  placeholder="搜索主题或话题"
                  autoComplete="off"
                  className="w-full rounded-[18px] border border-[#163f38]/10 bg-white py-3.5 pl-11 pr-11 text-sm font-semibold shadow-[0_10px_24px_rgba(30,55,51,0.07)] outline-none placeholder:font-normal placeholder:text-[#9aa39f] focus:ring-2 focus:ring-[#2f8473]/20"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#78837e]"
                    aria-label="清空搜索"
                  >
                    <X size={17} />
                  </button>
                )}
              </label>
              {searchFocused && normalizedQuery && (
                <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-[#163f38]/10 bg-white p-1.5 shadow-[0_18px_45px_rgba(30,55,51,0.16)]">
                  {suggestions.length > 0 ? suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.type}-${suggestion.themeId}-${suggestion.value}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSuggestion(suggestion)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#f3f6f3]"
                    >
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                        suggestion.type === '主题' ? 'bg-[#17453d] text-white' : 'bg-[#2f8473]/12 text-[#2f776b]'
                      }`}>
                        {suggestion.type}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#263a34]">{suggestion.value}</span>
                      {suggestion.type === '话题' && (
                        <span className="max-w-[42%] truncate text-[11px] text-[#89938e]">{suggestion.themeName}</span>
                      )}
                    </button>
                  )) : (
                    <div className="px-4 py-5 text-center text-sm text-[#89938e]">没有匹配的主题或话题</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2" aria-label="Part 多选筛选">
              <span className="mr-1 text-xs font-bold text-[#68756f]">适用 Part（可多选）</span>
              {(['Part 1', 'Part 2', 'Part 3'] as const).map((part) => (
                <button
                  key={part}
                  onClick={() => togglePart(part)}
                  aria-pressed={selectedParts.includes(part)}
                  className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                    selectedParts.includes(part)
                      ? 'border-[#17453d] bg-[#17453d] text-white'
                      : 'border-[#17453d]/12 bg-white text-[#52605a]'
                  }`}
                >
                  {part}
                </button>
              ))}
              {selectedParts.length > 0 && (
                <button onClick={() => setSelectedParts([])} className="px-2 py-2 text-xs font-bold text-[#2f776b]">清除</button>
              )}
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between text-xs font-semibold text-[#78837e]">
            <span>10 个主题 · {TOPIC_COUNT} 个话题</span>
            {(normalizedQuery || selectedParts.length > 0) && (
              <span>当前显示 {resultTopicCount} 个话题 · {resultVideoCount} 个视频</span>
            )}
          </div>

          {mobileNavOpen && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="分类导航">
              <button
                className="absolute inset-0 animate-fade-in bg-[#10201d]/45 backdrop-blur-sm"
                onClick={() => setMobileNavOpen(false)}
                aria-label="关闭分类导航"
              />
              <aside className="animate-sheet-in absolute inset-x-0 bottom-0 flex h-[72dvh] min-h-[420px] flex-col rounded-t-[28px] bg-[#f8f5ee] shadow-2xl">
                <div className="pt-2.5">
                  <div className="mx-auto h-1 w-10 rounded-full bg-[#17453d]/18" />
                </div>
                <div className="flex items-center justify-between border-b border-[#17453d]/8 px-5 pb-3.5 pt-2">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#89938e]">COURSE CATALOG</p>
                    <h3 className="mt-0.5 text-lg font-bold text-[#10201d]">目录</h3>
                  </div>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#66736d]"
                    aria-label="关闭"
                  >
                    <X size={18} />
                  </button>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="移动端主题与话题分类">
                  <button
                    onClick={() => {
                      chooseTheme('all');
                      setMobileNavOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold ${
                      selectedThemeId === 'all' && !selectedTopic ? 'bg-[#17453d] text-white' : 'text-[#52605a] hover:bg-white'
                    }`}
                  >
                    <span>全部主题</span><span className="text-xs opacity-60">{TOPIC_COUNT}</span>
                  </button>
                  {TOPIC_TAXONOMY.map((theme, index) => {
                    const expanded = expandedThemeIds.has(theme.id);
                    const themeActive = selectedThemeId === theme.id;
                    return (
                      <div key={theme.id}>
                        <button
                          onClick={() => toggleThemeExpansion(theme.id)}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-left text-sm font-bold ${
                            themeActive ? 'bg-[#e8f0ec] text-[#17453d]' : 'text-[#52605a] hover:bg-white'
                          }`}
                          aria-label={`${expanded ? '收起' : '展开'}${theme.name}的话题`}
                          aria-expanded={expanded}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#17453d]/8 text-[10px] text-[#2f776b]">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="min-w-0 flex-1">{theme.name}</span>
                          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        {expanded && (
                          <div className="ml-[26px] border-l border-[#17453d]/12 py-1 pl-4">
                            {theme.topics.map((topic) => (
                              <button
                                key={topic}
                                onClick={() => {
                                  chooseTopic(theme.id, topic);
                                  setMobileNavOpen(false);
                                }}
                                className={`block w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold leading-5 ${
                                  themeActive && selectedTopic === topic
                                    ? 'bg-[#17453d] text-white'
                                    : 'text-[#69766f] hover:bg-white hover:text-[#17453d]'
                                }`}
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </aside>
            </div>
          )}

          <div className="grid items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="hidden rounded-[22px] border border-[#17453d]/8 bg-white/65 p-2.5 lg:sticky lg:top-[88px] lg:block">
              <p className="mb-2 px-3 pt-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#89938e]">
                分类导航
              </p>
              <nav className="space-y-1" aria-label="主题与话题分类">
                <button
                  onClick={() => chooseTheme('all')}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold ${
                    selectedThemeId === 'all' && !selectedTopic ? 'bg-[#17453d] text-white' : 'text-[#52605a] hover:bg-[#f3f6f3]'
                  }`}
                >
                  <span>全部主题</span><span className="text-xs opacity-60">{TOPIC_COUNT}</span>
                </button>
                {TOPIC_TAXONOMY.map((theme, index) => {
                  const expanded = expandedThemeIds.has(theme.id);
                  const themeActive = selectedThemeId === theme.id;
                  return (
                    <div key={theme.id}>
                      <button
                        onClick={() => {
                          toggleThemeExpansion(theme.id);
                          chooseTheme(theme.id);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold ${
                          themeActive ? 'bg-[#e8f0ec] text-[#17453d]' : 'text-[#52605a] hover:bg-[#f3f6f3]'
                        }`}
                        aria-label={`${expanded ? '收起' : '展开'}${theme.name}的话题并定位到该主题`}
                        aria-expanded={expanded}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#17453d]/8 text-[10px] text-[#2f776b]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1">{theme.name}</span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#718079]">
                          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </span>
                      </button>
                      {expanded && (
                        <div className="ml-[23px] border-l border-[#17453d]/12 py-1 pl-4">
                          {theme.topics.map((topic) => (
                            <button
                              key={topic}
                              onClick={() => chooseTopic(theme.id, topic)}
                              className={`block w-full rounded-lg px-2.5 py-2 text-left text-[12px] font-semibold leading-4 ${
                                themeActive && selectedTopic === topic
                                  ? 'bg-[#17453d] text-white'
                                  : 'text-[#69766f] hover:bg-[#f3f6f3] hover:text-[#17453d]'
                              }`}
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </aside>

            <div className="min-w-0">
              {visibleThemes.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#17453d]/20 bg-white/45 px-6 py-16 text-center">
                  <Search className="mx-auto text-[#9aa39f]" size={28} />
                  <h2 className="mt-4 text-lg font-bold">没有找到相关话题</h2>
                  <p className="mt-2 text-sm text-[#78837e]">换一个关键词，或清空搜索后浏览全部分类。</p>
                  <button onClick={() => setQuery('')} className="mt-5 rounded-full bg-[#17453d] px-5 py-2.5 text-sm font-bold text-white">清空搜索</button>
                </div>
              ) : (
                <div className="space-y-12">
                  {visibleThemes.map((theme) => {
                    const themeIndex = TOPIC_TAXONOMY.findIndex((item) => item.id === theme.id);
                    return (
                      <section id={`theme-${theme.id}`} key={theme.id} className="relative scroll-mt-[240px] lg:scroll-mt-20">
                        <div className="sticky top-[232px] z-20 -mx-2 mb-5 flex items-start gap-4 border-b border-[#17453d]/8 bg-[#f8f5ee]/95 px-2 py-3 backdrop-blur-lg lg:top-[65px]">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#17453d] text-xs font-extrabold text-white">
                              {String(themeIndex + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h2 className="text-[22px] font-bold tracking-tight sm:text-[27px]">{theme.name}</h2>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-7">
                          {theme.topics.map((topic) => (
                            <section id={getTopicAnchorId(theme.id, topic.name)} key={topic.name} className="scroll-mt-[304px] lg:scroll-mt-28">
                              <div className="mb-3 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2f8473]/12 text-[#2f776b]">
                                  <BookOpen size={15} />
                                </span>
                                <div>
                                  <h3 className="text-[18px] font-bold sm:text-[20px]">{topic.name}</h3>
                                </div>
                                <span className="ml-auto rounded-full bg-[#17453d]/7 px-2.5 py-1 text-[10px] font-bold text-[#57716b]">
                                  {topic.videos.length > 0 ? `${topic.videos.length} 个视频` : '内容筹备中'}
                                </span>
                              </div>
                              {topic.videos.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                  {topic.videos.map((video) => (
                                    <VideoCard
                                      key={video.id}
                                      video={video}
                                      locked={!currentUser && !isFreeVideo(video.id)}
                                      onOpen={openVideo}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 rounded-2xl border border-dashed border-[#17453d]/14 bg-white/35 px-4 py-3 text-xs font-semibold text-[#99a29e]">
                                  <Play size={13} />该话题视频正在准备中
                                </div>
                              )}
                            </section>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#17453d]/8 px-4 py-8 text-center text-xs text-[#89938e]">
        © 2026 言之英语 · 雅思口语视频学习平台
      </footer>

      {loginModalOpen && (
        <LoginModal
          onClose={() => {
            setLoginModalOpen(false);
            setPendingVideoId(null);
          }}
          onSuccess={loginSuccess}
        />
      )}
    </div>
  );
}
