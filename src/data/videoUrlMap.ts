/**
 * Centralized video ID → URL lookup.
 *
 * All video URLs are defined here so both CatalogPage (thumbnails)
 * and LessonPage (full player) resolve consistently.
 */
export function getVideoUrl(videoId: string): string {
  switch (videoId) {
    case 'pilot-001':
      return (
        import.meta.env.VITE_VIDEO_001_URL ||
        'https://pub-18bb19e4b4de4de982781a56d34ab41b.r2.dev/video-002.mp4'
      );
    case 'video-002':
      return (
        import.meta.env.VITE_VIDEO_002_URL ||
        '/videos/video-002.mp4'
      );
    case 'video-003':
      return (
        import.meta.env.VITE_VIDEO_003_URL ||
        '/videos/video-003.mp4'
      );
    case 'video-004':
      return (
        import.meta.env.VITE_VIDEO_004_URL ||
        'https://pub-18bb19e4b4de4de982781a56d34ab41b.r2.dev/Realistic%20Minimalist%20Home%20Tour%20%7C%20Everything%20We%20Own.mp4'
      );
    default:
      return `/videos/${videoId}.mp4`;
  }
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
