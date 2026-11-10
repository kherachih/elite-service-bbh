import React from 'react';
import { Globe, Database, Cpu, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { playHoverSound, playClickSound } from '../utils/audio';

export default function Services({ t, onOpenEstimator }) {
  const disciplines = [
    {
      num: '01',
      title: 'Applications Web & Vitrines de Luxe',
      tagline: 'Des flagships numériques ultra-rapides qui convertissent et imposent votre autorité.',
      badge: 'Frontends & E-Commerce',
      icon: Globe,
      accent: 'from-[#e5a93c]/20 to-transparent',
      borderColor: 'group-hover:border-[#e5a93c]/50',
      points: [
        'Architecture React 19 & Vite (sub-second mobile)',
        'Design visuel immersif calibre Awwwards',
        'SEO sémantique & métadonnées riches',
        'Zéro constructeur lourd (pas de lenteur WordPress)',
      ],
    },
    {
      num: '02',
      title: 'Plateformes SaaS & ERP Cloud Métier',
      tagline: 'Remplacez les tableurs dispersés par un cockpit opérationnel taillé sur-mesure.',
      badge: 'SaaS & Gestion d\'Entreprise',
      icon: Database,
      accent: 'from-[#06b6d4]/20 to-transparent',
      borderColor: 'group-hover:border-[#06b6d4]/50',
      points: [
        'Gestion en direct des stocks et des commandes',
        'Contrôle des accès par rôles (RBAC sécurisé)',
        'Génération automatique de devis et factures',
        'Zéro coût d\'abonnement récurrent par utilisateur',
      ],
    },
    {
      num: '03',
      title: 'Systèmes d\'Automatisation & API',
      tagline: 'Connectez vos logiciels pour éliminer les tâches manuelles répétitives.',
      badge: 'Automatisation & Flux Déterministes',
      icon: Cpu,
      accent: 'from-[#10b981]/20 to-transparent',
      borderColor: 'group-hover:border-[#10b981]/50',
      points: [
        'Passerelles CIB, Edahabia et Stripe intégrées',
        'Routage automatique des commandes vers WhatsApp',
        'Mise à jour en temps réel des bases de données',
        'Sauvegardes chiffrées automatiques au quotidien',
      ],
    },
    {
      num: '04',
      title: 'Sponsoring & Tunnels Média Haute Vélocité',
      tagline: 'Acquisition payante ultra-ciblée sur Meta et Instagram avec suivi précis du ROI.',
      badge: 'Croissance & Acquisition Chiffrée',
      icon: TrendingUp,
      accent: 'from-white/15 to-transparent',
      borderColor: 'group-hover:border-white/40',
      points: [
        'Campagnes publicitaires ciblées B2B ou B2C',
        'Gestion de plus de 100 comptes partenaires',
        'Tunnels d\'acquisition orientés contact direct',
        'Optimisation permanente du coût par prospect qualifié',
      ],
    },
  ];

  return (
    <section id="services" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 relative z-10">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-mono-num font-semibold text-[#e5a93c] tracking-widest uppercase block mb-3">
            // NOS DISCIPLINES MAÎTRESSES
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight text-balance">
            Une expertise logicielle complète, conçue pour votre essor commercial
          </h2>
        </div>
        <p className="text-sm sm:text-base text-[#a0a6b5] max-w-md font-normal leading-relaxed text-pretty">
          Chaque projet est traité comme une pièce d'artisanat industriel : performance brute, esthétique raffinée et propriété intégrale de votre code.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {disciplines.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onMouseEnter={playHoverSound}
              className={`group relative p-8 sm:p-10 rounded-2xl liquid-glass ${item.borderColor} transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl`}
            >
              {/* Subtle Corner Glow Accent */}
              <div
                className={`pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full bg-gradient-to-br ${item.accent} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-mono-num font-semibold bg-white/5 border border-white/10 text-white">
                    {item.badge}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#e5a93c] group-hover:text-[#08090d] transition-all duration-300 shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <span className="font-mono-num text-xs text-[#a0a6b5] block mb-2">
                  DISCIPLINE 0{idx + 1}
                </span>

                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3 tracking-tight group-hover:text-[#e5a93c] transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-[#a0a6b5] leading-relaxed mb-8">
                  {item.tagline}
                </p>

                <ul className="space-y-3 mb-10">
                  {item.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-3 text-xs sm:text-sm text-[#f8f9fa]">
                      <CheckCircle2 className="w-4 h-4 text-[#e5a93c] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    playClickSound();
                    onOpenEstimator();
                  }}
                  className="text-xs font-display font-bold uppercase tracking-wider text-[#e5a93c] group-hover:text-white flex items-center gap-2 transition-colors"
                >
                  <span>Configurer ce périmètre</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </button>
                <span className="font-mono-num text-xs text-[#6b7280]">
                  Garantie 0 Latence
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
