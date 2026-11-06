import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { BarcodeSVG } from './BarcodeRenderer';
import { ShopperLoyaltyTier } from '../types';

export const PosTerminal: React.FC = () => {
  const {
    products,
    scanBarcode,
    posCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    checkoutCart,
    lastScannedProduct,
    lastTriggeredCampaign,
    activeCustomerTier,
    setActiveCustomerTier,
    selectedStore,
    setSelectedStore,
    stores,
    setIsCustomerScreenOpen,
  } = useData();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState<{ message: string; type: 'success' | 'error' | 'idle' }>({
    message: '',
    type: 'idle',
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastCheckoutResult, setLastCheckoutResult] = useState<{
    total: number;
    savings: number;
    itemsCount: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const result = scanBarcode(barcodeInput);
    if (result.success) {
      setScanFeedback({ message: result.message, type: 'success' });
      setBarcodeInput('');
    } else {
      setScanFeedback({ message: result.message, type: 'error' });
    }
  };

  const handleQuickScan = (barcode: string) => {
    const result = scanBarcode(barcode);
    if (result.success) {
      setScanFeedback({ message: result.message, type: 'success' });
    } else {
      setScanFeedback({ message: result.message, type: 'error' });
    }
  };

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } else {
        setScanFeedback({ message: 'Camera API not supported in this browser.', type: 'error' });
      }
    } catch {
      setScanFeedback({
        message: 'Camera access denied or unavailable. Use quick-scan or manual barcode input below.',
        type: 'error',
      });
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCheckout = () => {
    const res = checkoutCart();
    if (res.success) {
      setLastCheckoutResult(res);
      setScanFeedback({
        message: `Checkout Complete! $${res.total.toFixed(2)} billed. Customer saved $${res.savings.toFixed(2)} via Druk Barcode Marketing.`,
        type: 'success',
      });
    }
  };

  // Cart financial calculations
  const cartSubtotal = posCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartSavings = posCart.reduce((sum, item) => sum + (item.discountApplied || 0) * item.quantity, 0);
  const cartTotal = Math.max(0, cartSubtotal - cartSavings);

  const tiers: ShopperLoyaltyTier[] = ['Bronze', 'Silver', 'Gold', 'Dragon VIP'];

  return (
    <div className="space-y-6">
      {/* Top Bar / Location & Customer Setup */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
            📟
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              POS Barcode Engagement Terminal
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Terminal ID: POS-01</span>
              <span>·</span>
              <span>Real-Time Marketing Sync: Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Store Location
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-slate-500"
            >
              {stores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Shopper Loyalty Tier
            </label>
            <select
              value={activeCustomerTier}
              onChange={(e) => setActiveCustomerTier(e.target.value as ShopperLoyaltyTier)}
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-slate-500 font-medium"
            >
              {tiers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <button
              type="button"
              onClick={() => setIsCustomerScreenOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Customer Display</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Scanner & Barcode Trigger, Right = Active Basket & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner Station (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Barcode Scanner Viewport */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                  Barcode Laser Scanner
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  [EAN-13 / UPC / Code-128 / QR]
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-2.5 py-1 text-xs text-rose-300 bg-rose-950/60 border border-rose-800 rounded-md hover:bg-rose-900/60 transition-colors"
                  >
                    Turn Camera Off
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-2.5 py-1 text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 transition-colors flex items-center gap-1"
                  >
                    <span>📷</span>
                    <span>Use Camera</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Viewfinder / Laser animation */}
            <div className="relative w-full h-44 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white text-xl mb-2">
                    ⚡
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    Scanner Ready
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Click any quick test barcode below or type barcode number
                  </span>
                </div>
              )}

              {/* Viewfinder Target Reticle */}
              <div className="absolute inset-x-12 inset-y-6 pointer-events-none border border-slate-700/60 rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />
                {/* Animated Red Laser Scan Line */}
                <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] absolute top-1/2 -translate-y-1/2 animate-pulse" />
              </div>
            </div>

            {/* Manual Barcode Input Box */}
            <form onSubmit={handleManualScan} className="flex gap-2 mt-4">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan or enter barcode / SKU (e.g. 8901030829141)..."
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-slate-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                Scan Item
              </button>
            </form>

            {/* Scan Feedback Banner */}
            {scanFeedback.message && (
              <div
                className={`mt-3 p-2.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                  scanFeedback.type === 'success'
                    ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
                }`}
              >
                <span>{scanFeedback.message}</span>
                <button
                  type="button"
                  onClick={() => setScanFeedback({ message: '', type: 'idle' })}
                  className="text-slate-400 hover:text-white ml-2 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Quick-Tap Test Barcodes Catalog (Client instant manipulation) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300">
                  Quick Barcode Test Studio
                </h3>
                <span className="text-[11px] text-slate-400">
                  Click any product below to simulate a high-speed laser scan
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {products.length} Products Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleQuickScan(prod.barcode)}
                  className="p-3 text-left bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-lg transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {prod.name}
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-200 tabular-nums shrink-0">
                      ${prod.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="truncate">🏷️ {prod.barcode}</span>
                    <span className="text-[10px] uppercase text-slate-400">
                      {prod.barcodeType}
                    </span>
                  </div>

                  {prod.activeCampaignId && (
                    <div className="mt-1.5 text-[10px] text-amber-300 font-medium">
                      ⚡ Active Marketing Campaign Linked
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Scanned Item Spotlight & Marketing Storytelling */}
          {lastScannedProduct && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Scanned Product Spotlight
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {lastScannedProduct.sku}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="bg-white p-2 rounded-lg shrink-0">
                  <BarcodeSVG
                    value={lastScannedProduct.barcode}
                    format={lastScannedProduct.barcodeType}
                    width={180}
                    height={45}
                    showText={true}
                    className="border-none shadow-none"
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-sm font-bold text-white">
                      {lastScannedProduct.name}
                    </h4>
                    <span className="text-sm font-bold font-mono text-white tabular-nums">
                      ${lastScannedProduct.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lastScannedProduct.marketingStory}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                    <span>Stock: {lastScannedProduct.stock} units</span>
                    <span>·</span>
                    <span>Total Scans: {lastScannedProduct.engagementMetrics.totalScans}</span>
                    <span>·</span>
                    <span>Dwell Time: {lastScannedProduct.engagementMetrics.dwellTimeAvgSec}s</span>
                  </div>
                </div>
              </div>

              {lastTriggeredCampaign && (
                <div className="mt-3 p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-base">✨</span>
                    <div>
                      <span className="text-xs font-bold text-amber-200 block">
                        Campaign Promo Unlocked: {lastTriggeredCampaign.name}
                      </span>
                      <span className="text-[11px] text-amber-300/80">
                        {lastTriggeredCampaign.tagline} ({lastTriggeredCampaign.code})
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase px-2 py-0.5 rounded bg-amber-900/40">
                    Active
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Active Cart & Checkout (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Active POS Transaction
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ({posCart.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                </div>
                {posCart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Clear Basket
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              {posCart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xl text-slate-400">
                    🛒
                  </div>
                  <p className="text-xs font-medium text-slate-300">
                    Cart is empty
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Scan products via barcode laser or click any quick-test item to build transaction.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {posCart.map((item) => {
                    const itemTotal = (item.unitPrice - (item.discountApplied || 0)) * item.quantity;
                    return (
                      <div
                        key={item.product.id}
                        className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <span className="text-xs font-bold text-white block">
                              {item.product.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Barcode: {item.product.barcode}
                            </span>
                          </div>
                          <span className="text-xs font-bold font-mono text-white tabular-nums">
                            ${itemTotal.toFixed(2)}
                          </span>
                        </div>

                        {item.discountApplied && item.discountApplied > 0 ? (
                          <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium bg-emerald-950/30 px-2 py-1 rounded">
                            <span>Promo: {item.campaignCode}</span>
                            <span>-${(item.discountApplied * item.quantity).toFixed(2)}</span>
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Financial Summary & Checkout Button */}
            <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-slate-300">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>

              {cartSavings > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
                  <span>Marketing Barcode Savings</span>
                  <span className="font-mono tabular-nums">
                    -${cartSavings.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-baseline justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Due</span>
                <span className="font-mono tabular-nums text-xl">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                disabled={posCart.length === 0}
                onClick={handleCheckout}
                className="w-full mt-3 py-3 px-4 text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Complete Checkout & Log Engagement</span>
              </button>

              {lastCheckoutResult && (
                <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-1 animate-in fade-in">
                  <div className="text-xs font-bold text-emerald-400">
                    ✓ Receipt Generated & Analytics Logged
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Sale: ${lastCheckoutResult.total.toFixed(2)} · Saved: ${lastCheckoutResult.savings.toFixed(2)} · {lastCheckoutResult.itemsCount} units
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
