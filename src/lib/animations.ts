import { useEffect, useRef, useState, useCallback } from "react";

export const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Skip if we're in SSR
    if (typeof window === 'undefined') return;
    
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      // Only update state if the visibility actually changed
      if (isInView !== entry.isIntersecting) {
        setIsInView(entry.isIntersecting);
      }
    }, { threshold: 0.1, rootMargin: "0px", ...options });

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [options, isInView]); // Include isInView in dependencies

  return { ref, isInView };
};

// Memoize the stagger delay calculation to prevent recalculations
export const generateStaggerDelay = (index: number, baseDelay = 0.05) => {
  return `${baseDelay * index}s`;
};

// Hook to track scroll position
export const useScrollPosition = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return scrollY;
};

// Calculate scroll progress for an element
export const useScrollProgress = (ref) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how far into the section the user has scrolled
      const entry = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      
      // Clamp progress between 0 and 1
      const clampedProgress = Math.max(0, Math.min(1, entry));
      setProgress(clampedProgress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);
  
  return progress;
};

// Motion value for smooth animations
export const useSmoothTransform = (value, damping = 0.15) => {
  const [smoothValue, setSmoothValue] = useState(value);
  const prevValue = useRef(value);
  const frameRef = useRef(null);
  
  useEffect(() => {
    const updateSmoothValue = () => {
      const diff = value - smoothValue;
      const newValue = smoothValue + diff * damping;
      
      if (Math.abs(diff) > 0.001) {
        setSmoothValue(newValue);
        frameRef.current = requestAnimationFrame(updateSmoothValue);
      } else {
        setSmoothValue(value);
      }
    };
    
    if (prevValue.current !== value) {
      prevValue.current = value;
      frameRef.current = requestAnimationFrame(updateSmoothValue);
    }
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, smoothValue, damping]);
  
  return smoothValue;
};
