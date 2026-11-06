import React from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

export const CustomerScreenModal: React.FC = () => {
  const { t } = useLanguage();
  const {
    isCustomerScreenOpen,
    setIsCustomerScreenOpen,
    lastScannedProduct,
    lastTriggeredCampaign,
    activeCustomerTier,
    posCart,
  } = useData();

  if (!isCustomerScreenOpen) return null;

  const cartSubtotal = posCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartSavings = posCart.reduce((sum, item) => sum + (item.discountApplied || 0) * item.quantity, 0);
  const cartTotal = Math.max(0, cartSubtotal - cartSavings);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[90vh] max-h-[820px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Aesthetic Background Image with Scrim */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen">
          <img
            src="/src/assets/images/druk_pos_aesthetic_bg_1793992014401.jpg"
            alt="Druk Boutique Atmosphere"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

        {/* Top Header of Customer Screen */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-slate-900 shrink-0">
              <img
                src="/src/assets/images/druk_white_dragon_logo_1793992014257.jpg"
                alt="White Dragon Druk"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-white uppercase">
                  {t('brandName')}
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {activeCustomerTier} {t('memberTier')}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {t('customerScreenTitle')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 block">{t('accumulatedPoints')}</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                1,420 PTS
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCustomerScreenOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            >
              {t('closeDisplay')}
            </button>
          </div>
        </div>

        {/* Center Showcase: Scanned Product Story & White Dragon Motif */}
        <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 p-6 items-center overflow-y-auto">
          {/* Left: Dragon Emblem Visual Showcase (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center text-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-900 group">
              <img
                src="/src/assets/images/druk_white_dragon_logo_1793992014257.jpg"
                alt="White Dragon Aesthetic"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="text-[11px] font-mono tracking-widest uppercase text-slate-300 font-semibold block">
                  {t('theThunderDragon')}
                </span>
              </div>
            </div>

            <div className="mt-4 max-w-xs">
              <h4 className="text-sm font-semibold text-slate-200">
                {t('realtimeBarcodeEng')}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t('realtimeBarcodeEngSub')}
              </p>
            </div>
          </div>

          {/* Right: Live Scanned Product & Promotion Unlocked (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {lastScannedProduct ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('currentlyEngagingWith')}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Barcode: {lastScannedProduct.barcode}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {lastScannedProduct.name}
                    </h3>
                    <span className="text-2xl font-bold font-mono text-white tabular-nums">
                      ${lastScannedProduct.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {lastScannedProduct.description}
                  </p>

                  <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      {t('artisanOriginStory')}
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "{lastScannedProduct.marketingStory}"
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {lastScannedProduct.benefits.map((b, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-md"
                      >
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>

                {lastTriggeredCampaign && (
                  <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <div>
                          <span className="text-sm font-bold text-amber-200 block">
                            {t('privilegeUnlocked')}: {lastTriggeredCampaign.name}
                          </span>
                          <span className="text-xs text-amber-300/80">
                            {lastTriggeredCampaign.tagline}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300 px-2.5 py-1 bg-amber-900/60 rounded border border-amber-600/50">
                        {lastTriggeredCampaign.code}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-900/70 rounded-xl border border-slate-800">
                <p className="text-sm font-medium text-slate-300">
                  Ready to scan item at POS counter
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Product details and promotional discounts will display here instantly upon scan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Basket Ledger on Customer Display */}
        <div className="relative z-10 p-4 sm:px-6 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <span>
              {t('itemsInBasket')}{' '}
              <strong className="text-white font-mono">
                {posCart.reduce((sum, item) => sum + item.quantity, 0)}
              </strong>
            </span>
            {cartSavings > 0 && (
              <span className="text-emerald-400 font-medium">
                {t('barcodeSavings')}: -${cartSavings.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              {t('totalPayable')}
            </span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              ${cartTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
