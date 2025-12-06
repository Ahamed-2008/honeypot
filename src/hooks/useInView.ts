import { useEffect, useState, RefObject } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInView(
  ref: RefObject<Element>,
  options: UseInViewOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false);
  const { threshold = 0, rootMargin = "0px" } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return isInView;
}
