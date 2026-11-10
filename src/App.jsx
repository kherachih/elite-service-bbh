import React, { useState, useEffect } from 'react';
import { translations } from './translations';
import ThreeCanvas from './components/ThreeCanvas';
import CustomCursor from './components/CustomCursor';
import Header from './components/Header';
import Hero from './components/Hero';
import Metrics from './components/Metrics';
import Services from './components/Services';
import ScrollytellingExperience from './components/ScrollytellingExperience';
import Portfolio from './components/Portfolio';
import Estimator from './components/Estimator';
import SponsoringSimulator from './components/SponsoringSimulator';
import EngineRoom from './components/EngineRoom';
import ClientMarquee from './components/ClientMarquee';
import Footer from './components/Footer';
import ConciergeDrawer from './components/ConciergeDrawer';

export default function App() {
  const [lang, setLang] = useState('fr');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerInitialData, setDrawerInitialData] = useState(null);

  const t = translations[lang] || translations.fr;

  // Handle RTL vs LTR based on language
  useEffect(() => {
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t.dir]);

  const handleOpenDrawer = (data = null) => {
    setDrawerInitialData(data);
    setDrawerOpen(true);
  };

  const handleTransferScope = (scopeData) => {
    handleOpenDrawer(scopeData);
  };

  const handleLockPlan = (planData) => {
    handleOpenDrawer(planData);
  };

  const scrollToEstimator = () => {
    const el = document.getElementById('estimator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-[#08090d] text-[#f8f9fa] font-sans antialiased relative selection:bg-[#e5a93c]/30 selection:text-[#e5a93c] ${lang === 'ar' ? 'font-arabic' : ''}`}>
      
      {/* Interactive 3D Three.js Particle Mesh Wave Background (Reacts to Mouse & Scroll Velocity) */}
      <ThreeCanvas />

      {/* Magnetic Interactive Precision Cursor */}
      <CustomCursor />

      {/* Floating Glass Navigation with Sound Controls */}
      <Header
        lang={lang}
        setLang={setLang}
        t={t}
        onOpenDrawer={() => handleOpenDrawer()}
      />

      {/* Main Structural Flow */}
      <main className="relative z-10">
        <Hero
          t={t}
          onOpenEstimator={scrollToEstimator}
          onOpenDrawer={() => handleOpenDrawer()}
        />

        <Metrics t={t} />

        <Services
          t={t}
          onOpenEstimator={scrollToEstimator}
        />

        {/* Scroll-Driven Pinned Interactive Experience (Colibrity Inspired) */}
        <ScrollytellingExperience
          onOpenDrawer={() => handleOpenDrawer()}
        />

        <Portfolio
          t={t}
          onOpenDrawer={handleOpenDrawer}
        />

        {/* Social proof marquee relocated below real portfolio projects */}
        <ClientMarquee />

        <Estimator
          t={t}
          onTransferScope={handleTransferScope}
        />

        <SponsoringSimulator
          t={t}
          onLockPlan={handleLockPlan}
        />

        <EngineRoom t={t} />
      </main>

      {/* Grounded Architectural Footer */}
      <Footer
        t={t}
        onOpenDrawer={() => handleOpenDrawer()}
      />

      {/* Slide-In Concierge Drawer */}
      <ConciergeDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        t={t}
        initialData={drawerInitialData}
      />
    </div>
  );
}
