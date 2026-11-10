import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, MessageCircle, ArrowUp, Zap, Sparkles } from 'lucide-react';

/**
 * DynamicIslandHUD (Inspired by Skiper UI Dynamic Island / Floating Dock)
 * Interactive floating command pill docked at the bottom center of the screen.
 */
export default function DynamicIslandHUD({ onOpenDrawer, onOpenEstimator }) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/213550000000?text=Bonjour%20EliteSCE,%20je%20souhaite%20un%20devis', '_blank');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            className="flex items-center gap-1.5 p-1.5 rounded-full glass-panel border border-white/15 shadow-2xl backdrop-blur-2xl bg-[#0d0f14]/90 transition-all duration-300"
          >
            {/* Live Indicator Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[11px] font-mono-num text-[#949aa4]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="hidden sm:inline text-white font-medium">EliteSCE Studio</span>
            </div>

            {/* Estimator Shortcut */}
            <button
              onClick={onOpenEstimator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-xs font-display font-medium text-[#f4f5f6] transition-colors"
              title="Ouvrir le configurateur"
            >
              <Calculator className="w-3.5 h-3.5 text-[#e5a93c]" />
              <span className="hidden md:inline">Calculer mon devis</span>
            </button>

            {/* Direct WhatsApp Contact */}
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#10b981]/15 text-xs font-display font-medium text-[#10b981] transition-colors"
              title="Discuter sur WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => onOpenDrawer()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#e5a93c] text-[#08090b] font-display font-bold text-xs uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-md"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Cadrer</span>
            </button>

            {/* Scroll to Top */}
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#949aa4] hover:text-white transition-colors"
              aria-label="Retour en haut"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
