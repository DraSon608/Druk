import React, { createContext, useContext, useState } from 'react';
import { Product, Campaign, ScanEvent, AutomatedReportConfig, ShopperLoyaltyTier } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CAMPAIGNS, INITIAL_SCAN_EVENTS, INITIAL_STORES } from '../data/initialData';
import { playBarcodeBeep, playPromoChime } from '../utils/audio';

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountApplied?: number;
  campaignCode?: string;
}

interface DataContextType {
  products: Product[];
  campaigns: Campaign[];
  scanEvents: ScanEvent[];
  stores: string[];
  selectedStore: string;
  setSelectedStore: (store: string) => void;
  // Product actions (Client manipulation)
  addProduct: (product: Omit<Product, 'id' | 'engagementMetrics'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Campaign actions
  addCampaign: (campaign: Omit<Campaign, 'id' | 'metrics'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  toggleCampaignStatus: (id: string) => void;
  // POS & Scanning
  posCart: CartItem[];
  lastScannedProduct: Product | null;
  lastTriggeredCampaign: Campaign | null;
  activeCustomerTier: ShopperLoyaltyTier;
  setActiveCustomerTier: (tier: ShopperLoyaltyTier) => void;
  scanBarcode: (barcode: string) => { success: boolean; message: string; product?: Product };
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  checkoutCart: () => { success: boolean; total: number; savings: number; itemsCount: number };
  // Simulation tools
  simulateLiveScan: () => void;
  simulateRushSurge: () => void;
  // Customer Screen view toggle
  isCustomerScreenOpen: boolean;
  setIsCustomerScreenOpen: (open: boolean) => void;
  // Reporting configuration
  reportConfig: AutomatedReportConfig;
  updateReportConfig: (cfg: Partial<AutomatedReportConfig>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [scanEvents, setScanEvents] = useState<ScanEvent[]>(INITIAL_SCAN_EVENTS);
  const [stores] = useState<string[]>(INITIAL_STORES);
  const [selectedStore, setSelectedStore] = useState<string>(INITIAL_STORES[0]);
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [lastScannedProduct, setLastScannedProduct] = useState<Product | null>(INITIAL_PRODUCTS[0]);
  const [lastTriggeredCampaign, setLastTriggeredCampaign] = useState<Campaign | null>(INITIAL_CAMPAIGNS[0]);
  const [activeCustomerTier, setActiveCustomerTier] = useState<ShopperLoyaltyTier>('Dragon VIP');
  const [isCustomerScreenOpen, setIsCustomerScreenOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<AutomatedReportConfig>({
    frequency: 'daily',
    recipients: ['executives@druk-retail.com', 'marketing@druk-retail.com'],
    autoGenerate: true,
    deliveryHour: 8,
    lastGeneratedDate: '2026-11-06T08:00:00.000Z',
  });

  // Client manipulation: Product management
  const addProduct = (newProdData: Omit<Product, 'id' | 'engagementMetrics'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      engagementMetrics: {
        totalScans: 0,
        uniqueShoppers: 0,
        conversions: 0,
        dwellTimeAvgSec: 0,
        revenueGenerated: 0,
      },
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Client manipulation: Campaign management
  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'metrics'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      metrics: {
        impressions: 0,
        scansTriggered: 0,
        redemptions: 0,
        attributedSales: 0,
        budgetAllocated: 1000,
        roiPercentage: 0,
      },
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'active' ? 'paused' : 'active';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // Scanning engine at POS
  const scanBarcode = (barcodeInput: string): { success: boolean; message: string; product?: Product } => {
    const cleanBarcode = barcodeInput.trim();
    if (!cleanBarcode) {
      return { success: false, message: 'Please enter or scan a barcode' };
    }

    const matchedProduct = products.find(
      (p) =>
        p.barcode.toLowerCase() === cleanBarcode.toLowerCase() ||
        p.sku.toLowerCase() === cleanBarcode.toLowerCase() ||
        p.name.toLowerCase().includes(cleanBarcode.toLowerCase())
    );

    if (!matchedProduct) {
      return { success: false, message: `Barcode "${cleanBarcode}" not recognized in Druk catalog` };
    }

    // Play scanner sound
    playBarcodeBeep();

    setLastScannedProduct(matchedProduct);

    // Evaluate active campaign triggers
    let appliedCampaign: Campaign | null = null;
    let discountAmount = 0;

    const activeCampaigns = campaigns.filter(
      (c) => c.status === 'active' && c.targetProductIds.includes(matchedProduct.id)
    );

    if (activeCampaigns.length > 0) {
      // Find eligible campaign based on trigger rules
      for (const camp of activeCampaigns) {
        if (camp.triggerCondition === 'instant_scan') {
          appliedCampaign = camp;
          break;
        } else if (camp.triggerCondition === 'loyalty_tier_vip' && activeCustomerTier === 'Dragon VIP') {
          appliedCampaign = camp;
          break;
        } else if (camp.triggerCondition === 'second_scan') {
          // Check if product is already in cart
          const inCart = posCart.some((item) => item.product.id === matchedProduct.id);
          if (inCart) {
            appliedCampaign = camp;
            break;
          }
        } else if (camp.triggerCondition === 'basket_paired') {
          // If another targeted product is in cart
          const pairMatch = posCart.some((item) => camp.targetProductIds.includes(item.product.id));
          if (pairMatch) {
            appliedCampaign = camp;
            break;
          }
        }
      }
    }

    if (appliedCampaign) {
      playPromoChime();
      setLastTriggeredCampaign(appliedCampaign);
      if (appliedCampaign.discountType === 'percentage') {
        discountAmount = (matchedProduct.price * appliedCampaign.discountValue) / 100;
      } else if (appliedCampaign.discountType === 'fixed') {
        discountAmount = Math.min(appliedCampaign.discountValue, matchedProduct.price);
      }
    } else {
      setLastTriggeredCampaign(null);
    }

    // Update POS Cart
    setPosCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === matchedProduct.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === matchedProduct.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                discountApplied: discountAmount > 0 ? discountAmount : item.discountApplied,
                campaignCode: appliedCampaign ? appliedCampaign.code : item.campaignCode,
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            product: matchedProduct,
            quantity: 1,
            unitPrice: matchedProduct.price,
            discountApplied: discountAmount,
            campaignCode: appliedCampaign?.code,
          },
        ];
      }
    });

    // Update real-time product engagement metrics
    const dwell = Math.floor(Math.random() * 25) + 10;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === matchedProduct.id) {
          return {
            ...p,
            engagementMetrics: {
              ...p.engagementMetrics,
              totalScans: p.engagementMetrics.totalScans + 1,
              uniqueShoppers: p.engagementMetrics.uniqueShoppers + 1,
              lastScannedAt: new Date().toISOString(),
              dwellTimeAvgSec: Math.round(((p.engagementMetrics.dwellTimeAvgSec * p.engagementMetrics.totalScans + dwell) / (p.engagementMetrics.totalScans + 1)) * 10) / 10,
            },
          };
        }
        return p;
      })
    );

    // Record Scan Event
    const newScanEvent: ScanEvent = {
      id: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      barcode: matchedProduct.barcode,
      productId: matchedProduct.id,
      productName: matchedProduct.name,
      category: matchedProduct.category,
      storeLocation: selectedStore,
      terminalId: 'POS-01',
      operatorName: 'Active POS Lead',
      shopperTier: activeCustomerTier,
      convertedToSale: false, // Initially uncommitted until checkout
      dwellTimeSec: dwell,
      campaignApplied: appliedCampaign ? `${appliedCampaign.name} (${appliedCampaign.code})` : undefined,
      discountSaved: discountAmount,
    };

    setScanEvents((prev) => [newScanEvent, ...prev.slice(0, 199)]); // Keep latest 200

    return {
      success: true,
      message: `Scanned: ${matchedProduct.name}${appliedCampaign ? ` · Promo Applied: ${appliedCampaign.code}` : ''}`,
      product: matchedProduct,
    };
  };

  const removeFromCart = (productId: string) => {
    setPosCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setPosCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setPosCart([]);
  };

  const checkoutCart = (): { success: boolean; total: number; savings: number; itemsCount: number } => {
    if (posCart.length === 0) {
      return { success: false, total: 0, savings: 0, itemsCount: 0 };
    }

    let subtotal = 0;
    let savings = 0;
    let itemsCount = 0;

    posCart.forEach((item) => {
      subtotal += item.unitPrice * item.quantity;
      if (item.discountApplied) {
        savings += item.discountApplied * item.quantity;
      }
      itemsCount += item.quantity;
    });

    const finalTotal = Math.max(0, subtotal - savings);

    // Mark recent scan events as convertedToSale and record saleAmount
    const cartProductIds = posCart.map((i) => i.product.id);

    setScanEvents((prev) =>
      prev.map((event) => {
        if (cartProductIds.includes(event.productId) && !event.convertedToSale) {
          const matchingItem = posCart.find((i) => i.product.id === event.productId);
          const itemNet = matchingItem ? (matchingItem.unitPrice - (matchingItem.discountApplied || 0)) : 0;
          return {
            ...event,
            convertedToSale: true,
            saleAmount: Math.round(itemNet * 100) / 100,
          };
        }
        return event;
      })
    );

    // Update Product revenue and conversion stats
    setProducts((prev) =>
      prev.map((prod) => {
        const item = posCart.find((i) => i.product.id === prod.id);
        if (item) {
          const itemRev = (item.unitPrice - (item.discountApplied || 0)) * item.quantity;
          return {
            ...prod,
            stock: Math.max(0, prod.stock - item.quantity),
            engagementMetrics: {
              ...prod.engagementMetrics,
              conversions: prod.engagementMetrics.conversions + item.quantity,
              revenueGenerated: prod.engagementMetrics.revenueGenerated + itemRev,
            },
          };
        }
        return prod;
      })
    );

    // Update Campaign attributed sales metrics
    const appliedCampaignCodes = new Set(posCart.map((i) => i.campaignCode).filter(Boolean));
    if (appliedCampaignCodes.size > 0) {
      setCampaigns((prev) =>
        prev.map((camp) => {
          if (appliedCampaignCodes.has(camp.code)) {
            return {
              ...camp,
              metrics: {
                ...camp.metrics,
                redemptions: camp.metrics.redemptions + 1,
                attributedSales: camp.metrics.attributedSales + finalTotal,
              },
            };
          }
          return camp;
        })
      );
    }

    playPromoChime();
    clearCart();

    return {
      success: true,
      total: Math.round(finalTotal * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      itemsCount,
    };
  };

  // Simulates a shopper scanning an item in real-time
  const simulateLiveScan = () => {
    if (products.length === 0) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomStore = stores[Math.floor(Math.random() * stores.length)];
    const tiers: ShopperLoyaltyTier[] = ['Bronze', 'Silver', 'Gold', 'Dragon VIP'];
    const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
    const converted = Math.random() > 0.35;
    const dwell = Math.floor(Math.random() * 35) + 10;
    const discount = Math.random() > 0.4 ? Math.round(randomProduct.price * 0.15 * 100) / 100 : 0;
    const finalSale = converted ? Math.max(1, randomProduct.price - discount) : undefined;

    playBarcodeBeep();

    const newScan: ScanEvent = {
      id: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      barcode: randomProduct.barcode,
      productId: randomProduct.id,
      productName: randomProduct.name,
      category: randomProduct.category,
      storeLocation: randomStore,
      terminalId: `POS-0${Math.floor(Math.random() * 4) + 1}`,
      operatorName: ['Leo Vargas', 'Sarah Chen', 'Tenzin Dorji', 'Maya Patel'][Math.floor(Math.random() * 4)],
      shopperTier: randomTier,
      convertedToSale: converted,
      saleAmount: finalSale,
      dwellTimeSec: dwell,
      campaignApplied: discount > 0 ? 'DRUK15 (15% Off)' : undefined,
      discountSaved: discount,
    };

    setScanEvents((prev) => [newScan, ...prev.slice(0, 199)]);

    // Update product stats
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === randomProduct.id) {
          return {
            ...p,
            engagementMetrics: {
              ...p.engagementMetrics,
              totalScans: p.engagementMetrics.totalScans + 1,
              uniqueShoppers: p.engagementMetrics.uniqueShoppers + 1,
              conversions: converted ? p.engagementMetrics.conversions + 1 : p.engagementMetrics.conversions,
              revenueGenerated: converted && finalSale ? p.engagementMetrics.revenueGenerated + finalSale : p.engagementMetrics.revenueGenerated,
              dwellTimeAvgSec: Math.round(((p.engagementMetrics.dwellTimeAvgSec * p.engagementMetrics.totalScans + dwell) / (p.engagementMetrics.totalScans + 1)) * 10) / 10,
              lastScannedAt: new Date().toISOString(),
            },
          };
        }
        return p;
      })
    );
  };

  const simulateRushSurge = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        simulateLiveScan();
      }, i * 300);
    }
  };

  const updateReportConfig = (cfg: Partial<AutomatedReportConfig>) => {
    setReportConfig((prev) => ({ ...prev, ...cfg }));
  };

  return (
    <DataContext.Provider
      value={{
        products,
        campaigns,
        scanEvents,
        stores,
        selectedStore,
        setSelectedStore,
        addProduct,
        updateProduct,
        deleteProduct,
        addCampaign,
        updateCampaign,
        toggleCampaignStatus,
        posCart,
        lastScannedProduct,
        lastTriggeredCampaign,
        activeCustomerTier,
        setActiveCustomerTier,
        scanBarcode,
        removeFromCart,
        updateCartQty,
        clearCart,
        checkoutCart,
        simulateLiveScan,
        simulateRushSurge,
        isCustomerScreenOpen,
        setIsCustomerScreenOpen,
        reportConfig,
        updateReportConfig,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
