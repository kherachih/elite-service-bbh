import React, { useState } from 'react';
import { ArrowRight, Users, Eye, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { playHoverSound, playClickSound } from '../utils/audio';

export default function SponsoringSimulator({ t, onLockPlan }) {
  const [budget, setBudget] = useState(25000);
  const [audience, setAudience] = useState('b2c');

  const presets = [5000, 15000, 25000, 50000, 100000, 200000];

  const cpm = audience === 'b2c' ? 380 : 720;
  const totalViews = Math.round((budget / cpm) * 1000);
  const dailyReach = Math.round(totalViews / 30);
  const convRate = audience === 'b2c' ? 0.012 : 0.018;
  const estimatedLeads = Math.max(12, Math.round(totalViews * convRate * 0.15));

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  const handleLock = () => {
    playClickSound();
    onLockPlan({
      budget: `${formatNumber(budget)} DA / mois`,
      audience: audience === 'b2c' ? 'Particuliers (B2C)' : 'Professionnels & Décideurs (B2B)',
      estimatedViews: `${formatNumber(totalViews)} impressions`,
      estimatedLeads: `${formatNumber(estimatedLeads)} contacts qualifiés`,
    });
  };

  return (
    <section id="simulator" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-mono-num font-semibold text-[#10b981] tracking-widest uppercase block mb-3">
            // SIMULATEUR DE CROISSANCE PUBLICITAIRE
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight text-balance">
            Calculez la portée et les retours de vos campagnes
          </h2>
        </div>
        <p className="text-sm sm:text-base text-[#a0a6b5] max-w-md font-normal leading-relaxed text-pretty">
          Ajustez votre budget pour projeter avec précision votre visibilité et vos prises de contact directes.
        </p>
      </div>

      {/* Simulator Liquid Glass Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 rounded-3xl liquid-glass border border-white/10 shadow-2xl items-center">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Audience Toggle */}
          <div>
            <label className="text-xs font-mono-num font-semibold text-white uppercase block mb-3">
              Audience Cible
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onMouseEnter={playHoverSound}
                onClick={() => {
                  playClickSound();
                  setAudience('b2c');
                }}
                className={`p-4 rounded-xl text-left border transition-all ${
                  audience === 'b2c'
                    ? 'bg-gradient-to-r from-white/15 to-white/5 border-[#10b981] text-white shadow-lg'
                    : 'bg-white/[0.02] border-white/5 text-[#a0a6b5] hover:text-white'
                }`}
              >
                <span className="font-display font-bold text-sm block mb-1">
                  Grand Public & Consommateurs (B2C)
                </span>
                <span className="text-xs text-[#a0a6b5]">
                  Notoriété maximale, volume élevé et achats d'impulsion
                </span>
              </button>

              <button
                type="button"
                onMouseEnter={playHoverSound}
                onClick={() => {
                  playClickSound();
                  setAudience('b2b');
                }}
                className={`p-4 rounded-xl text-left border transition-all ${
                  audience === 'b2b'
                    ? 'bg-gradient-to-r from-white/15 to-white/5 border-[#10b981] text-white shadow-lg'
                    : 'bg-white/[0.02] border-white/5 text-[#a0a6b5] hover:text-white'
                }`}
              >
                <span className="font-display font-bold text-sm block mb-1">
                  Entreprises & Décideurs (B2B)
                </span>
                <span className="text-xs text-[#a0a6b5]">
                  Ciblage ultra-qualifié, dirigeants et commerces
                </span>
              </button>
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono-num font-semibold text-white uppercase">
                Budget Publicitaire Mensuel
              </label>
              <span className="font-mono-num font-extrabold text-2xl text-[#10b981]">
                {formatNumber(budget)} DA
              </span>
            </div>

            <input
              type="range"
              min="3800"
              max="250000"
              step="1000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-4">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    playClickSound();
                    setBudget(val);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-num transition-all ${
                    budget === val
                      ? 'bg-[#10b981] text-[#08090d] font-bold shadow-md'
                      : 'bg-white/5 text-[#a0a6b5] hover:text-white hover:bg-white/10'
                  }`}
                >
                  {formatNumber(val)} DA
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#a0a6b5]">
            <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
            <span>Basé sur les données de plus de 100 comptes publicitaires gérés par l'équipe EliteSCE.</span>
          </div>

        </div>

        {/* Right Output Metrics (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-2xl bg-gradient-to-br from-[#1c202e] to-[#0d0f14] border border-white/15 space-y-5 shadow-xl">
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono-num text-[#a0a6b5] uppercase block">
                  Portée quotidienne estimée
                </span>
                <span className="font-display font-semibold text-xs text-white">
                  Chaque jour
                </span>
              </div>
            </div>
            <span className="font-mono-num font-bold text-xl text-white">
              ~ {formatNumber(dailyReach)}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e5a93c]/10 flex items-center justify-center text-[#e5a93c]">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono-num text-[#a0a6b5] uppercase block">
                  Impressions totales sur 30 jours
                </span>
                <span className="font-display font-semibold text-xs text-white">
                  Vues ciblées
                </span>
              </div>
            </div>
            <span className="font-mono-num font-bold text-xl text-[#e5a93c]">
              {formatNumber(totalViews)}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/25">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono-num text-[#10b981] uppercase block font-semibold">
                  Contacts qualifiés estimés
                </span>
                <span className="font-display font-semibold text-xs text-[#f8f9fa]">
                  Conversations WhatsApp & appels
                </span>
              </div>
            </div>
            <span className="font-mono-num font-extrabold text-2xl text-[#10b981]">
              {formatNumber(estimatedLeads)}+
            </span>
          </div>

          <button
            type="button"
            onMouseEnter={playHoverSound}
            onClick={handleLock}
            className="w-full py-4 px-6 rounded-xl bg-[#10b981] hover:bg-[#0ea371] text-[#08090d] font-display font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Verrouiller ce plan de sponsoring</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>

    </section>
  );
}
