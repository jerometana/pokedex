"use client";

import { useEffect, useRef, useState } from "react";

export const PAGE_SIZE = 60;

export function useInfinitePage(resetKey: string, total: number) {
  const [prevKey, setPrevKey] = useState(resetKey);
  const [count, setCount] = useState(PAGE_SIZE);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setCount(PAGE_SIZE);
  }
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setCount((c) => Math.min(total, c + PAGE_SIZE));
        }
      },
      { rootMargin: "600px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [total]);

  return { count: Math.min(count, total), sentinelRef };
}
