import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Product, BarcodeFormat } from '../types';
import { BarcodeSVG, ShelfTalkerCard } from './BarcodeRenderer';

export const ProductEngagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, campaigns } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeModal, setActiveModal] = useState<'NONE' | 'ADD' | 'EDIT' | 'SHELF_TALKER'>('NONE');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    barcodeType: 'EAN-13' as BarcodeFormat,
    category: 'Artisanal Teas',
    price: 35.0,
    costPrice: 10.0,
    stock: 50,
    activeCampaignId: '',
    description: '',
    tags: 'Flagship, Luxury',
    marketingStory: '',
    benefits: 'Organic, Handcrafted, High Elevation',
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      sku: `DRK-${Date.now().toString().slice(-4)}`,
      barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      barcodeType: 'EAN-13',
      category: categories[0] || 'Artisanal Teas',
      price: 45.0,
      costPrice: 15.0,
      stock: 60,
      activeCampaignId: campaigns[0]?.id || '',
      description: '',
      tags: 'Artisanal, Organic',
      marketingStory: '',
      benefits: 'High Altitude Harvest, Sovereign Purity',
    });
    setActiveModal('ADD');
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      barcodeType: product.barcodeType,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      activeCampaignId: product.activeCampaignId || '',
      description: product.description,
      tags: product.tags.join(', '),
      marketingStory: product.marketingStory,
      benefits: product.benefits.join(', '),
    });
    setActiveModal('EDIT');
  };

  const handleOpenShelfTalker = (product: Product) => {
    setSelectedProduct(product);
    setActiveModal('SHELF_TALKER');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.barcode.trim()) return;

    const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const benefitsArray = formData.benefits.split(',').map((b) => b.trim()).filter(Boolean);

    if (activeModal === 'ADD') {
      addProduct({
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        barcodeType: formData.barcodeType,
        category: formData.category,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        activeCampaignId: formData.activeCampaignId || undefined,
        description: formData.description,
        tags: tagsArray,
        marketingStory: formData.marketingStory,
        benefits: benefitsArray,
      });
    } else if (activeModal === 'EDIT' && selectedProduct) {
      updateProduct(selectedProduct.id, {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        barcodeType: formData.barcodeType,
        category: formData.category,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        activeCampaignId: formData.activeCampaignId || undefined,
        description: formData.description,
        tags: tagsArray,
        marketingStory: formData.marketingStory,
        benefits: benefitsArray,
      });
    }

    setActiveModal('NONE');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Product Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Product Engagement & Barcode Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage product metadata, generate retail barcodes, and monitor customer engagement velocity
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, SKU, or barcode..."
            className="w-full sm:w-80 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-slate-500"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-slate-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400 self-center">
          {filteredProducts.length} items cataloged
        </span>
      </div>

      {/* Product Grid / Engagement Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => {
          const linkedCampaign = campaigns.find((c) => c.id === prod.activeCampaignId);
          const convRate = prod.engagementMetrics.totalScans > 0
            ? Math.round((prod.engagementMetrics.conversions / prod.engagementMetrics.totalScans) * 100)
            : 0;

          return (
            <div
              key={prod.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      {prod.category}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {prod.name}
                    </h3>
                  </div>
                  <span className="text-base font-bold font-mono text-white tabular-nums shrink-0">
                    ${prod.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {prod.description}
                </p>

                {/* Scannable Barcode Vector Preview */}
                <div className="bg-white p-2.5 rounded-lg mb-4 text-center">
                  <BarcodeSVG
                    value={prod.barcode}
                    format={prod.barcodeType}
                    width={220}
                    height={46}
                    showText={true}
                    className="border-none shadow-none"
                  />
                </div>

                {/* Engagement Telemetry Strip */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-950 rounded-lg border border-slate-800/80 text-center mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Total Scans
                    </span>
                    <span className="text-xs font-bold font-mono text-white tabular-nums">
                      {prod.engagementMetrics.totalScans}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Conversion
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                      {convRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Dwell Time
                    </span>
                    <span className="text-xs font-bold font-mono text-cyan-300 tabular-nums">
                      {prod.engagementMetrics.dwellTimeAvgSec}s
                    </span>
                  </div>
                </div>

                {linkedCampaign && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/30 px-2.5 py-1 rounded border border-amber-800/40 font-medium mb-3">
                    ⚡ Promo: {linkedCampaign.name} ({linkedCampaign.code})
                  </div>
                )}
              </div>

              {/* Action Buttons for Client Manipulation */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleOpenShelfTalker(prod)}
                  className="px-2.5 py-1.5 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                  title="Preview & print physical shelf-talker barcode tag"
                >
                  <span>🏷️ Shelf Tag</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(prod)}
                    className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(prod.id)}
                    className="px-2 py-1.5 text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete product"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add / Edit Product */}
      {(activeModal === 'ADD' || activeModal === 'EDIT') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white">
                {activeModal === 'ADD' ? 'Add New Product to Druk Catalog' : 'Edit Product & Barcode'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal('NONE')}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Druk High Mountain Peony Tea"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">SKU Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Barcode String</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. 8901030829141"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Barcode Standard</label>
                  <select
                    value={formData.barcodeType}
                    onChange={(e) => setFormData({ ...formData, barcodeType: e.target.value as BarcodeFormat })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="EAN-13">EAN-13 (Standard Retail)</option>
                    <option value="UPC-A">UPC-A (North America)</option>
                    <option value="CODE-128">Code-128 (High Density Alphanumeric)</option>
                    <option value="QR">QR Code (Mobile & Dynamic Touchpoint)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Stock Level</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Linked Marketing Campaign</label>
                  <select
                    value={formData.activeCampaignId}
                    onChange={(e) => setFormData({ ...formData, activeCampaignId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="">No Promotional Trigger</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key sensory notes and summary..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Artisan Marketing Story (Customer-Facing on POS Scan)
                </label>
                <textarea
                  rows={2}
                  value={formData.marketingStory}
                  onChange={(e) => setFormData({ ...formData, marketingStory: e.target.value })}
                  placeholder="The origin story displayed to customers when this product's barcode is scanned..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal('NONE')}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-slate-950 bg-white hover:bg-slate-200 rounded-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Shelf-Talker Print Studio */}
      {activeModal === 'SHELF_TALKER' && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <ShelfTalkerCard
            product={selectedProduct}
            onClose={() => setActiveModal('NONE')}
          />
        </div>
      )}
    </div>
  );
};
