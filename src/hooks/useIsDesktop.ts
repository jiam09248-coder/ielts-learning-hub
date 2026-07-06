import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 1024px)';

export default function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const updateLayout = (event: MediaQueryList | MediaQueryListEvent) => setIsDesktop(event.matches);
    updateLayout(media);
    media.addEventListener('change', updateLayout);
    return () => media.removeEventListener('change', updateLayout);
  }, []);

  return isDesktop;
}
