import React, { useState, useEffect, useRef } from 'react';
import { Layers, Activity, Gauge, Terminal } from 'lucide-react';
import { playHoverSound } from '../utils/audio';

function CounterNumber({ targetVal, duration = 1200 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  // Extract number from string, e.g. "24+" -> 24
  const numericTarget = parseInt(targetVal.replace(/\D/g, ''), 10) || 0;
  const suffix = targetVal.replace(/[0-9]/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasStarted) {
        setHasStarted(true);
      }
    }, { threshold: 0.3 });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    let animId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numericTarget));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCount(numericTarget);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [hasStarted, numericTarget, duration]);

  return (
    <span ref={elementRef} className="font-mono-num font-extrabold text-3xl sm:text-4xl tracking-tight text-white">
      {targetVal.includes('<') && '< '}
      {count}
      {suffix.replace('<', '')}
    </span>
  );
}

export default function Metrics({ t }) {
  const metrics = [
    {
      val: '24+',
      label: 'Systèmes numériques déployés',
      sub: 'Applications web, SaaS et ERP sur-mesure',
      icon: Layers,
      color: 'text-[#e5a93c]',
      glow: 'hover:border-[#e5a93c]/50',
    },
    {
      val: '100+',
      label: 'Écosystèmes publicitaires gérés',
      sub: 'Campagnes d\'acquisition haute vélocité',
      icon: Activity,
      color: 'text-[#10b981]',
      glow: 'hover:border-[#10b981]/50',
    },
    {
      val: '< 700ms',
      label: 'Temps de chargement mobile 4G',
      sub: 'Score Core Web Vitals 99+ garanti',
      icon: Gauge,
      color: 'text-[#06b6d4]',
      glow: 'hover:border-[#06b6d4]/50',
    },
    {
      val: '100%',
      label: 'Code propriétaire garanti',
      sub: 'Zéro abonnement mensuel par employé',
      icon: Terminal,
      color: 'text-white',
      glow: 'hover:border-white/50',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onMouseEnter={playHoverSound}
              className={`p-6 sm:p-7 rounded-2xl liquid-glass ${item.glow} transition-all duration-300 flex flex-col justify-between group shadow-xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <CounterNumber targetVal={item.val} />
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#a0a6b5] group-hover:text-white group-hover:bg-white/10 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-white mb-1">
                  {item.label}
                </h3>
                <p className="text-xs text-[#a0a6b5] leading-relaxed">
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
