# Druk — POS Barcode Marketing Intelligence & Real-Time Analytics

> **Next-generation retail marketing platform leveraging Point of Sale (POS) barcode touchpoints to capture product engagement, calculate real-time customer analytics, and generate automated executive performance reports.**

---

## 🐉 Brand Identity & Overview

**Druk** (the revered Thunder Dragon) blends modern luxury retail aesthetics with high-performance marketing technology. Designed for enterprise retail brands and multi-location boutiques, Druk transforms routine barcode scanning at checkout counters and shelf displays into measurable marketing interactions and instant customer loyalty rewards.

- **Branding**: White Dragon insignia featuring an atmospheric twilight mountain background.
- **Audience**: Retail Executives, Marketing Directors, POS Terminal Operators, and Data Analysts.
- **Core Value**: Turns every physical product barcode scan into an attributable digital marketing event.

---

## ✨ Core Capabilities

### 1. POS Barcode Terminal & Dual-Screen Marketing Engine
- **Laser Barcode Scanning Simulator**: High-speed visual laser viewfinder with interactive scan-line animation.
- **Audio Feedback**: Synthesizes realistic POS scanner chirps and celebratory promotional chimes using the native `Web Audio API` (zero external audio file dependencies).
- **Camera Barcode Input**: Integrated camera support via `navigator.mediaDevices` with graceful fallback to simulated laser input.
- **Quick-Tap Barcode Test Studio**: One-click test scan buttons for every catalog item to simulate high-throughput retail lanes.
- **Interactive Customer Screen**: Dedicated customer-facing display showing the White Dragon motif, product provenance and artisan stories, active discount highlights, and loyalty tier recognition.
- **Basket Checkout & Attribution**: Calculates line-item promo savings, updates stock levels, and generates verifiable checkout receipts logged directly to the telemetry database.

### 2. Marketing Campaigns & Promotional Rules
- **Rule-Based Triggers**:
  - `instant_scan`: Immediate percentage or dollar discount upon first barcode scan.
  - `loyalty_tier_vip`: Exclusive pricing unlocked for Dragon VIP tier members.
  - `basket_paired`: Co-scan discounts triggered when complementary products appear in the same basket.
  - `second_scan`: Multipliers applied when shoppers interact with an item repeatedly.
- **ROI Tracking**: Live measurement of impressions, scan triggers, redemptions, attributed revenue, and return on marketing spend.
- **Basket Affinity Intelligence**: Algorithmic discovery of high-frequency product pairings co-scanned across retail terminals.

### 3. Product Catalog & Barcode Studio
- **Full Client Manipulation**: Add, edit, or remove catalog items, update retail and cost pricing, manage stock, and link promotional campaigns.
- **Vector Barcode SVG Generator**: Clean, deterministic SVG bar generation supporting **EAN-13**, **UPC-A**, **CODE-128**, and **QR codes**.
- **Printable Shelf-Talker Studio**: Generates formatted, print-ready shelf talkers and packaging tags with product descriptions, prices, promotional perks, and scannable barcodes (`window.print()` ready).

### 4. Admin Dashboard & Real-Time Analytics
- **Executive Metric Cards**: Total Scans, Scan-to-Sale Conversion Rate, Attributed POS Revenue, Active Campaigns, and Average Customer Dwell Time.
- **Hourly Engagement Velocity Chart**: SVG area/bar chart displaying peak shopping hours and conversion densities across POS terminals.
- **Branch Performance Comparison**: Revenue and scan metrics broken down across retail branches.
- **Live POS Stream**: Real-time table stream with instant filtering by branch, conversion status (purchased vs. scan-only), and keyword search.
- **Traffic Simulator**: Interactive controls to simulate individual shopper scans or a 5x rush-hour burst.

### 5. Automated Performance Reporting & External Analysis Export
- **Executive Intelligence Briefing**: Synthesizes total scan volume, checkout conversion rates, attributed revenue, leading products, and campaign leaders.
- **Algorithmic Insights**: Generates automated performance highlights and strategic marketing recommendations.
- **Configurable Periods**: Today, 7-Day Cycle, and Month-to-Date scopes.
- **Scheduled Digest Dispatch**: Simulates daily (8:00 AM) or weekly executive email summaries with a full inbox preview modal.
- **Direct PDF Export**: Downloads a formatted executive PDF report (`jsPDF`) including KPI scorecards, highlights, recommendations, branch performance, and top product rankings.
- **Structured CSV Export for BI & Excel**: Multi-section CSV export containing metadata, KPI metrics, highlighted recommendations, product engagement tables, branch breakdowns, and campaign ROI.
- **Raw Telemetry Export**: Granular scan-by-scan log export for deep data-science modeling.

