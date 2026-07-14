import { CONTENT_BY_ID, CONTENT_MANIFEST } from './contentManifest';
import type { VideoContent } from '../types/video';

export { CONTENT_MANIFEST } from './contentManifest';

export const FREE_VIDEO_IDS = CONTENT_MANIFEST
  .filter((entry) => entry.access === 'free')
  .map((entry) => entry.id);

export function getContentManifestEntry(videoId?: string) {
  return videoId ? CONTENT_BY_ID[videoId] : undefined;
}

export async function loadVideoContent(videoId: string): Promise<VideoContent> {
  const entry = CONTENT_BY_ID[videoId];
  if (!entry) throw new Error(`Unknown video id: ${videoId}`);
  return entry.loadContent();
}

export function isFreeVideo(videoId: string): boolean {
  return CONTENT_BY_ID[videoId]?.access === 'free';
}
