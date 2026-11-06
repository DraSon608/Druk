import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_USERS } from '../data/initialData';
import { UserRole } from '../types';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please provide a valid work email.');
      return;
    }
    if (password.length > 0 && password.length < 4) {
      setErrorMessage('Security token must be at least 4 characters.');
      return;
    }
    login(email, selectedRole);
    setErrorMessage('');
  };

  const handleSelectPreset = (presetEmail: string, role: UserRole) => {
    login(presetEmail, role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Aesthetic background accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-slate-800/40 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
              <img
                src="/src/assets/images/druk_white_dragon_logo_1793992014257.jpg"
                alt="Druk Dragon"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Druk Secure Access
              </h2>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                POS Barcode Marketing Intelligence
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            aria-label="Close login dialog"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Select a verified role credential to test permissions, manage campaigns, or operate the barcode POS terminal.
        </p>

        {/* Quick Demo Switcher */}
        <div className="space-y-2 mb-5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 block">
            Instant Demo Sign-In
          </span>
          <div className="grid grid-cols-2 gap-2">
            {INITIAL_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectPreset(user.email, user.role)}
                className="p-2.5 text-left rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 transition-colors flex flex-col group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {user.role === 'admin' ? 'Admin' : user.role === 'marketing_manager' ? 'Marketing' : 'POS'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                  {user.email}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-400">
            or sign in with credentials
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {errorMessage && (
            <div className="p-2.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Enterprise Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. director@retailer.com"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Security Token / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Assigned Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-slate-500"
            >
              <option value="admin">System Administrator (Full Control)</option>
              <option value="marketing_manager">Marketing Manager (Campaigns & Analytics)</option>
              <option value="pos_operator">POS Operator (Scanning & Checkout)</option>
              <option value="analyst">Data Analyst (Read & Reports)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Authenticate Session</span>
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Encrypted with SHA-256</span>
          <span>Session TTL: 8 Hours</span>
        </div>
      </div>
    </div>
  );
};
