import React, { useState } from 'react';
import { Code2, Server, Shield } from 'lucide-react';

export default function EngineRoom({ t }) {
  const [activeTab, setActiveTab] = useState('frontend');

  const stackDetails = {
    frontend: {
      title: 'Frontend & Temps de rendu',
      desc: 'Aucun constructeur lourd (WordPress, Elementor). Code compilé avec zéro décalage cumulé (CLS = 0.0).',
      techs: [
        { name: 'React 19 & TypeScript', note: 'Typage strict et zéro runtime d\'erreurs inattendues' },
        { name: 'Vite 8 & ES Modules', note: 'Bundles légers (<150 kB gzip) et chargement en moins de 800ms' },
        { name: 'Tailwind CSS Tokens', note: 'Styles déclaratifs sans surcharge de fichiers CSS externes' },
      ],
      code: `// Audit de performance de rendu frontend
export const performanceTarget = {
  firstContentfulPaint: '< 750ms',
  largestContentfulPaint: '< 1.1s',
  cumulativeLayoutShift: 0.0,
  targetNetwork: 'Mobile 4G Algérie',
  proprietaryCode: true
};`
    },
    backend: {
      title: 'Backend & Données relationnelles',
      desc: 'Bases de données transactionnelles avec intégrité ACID et logique métier isolée.',
      techs: [
        { name: 'PostgreSQL Relational DB', note: 'Schémas stricts, relations garanties et sauvegardes quotidiennes' },
        { name: 'Node.js Micro-APIs', note: 'Endpoints modulaires avec validation rigoureuse des requêtes' },
        { name: 'Connecteurs CIB & Edahabia', note: 'Rapprochement bancaire déterministe et sécurisé' },
      ],
      code: `// Middleware d'intégrité de commande
async function processOrder(orderId, paymentProof) {
  const tx = await db.beginTransaction();
  try {
    await verifyPaymentWebhook(paymentProof);
    await decrementInventory(tx, orderId);
    await generateInvoicePDF(orderId);
    await tx.commit();
  } catch (err) {
    await tx.rollback();
  }
}`
    },
    infra: {
      title: 'Infrastructure & Distribution réseau',
      desc: 'Hébergement haute disponibilité, certificat SSL A+ et filtrage des attaques DDoS.',
      techs: [
        { name: 'Cloudflare Edge CDN', note: 'Mise en cache statique distribuée pour les utilisateurs locaux' },
        { name: 'Docker Containers', note: 'Environnements de production hermétiques et reproductibles' },
        { name: 'Chiffrement SSL A+', note: 'Protocoles TLS 1.3 et en-têtes de sécurité stricts (HSTS)' },
      ],
      code: `// En-têtes de sécurité HTTP stricts
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'"
};`
    },
  };

  const current = stackDetails[activeTab];

  return (
    <section id="engine" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16">
      
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-mono-num text-[#e59b2c] block mb-2">
          {t.engine.tag}
        </span>
        <h2 className="font-sans font-semibold text-2xl sm:text-3xl lg:text-4xl text-[#f1f3f7] tracking-tight mb-3">
          {t.engine.title}
        </h2>
        <p className="text-sm text-[#9ba1b4] leading-relaxed">
          {t.engine.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'frontend', label: 'Frontend', icon: Code2 },
          { key: 'backend', label: 'Backend & Données', icon: Server },
          { key: 'infra', label: 'Infrastructure & Sécurité', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sans transition-colors border ${
                activeTab === tab.key
                  ? 'bg-[#1c202c] border-[#e59b2c] text-[#f1f3f7] font-medium'
                  : 'card-surface border-white/5 text-[#9ba1b4] hover:text-[#f1f3f7]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#e59b2c]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 rounded-xl card-surface border-hairline">
        
        {/* Left Tech List (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <h3 className="font-sans font-semibold text-xl text-[#f1f3f7] mb-1">
              {current.title}
            </h3>
            <p className="text-xs text-[#9ba1b4] leading-relaxed">
              {current.desc}
            </p>
          </div>

          <div className="space-y-2 pt-3">
            {current.techs.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-[#171a22]">
                <span className="font-sans font-semibold text-xs text-[#f1f3f7] block mb-0.5">
                  {item.name}
                </span>
                <span className="text-[11px] text-[#9ba1b4] leading-relaxed">
                  {item.note}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Code (6 cols) */}
        <div className="lg:col-span-6 p-4 rounded-lg bg-[#0d0f14] border border-white/5 font-mono-num text-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3 text-[11px] text-[#676f82]">
            <span>architecture-sample.ts</span>
            <span className="text-[#10b981]">Conforme production</span>
          </div>

          <pre className="text-[#9ba1b4] overflow-x-auto whitespace-pre-wrap leading-relaxed py-1">
            <code>{current.code}</code>
          </pre>

          <div className="pt-3 border-t border-white/5 text-[10px] text-[#676f82] flex items-center justify-between">
            <span>Code source vérifié</span>
            <span>TypeScript 5.8</span>
          </div>
        </div>

      </div>

    </section>
  );
}
