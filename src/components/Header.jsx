import React, { useState } from 'react';
import { Menu, X, ArrowRight, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { playHoverSound, playClickSound, toggleSound } from '../utils/audio';

export default function Header({ lang, setLang, t, onOpenDrawer }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(true);

  const navLinks = [
    { href: '#services', label: t.nav.services },
    { href: '#portfolio', label: t.nav.work },
    { href: '#estimator', label: t.nav.estimator },
    { href: '#simulator', label: t.nav.simulator },
    { href: '#engine', label: t.nav.stack },
  ];

  const languages = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'عربي' },
  ];

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundActive(newState);
    if (newState) {
      playClickSound();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#08090d]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a
          href="#"
          onMouseEnter={playHoverSound}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1c202e] to-[#08090d] border border-white/15 flex items-center justify-center font-display font-black text-lg text-white group-hover:border-[#e5a93c] transition-colors shadow-lg">
            E<span className="text-[#e5a93c]">.</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg text-white tracking-tight flex items-center gap-1">
              ELITE<span className="text-[#e5a93c]">SCE</span>
            </span>
            <span className="text-[10px] font-mono-num text-[#a0a6b5] -mt-1 tracking-wider uppercase">
              Engineering Studio
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full liquid-glass border border-white/10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onMouseEnter={playHoverSound}
              className="px-4 py-2 text-xs font-display font-medium text-[#a0a6b5] hover:text-white rounded-full transition-all hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions (Sound, Lang, CTA) */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleSoundToggle}
            onMouseEnter={playHoverSound}
            title={soundActive ? 'Désactiver les micro-sons' : 'Activer les micro-sons'}
            className="p-2.5 rounded-full liquid-glass text-[#a0a6b5] hover:text-[#e5a93c] transition-colors border border-white/10"
            aria-label="Toggle Sound"
          >
            {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center p-1 rounded-full liquid-glass border border-white/10 text-xs font-mono-num">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onMouseEnter={playHoverSound}
                onClick={() => {
                  playClickSound();
                  setLang(item.code);
                }}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  lang === item.code
                    ? 'bg-[#e5a93c] text-[#08090d] shadow-md'
                    : 'text-[#a0a6b5] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onMouseEnter={playHoverSound}
            onClick={() => {
              playClickSound();
              onOpenDrawer();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#e5a93c] to-[#d69527] text-[#08090d] font-display font-bold text-xs uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-lg hover:shadow-[#e5a93c]/20"
          >
            <span>{t.nav.startProject}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={handleSoundToggle}
            className="p-2 rounded-lg liquid-glass text-[#a0a6b5]"
          >
            {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              const next = lang === 'fr' ? 'en' : lang === 'en' ? 'ar' : 'fr';
              setLang(next);
            }}
            className="px-2.5 py-1.5 rounded-lg liquid-glass text-xs font-mono-num text-white"
          >
            {lang.toUpperCase()}
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2.5 rounded-xl liquid-glass text-white"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden py-4 border-t border-white/10 flex flex-col gap-2 animate-in fade-in duration-200">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 text-sm text-[#f8f9fa] hover:bg-white/5 rounded-lg font-medium"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDrawer();
              }}
              className="w-full py-3 rounded-xl bg-[#e5a93c] text-[#08090d] font-bold text-xs uppercase tracking-wider text-center"
            >
              {t.nav.startProject}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
