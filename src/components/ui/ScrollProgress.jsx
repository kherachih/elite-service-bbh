import React, { useState, useEffect } from 'react';

/**
 * ScrollProgress (Inspired by Anim Master Lib Scroll components)
 * Fine hairline progress bar across the top with scroll percentage and active section tracking.
 */
export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('STUDIO');

  useEffect(() => {
    const sections = [
      { id: 'disciplines', label: 'DISCIPLINES' },
      { id: 'portfolio', label: 'RÉALISATIONS' },
      { id: 'estimator', label: 'CONFIGURATEUR' },
      { id: 'simulator', label: 'SPONSORING' },
      { id: 'engine', label: 'TECHNOLOGIES' },
    ];

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100));
        setScrollProgress(progress);
      }

      // Track active section
      const scrollPos = window.scrollY + 200;
      let current = 'STUDIO';
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollPos) {
          current = sec.label;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Hairline Progress Track */}
      <div className="h-[2.5px] w-full bg-white/5 relative">
        <div
          className="h-full bg-gradient-to-r from-[#e5a93c] via-[#f5c36a] to-[#10b981] transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Micro HUD Pill */}
      {scrollProgress > 2 && (
        <div className="hidden md:flex items-center gap-2 absolute top-2 right-6 px-3 py-1 rounded-full glass-panel border border-white/10 text-[10px] font-mono-num text-[#949aa4] animate-in fade-in duration-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e5a93c]" />
          <span>{activeSection}</span>
          <span>·</span>
          <span className="font-bold text-white">{Math.round(scrollProgress)}%</span>
        </div>
      )}
    </div>
  );
}
