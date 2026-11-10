import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Compass, Palette, Terminal, Rocket, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { playHoverSound, playClickSound } from '../utils/audio';

export default function ScrollytellingExperience({ onOpenDrawer }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: '01',
      tag: 'PHASE 01 · DIAGNOSTIC & CADRAGE',
      title: 'Audit architectural & définition de la vision',
      desc: 'Avant toute ligne de code, nous disséquons vos flux opérationnels réels. Pas de maquette superflue : nous définissons l\'architecture logicielle, les bases relationnelles et les cibles d\'acquisition.',
      icon: Compass,
      accent: '#e5a93c',
      badge: 'Cadrage Déterministe',
      visualType: 'blueprint',
      metrics: [
        { label: 'Cahier des charges', val: '100% Validé' },
        { label: 'Délai d\'analyse', val: '48 Heures' },
      ],
    },
    {
      id: '02',
      tag: 'PHASE 02 · DIRECTION ARTISTIQUE & EXPÉRIENCE',
      title: 'Design immersif sans modèle préfabriqué',
      desc: 'Création d\'une identité visuelle d\'autorité. Typographie suisse millimétrée, verre dépoli haute définition, animations à 60 FPS et interactions tactiles qui captivent immédiatement l\'attention.',
      icon: Palette,
      accent: '#06b6d4',
      badge: 'Finition Awwwards',
      visualType: 'design',
      metrics: [
        { label: 'Taux de rétention', val: '+65% estimé' },
        { label: 'Fluidité de rendu', val: '60 FPS fixes' },
      ],
    },
    {
      id: '03',
      tag: 'PHASE 03 · INGÉNIERIE & DÉVELOPPEMENT',
      title: 'Code propriétaire pur & vitesse brute',
      desc: 'Développement React 19, TypeScript et PostgreSQL sans CMS lourd. Nous garantissons un chargement en moins de 800ms sur mobile 4G et une sécurité des données de niveau bancaire.',
      icon: Terminal,
      accent: '#10b981',
      badge: 'Zéro Dépendance Tierce',
      visualType: 'code',
      metrics: [
        { label: 'Score Core Web Vitals', val: '100/100' },
        { label: 'Temps de chargement', val: '< 0.8s mobile' },
      ],
    },
    {
      id: '04',
      tag: 'PHASE 04 · PROPULSION & ACQUISITION',
      title: 'Lancement & campagnes de croissance ROI',
      desc: 'Déploiement sur CDN mondial Cloudflare Edge et activation des campagnes publicitaires ciblées sur Meta/Instagram avec routage direct des prospects qualifiés vers WhatsApp Business.',
      icon: Rocket,
      accent: '#f59e0b',
      badge: 'Conversion Directe',
      visualType: 'growth',
      metrics: [
        { label: 'Routage WhatsApp', val: 'Immédiat' },
        { label: 'Gestion publicitaire', val: '100+ Comptes' },
      ],
    },
  ];

  // Track scroll position to update active step
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const elements = containerRef.current.querySelectorAll('.step-trigger');
      const windowCenter = window.innerHeight * 0.45;

      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowCenter && rect.bottom >= windowCenter) {
          setActiveStep(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const current = steps[activeStep];
  const StepIcon = current.icon;

  return (
    <section
      ref={containerRef}
      className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-20"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-xs font-mono-num font-semibold text-[#e5a93c] tracking-widest uppercase block mb-3">
          // LE PARCOURS D'IMMERSION TECHNIQUE
        </span>
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight text-balance mb-6">
          À chaque étape du défilement,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e5a93c] via-[#ffd580] to-[#06b6d4]">
            votre vision prend vie.
          </span>
        </h2>
        <p className="text-base text-[#a0a6b5] leading-relaxed text-pretty">
          Faites défiler pour explorer la méthode d'ingénierie qui transforme une idée brute en un empire numérique performant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Scrolling Story Steps (6 cols) */}
        <div className="lg:col-span-6 space-y-24 relative pl-8 border-l border-white/10">
          
          {/* Animated vertical progress bar indicator */}
          <div
            className="absolute left-[-1.5px] top-0 w-[3px] bg-gradient-to-b from-[#e5a93c] via-[#06b6d4] to-[#10b981] transition-all duration-300 rounded-full"
            style={{
              height: `${((activeStep + 1) / steps.length) * 100}%`,
            }}
          />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === idx;

            return (
              <div
                key={step.id}
                className={`step-trigger transition-all duration-500 ${
                  isCurrent ? 'opacity-100 translate-x-2' : 'opacity-35 hover:opacity-70'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono-num font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-[#e5a93c] text-[#08090d] shadow-lg shadow-[#e5a93c]/30 scale-110'
                        : 'bg-white/5 text-[#a0a6b5]'
                    }`}
                  >
                    {step.id}
                  </span>
                  <span className="text-xs font-mono-num text-[#e5a93c] tracking-wider uppercase font-semibold">
                    {step.tag}
                  </span>
                </div>

                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-4 tracking-tight">
                  {step.title}
                </h3>

                <p className="text-sm sm:text-base text-[#a0a6b5] leading-relaxed mb-6 font-normal">
                  {step.desc}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  {step.metrics.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono-num"
                    >
                      <span className="text-[#6b7280] block text-[10px]">{m.label}</span>
                      <span className="font-bold text-white text-sm">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Interactive Dynamic Visual Stage (6 cols) */}
        <div className="lg:col-span-6 sticky top-28">
          <div className="p-8 sm:p-10 rounded-3xl liquid-glass border border-white/15 shadow-2xl relative overflow-hidden min-h-[480px] flex flex-col justify-between group">
            
            {/* Dynamic Ambient Glow matching the active step */}
            <div
              className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 transition-all duration-700"
              style={{ backgroundColor: current.accent }}
            />

            {/* Top Stage Bar */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10 text-xs font-mono-num">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors duration-300 shadow-md"
                  style={{ backgroundColor: `${current.accent}25`, color: current.accent }}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white block">
                    {current.badge}
                  </span>
                  <span className="text-[11px] text-[#6b7280]">
                    Scrollytelling Engine // Actif
                  </span>
                </div>
              </div>

              <span className="font-mono-num font-extrabold text-2xl text-white/30">
                0{activeStep + 1}
              </span>
            </div>

            {/* Dynamic Stage Center Content (Morphs per step) */}
            <div className="py-8 my-auto">
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 font-mono-num text-xs">
                      <span className="text-[#e5a93c] block mb-2 font-bold">// ARCHITECTURE SPECIFICATION</span>
                      <div className="space-y-1 text-[#a0a6b5] text-[11px]">
                        <div>&gt; Modelisation relationnelle : PostgreSQL v16</div>
                        <div>&gt; Couche de cache : Redis Cluster (latence 1.2ms)</div>
                        <div>&gt; Passerelle de paiement : Algérie CIB/Edahabia + Stripe</div>
                        <div>&gt; Objectif de conversion mobile : &gt; 3.8%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[#6b7280] block text-[10px]">Cible de performance</span>
                        <span className="font-bold text-white text-base font-mono-num">&lt; 800ms 4G</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[#6b7280] block text-[10px]">Licence logicielle</span>
                        <span className="font-bold text-[#10b981] text-base font-mono-num">100% Propriétaire</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#06b6d4]/10 to-transparent border border-[#06b6d4]/30 shadow-2xl overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono-num text-[#06b6d4] font-bold">SYSTÈME DESIGN 3D & RETINE</span>
                        <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-[#06b6d4]/20 text-[#06b6d4]">60 FPS</span>
                      </div>
                      <h4 className="font-display font-bold text-xl text-white mb-2">
                        Immersion visuelle captivante
                      </h4>
                      <p className="text-xs text-[#a0a6b5] leading-relaxed">
                        Effets d'ombrages portés étagés, reflets spéculaires sous le curseur, et physique de ressorts inertiels.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <span className="text-[#a0a6b5]">Animations Framer Motion</span>
                      <span className="font-mono-num font-bold text-[#06b6d4]">Spring Physics Active</span>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 rounded-2xl bg-black/60 border border-white/10 font-mono-num text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-[#6b7280] pb-2 border-b border-white/10 text-[11px]">
                      <span>runtime-benchmark.sh</span>
                      <span className="text-[#10b981]">Core Web Vitals : 100%</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-[#a0a6b5]">
                      <div><span className="text-[#10b981]">✓</span> Vite bundle gzippé : <span className="text-white font-bold">90.5 kB</span></div>
                      <div><span className="text-[#10b981]">✓</span> Rendu GPU : <span className="text-white font-bold">16.6ms / frame</span></div>
                      <div><span className="text-[#10b981]">✓</span> Zéro dépendance jQuery ou WordPress</div>
                      <div><span className="text-[#10b981]">✓</span> Temps de réponse serveur Edge : <span className="text-[#e5a93c] font-bold">28ms</span></div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="p-5 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono-num text-[#10b981] font-bold">TUNNEL DE CONVERSION EN DIRECT</span>
                        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                      </div>
                      <span className="font-mono-num font-extrabold text-3xl text-white block mb-1">
                        +240%
                      </span>
                      <span className="text-xs text-[#a0a6b5]">
                        Augmentation moyenne des prises de contact directes via nos tunnels WhatsApp & formulaires.
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[#a0a6b5]">Gestion publicitaire Meta Ads</span>
                      <span className="font-mono-num font-bold text-[#e5a93c]">100+ Comptes Partenaires</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stage Bottom Action */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono-num text-[#a0a6b5]">
                Étape {activeStep + 1} sur 4
              </span>

              <button
                type="button"
                onMouseEnter={playHoverSound}
                onClick={() => {
                  playClickSound();
                  onOpenDrawer();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e5a93c] to-[#d69527] text-[#08090d] font-display font-bold text-xs uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-lg flex items-center gap-2"
              >
                <span>Démarrer cette étape</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
