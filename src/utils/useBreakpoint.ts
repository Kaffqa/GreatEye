import { useState, useEffect } from 'react';

export interface BreakpointState {
  isMobile: boolean; // < 768px
  isTablet: boolean; // 768px - 1023px
  isDesktop: boolean; // >= 1024px
  isCompactHeight: boolean; // height < 500px (e.g. mobile landscape)
  width: number;
  height: number;
}

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isCompactHeight: false,
        width: 1280,
        height: 800,
      };
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
      isCompactHeight: h < 500,
      width: w,
      height: h,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setState({
        isMobile: w < 768,
        isTablet: w >= 768 && w < 1024,
        isDesktop: w >= 1024,
        isCompactHeight: h < 500,
        width: w,
        height: h,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
