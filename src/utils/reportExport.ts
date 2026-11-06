import { jsPDF } from 'jspdf';
import { ExecutiveReport, Product, Campaign, StoreMetric, ScanEvent } from '../types';

/**
 * Generates and downloads a clean, multi-section CSV file containing the full
 * automated performance report, KPIs, recommendations, product engagement, and branch breakdown.
 */
export function generateReportCSVContent(
  report: ExecutiveReport,
  products: Product[],
  campaigns: Campaign[],
  storeMetrics: StoreMetric[]
): string {
  const lines: string[] = [];

  // Section 1: Executive KPI Overview
  lines.push('=== DRUK MARKETING INTELLIGENCE - EXECUTIVE PERFORMANCE REPORT ===');
  lines.push(`Report ID,${report.reportId}`);
  lines.push(`Generated Date,"${new Date(report.generatedAt).toLocaleString()}"`);
  lines.push(`Reporting Period Scope,"${report.period}"`);
  lines.push(`Total POS Barcode Scans,${report.totalScans}`);
  lines.push(`Completed Conversions,${report.totalConversions}`);
  lines.push(`Scan-to-Sale Conversion Rate,${report.conversionRate}%`);
  lines.push(`Attributed POS Revenue ($),${report.totalRevenue.toFixed(2)}`);
  lines.push(`Average Customer Dwell Time (sec),${report.averageDwellTimeSec}`);
  lines.push(`Top Performing Product,"${report.topPerformingProduct}"`);
  lines.push(`Top Attributed Campaign,"${report.topPerformingCampaign}"`);
  lines.push('');

  // Section 2: Automated Executive Highlights
  lines.push('=== AUTOMATED EXECUTIVE HIGHLIGHTS ===');
  lines.push('Index,Highlight Description');
  report.executiveHighlights.forEach((h, i) => {
    lines.push(`${i + 1},"${h.replace(/"/g, '""')}"`);
  });
  lines.push('');

  // Section 3: Strategic Marketing Recommendations
  lines.push('=== STRATEGIC MARKETING RECOMMENDATIONS ===');
  lines.push('Index,Strategic Action');
  report.strategicRecommendations.forEach((r, i) => {
    lines.push(`${i + 1},"${r.replace(/"/g, '""')}"`);
  });
  lines.push('');

  // Section 4: Product Engagement Performance Breakdown
  lines.push('=== PRODUCT ENGAGEMENT BREAKDOWN ===');
  lines.push('Product Name,SKU,Barcode,Category,Price ($),Total Scans,Conversions,Conversion (%),Attributed Revenue ($),Avg Dwell (s)');
  products.forEach((p) => {
    const convRate = p.engagementMetrics.totalScans > 0
      ? Math.round((p.engagementMetrics.conversions / p.engagementMetrics.totalScans) * 1000) / 10
      : 0;
    lines.push(
      `"${p.name.replace(/"/g, '""')}","${p.sku}","${p.barcode}","${p.category}",${p.price.toFixed(2)},${p.engagementMetrics.totalScans},${p.engagementMetrics.conversions},${convRate}%,${p.engagementMetrics.revenueGenerated.toFixed(2)},${p.engagementMetrics.dwellTimeAvgSec}`
    );
  });
  lines.push('');

  // Section 5: Store Branch Performance Breakdown
  lines.push('=== STORE BRANCH PERFORMANCE ===');
  lines.push('Store Branch,Total Scans,Conversions,Conversion (%),Attributed Revenue ($),Leading Product');
  storeMetrics.forEach((s) => {
    lines.push(
      `"${s.store.replace(/"/g, '""')}",${s.scans},${s.conversions},${s.conversionRate}%,${s.revenue.toFixed(2)},"${s.topProduct.replace(/"/g, '""')}"`
    );
  });
  lines.push('');

  // Section 6: Marketing Campaigns ROI Attribution
  lines.push('=== CAMPAIGN ROI ATTRIBUTION ===');
  lines.push('Campaign Name,Promo Code,Status,Scans Triggered,Redemptions,Attributed Sales ($),Allocated Budget ($),ROI (%)');
  campaigns.forEach((c) => {
    lines.push(
      `"${c.name.replace(/"/g, '""')}","${c.code}","${c.status}",${c.metrics.scansTriggered},${c.metrics.redemptions},${c.metrics.attributedSales.toFixed(2)},${c.metrics.budgetAllocated.toFixed(2)},${c.metrics.roiPercentage}%`
    );
  });

  return lines.join('\n');
}

/**
 * Triggers instant browser download of the full Performance Report as CSV
 */
