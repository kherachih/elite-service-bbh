import React, { useState, useRef } from 'react';
import { ArrowRight, Sparkles, Database, Shield, Zap, CheckCircle2, Activity, Server, Cpu } from 'lucide-react';
import { playHoverSound, playClickSound } from '../utils/audio';

export default function Hero({ t, onOpenEstimator, onOpenDrawer }) {
  const [activeTab, setActiveTab] = useState('traffic');
  const [tilt, setTilt] = useState({ x: 0, y: 0, specularX: 50, specularY: 50 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -6;
    const rotY = ((x - centerX) / centerX) * 6;

    setTilt({
      x: rotX,
      y: rotY,
      specularX: (x / rect.width) * 100,
      specularY: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, specularX: 50, specularY: 50 });
  };

  return (
    <section className="relative pt-6 sm:pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] kinetic-glow pointer-events-none blur-3xl -z-10" />

      {/* Tightened Studio Status Indicator */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono-num text-[#a0a6b5] mb-6 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
        </span>
        <span className="text-[#f8f9fa] font-medium tracking-wide text-[11px] sm:text-xs">
          ELITESCE // HIGH-PERFORMANCE WEB ARCHITECTURE · DISPONIBLE T2/T3
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
        
        {/* Left Column: Monumental Text & Actions (6 cols) */}
        <div className="lg:col-span-6">
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#f8f9fa] tracking-tight leading-[1.08] text-balance mb-4">
            Nous bâtissons les systèmes qui{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e5a93c] via-[#ffd580] to-[#e5a93c]">
              marquent les esprits.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#a0a6b5] leading-relaxed mb-8 max-w-xl font-normal text-pretty">
            Applications web sur-mesure, plateformes SaaS et systèmes de gestion ERP haute vélocité. 
            Une immersion esthétique totale alliée à une rigueur logicielle sans compromis technique.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 mb-8">
            <button
              type="button"
              onMouseEnter={playHoverSound}
              onClick={() => {
                playClickSound();
                onOpenEstimator();
              }}
              className="relative group px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#e5a93c] to-[#d69527] text-[#08090d] font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 shadow-xl hover:shadow-[#e5a93c]/25 flex items-center gap-2"
            >
              <span>Calculer mon projet</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onMouseEnter={playHoverSound}
              onClick={() => {
                playClickSound();
                onOpenDrawer();
              }}
              className="px-7 py-3.5 rounded-xl liquid-glass liquid-glass-hover text-[#f8f9fa] font-display font-semibold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center gap-2"
            >
              <span>Initier un échange</span>
            </button>
          </div>

          {/* 3 Live Key Indicators */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5">
            <div>
              <span className="font-mono-num font-bold text-2xl text-white block">
                24+
              </span>
              <span className="text-[11px] text-[#a0a6b5] leading-tight block mt-0.5">
                Plateformes livrées
              </span>
            </div>
            <div>
              <span className="font-mono-num font-bold text-2xl text-[#06b6d4] block">
                &lt; 700ms
              </span>
              <span className="text-[11px] text-[#a0a6b5] leading-tight block mt-0.5">
                Vitesse 4G mobile
              </span>
            </div>
            <div>
              <span className="font-mono-num font-bold text-2xl text-[#e5a93c] block">
                0 DA
              </span>
              <span className="text-[11px] text-[#a0a6b5] leading-tight block mt-0.5">
                Taxe par utilisateur
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D High-Tech Systems Console (Pure Engineering, No Partners) */}
        <div className="lg:col-span-6 perspective-1200">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 120ms cubic-bezier(0.2, 0, 0, 1)',
            }}
            className="relative rounded-2xl liquid-glass overflow-hidden shadow-2xl border border-white/10 group cursor-default"
          >
            {/* Specular Light Sheen */}
            <div
              className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-60 group-hover:opacity-100"
              style={{
                background: `radial-gradient(400px circle at ${tilt.specularX}% ${tilt.specularY}%, rgba(229, 169, 60, 0.15), transparent 70%)`,
              }}
            />

            {/* Top Chrome Header */}
            <div className="px-5 py-3 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs font-mono-num">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5a93c]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/80" />
                <span className="ml-2 text-[#f8f9fa] font-semibold text-xs">
                  Console Système · Architecture Cloud v2.4
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#10b981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                <span>Cluster actif · 18ms</span>
              </div>
            </div>

            {/* Interactive Tabs (Navigation Liked by User) */}
            <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {[
                  { key: 'traffic', label: 'Requêtes API Live' },
                  { key: 'security', label: 'Sécurité & WAF' },
                  { key: 'pipelines', label: 'Déploiement' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onMouseEnter={playHoverSound}
                    onClick={() => {
                      playClickSound();
                      setActiveTab(tab.key);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                      activeTab === tab.key
                        ? 'bg-[#e5a93c] text-[#08090d] font-bold shadow-md'
                        : 'text-[#a0a6b5] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono-num text-[#e5a93c]">
                Cloudflare Edge
              </span>
            </div>

            {/* Tab Content Panel (Pure High-Tech Engineering, Zero Partner Names) */}
            <div className="p-5 space-y-3">
              
              {/* Tab 1: Live API Endpoints & Fast Latency */}
              {activeTab === 'traffic' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 text-[11px] font-mono-num text-[#6b7280] px-3 pb-1 border-b border-white/5">
                    <span className="col-span-3">MÉTHODE</span>
                    <span className="col-span-4">ENDPOINT</span>
                    <span className="col-span-3 text-right">TEMPS RÉP.</span>
                    <span className="col-span-2 text-right">STATUT</span>
                  </div>

                  {[
                    { method: 'POST', endpoint: '/api/v2/checkout/cib', latency: '18ms', status: '200 OK', color: 'text-[#10b981]' },
                    { method: 'GET', endpoint: '/api/v2/inventory/sync', latency: '24ms', status: '200 OK', color: 'text-[#10b981]' },
                    { method: 'WS', endpoint: '/realtime/orders/stream', latency: '6ms', status: 'Connecté', color: 'text-[#06b6d4]' },
                    { method: 'POST', endpoint: '/api/v2/auth/verify', latency: '14ms', status: '200 OK', color: 'text-[#10b981]' },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 items-center text-xs px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all"
                    >
                      <span className="col-span-3 font-mono-num text-[#e5a93c] font-semibold text-[11px]">
                        {row.method}
                      </span>
                      <span className="col-span-4 font-mono-num text-[#f8f9fa] text-xs truncate">
                        {row.endpoint}
                      </span>
                      <span className="col-span-3 font-mono-num text-[#a0a6b5] text-right font-medium">
                        {row.latency}
                      </span>
                      <span className={`col-span-2 font-mono-num text-[11px] text-right font-bold ${row.color}`}>
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Security & WAF */}
              {activeTab === 'security' && (
                <div className="space-y-2.5">
                  {[
                    { title: 'Pare-feu d\'applications web (WAF)', detail: 'Filtrage anti-DDoS niveau 7 actif', status: 'Protégé', color: 'text-[#10b981]' },
                    { title: 'Chiffrement des transactions', detail: 'Algorithme AES-256 GCM avec TLS 1.3', status: 'Conforme', color: 'text-[#10b981]' },
                    { title: 'Isolation des bases de données', detail: 'Schémas relationnels étanches et sauvegardes chiffrées', status: 'Sécurisé', color: 'text-[#06b6d4]' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white block">{item.title}</span>
                        <span className="text-[11px] text-[#a0a6b5]">{item.detail}</span>
                      </div>
                      <span className={`text-xs font-mono-num font-bold ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Build Pipelines & Runtime */}
              {activeTab === 'pipelines' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] font-mono-num text-[#a0a6b5] block mb-1">
                      Débit réseau instantané
                    </span>
                    <span className="font-mono-num font-extrabold text-2xl text-white block">
                      14 820 req/s
                    </span>
                    <span className="text-[11px] text-[#10b981] font-semibold mt-1 inline-block">
                      Core Web Vitals : 100/100
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[11px] font-mono-num text-[#a0a6b5] block mb-1">
                      Temps de compilation Vite
                    </span>
                    <span className="font-mono-num font-extrabold text-2xl text-[#e5a93c] block">
                      1.46s
                    </span>
                    <span className="text-[11px] text-[#a0a6b5] font-medium mt-1 inline-block">
                      Taille bundle gzippé : 90 kB
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Proof Bar */}
            <div className="px-5 py-2.5 bg-black/30 border-t border-white/5 flex items-center justify-between text-[11px] font-mono-num text-[#a0a6b5]">
              <span className="flex items-center gap-1.5 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                Infrastructure cloud haute disponibilité
              </span>
              <span className="text-[#e5a93c]">Uptime 99.99%</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
