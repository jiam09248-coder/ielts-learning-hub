import { mockVideoContent } from './mockVideo';
import { videoData as part1HomeAccommodation001 } from './part1-home-accommodation-001';
import { videoData as part1HomeAccommodation002 } from './part1-home-accommodation-002';
import { videoData as part1HomeAccommodation003 } from './part1-home-accommodation-003';
import { videoData as part1StudyWork001 } from './part1-study-work-001';
import { videoData as video003 } from './video-003';
import { videoData as video004 } from './video-004';
import type { VideoContent } from '../types/video';

export const FREE_VIDEO_IDS = ['pilot-001', 'part1-home-accommodation-001', 'part1-home-accommodation-002', 'part1-home-accommodation-003'];

export const VIDEO_LIBRARY: Record<string, VideoContent> = {
  'pilot-001': mockVideoContent,
  'part1-home-accommodation-001': part1HomeAccommodation001 as unknown as VideoContent,
  'part1-home-accommodation-002': part1HomeAccommodation002 as unknown as VideoContent,
  'part1-home-accommodation-003': part1HomeAccommodation003 as unknown as VideoContent,
  'part1-study-work-001': part1StudyWork001 as unknown as VideoContent,
  'video-003': video003 as unknown as VideoContent,
  'video-004': video004 as unknown as VideoContent,
};

export function getVideoContent(videoId?: string): VideoContent {
  if (videoId && VIDEO_LIBRARY[videoId]) return VIDEO_LIBRARY[videoId];
  return VIDEO_LIBRARY['pilot-001'];
}

export function isFreeVideo(videoId: string): boolean {
  return FREE_VIDEO_IDS.includes(videoId);
}
