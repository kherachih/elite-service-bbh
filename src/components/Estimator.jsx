import React, { useState } from 'react';
import { Check, Clock, ArrowRight, Sparkles, DollarSign } from 'lucide-react';
import { playHoverSound, playClickSound } from '../utils/audio';

export default function Estimator({ t, onTransferScope }) {
  const [platformType, setPlatformType] = useState('vitrine');
  const [complexity, setComplexity] = useState('standard');
  const [currency, setCurrency] = useState('DZD');
  const [addons, setAddons] = useState({
    payment: false,
    multilingual: true,
    dashboard: false,
    growth: false,
  });
  const [speed, setSpeed] = useState('normal');

  const basePricing = {
    vitrine: { dzd: 120000, eur: 850, weeks: '2 à 3' },
    ecommerce: { dzd: 220000, eur: 1550, weeks: '3 à 5' },
    saas: { dzd: 380000, eur: 2650, weeks: '4 à 6' },
    erp: { dzd: 540000, eur: 3800, weeks: '6 à 8' },
    automation: { dzd: 160000, eur: 1150, weeks: '2 à 3' },
  };

  const complexityMultipliers = {
    mvp: 0.85,
    standard: 1.0,
    enterprise: 1.45,
  };

  const addonPrices = {
    payment: { dzd: 45000, eur: 310 },
    multilingual: { dzd: 35000, eur: 240 },
    dashboard: { dzd: 50000, eur: 350 },
    growth: { dzd: 40000, eur: 280 },
  };

  const speedMultipliers = {
    normal: 1.0,
    fast: 1.25,
  };

  const base = basePricing[platformType];
  const mult = complexityMultipliers[complexity] * speedMultipliers[speed];

  const totalDzd = Math.round(
    base.dzd * mult +
      (addons.payment ? addonPrices.payment.dzd : 0) +
      (addons.multilingual ? addonPrices.multilingual.dzd : 0) +
      (addons.dashboard ? addonPrices.dashboard.dzd : 0) +
      (addons.growth ? addonPrices.growth.dzd : 0)
  );

  const totalEur = Math.round(
    base.eur * mult +
      (addons.payment ? addonPrices.payment.eur : 0) +
      (addons.multilingual ? addonPrices.multilingual.eur : 0) +
      (addons.dashboard ? addonPrices.dashboard.eur : 0) +
      (addons.growth ? addonPrices.growth.eur : 0)
  );

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  const handleTransfer = () => {
    playClickSound();
    const scopeData = {
      type: platformType,
      complexity,
      speed,
      addons,
      currency,
      estimatedPrice: currency === 'DZD' ? `${formatNumber(totalDzd)} DA` : `${formatNumber(totalEur)} €`,
      estimatedTime: `${base.weeks} semaines`,
    };
    onTransferScope(scopeData);
  };

  return (
    <section id="estimator" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-mono-num font-semibold text-[#e5a93c] tracking-widest uppercase block mb-3">
            // ESTIMATEUR DYNAMIQUE
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight text-balance">
            Estimez votre investissement en toute clarté
          </h2>
        </div>
        <p className="text-sm sm:text-base text-[#a0a6b5] max-w-md font-normal leading-relaxed text-pretty">
          Configurez votre pile technique pour obtenir instantanément une estimation réaliste de délai et de budget.
        </p>
      </div>

      {/* Configurator Liquid Glass Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 rounded-3xl liquid-glass border border-white/10 shadow-2xl">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Step 1: Platform Type */}
          <div>
            <label className="text-xs font-mono-num font-semibold text-white uppercase block mb-3">
              1. Type d'architecture souhaitée
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'vitrine', label: 'Site Vitrine Haute Fidélité' },
                { key: 'ecommerce', label: 'Boutique E-Commerce Complète' },
                { key: 'saas', label: 'Application SaaS Métier' },
                { key: 'erp', label: 'ERP de Gestion Sur-Mesure' },
                { key: 'automation', label: 'Pipelines d\'Automatisation & API' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    playClickSound();
                    setPlatformType(item.key);
                  }}
                  className={`p-4 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between border ${
                    platformType === item.key
                      ? 'bg-gradient-to-r from-white/15 to-white/5 border-[#e5a93c] text-white shadow-lg'
                      : 'bg-white/[0.02] border-white/5 text-[#a0a6b5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="font-semibold">{item.label}</span>
                  {platformType === item.key && (
                    <Check className="w-4 h-4 text-[#e5a93c]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Complexity */}
          <div>
            <label className="text-xs font-mono-num font-semibold text-white uppercase block mb-3">
              2. Niveau d'envergure
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { key: 'mvp', label: 'Version Essentielle (MVP)' },
                { key: 'standard', label: 'Production Standard' },
                { key: 'enterprise', label: 'Entreprise & Multi-Sites' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    playClickSound();
                    setComplexity(item.key);
                  }}
                  className={`p-3.5 rounded-xl text-xs font-medium transition-all text-center border ${
                    complexity === item.key
                      ? 'bg-gradient-to-r from-white/15 to-white/5 border-[#e5a93c] text-white font-bold shadow-md'
                      : 'bg-white/[0.02] border-white/5 text-[#a0a6b5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Add-ons */}
          <div>
            <label className="text-xs font-mono-num font-semibold text-white uppercase block mb-3">
              3. Options stratégiques
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'payment', label: 'Paiement CIB / Edahabia / Stripe' },
                { key: 'multilingual', label: 'Support Trilingue (FR, EN, Arabe)' },
                { key: 'dashboard', label: 'Tableau de bord financier live' },
                { key: 'growth', label: 'Campagne de lancement sponsoring' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    playClickSound();
                    setAddons((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                  }}
                  className={`p-4 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between border ${
                    addons[item.key]
                      ? 'bg-[#e5a93c]/10 border-[#e5a93c]/60 text-white'
                      : 'bg-white/[0.02] border-white/5 text-[#a0a6b5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="font-semibold">{item.label}</span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      addons[item.key]
                        ? 'bg-[#e5a93c] border-[#e5a93c] text-[#08090d]'
                        : 'border-white/20'
                    }`}
                  >
                    {addons[item.key] && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Summary Box (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-2xl bg-gradient-to-b from-white/[0.05] to-black/40 border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <span className="font-display font-bold text-base text-white">
                Synthèse prévisionnelle
              </span>

              {/* Currency Selector */}
              <div className="flex items-center p-1 rounded-full bg-black/50 border border-white/10 text-xs font-mono-num">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setCurrency('DZD');
                  }}
                  className={`px-3 py-1 rounded-full transition-all ${
                    currency === 'DZD' ? 'bg-[#e5a93c] text-black font-bold' : 'text-[#a0a6b5]'
                  }`}
                >
                  DA
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setCurrency('EUR');
                  }}
                  className={`px-3 py-1 rounded-full transition-all ${
                    currency === 'EUR' ? 'bg-[#e5a93c] text-black font-bold' : 'text-[#a0a6b5]'
                  }`}
                >
                  € EUR
                </button>
              </div>
            </div>

            {/* Timeframe */}
            <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#e5a93c]/10 flex items-center justify-center text-[#e5a93c] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono-num text-[#a0a6b5] uppercase block">
                  Délai de livraison estimé
                </span>
                <span className="font-display font-bold text-lg text-white">
                  {base.weeks} semaines
                </span>
              </div>
            </div>

            {/* Price Tag */}
            <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-[#1c202e] to-[#0d0f14] border border-white/15">
              <span className="text-xs font-mono-num text-[#a0a6b5] uppercase block mb-1">
                Fourchette d'investissement
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-num font-extrabold text-3xl sm:text-4xl text-[#e5a93c] tracking-tight">
                  {currency === 'DZD' ? formatNumber(totalDzd) : formatNumber(totalEur)}
                </span>
                <span className="font-display font-bold text-sm text-white">
                  {currency === 'DZD' ? 'DA HT' : '€ HT'}
                </span>
              </div>
              <span className="text-xs text-[#a0a6b5] font-mono-num mt-2 block">
                Équivalent : {currency === 'DZD' ? `${formatNumber(totalEur)} €` : `${formatNumber(totalDzd)} DA`}
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onMouseEnter={playHoverSound}
              onClick={handleTransfer}
              className="w-full py-4 px-6 rounded-xl bg-[#e5a93c] hover:bg-[#d69527] text-[#08090d] font-display font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl hover:shadow-[#e5a93c]/20 mb-3"
            >
              <span>Transférer ces spécifications</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-[#a0a6b5] text-center leading-relaxed">
              Estimation indicative. Le cadrage direct confirme le cahier des charges ferme.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}
