/**
 * Centralized video ID → URL lookup.
 *
 * All video URLs are defined here so both CatalogPage (thumbnails)
 * and LessonPage (full player) resolve consistently.
 */
export function getVideoUrl(videoId: string): string {
  const OSS_PROXY_BASE_URL = '/oss-videos';
  const URL_MAP: Record<string, string | undefined> = {
    'pilot-001': import.meta.env.VITE_VIDEO_001_URL || `${OSS_PROXY_BASE_URL}/video-002.mp4`,
    'part1-study-work-001': import.meta.env.VITE_VIDEO_PART1_STUDY_WORK_001_URL || `${OSS_PROXY_BASE_URL}/study-work1.mp4`,
    'video-003': import.meta.env.VITE_VIDEO_003_URL || `${OSS_PROXY_BASE_URL}/Go%20Inside%20Lydia%20Millen%E2%80%99s%20Timeless%20Country%20Home%20_%20Home%20Tour.mp4`,
    'video-004': import.meta.env.VITE_VIDEO_004_URL || `${OSS_PROXY_BASE_URL}/Realistic%20Minimalist%20Home%20Tour%20_%20Everything%20We%20Own.mp4`,
  };

  return URL_MAP[videoId] || '';
}

/**
 * Returns a pre-extracted static thumbnail for known videos.
 * Returns undefined for unknown videos — the caller should fall
 * back to runtime frame extraction.
 */
export function getThumbnailUrl(videoId: string): string | undefined {
  switch (videoId) {
    case 'pilot-001':
      return '/thumbnails/pilot-001.jpg';
    case 'video-003':
      return '/thumbnails/video-003.jpg';
    case 'video-004':
      return '/thumbnails/video-004.jpg';
    default:
      return undefined;
  }
}
