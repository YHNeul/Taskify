'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 요소가 뷰포트에 들어오면 isVisible = true 로 바뀌는 훅.
 * 한 번 보이면 다시 숨기지 않는다 (unobserve).
 */
export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
