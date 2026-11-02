'use client';

import React, { useState, useEffect } from 'react';
import Crest from '@/components/Crest';
import { Lock, ShieldAlert, KeyRound, CheckCircle2, LogOut, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { sound } from '@/lib/sound';

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; role: string } | null>(null);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
          setAdminUser(data.admin);
        } else {
          setAuthenticated(false);
        }
      })
      .catch(() => {
        setAuthenticated(false);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sound.play('correct');
        setAuthenticated(true);
        setAdminUser(data.admin);
        setPasscode('');
      } else {
        sound.play('incorrect');
        setErrorMsg(data.message || 'Access Denied: Invalid clearance passcode.');
      }
    } catch {
      sound.play('incorrect');
      setErrorMsg('Failed to communicate with Academy Security Gate.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      sound.play('seal');
      setAuthenticated(false);
      setAdminUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Loading state
  if (authenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-nevermore-candle border-t-transparent animate-spin" />
        <p className="font-gothic text-xs text-nevermore-muted tracking-wider">
          Verifying Academy Clearance...
        </p>
      </div>
    );
  }

  // Unauthenticated: Show Vault Door Gate
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-8 animate-fadeInUp">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <div className="animate-crestEntrance">
              <Crest size="lg" showSubtitle={false} />
            </div>
          </div>
          <h1 className="font-gothic text-2xl sm:text-3xl font-extrabold text-nevermore-parchment tracking-wide animate-titleEntrance">
            Headmaster Vault
          </h1>
          <p className="text-xs text-nevermore-muted font-mono uppercase tracking-widest text-rose-400">
            Confidential · Authorized Personnel Only
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="parchment-card-elevated p-6 sm:p-8 rounded-3xl border-2 border-rose-900/60 shadow-crimson space-y-5"
        >
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-black/60 border border-nevermore-border/70 text-xs text-nevermore-bone leading-relaxed">
            <Lock className="w-5 h-5 text-nevermore-candle shrink-0" />
            <p className="text-[11px]">
              This terminal controls device bindings, round releases, manual score adjustments, and secret answer keys.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-500/70 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-gothic text-xs font-bold text-nevermore-parchment flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-nevermore-candle" />
                <span>Security Passcode</span>
              </span>
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Headmaster or Volunteer Passcode"
                required
                className="w-full py-3.5 pl-4 pr-10 rounded-xl bg-black/70 border border-nevermore-border focus:border-nevermore-candle text-nevermore-parchment font-mono text-sm tracking-wider outline-none focus:ring-2 focus:ring-nevermore-candle/30"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nevermore-muted hover:text-nevermore-parchment"
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-nevermore-candle to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-black font-gothic text-xs font-bold tracking-wider shadow-candle transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Unlocking Vault Door...</span>
            ) : (
              <>
                <span>Authenticate Clearance</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="pt-2 border-t border-nevermore-border/40 text-[10px] text-nevermore-muted text-center space-y-1 font-mono">
            <p className="text-nevermore-muted/70">
              Nevermore Academy Security Vault · Authorized Personnel Only
            </p>
            <p className="text-[9px] text-amber-500/60">
              Clearance codes are restricted. All login attempts are recorded in the immutable audit ledger.
            </p>
          </div>
        </form>
      </div>
    );
  }

  // Authenticated: Render children with admin security bar
  return (
    <div className="space-y-4">
      {/* Admin Security Banner */}
      <div className="p-2.5 px-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-nevermore-parchment">
            {adminUser?.name || 'Administrator'}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/60 text-amber-300 border border-amber-500/30">
            Role: {adminUser?.role}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-rose-300 hover:text-rose-100 flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Lock Desk</span>
        </button>
      </div>

      {children}
    </div>
  );
}

