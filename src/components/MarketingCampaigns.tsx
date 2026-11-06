import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Campaign, DiscountType, TriggerCondition } from '../types';
import { computeBasketAffinity } from '../utils/analytics';

export const MarketingCampaigns: React.FC = () => {
  const { t } = useLanguage();
  const { campaigns, addCampaign, updateCampaign, toggleCampaignStatus, products, scanEvents } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    tagline: '',
    discountType: 'percentage' as DiscountType,
    discountValue: 15,
    targetProductIds: [] as string[],
    triggerCondition: 'instant_scan' as TriggerCondition,
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
  });

  const basketAffinities = computeBasketAffinity(scanEvents);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: `PROMO-${Math.floor(100 + Math.random() * 900)}`,
      tagline: 'Exclusive barcode privilege',
      discountType: 'percentage',
      discountValue: 15,
      targetProductIds: products.slice(0, 2).map((p) => p.id),
      triggerCondition: 'instant_scan',
      description: 'Customer receives instant discount upon scanning product barcode at POS terminal.',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    addCampaign({
      name: formData.name,
      code: formData.code.toUpperCase(),
      tagline: formData.tagline,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      targetProductIds: formData.targetProductIds,
      triggerCondition: formData.triggerCondition,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'active',
      bannerColor: 'from-amber-500/20 to-slate-900',
    });

    setIsAddModalOpen(false);
  };

  const toggleTargetProduct = (prodId: string) => {
    setFormData((prev) => {
      const exists = prev.targetProductIds.includes(prodId);
      return {
        ...prev,
        targetProductIds: exists
          ? prev.targetProductIds.filter((id) => id !== prodId)
          : [...prev.targetProductIds, prodId],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            {t('campaignsTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('campaignsSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <span>{t('createCampaignBtn')}</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {campaigns.map((camp) => {
          const targetProducts = products.filter((p) => camp.targetProductIds.includes(p.id));

          return (
            <div
              key={camp.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {camp.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        {camp.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      {camp.tagline}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCampaignStatus(camp.id)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                      camp.status === 'active'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {camp.status === 'active' ? 'Active' : 'Paused'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed my-3">
                  {camp.description}
                </p>

                {/* Target Products Tags */}
                <div className="mb-4">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-1.5">
                    {t('targetedProducts')} ({targetProducts.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {targetProducts.map((p) => (
                      <span
                        key={p.id}
                        className="text-[10px] font-medium text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded"
                      >
                        🏷️ {p.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Campaign Financial & ROI Metrics */}
                <div className="grid grid-cols-4 gap-2 py-3 px-3.5 bg-slate-950 rounded-lg border border-slate-800/80 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Scans
                    </span>
                    <span className="text-xs font-bold font-mono text-white tabular-nums">
                      {camp.metrics.scansTriggered}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Redeemed
                    </span>
                    <span className="text-xs font-bold font-mono text-white tabular-nums">
                      {camp.metrics.redemptions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Attributed
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                      ${camp.metrics.attributedSales.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      ROI
                    </span>
                    <span className="text-xs font-bold font-mono text-cyan-300 tabular-nums">
                      {camp.metrics.roiPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 mt-4">
                <span>
                  Trigger: <strong className="text-slate-300 capitalize">{camp.triggerCondition.replace('_', ' ')}</strong>
                </span>
                <span>
                  Valid: {camp.startDate} to {camp.endDate}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Basket Affinity Recommendation Engine */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('basketAffinityTitle')}
            </h2>
            <span className="text-[11px] text-slate-400">
              {t('basketAffinitySubtitle')}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time Basket Association
          </span>
        </div>

        <div className="space-y-3">
          {basketAffinities.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">
              Scan more items together at the POS terminal to discover basket pairings.
            </p>
          ) : (
            basketAffinities.map((pair, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {pair.productA}
                    </span>
                    <span className="text-xs text-slate-400">+</span>
                    <span className="text-xs font-bold text-white">
                      {pair.productB}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Co-scanned in {pair.coScanCount} checkout baskets · Expected Lift: +{pair.liftPercentage}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {t('createPairPromo')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Create Campaign */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white">
                Launch Barcode Promotional Campaign
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. White Dragon Heritage Sale"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Promo Barcode Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Marketing Tagline</label>
                <input
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Instant 15% discount when product barcode is scanned"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed">Fixed Dollar Off ($)</option>
                    <option value="points_multiplier">Loyalty Points Multiplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">POS Trigger Condition</label>
                <select
                  value={formData.triggerCondition}
                  onChange={(e) => setFormData({ ...formData, triggerCondition: e.target.value as TriggerCondition })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="instant_scan">Instant First Barcode Scan</option>
                  <option value="loyalty_tier_vip">Dragon VIP Loyalty Tier Exclusive</option>
                  <option value="second_scan">Second Barcode Scan Re-engagement</option>
                  <option value="basket_paired">Co-Scanned with Partner Product</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Select Targeted Products ({formData.targetProductIds.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
                  {products.map((p) => {
                    const isSelected = formData.targetProductIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleTargetProduct(p.id)}
                        className={`p-2 text-left rounded text-xs transition-colors border ${
                          isSelected
                            ? 'bg-slate-800 border-emerald-500/80 text-white font-medium'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-slate-950 bg-white hover:bg-slate-200 rounded-lg"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
