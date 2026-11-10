import React from 'react';

export default function ClientMarquee() {
  const brands = [
    'CHAZ EYEWEAR',
    'TOURURWORLD',
    'COREFLOW CLOUD',
    'CLINIQUE EL AFIA',
    'MAGHREB DISTRIB',
    'ALGERIA VENTURE ECOSYSTEM',
    'GLOBAL LOGISTICS',
    'ATELIER OPTIQUE',
  ];

  return (
    <div className="py-8 border-y border-white/5 bg-[#0b0c10] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
        <span className="text-[10px] font-mono-num text-[#676f82] uppercase tracking-wider">
          Systèmes développés & campagnes gérées pour ces marques
        </span>
      </div>

      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 py-1">
          {brands.concat(brands).map((name, idx) => (
            <span
              key={idx}
              className="text-xs font-mono-num text-[#676f82] hover:text-[#9ba1b4] transition-colors cursor-default select-none"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Subtle edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0b0c10] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0b0c10] to-transparent z-10" />
      </div>
    </div>
  );
}
