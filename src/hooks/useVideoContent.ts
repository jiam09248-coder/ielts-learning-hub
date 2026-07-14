import { useEffect, useState } from 'react';
import { loadVideoContent } from '../data/videoLibrary';
import type { VideoContent } from '../types/video';

export default function useVideoContent(videoId: string) {
  const [state, setState] = useState<{ videoId: string; content: VideoContent | null; error: Error | null }>({
    videoId: '', content: null, error: null,
  });

  useEffect(() => {
    let cancelled = false;
    loadVideoContent(videoId)
      .then((nextContent) => { if (!cancelled) setState({ videoId, content: nextContent, error: null }); })
      .catch((nextError: unknown) => {
        if (!cancelled) setState({ videoId, content: null, error: nextError instanceof Error ? nextError : new Error('课程加载失败') });
      });
    return () => { cancelled = true; };
  }, [videoId]);

  const isCurrent = state.videoId === videoId;
  return {
    content: isCurrent ? state.content : null,
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent,
  };
}
