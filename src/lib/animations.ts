
import { useEffect, useRef, useState, useCallback } from "react";

export const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Skip if we're in SSR
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver(([entry]) => {
      // Only update state if the visibility actually changed
      if (isInView !== entry.isIntersecting) {
        setIsInView(entry.isIntersecting);
      }
    }, { threshold: 0.1, rootMargin: "0px", ...options });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]); // Don't include isInView in dependencies to prevent observer re-creation

  return { ref, isInView };
};

// Memoize the stagger delay calculation to prevent recalculations
export const generateStaggerDelay = (index: number, baseDelay = 0.05) => {
  return `${baseDelay * index}s`;
};
