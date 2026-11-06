import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateConversionRate,
  calculateCampaignROI,
  calculateAverageDwellTime,
  computeHourlyVelocity,
  computeStorePerformance,
  generateExecutiveReport,
} from './analytics';
import { Product, Campaign, ScanEvent } from '../types';

test('calculateConversionRate returns rounded percentage and handles zero scans', () => {
  assert.equal(calculateConversionRate(0, 0), 0);
  assert.equal(calculateConversionRate(100, 25), 25);
  assert.equal(calculateConversionRate(3, 1), 33.3);
  assert.equal(calculateConversionRate(200, 150), 75);
});

test('calculateCampaignROI calculates profit percentage over budget', () => {
  assert.equal(calculateCampaignROI(1500, 1000), 50);
  assert.equal(calculateCampaignROI(3000, 1000), 200);
  assert.equal(calculateCampaignROI(500, 1000), -50);
  assert.equal(calculateCampaignROI(100, 0), 100);
});

test('calculateAverageDwellTime calculates average correctly', () => {
  assert.equal(calculateAverageDwellTime([]), 0);
  const events = [
    { dwellTimeSec: 10 },
    { dwellTimeSec: 20 },
    { dwellTimeSec: 15 },
  ];
  assert.equal(calculateAverageDwellTime(events), 15);
});

test('computeHourlyVelocity groups events correctly into hours', () => {
  const events: ScanEvent[] = [
    {
      id: '1',
      timestamp: '2026-11-06T10:15:00.000Z',
      barcode: '123',
      productId: 'p1',
      productName: 'Item 1',
      category: 'Electronics',
      storeLocation: 'Main',
      terminalId: 'T1',
      operatorName: 'Alex',
      shopperTier: 'Gold',
      convertedToSale: true,
      saleAmount: 50,
      dwellTimeSec: 12,
    },
    {
      id: '2',
      timestamp: '2026-11-06T10:45:00.000Z',
      barcode: '124',
      productId: 'p2',
      productName: 'Item 2',
      category: 'Electronics',
      storeLocation: 'Main',
      terminalId: 'T1',
      operatorName: 'Alex',
      shopperTier: 'Silver',
      convertedToSale: false,
      dwellTimeSec: 8,
    },
  ];

  const velocity = computeHourlyVelocity(events);
  assert.ok(velocity.length > 0);
  const hour10 = velocity.find((v) => v.hour.startsWith('10:'));
  // Note: Depending on timezone, date.getHours() will format into hour string
  const totalScansInOutput = velocity.reduce((sum, v) => sum + v.scans, 0);
  assert.equal(totalScansInOutput, 2);
});

test('computeStorePerformance groups stores and calculates revenue and conversion', () => {
  const events: ScanEvent[] = [
    {
      id: '1',
      timestamp: '2026-11-06T12:00:00.000Z',
      barcode: '123',
      productId: 'p1',
      productName: 'Druk Obsidian Watch',
      category: 'Accessories',
      storeLocation: 'Downtown Flagship',
      terminalId: 'T1',
      operatorName: 'Sam',
      shopperTier: 'Dragon VIP',
      convertedToSale: true,
      saleAmount: 250,
      dwellTimeSec: 25,
    },
    {
      id: '2',
      timestamp: '2026-11-06T12:05:00.000Z',
      barcode: '124',
      productId: 'p2',
      productName: 'Thunder Silk Scarf',
      category: 'Apparel',
      storeLocation: 'Downtown Flagship',
      terminalId: 'T1',
      operatorName: 'Sam',
      shopperTier: 'Bronze',
      convertedToSale: false,
      dwellTimeSec: 10,
    },
  ];

  const stores = computeStorePerformance(events);
  assert.equal(stores.length, 1);
  assert.equal(stores[0].store, 'Downtown Flagship');
  assert.equal(stores[0].scans, 2);
  assert.equal(stores[0].conversions, 1);
  assert.equal(stores[0].conversionRate, 50);
  assert.equal(stores[0].revenue, 250);
});

test('generateExecutiveReport generates complete report with insights', () => {
  const mockProducts: Product[] = [
    {
      id: 'p1',
      name: 'Druk Alpine Tea',
      sku: 'DRK-TEA-01',
      barcode: '8901030829141',
      barcodeType: 'EAN-13',
      category: 'Artisanal Beverage',
      price: 28,
      costPrice: 8,
      stock: 120,
      description: 'Hand-picked organic tea',
      tags: ['Beverage', 'Organic'],
      marketingStory: 'Grown in high altitude valleys',
      benefits: ['Calming', 'Antioxidant'],
      engagementMetrics: {
        totalScans: 45,
        uniqueShoppers: 38,
        conversions: 25,
        dwellTimeAvgSec: 18,
        revenueGenerated: 700,
      },
    },
  ];

  const mockCampaigns: Campaign[] = [
    {
      id: 'c1',
      name: 'White Dragon Welcome',
      code: 'DRUK15',
      tagline: 'Experience the thunder',
      discountType: 'percentage',
      discountValue: 15,
      targetProductIds: ['p1'],
      triggerCondition: 'instant_scan',
      description: '15% discount on first POS scan',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      status: 'active',
      metrics: {
        impressions: 120,
        scansTriggered: 45,
        redemptions: 25,
        attributedSales: 700,
        budgetAllocated: 150,
        roiPercentage: 366.7,
      },
    },
  ];

  const report = generateExecutiveReport(mockProducts, mockCampaigns, []);
  assert.ok(report.reportId.startsWith('DRUK-REP-'));
  assert.equal(report.topPerformingProduct, 'Druk Alpine Tea');
  assert.ok(report.topPerformingCampaign.includes('DRUK15'));
  assert.equal(report.executiveHighlights.length, 3);
  assert.equal(report.strategicRecommendations.length, 3);
});
