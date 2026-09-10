import React, { useState } from 'react';
import { Lock, ShieldCheck, RefreshCw, AlertTriangle, Mail, KeyRound } from 'lucide-react';

export default function LoginGate({ roles, credentialsByRole, defaultRoleId, error, isLoggingIn, onLogin }) {
  const [selectedRoleId, setSelectedRoleId] = useState(defaultRoleId || roles[0]?.id);
  const credentials = credentialsByRole[selectedRoleId] || { email: '', password: '' };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    onLogin(selectedRoleId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-cyan-600/30">
            K2
          </div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">K2 WealthDesk</h1>
          <p className="text-xs text-slate-400">Sign in to continue</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Sign-in failed: {error}</span>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Role
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              disabled={isLoggingIn}
              className="w-full bg-slate-950 border border-slate-800 text-sm rounded-lg px-3 py-2 text-slate-200 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-60"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} — {role.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Email
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={credentials.email}
                readOnly
                className="flex-1 bg-transparent text-sm text-slate-300 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
              <KeyRound className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="password"
                value={credentials.password}
                readOnly
                className="flex-1 bg-transparent text-sm text-slate-300 font-mono focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            {isLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span>Demo credentials, pre-filled — signs in against the live K2 WealthDesk backend</span>
        </p>
      </form>
    </div>
  );
}
