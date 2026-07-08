import { useRef, useEffect, useState } from 'react';

interface ThumbnailState {
  thumbnail: string | null;
  loading: boolean;
  error: boolean;
  tainted: boolean;
  /** debug info for troubleshooting */
  debug: string;
}

export function useVideoThumbnail(
  videoUrl: string | undefined,
  options?: { seekSeconds?: number }
): ThumbnailState {
  const { seekSeconds = 1 } = options ?? {};
  const [state, setState] = useState<ThumbnailState>({
    thumbnail: null,
    loading: true,
    error: false,
    tainted: false,
    debug: 'init',
  });

  const genRef = useRef(0);

  useEffect(() => {
    if (!videoUrl) {
      const frame = window.requestAnimationFrame(() => {
        setState({ thumbnail: null, loading: false, error: true, tainted: false, debug: 'no-url' });
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const startFrame = window.requestAnimationFrame(() => {
      setState({ thumbnail: null, loading: true, error: false, tainted: false, debug: `starting cors attempt: ${videoUrl.slice(0, 60)}` });
    });

    if (!videoUrl) {
      return;
    }

    const gen = ++genRef.current;

    let video: HTMLVideoElement | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    function cleanup() {
      clearTimeout(fallbackTimer!);
      if (video) {
        video.removeAttribute('src');
        video.load();
        video.remove();
        video = null;
      }
      if (canvas) {
        canvas.remove();
        canvas = null;
      }
    }

    function finish(update: Partial<ThumbnailState>) {
      if (gen !== genRef.current) return;
      cleanup();
      setState((prev) => ({ ...prev, loading: false, ...update }));
    }

    const url = videoUrl;

    function tryWithCORS() {
      video = document.createElement('video');
      canvas = document.createElement('canvas');

      video.preload = 'metadata';
      video.muted = true;
      video.setAttribute('referrerpolicy', 'no-referrer');
      video.crossOrigin = 'anonymous';

      video.addEventListener('loadedmetadata', () => {
        if (gen !== genRef.current || !video) return;
        video.currentTime = Math.min(seekSeconds, video.duration || seekSeconds);
      }, { once: true });

      video.addEventListener('seeked', () => {
        if (gen !== genRef.current || !video || !canvas) return;
        captureAndFinish(video, canvas, finish, false);
      }, { once: true });

      video.addEventListener('error', () => {
        if (gen !== genRef.current) return;
        console.log('[thumbnail] CORS load failed, falling back to no-CORS');
        cleanup();
        tryNoCORS();
      }, { once: true });

      fallbackTimer = setTimeout(() => {
        if (gen !== genRef.current || !video) return;
        if (video.readyState >= 1 && video.duration > 0) {
          video.currentTime = Math.min(seekSeconds, video.duration);
        } else {
          finish({ error: true, debug: 'timeout-cors' });
        }
      }, 10000);

      video.src = url;
      video.load();
    }

    function tryNoCORS() {
      video = document.createElement('video');
      canvas = document.createElement('canvas');
      // NO crossOrigin

      video.preload = 'metadata';
      video.muted = true;
      video.setAttribute('referrerpolicy', 'no-referrer');

      video.addEventListener('loadedmetadata', () => {
        if (gen !== genRef.current || !video) return;
        video.currentTime = Math.min(seekSeconds, video.duration || seekSeconds);
      }, { once: true });

      video.addEventListener('seeked', () => {
        if (gen !== genRef.current || !video || !canvas) return;
        captureAndFinish(video, canvas, finish, true);
      }, { once: true });

      video.addEventListener('error', () => {
        console.log('[thumbnail] No-CORS load also failed');
        finish({ error: true, debug: 'error-nocors' });
      }, { once: true });

      fallbackTimer = setTimeout(() => {
        if (gen !== genRef.current || !video) return;
        if (video.readyState >= 1 && video.duration > 0) {
          video.currentTime = Math.min(seekSeconds, video.duration);
        } else {
          finish({ error: true, debug: 'timeout-nocors' });
        }
      }, 10000);

      video.src = url;
      video.load();
    }

    tryWithCORS();

    return () => {
      window.cancelAnimationFrame(startFrame);
      genRef.current = gen + 1;
      cleanup();
    };
  }, [videoUrl, seekSeconds]);

  return state;
}

function captureAndFinish(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  finish: (update: Partial<ThumbnailState>) => void,
  noCORS: boolean
) {
  const w = video.videoWidth;
  const h = video.videoHeight;

  console.log(`[thumbnail] capture attempt: ${w}x${h}, noCORS=${noCORS}`);

  if (w === 0 || h === 0) {
    console.log('[thumbnail] zero dimensions');
    finish({ error: true, debug: 'zero-dimensions' });
    return;
  }

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    console.log('[thumbnail] no 2d context');
    finish({ error: true, debug: 'no-ctx' });
    return;
  }

  try {
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    console.log('[thumbnail] SUCCESS, dataUrl length:', dataUrl.length);
    finish({ thumbnail: dataUrl, debug: 'success' });
  } catch (error: unknown) {
    const captureError = error instanceof Error ? error : new Error(String(error));
    console.log('[thumbnail] capture error:', captureError.name, captureError.message);
    finish(noCORS ? { tainted: true, debug: 'tainted' } : { error: true, debug: `cors-error:${captureError.name}` });
  }
}
