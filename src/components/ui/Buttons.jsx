import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * 1. ShimmerButton (Inspired by Vengeance UI Animated Shine Button)
 * Features a seamless rotating conic gradient border with a dark obsidian core.
 */
export function ShimmerButton({
  children,
  onClick,
  className = '',
  shimmerColor = '#e5a93c',
  ...props
}) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center justify-center p-[1px] overflow-hidden rounded-full font-display font-bold text-xs uppercase tracking-wider group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a93c] active:scale-95 transition-transform duration-100 ${className}`}
      {...props}
    >
      {/* Rotating Conic Shimmer Beam */}
      <span className="absolute inset-[-100%] animate-shimmer-spin bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#e5a93c_50%,#000000_100%)] opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Inner Surface */}
      <span className="relative inline-flex items-center justify-center gap-2 w-full h-full px-6 py-3 rounded-full bg-[#0d0f14] text-white backdrop-blur-xl group-hover:bg-[#13161d] transition-colors border border-white/10">
        {children}
      </span>
    </button>
  );
}

/**
 * 2. RadialGlowButton (Inspired by Vengeance UI Radial Glow Button)
 * Tracks the cursor position inside the button and renders a dynamic radial spotlight glow.
 */
export function RadialGlowButton({
  children,
  onClick,
  className = '',
  glowColor = 'rgba(229, 169, 60, 0.35)',
  ...props
}) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setPosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-white overflow-hidden glass-panel border border-white/15 transition-all duration-200 active:scale-95 hover:border-white/30 ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Follower Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: position.opacity,
          background: `radial-gradient(120px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 80%)`,
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

/**
 * 3. Pop3DButton (Inspired by Vengeance UI Pop Button)
 * Physical 3D pushable button with realistic depth, edge highlight, and mechanical spring press.
 */
export function Pop3DButton({
  children,
  onClick,
  className = '',
  variant = 'gold', // 'gold' | 'emerald' | 'dark'
  ...props
}) {
  const variants = {
    gold: {
      face: 'bg-[#e5a93c] text-[#08090b]',
      edge: 'bg-[#b87d1e]',
      shadow: 'rgba(229, 169, 60, 0.25)',
    },
    emerald: {
      face: 'bg-[#10b981] text-[#08090b]',
      edge: 'bg-[#0b7854]',
      shadow: 'rgba(16, 185, 129, 0.25)',
    },
    dark: {
      face: 'bg-[#1a1e27] text-white border border-white/10',
      edge: 'bg-[#0f1115]',
      shadow: 'rgba(0, 0, 0, 0.4)',
    },
  };

  const v = variants[variant] || variants.gold;

  return (
    <button
      onClick={onClick}
      className={`relative group inline-block focus:outline-none select-none transition-transform active:translate-y-1 ${className}`}
      {...props}
    >
      {/* 3D Bottom Edge Layer */}
      <span
        className={`absolute inset-0 w-full h-full rounded-xl translate-y-1 ${v.edge}`}
      />
      {/* Top Face Layer */}
      <span
        className={`relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0 shadow-lg ${v.face}`}
      >
        {children}
      </span>
    </button>
  );
}

/**
 * 4. CornerButton (Inspired by Vengeance UI Corner Button)
 * Architectural/cyber Swiss button with precision corner crosshairs that light up on hover.
 */
export function CornerButton({
  children,
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center justify-center gap-2 px-6 py-3 font-mono-num font-semibold text-xs tracking-wider text-[#f4f5f6] uppercase glass-panel border border-white/10 group hover:border-[#e5a93c]/50 transition-all active:scale-95 ${className}`}
      {...props}
    >
      {/* Top Left Corner Bracket */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#e5a93c] transition-all group-hover:w-3 group-hover:h-3" />
      {/* Top Right Corner Bracket */}
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#e5a93c] transition-all group-hover:w-3 group-hover:h-3" />
      {/* Bottom Left Corner Bracket */}
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#e5a93c] transition-all group-hover:w-3 group-hover:h-3" />
      {/* Bottom Right Corner Bracket */}
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#e5a93c] transition-all group-hover:w-3 group-hover:h-3" />

      <span className="relative z-10 flex items-center gap-2 group-hover:text-[#e5a93c] transition-colors">
        {children}
      </span>
    </button>
  );
}
