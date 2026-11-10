import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ScrollTextReveal (Inspired by Anim Master Lib Scroll Text Animations)
 * Words illuminate progressively from muted gray to radiant white as they scroll through the viewport.
 */
function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const color = useTransform(progress, range, ['#4a505e', '#f4f5f6']);

  return (
    <motion.span
      style={{ opacity, color }}
      className="inline-block mr-[0.28em] transition-colors duration-75"
    >
      {children}
    </motion.span>
  );
}

export default function ScrollTextReveal({
  text,
  highlightWord = 'EliteSCE',
  className = '',
}) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.45'],
  });

  const words = text.split(' ');

  return (
    <div ref={containerRef} className={`relative max-w-4xl mx-auto ${className}`}>
      <p className="font-display font-bold text-2xl sm:text-4xl md:text-5xl leading-[1.25] text-balance">
        {words.map((word, idx) => {
          const start = idx / words.length;
          const end = start + 1 / words.length;
          const isHighlight = word.toLowerCase().includes(highlightWord.toLowerCase());

          return (
            <Word key={idx} progress={scrollYProgress} range={[start, end]}>
              {isHighlight ? (
                <span className="text-[#e5a93c]">{word}</span>
              ) : (
                word
              )}
            </Word>
          );
        })}
      </p>
    </div>
  );
}
