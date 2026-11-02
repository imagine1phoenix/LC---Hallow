'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SIGIL_LIST, CREATURE_SIGILS } from '@/lib/sigils';
import { SigilId } from '@/lib/types';
import WaxSeal from '@/components/WaxSeal';
import Crest from '@/components/Crest';
import {
  KeyRound,
  Users,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Clock,
  Skull,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();

  const [joinCode, setJoinCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedSigil, setSelectedSigil] = useState<SigilId>('raven');
  const [fingerprint, setFingerprint] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeSigil = CREATURE_SIGILS[selectedSigil] || CREATURE_SIGILS.raven;

  // Generate or retrieve device fingerprint
  useEffect(() => {
    let fp = localStorage.getItem('nevermore_device_fp');
    if (!fp) {
      fp =
        'fp-' +
        Math.random().toString(36).slice(2, 10) +
        '-' +
        window.screen.width +
        'x' +
        window.screen.height;
      localStorage.setItem('nevermore_device_fp', fp);
    }
    setFingerprint(fp);

    // Check if already authenticated
    fetch('/api/team/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.push('/play');
        }
      })
      .catch(() => { });
  }, [router]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setErrorMsg('Please enter your Nevermore Academy team join code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/team/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          joinCode: joinCode.trim(),
          name: teamName.trim() || undefined,
          sigil: selectedSigil,
          deviceFingerprint: fingerprint,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Failed to bind device.');
        setLoading(false);
        return;
      }

      router.push('/play');
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error connecting to Nevermore Academy gatekeeper.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 lg:py-12 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Event Presentation & Lore */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left animate-fadeInUp">
          <div className="flex justify-center lg:justify-start">
            <div className="animate-float">
              <Crest size="md" showSubtitle={false} />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-nevermore-candle uppercase block">
              Ink in Quills Presents
            </span>
            <h1 className="font-gothic text-3xl sm:text-5xl font-black text-nevermore-parchment tracking-wide leading-tight">
              THE NEVERMORE MURDERS
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-nevermore-muted leading-relaxed max-w-md mx-auto lg:mx-0">
            Darkness has fallen across Ophelia Hall. A murder has shaken the Academy.
            Your investigation begins here.
          </p>

          <div className="pt-1 flex justify-center lg:justify-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono text-xs shadow-candle">
              <Clock className="w-3.5 h-3.5 text-nevermore-candle animate-pulse" />
              <span className="tracking-widest font-semibold uppercase text-[11px]">
                The Game Is Afoot
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Enter The Academy Card */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleJoin}
            className="parchment-card p-6 sm:p-8 rounded-3xl border border-nevermore-border/80 shadow-candle space-y-5 animate-fadeInUp"
            style={{ animationDelay: '150ms', animationFillMode: 'both' }}
          >
            {/* Form Header */}
            <div className="space-y-1 pb-3 border-b border-nevermore-border/60">
              <h2 className="font-gothic text-xl sm:text-2xl font-bold text-nevermore-parchment tracking-wider uppercase">
                Enter The Academy
              </h2>
              <p className="text-xs text-nevermore-muted">
                Your identity is your only key.
              </p>
            </div>

            {/* Error Callout */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-rose-100 uppercase tracking-wide">
                    Access Restricted
                  </p>
                  <p className="leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Academy Join Code */}
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] font-bold text-nevermore-parchment uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-nevermore-candle" />
                  <span>Academy Join Code</span>
                </span>
                <span className="text-[10px] text-nevermore-muted font-normal">
                  Single device binding
                </span>
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. RAVEN-772"
                required
                className="w-full py-3.5 px-4 rounded-xl bg-black/60 border border-nevermore-border focus:border-nevermore-candle text-nevermore-parchment font-mono tracking-widest text-base sm:text-lg uppercase outline-none focus:ring-2 focus:ring-nevermore-candle/30 transition-all duration-300"
              />
            </div>

            {/* Team Name */}
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] font-bold text-nevermore-parchment uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-nevermore-candle" />
                <span>Team Name</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. The Nightshade Society"
                className="w-full py-3 px-4 rounded-xl bg-black/50 border border-nevermore-border focus:border-nevermore-candle text-nevermore-parchment text-sm outline-none focus:ring-2 focus:ring-nevermore-candle/20 transition-all duration-300"
              />
            </div>

            {/* Choose Your Sigil */}
            <div className="space-y-2.5">
              <label className="font-mono text-[11px] font-bold text-nevermore-parchment uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-nevermore-candle" />
                  <span>Choose Your Sigil</span>
                </span>
                <span className="text-[10px] text-nevermore-muted font-normal">
                  6 Outcast Orders
                </span>
              </label>

              <div className="grid grid-cols-6 gap-2 pt-1 stagger-children">
                {SIGIL_LIST.map((sigil) => (
                  <WaxSeal
                    key={sigil.id}
                    sigilId={sigil.id}
                    size="md"
                    selected={selectedSigil === sigil.id}
                    onClick={() => setSelectedSigil(sigil.id)}
                    showName={false}
                  />
                ))}
              </div>

              {/* Selected Creature Identity Dossier & Powers */}
              {activeSigil && (
                <div
                  key={activeSigil.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 animate-fadeInUp ${activeSigil.badgeBg} flex items-start gap-3 shadow-candle mt-2`}
                >
                  <div className="shrink-0 mt-0.5">
                    <WaxSeal sigilId={activeSigil.id} size="sm" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-gothic text-xs font-bold text-nevermore-parchment">
                        {activeSigil.name}
                      </span>
                      <span className="text-[10px] font-mono italic opacity-75">
                        ({activeSigil.latinName})
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-amber-300 flex items-center gap-1 font-semibold">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>Powers</span>
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-nevermore-bone/95">
                      {activeSigil.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-nevermore-candle to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-[0.98] text-black font-gothic text-sm font-bold tracking-wider shadow-candle transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-black/40 border-t-transparent animate-spin" />
                  <span>Binding Device to Academy Archives...</span>
                </span>
              ) : (
                <>
                  <span>ENTER THE ACADEMY</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-nevermore-muted text-center italic">
              Session restriction: Once bound, device cannot be transferred without Volunteer Admin authorization.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
