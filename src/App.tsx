import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar, NavTab } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { PosTerminal } from './components/PosTerminal';
import { ProductEngagement } from './components/ProductEngagement';
import { MarketingCampaigns } from './components/MarketingCampaigns';
import { AutomatedReports } from './components/AutomatedReports';
import { AuditSecurity } from './components/AuditSecurity';
import { CustomerScreenModal } from './components/CustomerScreenModal';
import { LoginModal } from './components/LoginModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'pos' && <PosTerminal />}
        {activeTab === 'products' && <ProductEngagement />}
        {activeTab === 'campaigns' && <MarketingCampaigns />}
        {activeTab === 'reports' && <AutomatedReports />}
        {activeTab === 'security' && <AuditSecurity />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold tracking-wider">DRUK · འབྲུག</span>
            <span>·</span>
            <span>POS Barcode Marketing Intelligence & Customer Analytics</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>SHA-256 Verified Data Security</span>
            <span>·</span>
            <span>High Altitude Retail Cloud</span>
          </div>
        </div>
      </footer>

      {/* Customer-Facing Display Modal */}
      <CustomerScreenModal />

      {/* Security Login Modal */}
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
