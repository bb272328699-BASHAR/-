import React, { useEffect, useState } from 'react';

interface ScrollProgressProps {
  currentPath?: string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ currentPath }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 100) {
            const currentScroll = window.scrollY;
            const scrollPercentage = Math.min(Math.max((currentScroll / totalHeight) * 100, 0), 100);
            setProgress(scrollPercentage);
            setIsVisible(currentScroll > 20);
          } else {
            setProgress(0);
            setIsVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPath]);

  if (!isVisible && progress === 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 h-[3px] w-full bg-slate-200/40 pointer-events-none transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div 
        className="h-full bg-gradient-to-l from-indigo-500 via-indigo-600 to-purple-600 transition-all duration-75 ease-out shadow-xs shadow-indigo-500/50"
        style={{ 
          width: `${progress}%`,
          transformOrigin: 'right',
        }}
      />
    </div>
  );
};
