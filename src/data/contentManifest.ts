import type { VideoContent } from '../types/video';

export type ContentAccess = 'free' | 'paid';

export interface ContentManifestEntry {
  id: string;
  part: 'Part 1' | 'Part 2' | 'Part 3';
  category: string;
  titleZh: string;
  description: string;
  access: ContentAccess;
  duration: number;
  loadContent: () => Promise<VideoContent>;
  videoFile: string;
  videoEnvKey: string;
}

/**
 * Single source for catalog metadata, access level, content and video filename.
 * The access value is a UI rule only; paid content still needs server-side auth.
 */
export const CONTENT_MANIFEST: ContentManifestEntry[] = [
  {
    id: 'part1-home-accommodation-001',
    part: 'Part 1',
    category: 'Home/accommodation',
    titleZh: '阳台与居住空间：描述住所和舒适感',
    description: '从阳台、植物和家具入手，学习描述家中最喜欢的区域、日常活动和居住感受。',
    access: 'free',
    duration: 227,
    loadContent: async () => (await import('./part1-home-accommodation-001')).videoData,
    videoFile: 'part1-home-accommodation-001.mp4',
    videoEnvKey: 'VITE_VIDEO_PART1_HOME_ACCOMMODATION_001_URL',
  },
  {
    id: 'part1-home-accommodation-002',
    part: 'Part 1',
    category: 'Home/accommodation',
    titleZh: 'House tour：房间布局与日常用途',
    description: '通过一段完整 house tour，学习描述房间布局、开放式空间和各个房间的日常用途。',
    access: 'free',
    duration: 299,
    loadContent: async () => (await import('./part1-home-accommodation-002')).videoData,
    videoFile: 'part1-home-accommodation-002.mp4',
    videoEnvKey: 'VITE_VIDEO_PART1_HOME_ACCOMMODATION_002_URL',
  },
  {
    id: 'part1-home-accommodation-003',
    part: 'Part 1',
    category: 'Home/accommodation',
    titleZh: '小户型与收纳：空间功能和居住取舍',
    description: '学习描述小空间、收纳设计、家具取舍，以及“好看但仍然实用”的居住表达。',
    access: 'free',
    duration: 223,
    loadContent: async () => (await import('./part1-home-accommodation-003')).videoData,
    videoFile: 'part1-home-accommodation-003.mp4',
    videoEnvKey: 'VITE_VIDEO_PART1_HOME_ACCOMMODATION_003_URL',
  },
  {
    id: 'pilot-001',
    part: 'Part 1',
    category: 'Hometown',
    titleZh: '450平方英尺洛杉矶单间公寓参观',
    description: '学习描述小空间、居住感受和房间布置。',
    access: 'paid',
    duration: 1009,
    loadContent: async () => (await import('./mockVideo')).mockVideoContent,
    videoFile: 'video-002.mp4',
    videoEnvKey: 'VITE_VIDEO_001_URL',
  },
  {
    id: 'video-003',
    part: 'Part 1',
    category: 'Hometown',
    titleZh: '走进莉迪亚·米伦的经典乡村住宅',
    description: '学习描述理想住宅、乡村生活和个人审美。',
    access: 'paid',
    duration: 653,
    loadContent: async () => (await import('./video-003')).videoData,
    videoFile: 'Go Inside Lydia Millen’s Timeless Country Home | Home Tour.mp4',
    videoEnvKey: 'VITE_VIDEO_003_URL',
  },
  {
    id: 'video-004',
    part: 'Part 1',
    category: 'Hometown',
    titleZh: '真实极简家居参观',
    description: '学习表达生活方式、物品取舍和家的优缺点。',
    access: 'paid',
    duration: 532,
    loadContent: async () => (await import('./video-004')).videoData,
    videoFile: 'Realistic Minimalist Home Tour | Everything We Own.mp4',
    videoEnvKey: 'VITE_VIDEO_004_URL',
  },
  {
    id: 'part1-study-work-001',
    part: 'Part 1',
    category: 'Study & Work',
    titleZh: 'Study or Work 话题 01',
    description: '学习说明专业选择、职业规划和未来方向。',
    access: 'paid',
    duration: 400,
    loadContent: async () => (await import('./part1-study-work-001')).videoData,
    videoFile: 'study-work1.mp4',
    videoEnvKey: 'VITE_VIDEO_PART1_STUDY_WORK_001_URL',
  },
];

export const CONTENT_BY_ID = Object.fromEntries(
  CONTENT_MANIFEST.map((entry) => [entry.id, entry]),
) as Record<string, ContentManifestEntry>;
