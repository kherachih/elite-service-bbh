import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer({ t, onOpenDrawer }) {
  return (
    <footer className="border-t border-white/5 bg-[#0b0c10] py-16 px-4 sm:px-6 lg:px-8 text-xs text-[#9ba1b4]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/5">
          
          {/* Brand Column (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#1c202c] border border-white/10 flex items-center justify-center font-mono-num font-semibold text-xs text-[#e59b2c]">
                E
              </div>
              <span className="font-sans font-semibold text-sm text-[#f1f3f7]">
                EliteSCE Studio
              </span>
            </div>
            <p className="text-xs text-[#9ba1b4] leading-relaxed max-w-sm">
              {t.footer.desc}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#676f82]">
              <MapPin className="w-3.5 h-3.5 text-[#e59b2c]" />
              <span>{t.footer.coords}</span>
            </div>
          </div>

          {/* Navigation (3 cols) */}
          <div className="md:col-span-3 space-y-2">
            <span className="font-mono-num text-[11px] text-[#f1f3f7] uppercase block mb-2">
              Navigation
            </span>
            <ul className="space-y-1.5">
              <li><a href="#services" className="hover:text-[#f1f3f7] transition-colors">Services</a></li>
              <li><a href="#portfolio" className="hover:text-[#f1f3f7] transition-colors">Réalisations</a></li>
              <li><a href="#estimator" className="hover:text-[#f1f3f7] transition-colors">Calculer un devis</a></li>
              <li><a href="#simulator" className="hover:text-[#f1f3f7] transition-colors">Sponsoring & Acquisition</a></li>
              <li><a href="#engine" className="hover:text-[#f1f3f7] transition-colors">Architecture logicielle</a></li>
            </ul>
          </div>

          {/* Inquiries (4 cols) */}
          <div className="md:col-span-4 space-y-2">
            <span className="font-mono-num text-[11px] text-[#f1f3f7] uppercase block mb-2">
              Contact direct
            </span>
            <div className="space-y-1.5">
              <a
                href="mailto:contact@elitesce.com"
                className="flex items-center gap-2 text-[#f1f3f7] hover:text-[#e59b2c] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#e59b2c]" />
                <span>contact@elitesce.com</span>
              </a>
              <a
                href="tel:+213550000000"
                className="flex items-center gap-2 text-[#f1f3f7] hover:text-[#e59b2c] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#e59b2c]" />
                <span>+213 (0) 550 00 00 00</span>
              </a>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => onOpenDrawer()}
                className="px-3.5 py-1.5 rounded-md bg-[#171a22] hover:bg-[#1f2430] text-[#f1f3f7] text-xs transition-colors border border-white/5"
              >
                Ouvrir un ticket de cadrage
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono-num text-[#676f82]">
          <span>© {new Date().getFullYear()} EliteSCE. {t.footer.rights}</span>
          <div className="flex items-center gap-3">
            <span>Code 100% propriétaire</span>
            <span>·</span>
            <span>Algérie & International</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
