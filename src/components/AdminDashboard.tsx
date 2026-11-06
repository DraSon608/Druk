import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import {
  calculateConversionRate,
  calculateAverageDwellTime,
  computeHourlyVelocity,
  computeStorePerformance,
} from '../utils/analytics';

export const AdminDashboard: React.FC = () => {
  const { t, isDzongkha } = useLanguage();
  const {
    scanEvents,
    products,
    campaigns,
    stores,
    simulateLiveScan,
    simulateRushSurge,
  } = useData();

  const [selectedStoreFilter, setSelectedStoreFilter] = useState('ALL');
  const [conversionFilter, setConversionFilter] = useState<'ALL' | 'CONVERTED' | 'UNCONVERTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Metrics
  const totalScans = scanEvents.length;
  const conversions = scanEvents.filter((s) => s.convertedToSale);
  const conversionRate = calculateConversionRate(totalScans, conversions.length);
  const totalAttributedRevenue = conversions.reduce((sum, s) => sum + (s.saleAmount || 0), 0);
  const avgDwellTime = calculateAverageDwellTime(scanEvents);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

  const hourlyVelocity = computeHourlyVelocity(scanEvents);
  const storePerformance = computeStorePerformance(scanEvents);

  // Filtered Scan Events
  const filteredEvents = scanEvents.filter((event) => {
    if (selectedStoreFilter !== 'ALL' && event.storeLocation !== selectedStoreFilter) {
      return false;
    }
    if (conversionFilter === 'CONVERTED' && !event.convertedToSale) {
      return false;
    }
    if (conversionFilter === 'UNCONVERTED' && event.convertedToSale) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        event.barcode.toLowerCase().includes(q) ||
        event.productName.toLowerCase().includes(q) ||
        event.storeLocation.toLowerCase().includes(q) ||
        event.shopperTier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate max scan value for SVG chart height scaling
  const maxScanValue = Math.max(...hourlyVelocity.map((v) => v.scans), 8);

  return (
    <div className="space-y-6">
      {/* Top Banner & Live Simulator Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            {t('dashboardTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('dashboardSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={simulateLiveScan}
            className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡</span>
            <span>{t('simulateScan')}</span>
          </button>
          <button
            type="button"
            onClick={simulateRushSurge}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {t('simulateRush')}
          </button>
        </div>
      </div>

      {/* KPI Metric Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            {t('totalScans')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {totalScans}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">+14.2%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{t('acrossBranches')}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            {t('conversionRate')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {conversionRate}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({conversions.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{t('checkoutRate')}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            {t('attributedRevenue')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              ${totalAttributedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{t('scanAttributedDesc')}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            {t('activeCampaigns')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {activeCampaignsCount}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              / {campaigns.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{t('triggeringPerks')}</span>
        </div>

        <div className="col-span-2 md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            {t('avgDwellTime')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
              {avgDwellTime}s
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{t('dwellDesc')}</span>
        </div>
      </div>

      {/* Hourly Scan Velocity & Retail Store Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Scan Velocity Chart (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {t('hourlyVelocity')}
              </h2>
              <span className="text-[11px] text-slate-400">
                {t('hourlyDesc')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-slate-400" /> {t('totalScansLegend')}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> {t('purchasesLegend')}
              </span>
            </div>
          </div>

          {/* SVG Bar / Area Visualization */}
          <div className="h-52 w-full flex items-end gap-1.5 pt-6 pb-2 px-1">
            {hourlyVelocity.map((item, idx) => {
              const scanHeightPct = (item.scans / maxScanValue) * 100;
              const convHeightPct = (item.conversions / maxScanValue) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-white whitespace-nowrap pointer-events-none z-20">
                    {item.hour}: {item.scans} scans, {item.conversions} sales
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    {/* Bar 1: Total Scans */}
                    <div
                      style={{ height: `${Math.max(scanHeightPct, 6)}%` }}
                      className="w-1/2 bg-slate-700/80 group-hover:bg-slate-500 rounded-t transition-all"
                    />
                    {/* Bar 2: Conversions */}
                    <div
                      style={{ height: `${Math.max(convHeightPct, 4)}%` }}
                      className="w-1/2 bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t transition-all"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 mt-2 block transform -rotate-45 sm:rotate-0">
                    {item.hour.split(':')[0]}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store Branches Performance (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('branchPerformance')}
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              {storePerformance.length} {t('locationsCount')}
            </span>
          </div>

          <div className="space-y-3">
            {storePerformance.map((store, i) => (
              <div
                key={i}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    {store.store}
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                    ${store.revenue.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {store.scans} scans · {store.conversions} sales ({store.conversionRate}%)
                  </span>
                  <span className="truncate max-w-[120px] text-slate-400 font-mono">
                    Top: {store.topProduct}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Live Barcode Scan Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {t('liveFeedTitle')}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                {t('liveFeedBadge')}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Showing {filteredEvents.length} {t('liveFeedSubtitle')}
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-slate-500 w-full sm:w-56"
            />

            <select
              value={selectedStoreFilter}
              onChange={(e) => setSelectedStoreFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">{t('allStores')}</option>
              {stores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              {(['ALL', 'CONVERTED', 'UNCONVERTED'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setConversionFilter(mode)}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                    conversionFilter === mode
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'ALL' ? t('filterAll') : mode === 'CONVERTED' ? t('filterPurchased') : t('filterScannedOnly')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* High-density telemetry data table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">{t('colTime')}</th>
                <th className="py-2.5 px-3">{t('colBarcode')}</th>
                <th className="py-2.5 px-3">{t('colProduct')}</th>
                <th className="py-2.5 px-3">{t('colBranch')}</th>
                <th className="py-2.5 px-3">{t('colTier')}</th>
                <th className="py-2.5 px-3">{t('colCampaign')}</th>
                <th className="py-2.5 px-3 text-right">{t('colDwell')}</th>
                <th className="py-2.5 px-3 text-right">{t('colStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No scan events match current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredEvents.slice(0, 30).map((event) => {
                  const timeStr = new Date(event.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-slate-800/40 transition-colors font-mono"
                    >
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {timeStr}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-semibold whitespace-nowrap">
                        {event.barcode}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-white max-w-xs truncate">
                        {event.productName}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300 whitespace-nowrap">
                        {event.storeLocation}
                      </td>
                      <td className="py-2.5 px-3 font-sans whitespace-nowrap">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            event.shopperTier === 'Dragon VIP'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                              : event.shopperTier === 'Gold'
                              ? 'bg-yellow-950/40 text-yellow-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {event.shopperTier}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-400 whitespace-nowrap">
                        {event.campaignApplied ? (
                          <span className="text-emerald-400 font-medium">
                            {event.campaignApplied}
                          </span>
                        ) : (
                          <span className="text-slate-400">Standard</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">
                        {event.dwellTimeSec}s
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {event.convertedToSale ? (
                          <span className="text-emerald-400 font-bold tabular-nums">
                            +${(event.saleAmount || 0).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-sans text-[11px]">
                            Scan Only
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
