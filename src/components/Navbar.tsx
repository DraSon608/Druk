import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';

export type NavTab =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'campaigns'
  | 'reports'
  | 'security';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, switchRole, setIsLoginModalOpen } = useAuth();
  const { setIsCustomerScreenOpen, isCustomerScreenOpen } = useData();

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Admin Dashboard' },
    { id: 'pos', label: 'POS Terminal' },
    { id: 'products', label: 'Product Engagement' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'reports', label: 'Automated Reports' },
    { id: 'security', label: 'Security & Access' },
  ];

  const roleLabels: Record<UserRole, string> = {
    admin: 'Admin',
    marketing_manager: 'Marketing',
    pos_operator: 'POS Cashier',
    analyst: 'Analyst',
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark with White Dragon emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-700/60 shadow-md bg-slate-900 flex items-center justify-center">
              <img
                src="/src/assets/images/druk_white_dragon_logo_1793992014257.jpg"
                alt="Druk White Dragon"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-wider text-white uppercase font-sans">
                DRUK
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 font-medium -mt-1 uppercase">
                POS MARKETING INTELLIGENCE
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Auth Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Customer Screen toggle */}
            <button
              type="button"
              onClick={() => setIsCustomerScreenOpen(!isCustomerScreenOpen)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/70 hover:border-slate-500 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
              title="Launch interactive customer-facing marketing screen"
            >
              <span className="text-white">🐉</span>
              <span className="hidden sm:inline">Customer Screen</span>
            </button>

            {/* Quick role switch dropdown for easy demonstration */}
            {currentUser && (
              <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                {(['admin', 'marketing_manager', 'pos_operator'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => switchRole(r)}
                    className={`px-2 py-1 text-[11px] rounded transition-colors whitespace-nowrap ${
                      currentUser.role === r
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
            )}

            {/* User profile / Login button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {roleLabels[currentUser.role]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Sign out of Druk session"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => setActiveTab(link.id)}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap shrink-0 ${
                activeTab === link.id
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