### 6. Security, RBAC & Audit Ledger
- **Role-Based Access Control (RBAC)**:
  - `admin`: Full system configuration, user provisioning, and report authorization.
  - `marketing_manager`: Campaign creation, trigger rules, and analytics export.
  - `pos_operator`: Barcode scanning, transaction checkout, and coupon redemption.
  - `analyst`: Telemetry inspection, report generation, and CSV archive exports.
- **Cryptographic Session Tokens**: SHA-256 session token generation with 8-hour TTL.
- **Audit Ledger**: Append-only log recording logins, role switches, campaign updates, and checkout events with timestamps and IP addresses.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 (Functional Components, Hooks) |
| **Language** | TypeScript (Strict mode enabled) |
| **Bundler & Dev Server** | Vite 8 |
| **Styling** | Tailwind CSS v4 (`@custom-variant dark`) |
| **Icons** | Lucide React |
| **Sound Synthesis** | Web Audio API (Native `AudioContext`) |
| **Unit Testing** | Node.js built-in test runner (`node:test`, `node:assert/strict` via `tsx`) |

---

## 📁 Project Structure

```
/
├── index.html                 # HTML entry point with Plus Jakarta Sans & JetBrains Mono fonts
├── metadata.json              # Applet metadata, capabilities, and camera permissions
├── package.json               # Dependencies, build, and dev scripts
├── tsconfig.json              # TypeScript compilation configuration
├── vite.config.ts             # Vite configuration with Tailwind CSS plugin and path aliases
├── src/
│   ├── main.tsx               # React root mount
│   ├── App.tsx                # Application shell with navigation and view switching
│   ├── index.css              # Tailwind CSS v4 imports and custom dark-mode variants
│   ├── types/
│   │   └── index.ts           # TypeScript models (Product, Campaign, ScanEvent, User, Reports)
│   ├── data/
│   │   └── initialData.ts     # Seed catalog, campaigns, demo users, and scan history
│   ├── context/
│   │   ├── AuthContext.tsx    # Authentication, RBAC, session tokens, and security audit log
│   │   └── DataContext.tsx    # Products, campaigns, POS cart, and scanning simulation state
│   ├── utils/
│   │   ├── analytics.ts       # Pure calculation logic (conversion, ROI, dwell time, reports)
│   │   ├── analytics.test.ts  # Deterministic unit tests using node:test
│   │   └── audio.ts           # Web Audio API scanner beep and promotional chimes
│   ├── components/
│   │   ├── Navbar.tsx         # 3-zone top bar with White Dragon logo, nav tabs, and role selector
│   │   ├── AdminDashboard.tsx # KPI scorecards, hourly velocity chart, and live scan stream
│   │   ├── PosTerminal.tsx    # Barcode scanner terminal, quick-test studio, cart, and checkout
│   │   ├── CustomerScreenModal.tsx # Customer-facing interactive display with Dragon branding
│   │   ├── ProductEngagement.tsx   # Product management, barcode studio, and shelf-talker preview
│   │   ├── MarketingCampaigns.tsx  # Campaign builder and basket affinity intelligence
│   │   ├── AutomatedReports.tsx    # Executive briefing generator, scheduling, and email preview
│   │   ├── AuditSecurity.tsx       # RBAC permissions matrix and security audit ledger
│   │   ├── BarcodeRenderer.tsx     # SVG barcode / QR generator and printable shelf-talker card
│   │   └── LoginModal.tsx          # Multi-role authentication and demo credentials modal
│   └── assets/
│       └── images/                 # White dragon branding and aesthetic background assets
```

---

## 🚀 Getting Started

### Development
Start the local development server on port 3000:
```bash
npm run dev
```

### Production Build
Compile the production-ready static bundle:
```bash
npm run build
```

### Type Checking & Linting
Validate TypeScript types across the entire project:
```bash
npm run lint
```

### Running Unit Tests
Execute the decoupled analytics test suite:
```bash
npx --yes tsx --test src/utils/analytics.test.ts
```

---

## 🔒 Security & Data Integrity
- All user sessions issue verifiable tokens.
- Role-based permissions protect campaign publishing and administrative functions.
- Client inputs and barcode streams are sanitized and validated against active catalog records.
- Built without external CDN scripts or untrusted image hosts to ensure hermetic deployment.
