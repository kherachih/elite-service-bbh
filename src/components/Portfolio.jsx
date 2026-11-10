import React, { useState } from 'react';
import { ArrowUpRight, X, Check, Award, Layers, Sparkles } from 'lucide-react';
import { playHoverSound, playClickSound } from '../utils/audio';

export default function Portfolio({ t, onOpenDrawer }) {
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = [
    {
      id: 'chaz',
      title: 'Chaz EyeWear',
      domain: 'chazeyewear.com',
      sector: 'Commerce & Lunetterie haut de gamme',
      headline: 'Plateforme E-Commerce de luxe et vitrine de marque haute fidélité.',
      metric: '0.7s',
      metricLabel: 'Temps de chargement sur réseau 4G',
      tags: ['React', 'Catalogue dynamique', 'Paiement en ligne', 'Images AVIF'],
      accentColor: 'border-[#e5a93c]/30 hover:border-[#e5a93c]',
      glowColor: 'bg-[#e5a93c]/15',
      challenge: 'Le site précédent chargeait en plus de 4 secondes sur smartphone à cause de photographies non optimisées, provoquant des abandons de panier répétés.',
      solution: 'Reconstruction complète de l\'interface avec compression d\'images à la volée, mise en cache CDN et tunnel d\'achat fluide en une seule page.',
      results: [
        '+42% de taux de conversion sur smartphone',
        'Temps de chargement moyen réduit à 700ms',
        'Catalogue réactif avec recherche instantanée',
      ],
    },
    {
      id: 'toururworld',
      title: 'TourUrWorld',
      domain: 'toururworld.com',
      sector: 'Tourisme & Expéditions internationales',
      headline: 'Moteur de réservation et catalogue d\'itinéraires multi-devises.',
      metric: 'x2.5',
      metricLabel: 'Demandes de devis directes',
      tags: ['React', 'Multi-devises', 'Filtres avancés', 'Synchronisation CRM'],
      accentColor: 'border-[#06b6d4]/30 hover:border-[#06b6d4]',
      glowColor: 'bg-[#06b6d4]/15',
      challenge: 'Gérer des catalogues complexes d\'itinéraires avec des tarifs variables selon les saisons sans alourdir la navigation des visiteurs.',
      solution: 'Architecture modulaire avec filtrage instantané d\'itinéraires, sélecteur de devises en temps réel et routage direct des demandes vers l\'équipe commerciale.',
      results: [
        'Multiplication par 2.5 des prises de contact directes',
        'Navigation sans rechargement de page',
        'Support bilingue complet pour clientèle locale et diaspora',
      ],
    },
    {
      id: 'coreflow',
      title: 'CoreFlow Cloud ERP',
      domain: 'Système d\'exploitation interne',
      sector: 'Gestion opérationnelle & Stocks',
      headline: 'Cockpit centralisé pour le suivi des stocks, ventes et facturation.',
      metric: '20h',
      metricLabel: 'Économisées par semaine par équipe',
      tags: ['SaaS', 'PostgreSQL', 'Droits RBAC', 'Facturation automatique'],
      accentColor: 'border-[#10b981]/30 hover:border-[#10b981]',
      glowColor: 'bg-[#10b981]/15',
      challenge: 'Multiplication des erreurs de réconciliation de stocks suite à l\'utilisation de tableurs Excel partagés et non synchronisés entre les dépôts et la direction.',
      solution: 'Développement d\'une plateforme web interne avec base de données PostgreSQL sécurisée, génération automatique de bons de livraison et suivi de la trésorerie.',
      results: [
        'Élimination complète des écarts de stock non justifiés',
        'Zéro coût d\'abonnement récurrent par utilisateur',
        'Calcul automatique et instantané des marges nettes',
      ],
    },
  ];

  return (
    <section id="portfolio" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-mono-num font-semibold text-[#e5a93c] tracking-widest uppercase block mb-3">
            // ÉTUDES DE CAS RÉELLES
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight text-balance">
            Des réalisations vivantes, un impact commercial mesurable
          </h2>
        </div>
        <p className="text-sm sm:text-base text-[#a0a6b5] max-w-md font-normal leading-relaxed text-pretty">
          Découvrez comment nous avons transformé la présence numérique et les opérations concrètes de marques leaders.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((item) => (
          <div
            key={item.id}
            onMouseEnter={playHoverSound}
            onClick={() => {
              playClickSound();
              setSelectedProject(item);
            }}
            className={`group relative p-8 rounded-2xl liquid-glass ${item.accentColor} cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl`}
          >
            {/* Dynamic Corner Ambient Aura */}
            <div
              className={`pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full ${item.glowColor} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-mono-num text-[#a0a6b5] uppercase">
                  {item.sector}
                </span>
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#e5a93c] group-hover:text-[#08090d] transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <h3 className="font-display font-bold text-2xl text-white mb-2 group-hover:text-[#e5a93c] transition-colors">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#a0a6b5] leading-relaxed mb-6">
                {item.headline}
              </p>

              {/* Metric Card */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-6 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-mono-num text-[#a0a6b5] uppercase block mb-0.5">
                    {item.metricLabel}
                  </span>
                  <span className="font-mono-num font-extrabold text-2xl text-white">
                    {item.metric}
                  </span>
                </div>
                <span className="text-xs font-mono-num text-[#e5a93c] underline underline-offset-4">
                  {item.domain}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
              {item.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono-num bg-white/5 text-[#a0a6b5]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Case Study Deep-Dive Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl liquid-glass bg-[#0d0f14] border border-white/20 rounded-3xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                playClickSound();
                setSelectedProject(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-full liquid-glass hover:bg-white/10 text-[#a0a6b5] hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-mono-num font-bold text-[#e5a93c] uppercase block mb-1">
              // {selectedProject.sector}
            </span>

            <h3 className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-1">
              {selectedProject.title}
            </h3>

            <p className="text-xs font-mono-num text-[#a0a6b5] mb-8">
              Référence client : {selectedProject.domain}
            </p>

            <div className="space-y-5 text-sm text-[#f8f9fa] mb-8">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="font-display font-bold text-white block mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Défi initial rencontré
                </span>
                <p className="text-xs sm:text-sm text-[#a0a6b5] leading-relaxed">
                  {selectedProject.challenge}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="font-display font-bold text-white block mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e5a93c]" />
                  Solution technique déployée
                </span>
                <p className="text-xs sm:text-sm text-[#a0a6b5] leading-relaxed">
                  {selectedProject.solution}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/25">
                <span className="font-display font-bold text-white block mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  Résultats mesurés
                </span>
                <ul className="space-y-2">
                  {selectedProject.results.map((res, rIdx) => (
                    <li key={rIdx} className="flex items-center gap-2 text-xs sm:text-sm text-[#f8f9fa]">
                      <Check className="w-4 h-4 text-[#10b981] shrink-0" />
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#a0a6b5]">Impact vérifié :</span>
                <span className="text-sm font-mono-num font-bold text-[#e5a93c]">
                  {selectedProject.metric} {selectedProject.metricLabel}
                </span>
              </div>

              <button
                type="button"
                onMouseEnter={playHoverSound}
                onClick={() => {
                  playClickSound();
                  setSelectedProject(null);
                  onOpenDrawer({ projectNote: `Intéressé par une architecture similaire à ${selectedProject.title}` });
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#e5a93c] text-[#08090d] font-display font-bold text-xs uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-md"
              >
                Demander une étude similaire
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
