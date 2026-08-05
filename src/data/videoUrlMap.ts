import { CONTENT_BY_ID } from './contentManifest';

const videoEnv = import.meta.env as Record<string, string | undefined>;

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
  return videoEnv[entry.videoEnvKey] || `${getVideoBaseUrl()}/${encodePathSegment(resolveVideoFile(entry.videoFile))}`;
}

export function getThumbnailUrl(videoId: string): string | undefined {
  if (!CONTENT_BY_ID[videoId]) return undefined;
  return `/thumbnails/${videoId}.jpg`;
}
