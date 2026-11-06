export type UserRole = 'admin' | 'marketing_manager' | 'pos_operator' | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  permissions: string[];
  lastLogin: string;
  storeAssignment?: string;
}

export type BarcodeFormat = 'EAN-13' | 'UPC-A' | 'CODE-128' | 'QR';

export interface ProductEngagementMetrics {
  totalScans: number;
  uniqueShoppers: number;
  conversions: number;
  dwellTimeAvgSec: number;
  revenueGenerated: number;
  lastScannedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  barcodeType: BarcodeFormat;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  activeCampaignId?: string;
  description: string;
  tags: string[];
  marketingStory: string;
  benefits: string[];
  engagementMetrics: ProductEngagementMetrics;
}

export type DiscountType = 'percentage' | 'fixed' | 'points_multiplier' | 'gift_with_purchase';
export type TriggerCondition = 'instant_scan' | 'second_scan' | 'loyalty_tier_vip' | 'basket_paired';

export interface CampaignMetrics {
  impressions: number;
  scansTriggered: number;
  redemptions: number;
  attributedSales: number;
  budgetAllocated: number;
  roiPercentage: number;
}

export interface Campaign {
  id: string;
  name: string;
  code: string;
  tagline: string;
  discountType: DiscountType;
  discountValue: number;
  targetProductIds: string[];
  triggerCondition: TriggerCondition;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'scheduled' | 'completed';
  metrics: CampaignMetrics;
  bannerColor?: string;
}

export type ShopperLoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Dragon VIP';

export interface ScanEvent {
  id: string;
  timestamp: string;
  barcode: string;
  productId: string;
  productName: string;
  category: string;
  storeLocation: string;
  terminalId: string;
  operatorName: string;
  shopperTier: ShopperLoyaltyTier;
  convertedToSale: boolean;
  saleAmount?: number;
  dwellTimeSec: number;
  campaignApplied?: string;
  discountSaved?: number;
}

export interface StoreMetric {
  store: string;
  scans: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  topProduct: string;
}

export interface BasketAffinityPair {
  productA: string;
  productB: string;
  coScanCount: number;
  liftPercentage: number;
}

export interface ExecutiveReport {
  reportId: string;
  generatedAt: string;
  period: string;
  totalScans: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  averageDwellTimeSec: number;
  topPerformingProduct: string;
  topPerformingCampaign: string;
  executiveHighlights: string[];
  strategicRecommendations: string[];
}

export interface AutomatedReportConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  autoGenerate: boolean;
  deliveryHour: number;
  lastGeneratedDate?: string;
}
