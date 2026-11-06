import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_USERS } from '../data/initialData';
import { UserRole } from '../types';

export const AuditSecurity: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, auditLogs, sessionToken, switchRole, setIsLoginModalOpen } = useAuth();
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== 'ALL' && log.action !== filterAction) return false;
    return true;
  });

  const permissionsMatrix: { role: UserRole; name: string; perms: string[] }[] = [
    {
      role: 'admin',
      name: 'System Administrator',
      perms: [
        'Full System Configuration',
        'User & Role Provisioning',
        'Security Audit Ledger Write',
        'Campaign Launch & Override',
        'POS Hardware Config',
        'Executive Report Authorization',
      ],
    },
    {
      role: 'marketing_manager',
      name: 'Marketing Director',
      perms: [
        'Campaign Creation & Editing',
        'Promotional Trigger Rules',
        'Product Barcode Tagging',
        'Customer Analytics Export',
        'Automated Digest Scheduling',
      ],
    },
    {
      role: 'pos_operator',
      name: 'POS Terminal Cashier',
      perms: [
        'Barcode Laser Scanning',
        'Basket Transaction Checkout',
        'Customer Loyalty Redemption',
        'Receipt Generation',
      ],
    },
    {
      role: 'analyst',
      name: 'Retail Intelligence Analyst',
      perms: [
        'View Telemetry Streams',
        'Generate Performance Reports',
        'Export CSV Scan Archives',
        'Basket Association Analysis',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            {t('securityTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('securitySubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsLoginModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>{t('switchCredentialBtn')}</span>
        </button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            {t('activeSecurityToken')}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 truncate">
              {sessionToken}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">
            SHA-256 Verified · 8-Hour TTL
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            {t('authenticatedRole')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-bold text-white">
              {currentUser ? currentUser.name : 'Guest'}
            </span>
            <span className="text-xs text-amber-300 font-mono uppercase font-semibold">
              [{currentUser ? currentUser.role : 'none'}]
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {currentUser?.storeAssignment || 'Global Scope'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            {t('encryptionLevel')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-bold text-white">
              AES-256 + TLS 1.3
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            End-to-end POS barcode transaction protection
          </span>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="pb-3 border-b border-slate-800 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {t('rbacTitle')}
          </h2>
          <span className="text-[11px] text-slate-400">
            Multi-tier granular permissions enforced across Druk POS, marketing workflows, and database exports
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {permissionsMatrix.map((item) => {
            const isCurrent = currentUser?.role === item.role;
            return (
              <div
                key={item.role}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-slate-950 border-emerald-500/80 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">
                      {item.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Active
                      </span>
                    )}
                  </div>

                  <ul className="space-y-1.5 mt-3 text-[11px] text-slate-400">
                    {item.perms.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span className="leading-snug">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => switchRole(item.role)}
                  className={`mt-4 w-full py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isCurrent ? 'Current Session' : `Switch to ${item.name.split(' ')[0]}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('auditLedgerTitle')}
            </h2>
            <span className="text-[11px] text-slate-400">
              Append-only tamper-resistant trail of logins, campaign updates, and checkout transactions
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
            >
              <option value="ALL">All Event Types</option>
              <option value="LOGIN">User Logins</option>
              <option value="LOGOUT">User Logouts</option>
              <option value="ROLE_SWITCH">Role Switches</option>
              <option value="CAMPAIGN_UPDATE">Campaign Updates</option>
              <option value="POS_TRANSACTION">POS Transactions</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">User & Persona</th>
                <th className="py-2 px-3">Action Type</th>
                <th className="py-2 px-3">Event Details</th>
                <th className="py-2 px-3">IP Address</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-medium text-white whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">
                    {log.details}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {log.ipAddress}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-emerald-400 font-bold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
