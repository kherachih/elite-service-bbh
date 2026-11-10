import React, { useRef, useState } from 'react';

/**
 * SpotlightCard (Inspired by Skiper UI Spotlight Cards)
 * Features a real-time cursor spotlight gradient that tracks across borders and surfaces.
 * Also includes smooth 3D tilt perspective.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(229, 169, 60, 0.18)',
  enableTilt = true,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, opacity: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y, opacity: 1 });

    if (enableTilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5; // max 5deg tilt
      const rotateY = ((x - centerX) / centerX) * 5;
      setTilt({ rotateX, rotateY });
    }
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, opacity: 0 }));
    if (enableTilt) {
      setTilt({ rotateX: 0, rotateY: 0 });
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: enableTilt
          ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
          : undefined,
        transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1)',
      }}
      className={`relative rounded-3xl p-[1px] overflow-hidden glass-panel group transition-colors duration-200 ${className}`}
      {...props}
    >
      {/* Spotlight Border Layer */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: mousePos.opacity,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />

      {/* Card Content Surface with Inner Spotlight */}
      <div className="relative w-full h-full rounded-[23px] bg-[#0d0f14]/90 p-6 sm:p-8 overflow-hidden">
        {/* Subtle Inner Spotlight */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity: mousePos.opacity * 0.5,
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
          }}
        />

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
