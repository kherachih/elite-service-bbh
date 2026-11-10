import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle, Check } from 'lucide-react';

export default function ConciergeDrawer({ isOpen, onClose, t, initialData }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [details, setDetails] = useState('');
  const [importedSpecs, setImportedSpecs] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.projectNote) {
        setDetails(initialData.projectNote);
      }
      setImportedSpecs(initialData);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitted(true);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Bonjour EliteSCE, je souhaite cadrer un projet :\n` +
      `- Nom : ${name || 'Non spécifié'}\n` +
      `- Entreprise : ${company || 'Non spécifiée'}\n` +
      `- Téléphone : ${phone || 'Non spécifié'}\n` +
      (details ? `- Détails : ${details}\n` : '') +
      (importedSpecs ? `\n(Spécifications techniques configurées sur elitesce.com)` : '')
    );
    window.open(`https://wa.me/213550000000?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-[#101217] border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono-num text-[#e59b2c] block mb-0.5">
              // Cadrage technique
            </span>
            <h3 className="font-sans font-semibold text-xl text-[#f1f3f7]">
              {t.drawer.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#171a22] text-[#9ba1b4] hover:text-[#f1f3f7] transition-colors"
            aria-label={t.drawer.btn_close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex-1">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 rounded-lg bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-sans font-semibold text-lg text-[#f1f3f7] mb-1">
                {t.drawer.success_title}
              </h4>
              <p className="text-xs text-[#9ba1b4] max-w-sm mb-6 leading-relaxed">
                {t.drawer.success_desc}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-[#171a22] hover:bg-[#1f2430] text-[#f1f3f7] text-xs font-medium"
              >
                {t.drawer.btn_close}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#9ba1b4] leading-relaxed mb-4">
                {t.drawer.subtitle}
              </p>

              {/* Imported specs badge if exists */}
              {importedSpecs && (
                <div className="p-3 rounded-lg bg-[#171a22] border border-white/5 text-xs text-[#f1f3f7]">
                  <span className="font-mono-num text-[11px] text-[#e59b2c] block mb-1">
                    {t.drawer.specs_badge}
                  </span>
                  <div className="space-y-0.5 text-[11px] font-mono-num text-[#9ba1b4]">
                    {importedSpecs.type && <div>Type : {importedSpecs.type}</div>}
                    {importedSpecs.estimatedPrice && <div>Fourchette : {importedSpecs.estimatedPrice}</div>}
                    {importedSpecs.estimatedTime && <div>Délai : {importedSpecs.estimatedTime}</div>}
                    {importedSpecs.budget && <div>Budget Sponsoring : {importedSpecs.budget}</div>}
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="text-[11px] font-mono-num text-[#9ba1b4] block mb-1">
                  {t.drawer.field_name} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sofiane Bouzid"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#171a22] border border-white/10 text-[#f1f3f7] placeholder-[#676f82] text-xs focus:outline-none focus:border-[#e59b2c] transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-[11px] font-mono-num text-[#9ba1b4] block mb-1">
                  {t.drawer.field_phone} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+213 550 12 34 56"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#171a22] border border-white/10 text-[#f1f3f7] placeholder-[#676f82] text-xs focus:outline-none focus:border-[#e59b2c] transition-colors"
                />
              </div>

              {/* Email & Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono-num text-[#9ba1b4] block mb-1">
                    {t.drawer.field_email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@societe.com"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#171a22] border border-white/10 text-[#f1f3f7] placeholder-[#676f82] text-xs focus:outline-none focus:border-[#e59b2c] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono-num text-[#9ba1b4] block mb-1">
                    {t.drawer.field_company}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nom société"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#171a22] border border-white/10 text-[#f1f3f7] placeholder-[#676f82] text-xs focus:outline-none focus:border-[#e59b2c] transition-colors"
                  />
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="text-[11px] font-mono-num text-[#9ba1b4] block mb-1">
                  {t.drawer.field_details}
                </label>
                <textarea
                  rows="3"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t.drawer.field_details_placeholder}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#171a22] border border-white/10 text-[#f1f3f7] placeholder-[#676f82] text-xs focus:outline-none focus:border-[#e59b2c] transition-colors"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="btn-inset-highlight bg-[#e59b2c] hover:bg-[#d48c22] text-[#0e1015] font-sans font-semibold text-xs w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.drawer.btn_submit}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full py-2.5 rounded-lg bg-[#171a22] hover:bg-[#1f2430] border border-white/10 text-[#10b981] font-sans font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{t.drawer.btn_whatsapp}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
