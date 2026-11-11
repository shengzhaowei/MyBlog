import { useEffect, useState } from 'react';

// 跟随容器宽度重绘 SVG。宽度取整，避免亚像素抖动触发无限重绘。
export function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const apply = (next) => {
      const rounded = Math.round(next);
      if (!rounded) return;
      setWidth((prev) => (prev === rounded ? prev : rounded));
    };

    apply(element.clientWidth);
    if (typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver((entries) => {
      apply(entries[0].contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

export function clampTipLeft(hostWidth, tipWidth, anchorX, gap = 12) {
  const maxLeft = Math.max(0, hostWidth - tipWidth);
  let left = anchorX + gap;
  if (left + tipWidth > hostWidth) left = anchorX - gap - tipWidth;
  return Math.max(0, Math.min(left, maxLeft));
}
