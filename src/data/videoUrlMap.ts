import { CONTENT_BY_ID } from './contentManifest';

const videoEnv = import.meta.env as Record<string, string | undefined>;

const DEPLOY_DIST_VIDEO_BASE =
  'https://cdn.jsdelivr.net/gh/jiam09248-coder/ielts-learning-hub@deploy-dist/videos';

const productionVideoOverrides: Record<string, string> = {
  'pilot-001': '/oss-videos/video-002.mp4',
  'video-003':
    '/oss-videos/Go%20Inside%20Lydia%20Millen%E2%80%99s%20Timeless%20Country%20Home%20_%20Home%20Tour.mp4',
  'video-004': '/oss-videos/Realistic%20Minimalist%20Home%20Tour%20_%20Everything%20We%20Own.mp4',
  'part2-tall-building-001': `${DEPLOY_DIST_VIDEO_BASE}/places-living/tall-building/part2-tall-building-001.mp4`,
  'part3-skyscrapers-europe-001': `${DEPLOY_DIST_VIDEO_BASE}/places-living/tall-building/part3-skyscrapers-europe-001.mp4`,
  'part2-interesting-building-001': `${DEPLOY_DIST_VIDEO_BASE}/places-living/interesting-building/part2-interesting-building-001.mp4`,
  'part3-adaptive-reuse-buildings-001': `${DEPLOY_DIST_VIDEO_BASE}/places-living/interesting-building/part3-adaptive-reuse-buildings-001.mp4`,
  'part2-interesting-building-002': `${DEPLOY_DIST_VIDEO_BASE}/places-living/interesting-building/part2-interesting-building-002.mp4`,
  'part2-quiet-place-001': `${DEPLOY_DIST_VIDEO_BASE}/places-living/quiet-place/part2-quiet-place-001.mp4`,
  'part3-quiet-place-001': `${DEPLOY_DIST_VIDEO_BASE}/places-living/quiet-place/part3-quiet-place-001.mp4`,
  'part2-visit-not-live-home-001': `${DEPLOY_DIST_VIDEO_BASE}/places-living/visit-not-live-home/part2-visit-not-live-home-001.mp4`,
  'part2-visit-not-live-home-002': `${DEPLOY_DIST_VIDEO_BASE}/places-living/visit-not-live-home/part2-visit-not-live-home-002.mp4`,
  'part3-city-country-living-001': `${DEPLOY_DIST_VIDEO_BASE}/places-living/visit-not-live-home/part3-city-country-living-001.mp4`,
};

function getVideoBaseUrl(): string {
  return import.meta.env.VITE_VIDEO_BASE_URL || (import.meta.env.DEV ? '/videos' : '/oss-videos');
}

function encodePathSegment(filename: string): string {
  return filename.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function resolveVideoFile(filename: string): string {
  if (import.meta.env.DEV || import.meta.env.VITE_VIDEO_BASE_URL) return filename;
  return filename.split('/').pop() ?? filename;
}

/** Resolve a video URL from the single content manifest and environment config. */
export function getVideoUrl(videoId: string): string {
  const entry = CONTENT_BY_ID[videoId];
  if (!entry) return '';
  if (!import.meta.env.DEV && !import.meta.env.VITE_VIDEO_BASE_URL && productionVideoOverrides[videoId]) {
    return productionVideoOverrides[videoId];
  }
  return videoEnv[entry.videoEnvKey] || `${getVideoBaseUrl()}/${encodePathSegment(resolveVideoFile(entry.videoFile))}`;
}

export function getThumbnailUrl(videoId: string): string | undefined {
  if (!CONTENT_BY_ID[videoId]) return undefined;
  return `/thumbnails/${videoId}.jpg`;
}
