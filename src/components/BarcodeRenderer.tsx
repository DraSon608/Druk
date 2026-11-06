import React from 'react';
import { Product } from '../types';

interface BarcodeProps {
  value: string;
  format?: 'EAN-13' | 'UPC-A' | 'CODE-128' | 'QR';
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

/**
 * Deterministically generates bar patterns for barcodes (monochrome black bars on white background)
 */
export const BarcodeSVG: React.FC<BarcodeProps> = ({
  value,
  format = 'EAN-13',
  width = 240,
  height = 70,
  showText = true,
  className = '',
}) => {
  // Deterministic pattern generator from string hash
  const generateBars = (input: string) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }

    const bars: { x: number; w: number }[] = [];
    let currentX = 12;

    // Start guard bars (101)
    bars.push({ x: currentX, w: 2 });
    currentX += 4;
    bars.push({ x: currentX, w: 2 });
    currentX += 6;

    // Data bars derived from characters
    for (let i = 0; i < Math.min(input.length, 16); i++) {
      const charCode = input.charCodeAt(i);
      const bar1 = (charCode % 3) + 1.2;
      const space1 = ((charCode >> 1) % 3) + 1.5;
      const bar2 = ((charCode >> 2) % 3) + 1.4;
      const space2 = ((charCode >> 3) % 3) + 1.8;

      bars.push({ x: currentX, w: bar1 });
      currentX += bar1 + space1;
      bars.push({ x: currentX, w: bar2 });
      currentX += bar2 + space2;

      // Center guard if half-way
      if (i === 6) {
        currentX += 2;
        bars.push({ x: currentX, w: 2 });
        currentX += 4;
        bars.push({ x: currentX, w: 2 });
        currentX += 4;
      }
    }

    // End guard bars (101)
    currentX += 2;
    bars.push({ x: currentX, w: 2 });
    currentX += 4;
    bars.push({ x: currentX, w: 2 });
    currentX += 6;

    return { bars, totalWidth: Math.max(currentX + 8, 200) };
  };

  const { bars, totalWidth } = generateBars(value);

  if (format === 'QR') {
    return (
      <div className={`inline-flex flex-col items-center bg-white p-3 rounded-lg text-slate-900 shadow-sm ${className}`}>
        <svg
          width={width > 120 ? 120 : width}
          height={width > 120 ? 120 : width}
          viewBox="0 0 100 100"
          className="shape-rendering-crisp"
        >
          {/* QR Corner Finders */}
          <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="3" />
          <rect x="9" y="9" width="20" height="20" fill="#ffffff" rx="2" />
          <rect x="13" y="13" width="12" height="12" fill="#0f172a" rx="1" />

          <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="3" />
          <rect x="71" y="9" width="20" height="20" fill="#ffffff" rx="2" />
          <rect x="75" y="13" width="12" height="12" fill="#0f172a" rx="1" />

          <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="3" />
          <rect x="9" y="71" width="20" height="20" fill="#ffffff" rx="2" />
          <rect x="13" y="75" width="12" height="12" fill="#0f172a" rx="1" />

          {/* Center Matrix Modules */}
          <rect x="38" y="12" width="6" height="6" fill="#0f172a" />
          <rect x="48" y="18" width="8" height="6" fill="#0f172a" />
          <rect x="58" y="10" width="5" height="10" fill="#0f172a" />

          <rect x="12" y="38" width="6" height="8" fill="#0f172a" />
          <rect x="22" y="48" width="8" height="6" fill="#0f172a" />
          <rect x="38" y="38" width="10" height="10" fill="#0f172a" />
          <rect x="52" y="42" width="6" height="6" fill="#0f172a" />
          <rect x="64" y="38" width="8" height="8" fill="#0f172a" />
          <rect x="78" y="45" width="10" height="6" fill="#0f172a" />

          <rect x="42" y="56" width="8" height="12" fill="#0f172a" />
          <rect x="56" y="58" width="6" height="8" fill="#0f172a" />
          <rect x="68" y="68" width="8" height="8" fill="#0f172a" />
          <rect x="82" y="72" width="8" height="14" fill="#0f172a" />

          {/* Druk stylized dragon motif center stamp */}
          <circle cx="50" cy="50" r="10" fill="#ffffff" />
          <circle cx="50" cy="50" r="7" fill="#0f172a" />
          <path d="M48 47 Q52 46 51 53 Q49 51 48 47" fill="#ffffff" />
        </svg>
        {showText && (
          <span className="text-[11px] font-mono tracking-wider font-semibold text-slate-800 mt-1">
            {value}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center bg-white px-4 py-2.5 rounded-lg shadow-sm border border-slate-200 text-slate-900 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${totalWidth} 48`}
        className="w-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x="0" y="0" width={totalWidth} height="48" fill="#ffffff" />
        {bars.map((bar, i) => (
          <rect
            key={i}
            x={bar.x}
            y="2"
            width={bar.w}
            height="44"
            fill="#0f172a"
          />
        ))}
      </svg>
      {showText && (
        <div className="flex items-center justify-between w-full px-2 mt-1 font-mono text-[11px] font-semibold tracking-widest text-slate-800">
          <span>{format}</span>
          <span>{value}</span>
        </div>
      )}
    </div>
  );
};

interface ShelfTalkerCardProps {
  product: Product;
  onPrint?: () => void;
  onClose?: () => void;
}

export const ShelfTalkerCard: React.FC<ShelfTalkerCardProps> = ({ product, onPrint, onClose }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
            🐉
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
            DRUK RETAIL MARKETING
          </span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          SKU: {product.sku}
        </div>
      </div>

      <div className="mb-4">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {product.category}
        </span>
        <h3 className="text-lg font-bold text-white mt-0.5 leading-snug">
          {product.name}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>

      <div className="flex items-baseline justify-between py-2 border-y border-slate-800/80 my-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Retail Price</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-white">
            ${product.price.toFixed(2)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold block">
            POS Scan Perk
          </span>
          <span className="text-xs text-slate-300">
            Scan at terminal for instant reward
          </span>
        </div>
      </div>

      {/* Barcode & QR Dual Scan Area */}
      <div className="bg-white p-3 rounded-lg text-center my-3">
        <BarcodeSVG
          value={product.barcode}
          format={product.barcodeType}
          width={280}
          height={55}
          showText={true}
          className="border-none shadow-none"
        />
        <div className="text-[10px] text-slate-600 font-medium tracking-tight mt-1">
          POS SCAN TOUCHPOINT · INSTANT PRODUCT ENGAGEMENT LOG
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (onPrint) {
              onPrint();
            } else {
              window.print();
            }
          }}
          className="flex-1 px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>Print Shelf-Talker Label</span>
        </button>
      </div>
    </div>
  );
};
