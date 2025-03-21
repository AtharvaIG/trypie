
import { useState, useEffect, useCallback } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  // Use debounce to prevent excessive re-renders during resize
  const debounce = useCallback((fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  }, []);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Debounced handler to prevent too many updates during resize
    const handleChange = debounce(() => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
      }
    }, 150);
    
    // Add event listener
    mql.addEventListener("change", handleChange);
    
    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    // Clean up
    return () => mql.removeEventListener("change", handleChange);
  }, [debounce, isMobile]);

  return !!isMobile;
}
