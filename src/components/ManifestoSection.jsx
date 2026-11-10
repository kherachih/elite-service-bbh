import React from 'react';
import ScrollTextReveal from './ui/ScrollTextReveal';
import SpotlightCard from './ui/SpotlightCard';
import { ShimmerButton, CornerButton } from './ui/Buttons';
import { ShieldCheck, Zap, Code2, Gauge } from 'lucide-react';

export default function ManifestoSection({ t, onOpenEstimator, onOpenDrawer }) {
  const manifestoText = 
    "Au-delà des promesses de modèles IA standardisés et de templates préfabriqués, EliteSCE défend l'artisanat logiciel de haute précision. Nous concevons des plateformes déterministes, des interfaces d'autorité et des campagnes d'acquisition où chaque milliseconde gagnée se transforme en chiffre d'affaires direct.";

  return (
    <section className="py-28 px-4 sm:px-6 relative z-10 border-t border-white/5 bg-[#090b0e]">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <span className="text-xs uppercase font-mono-num font-semibold tracking-widest text-[#e5a93c] mb-6 inline-block">
          // LE MANIFESTE D'INGÉNIERIE ELITESCE
        </span>

        {/* Scroll-Linked Word by Word Reveal */}
        <ScrollTextReveal
          text={manifestoText}
          highlightWord="EliteSCE"
          className="my-4"
        />

        {/* Action CTAs using Vengeance UI Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
          <ShimmerButton onClick={() => onOpenDrawer()}>
            <span>Rejoindre l'élite numérique</span>
          </ShimmerButton>

          <CornerButton onClick={onOpenEstimator}>
            <span>Simuler vos coûts de développement</span>
          </CornerButton>
        </div>
      </div>

      {/* 3 Core Philosophical Pillars (Skiper UI Spotlight Cards) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
        <SpotlightCard spotlightColor="rgba(229, 169, 60, 0.25)">
          <div className="w-10 h-10 rounded-xl bg-[#e5a93c]/10 text-[#e5a93c] flex items-center justify-center mb-5">
            <Gauge className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl text-white mb-2">
            Vitesse Sans Compromis
          </h3>
          <p className="text-xs sm:text-sm text-[#949aa4] leading-relaxed">
            Pas de CMS obèse. Pas de plugins vulnérables. Du code compilé optimisé pour charger sous la seconde même sur les réseaux mobiles 4G.
          </p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.25)">
          <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl text-white mb-2">
            Zéro Taxe Récurrente
          </h3>
          <p className="text-xs sm:text-sm text-[#949aa4] leading-relaxed">
            Votre code et vos données vous appartiennent à 100%. Nous ne vous enfermons dans aucun abonnement mensuel par utilisateur.
          </p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.25)">
          <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 text-[#06b6d4] flex items-center justify-center mb-5">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl text-white mb-2">
            Acquisition Mathématique
          </h3>
          <p className="text-xs sm:text-sm text-[#949aa4] leading-relaxed">
            Chaque dinar investi en sponsoring est tracé jusqu'à la conversation WhatsApp ou au panier d'achat. Zéro budget gaspillé.
          </p>
        </SpotlightCard>
      </div>
    </section>
  );
}