export function exportReportToCSV(
  report: ExecutiveReport,
  products: Product[],
  campaigns: Campaign[],
  storeMetrics: StoreMetric[]
): void {
  const csvContent = generateReportCSVContent(report, products, campaigns, storeMetrics);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedPeriod = report.period.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `Druk_Performance_Report_${sanitizedPeriod}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers browser download of raw scan-by-scan log CSV
 */
export function exportRawScansToCSV(scanEvents: ScanEvent[]): void {
  const headers = [
    'Timestamp',
    'Barcode',
    'Product',
    'Category',
    'Store',
    'Shopper Tier',
    'Converted',
    'Sale Amount',
    'Dwell Time Sec',
    'Campaign',
  ];

  const rows = scanEvents.map((s) => [
    `"${s.timestamp}"`,
    `"${s.barcode}"`,
    `"${s.productName}"`,
    `"${s.category}"`,
    `"${s.storeLocation}"`,
    `"${s.shopperTier}"`,
    s.convertedToSale ? 'YES' : 'NO',
    s.saleAmount || 0,
    s.dwellTimeSec,
    `"${s.campaignApplied || 'None'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Druk_Raw_Scan_Telemetry_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a clean, beautifully formatted PDF document of the automated performance report.
 */
export function exportReportToPDF(
  report: ExecutiveReport,
  products: Product[],
  campaigns: Campaign[],
  storeMetrics: StoreMetric[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 40;

  // Header Background Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Title & Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('DRUK RETAIL MARKETING INTELLIGENCE', 40, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`AUTOMATED PERFORMANCE REPORT  ·  ID: ${report.reportId}`, 40, 54);
  doc.text(`SCOPE: ${report.period.toUpperCase()}  ·  GENERATED: ${new Date(report.generatedAt).toLocaleDateString()}`, 40, 66);

  currentY = 95;

  // Section 1: Executive KPI Summary Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(40, currentY, pageWidth - 80, 70, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('CORE PERFORMANCE INDICATORS', 52, currentY + 18);

  const kpis = [
    { label: 'Total Scans', val: `${report.totalScans}` },
    { label: 'Conversions', val: `${report.totalConversions} (${report.conversionRate}%)` },
    { label: 'Attributed Revenue', val: `$${report.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'Avg Dwell Time', val: `${report.averageDwellTimeSec}s` },
  ];

  const colWidth = (pageWidth - 104) / 4;
  kpis.forEach((kpi, idx) => {
    const x = 52 + idx * colWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x, currentY + 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x, currentY + 54);
  });

  currentY += 85;

  // Section 2: Executive Highlights
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. AUTOMATED PERFORMANCE HIGHLIGHTS', 40, currentY);
  currentY += 14;

  report.executiveHighlights.forEach((h) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(40, currentY, pageWidth - 80, 24, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129); // emerald
    doc.text('✓', 50, currentY + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(h, pageWidth - 110);
    doc.text(splitText, 64, currentY + 15);

    currentY += 28;
  });

  currentY += 6;

  // Section 3: Strategic Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. STRATEGIC MARKETING RECOMMENDATIONS', 40, currentY);
  currentY += 14;

  report.strategicRecommendations.forEach((r) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(40, currentY, pageWidth - 80, 24, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(14, 165, 233); // sky blue
    doc.text('→', 50, currentY + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(r, pageWidth - 110);
    doc.text(splitText, 64, currentY + 15);

    currentY += 28;
  });

  currentY += 10;

  // Section 4: Store Branch Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. RETAIL STORE BRANCH BREAKDOWN', 40, currentY);
  currentY += 14;

  // Table header
  doc.setFillColor(30, 41, 59);
  doc.rect(40, currentY, pageWidth - 80, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('STORE BRANCH', 48, currentY + 12);
  doc.text('SCANS', 200, currentY + 12);
  doc.text('SALES', 260, currentY + 12);
  doc.text('CONV %', 320, currentY + 12);
  doc.text('REVENUE ($)', 380, currentY + 12);
  doc.text('TOP PRODUCT', 460, currentY + 12);

  currentY += 18;

  storeMetrics.forEach((store, i) => {
    doc.setFillColor(i % 2 === 0 ? 255 : 248, 250, 252);
    doc.rect(40, currentY, pageWidth - 80, 16, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(store.store, 48, currentY + 11);
    doc.text(`${store.scans}`, 200, currentY + 11);
    doc.text(`${store.conversions}`, 260, currentY + 11);
    doc.text(`${store.conversionRate}%`, 320, currentY + 11);
    doc.text(`$${store.revenue.toFixed(2)}`, 380, currentY + 11);
    doc.text(store.topProduct.substring(0, 22), 460, currentY + 11);

    currentY += 16;
  });

  currentY += 14;

  // Section 5: Top Products Summary Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. PRODUCT ENGAGEMENT RANKINGS', 40, currentY);
  currentY += 14;

  // Product table header
  doc.setFillColor(30, 41, 59);
  doc.rect(40, currentY, pageWidth - 80, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PRODUCT NAME', 48, currentY + 12);
  doc.text('CATEGORY', 220, currentY + 12);
  doc.text('PRICE', 320, currentY + 12);
  doc.text('SCANS', 370, currentY + 12);
  doc.text('CONVERSIONS', 420, currentY + 12);
  doc.text('REVENUE', 485, currentY + 12);

  currentY += 18;

  products.slice(0, 5).forEach((p, i) => {
    doc.setFillColor(i % 2 === 0 ? 255 : 248, 250, 252);
    doc.rect(40, currentY, pageWidth - 80, 16, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(p.name.substring(0, 28), 48, currentY + 11);
    doc.text(p.category.substring(0, 18), 220, currentY + 11);
    doc.text(`$${p.price.toFixed(2)}`, 320, currentY + 11);
    doc.text(`${p.engagementMetrics.totalScans}`, 370, currentY + 11);
    doc.text(`${p.engagementMetrics.conversions}`, 420, currentY + 11);
    doc.text(`$${p.engagementMetrics.revenueGenerated.toFixed(2)}`, 485, currentY + 11);

    currentY += 16;
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 25;
  doc.setDrawColor(226, 232, 240);
  doc.line(40, footerY - 8, pageWidth - 40, footerY - 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('DRUK POS BARCODE MARKETING INTELLIGENCE · CONFIDENTIAL & VERIFIED RECORD', 40, footerY);
  doc.text(`Page 1 of 1 · Generated ${new Date().toISOString()}`, pageWidth - 160, footerY);

  const sanitizedPeriod = report.period.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`Druk_Executive_Performance_Report_${sanitizedPeriod}_${Date.now()}.pdf`);
}
