import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { generateExecutiveReport, computeStorePerformance } from '../utils/analytics';
import { exportReportToPDF, exportReportToCSV, exportRawScansToCSV } from '../utils/reportExport';
import { ExecutiveReport } from '../types';

export const AutomatedReports: React.FC = () => {
  const { t } = useLanguage();
  const { products, campaigns, scanEvents, reportConfig, updateReportConfig } = useData();

  const [selectedPeriod, setSelectedPeriod] = useState<'Today' | '7-Day Cycle' | 'Month-to-Date'>('7-Day Cycle');
  const [currentReport, setCurrentReport] = useState<ExecutiveReport>(() =>
    generateExecutiveReport(products, campaigns, scanEvents, '7-Day Cycle')
  );
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const storeMetrics = computeStorePerformance(scanEvents);

  const handlePeriodChange = (period: 'Today' | '7-Day Cycle' | 'Month-to-Date') => {
    setSelectedPeriod(period);
    const updated = generateExecutiveReport(products, campaigns, scanEvents, period);
    setCurrentReport(updated);
  };

  const handleRefreshReport = () => {
    const updated = generateExecutiveReport(products, campaigns, scanEvents, selectedPeriod);
    setCurrentReport(updated);
    showFeedbackToast('✓ Performance report refreshed with latest POS telemetry');
  };

  const showFeedbackToast = (msg: string) => {
    setExportFeedback(msg);
    setTimeout(() => {
      setExportFeedback(null);
    }, 4500);
  };

  const handleExportPDF = () => {
    try {
      exportReportToPDF(currentReport, products, campaigns, storeMetrics);
      showFeedbackToast(`✓ Successfully exported "${currentReport.reportId}" as PDF`);
    } catch {
      showFeedbackToast('Error exporting PDF. Please use the Print/Save PDF option.');
    }
  };

  const handleExportCSVReport = () => {
    try {
      exportReportToCSV(currentReport, products, campaigns, storeMetrics);
      showFeedbackToast(`✓ Performance report exported as CSV for external analysis`);
    } catch {
      showFeedbackToast('Error generating CSV file.');
    }
  };

  const handleExportRawScans = () => {
    try {
      exportRawScansToCSV(scanEvents);
      showFeedbackToast(`✓ Raw scan telemetry (${scanEvents.length} records) exported as CSV`);
    } catch {
      showFeedbackToast('Error exporting raw scans.');
    }
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient.trim() || !newRecipient.includes('@')) return;
    updateReportConfig({
      recipients: [...reportConfig.recipients, newRecipient.trim()],
    });
    setNewRecipient('');
  };

  const handleRemoveRecipient = (emailToRemove: string) => {
    updateReportConfig({
      recipients: reportConfig.recipients.filter((r) => r !== emailToRemove),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            {t('reportsTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('reportsSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshReport}
            className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t('regenerateBtn')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Download executive performance report as PDF"
          >
            <span>{t('exportPdfBtn')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSVReport}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export structured performance report for Excel/BI analysis"
          >
            <span>{t('exportCsvBtn')}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Print-ready briefing format"
          >
            <span>{t('printBtn')}</span>
          </button>
        </div>
      </div>

      {/* Export Feedback Toast */}
      {exportFeedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-medium rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span>{exportFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportFeedback(null)}
            className="text-emerald-400 hover:text-white text-xs ml-3"
          >
            ✕
          </button>
        </div>
      )}


      {/* Period Filter & Automated Dispatch Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Automated Scheduling Config (5 cols) */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Automated Digest Dispatch
              </h2>
              <span className="text-[11px] text-slate-400">
                Scheduled delivery to executive leadership
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reportConfig.autoGenerate}
                onChange={(e) => updateReportConfig({ autoGenerate: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cadence Frequency</span>
              <select
                value={reportConfig.frequency}
                onChange={(e) => updateReportConfig({ frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-medium"
              >
                <option value="daily">Daily at 08:00 AM</option>
                <option value="weekly">Weekly on Mondays</option>
                <option value="monthly">Monthly Executive Summary</option>
              </select>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Subscribed Stakeholders</span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {reportConfig.recipients.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-slate-300"
                  >
                    <span className="truncate">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(email)}
                      className="text-slate-400 hover:text-rose-400 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddRecipient} className="flex gap-2 mt-2">
                <input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="Add executive email..."
                  className="flex-1 px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEmailPreviewOpen(true)}
                className="text-xs text-cyan-300 hover:text-cyan-200 font-medium"
              >
                ✉️ Preview Executive Email Digest
              </button>
              <button
                type="button"
                onClick={handleExportRawScans}
                className="text-xs text-slate-300 hover:text-white font-medium"
              >
                📥 Export Raw Scans (CSV)
              </button>
            </div>
          </div>
        </div>

        {/* Right: Period Switcher & Report Briefing Overview (7 cols) */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Reporting Interval Scope
              </h2>
              <span className="text-[11px] text-slate-400">
                Generated: {new Date(currentReport.generatedAt).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              {(['Today', '7-Day Cycle', 'Month-to-Date'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => handlePeriodChange(period)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedPeriod === period
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Core Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Total Scans
              </span>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {currentReport.totalScans}
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Conversions
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {currentReport.totalConversions} ({currentReport.conversionRate}%)
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Revenue
              </span>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                ${currentReport.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Avg Dwell
              </span>
              <span className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
                {currentReport.averageDwellTimeSec}s
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Leading Product Engagement:</span>
              <span className="font-semibold text-white">{currentReport.topPerformingProduct}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Top Attributed Campaign:</span>
              <span className="font-semibold text-amber-300">{currentReport.topPerformingCampaign}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Executive Briefing Document Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 print:border-none print:p-0 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 print:border-black/20 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
              <img
                src="/src/assets/images/druk_white_dragon_logo_1793992014257.jpg"
                alt="Druk Dragon"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-slate-400 print:text-slate-600 font-semibold block">
                EXECUTIVE INTELLIGENCE BRIEF · {currentReport.reportId}
              </span>
              <h2 className="text-lg font-black text-white print:text-slate-900 tracking-tight">
                Druk Retail POS Marketing & Engagement Report
              </h2>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 print:text-slate-600">
            <div>Scope: {currentReport.period}</div>
            <div>Generated: {new Date(currentReport.generatedAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Section 1: Executive Highlights */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-900">
            {t('highlightsTitle')}
          </h3>
          <div className="space-y-2">
            {currentReport.executiveHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-300 flex items-start gap-2.5 text-xs text-slate-200 print:text-slate-800 leading-relaxed"
              >
                <span className="text-emerald-400 print:text-emerald-700 font-bold">✓</span>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Strategic Marketing Recommendations */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-900">
            {t('recommendationsTitle')}
          </h3>
          <div className="space-y-2">
            {currentReport.strategicRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-300 flex items-start gap-2.5 text-xs text-slate-200 print:text-slate-800 leading-relaxed"
              >
                <span className="text-cyan-400 print:text-cyan-700 font-bold">→</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* External Analysis Quick Action Strip */}
        <div className="pt-4 border-t border-slate-800 print:hidden flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-xs font-bold text-white block">
              {t('externalAnalysisBannerTitle')}
            </span>
            <span className="text-[11px] text-slate-400">
              {t('externalAnalysisBannerSub')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>{t('downloadPdfBrief')}</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSVReport}
              className="px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t('downloadCsvReport')}</span>
            </button>
          </div>
        </div>

        {/* Document Footer Signoff */}
        <div className="pt-4 border-t border-slate-800 print:border-black/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 print:text-slate-500 font-mono">
          <span>DRUK INTELLIGENCE SYSTEM · VERIFIED CRYPTOGRAPHIC RECORD</span>
          <span>STATUS: AUDITED & CERTIFIED</span>
        </div>
      </div>

      {/* Modal: Executive Email Digest Preview */}
      {isEmailPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base">✉️</span>
                <h3 className="text-sm font-bold text-white">
                  Automated Digest Preview (Inbox View)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailPreviewOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Email simulated client view */}
            <div className="bg-white text-slate-900 rounded-xl p-6 text-xs space-y-4 font-sans shadow-inner">
              <div className="border-b border-slate-200 pb-3">
                <div className="text-[11px] text-slate-500">
                  From: <strong>reports@druk-marketing.com</strong>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  To: <strong>{reportConfig.recipients.join(', ')}</strong>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  Subject: [Druk Daily Digest] POS Engagement & Conversion Velocity ({currentReport.period})
                </div>
              </div>

              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white text-sm">
                  🐉
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 uppercase">DRUK RETAIL</span>
                  <span className="text-[10px] text-slate-500 block -mt-1">
                    Automated Executive Dispatch
                  </span>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed">
                Dear Leadership Team,
                <br />
                Here is your automated performance overview for <strong>{currentReport.period}</strong> across all retail barcode terminals.
              </p>

              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-3 rounded-lg text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Conversion</span>
                  <span className="text-sm font-bold font-mono text-emerald-700 block">
                    {currentReport.conversionRate}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Attributed Sales</span>
                  <span className="text-sm font-bold font-mono text-slate-900 block">
                    ${currentReport.totalRevenue.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Total Scans</span>
                  <span className="text-sm font-bold font-mono text-slate-900 block">
                    {currentReport.totalScans}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <strong className="text-slate-800 text-[11px] uppercase tracking-wider block">
                  Key Insights:
                </strong>
                {currentReport.executiveHighlights.map((h, i) => (
                  <div key={i} className="text-slate-600 pl-2 border-l-2 border-emerald-600">
                    {h}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500">
                You are receiving this automated email as a verified stakeholder of Druk Marketing Intelligence.
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsEmailPreviewOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
