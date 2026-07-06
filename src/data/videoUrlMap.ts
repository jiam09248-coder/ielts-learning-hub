/**
 * Centralized video ID → URL lookup.
 *
 * All video URLs are defined here so both CatalogPage (thumbnails)
 * and LessonPage (full player) resolve consistently.
 */
export function getVideoUrl(videoId: string): string {
  const URL_MAP: Record<string, string | undefined> = {
    'pilot-001': import.meta.env.VITE_VIDEO_001_URL,
    'part1-study-work-001': import.meta.env.VITE_VIDEO_PART1_STUDY_WORK_001_URL || 'https://pub-18bb19e4b4de4de982781a56d34ab41b.r2.dev/study-work1.mp4',
    'video-003': import.meta.env.VITE_VIDEO_003_URL,
    'video-004': import.meta.env.VITE_VIDEO_004_URL,
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
