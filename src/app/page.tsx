'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SIGIL_LIST } from '@/lib/sigils';
import { SigilId } from '@/lib/types';
import WaxSeal from '@/components/WaxSeal';
import Crest from '@/components/Crest';
import { KeyRound, Users, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();

  const [joinCode, setJoinCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedSigil, setSelectedSigil] = useState<SigilId>('raven');
  const [fingerprint, setFingerprint] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate or retrieve device fingerprint
  useEffect(() => {
    let fp = localStorage.getItem('nevermore_device_fp');
    if (!fp) {
      fp = 'fp-' + Math.random().toString(36).slice(2, 10) + '-' + window.screen.width + 'x' + window.screen.height;
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
      .catch(() => {});
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
    <div className="max-w-xl mx-auto space-y-8 py-4 sm:py-8">
      {/* Intro Hero */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-2">
          <Crest size="lg" showSubtitle={false} />
        </div>
        <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold text-nevermore-parchment tracking-wide">
          The Nevermore Murders
        </h1>
        <p className="text-xs sm:text-sm text-nevermore-muted max-w-md mx-auto leading-relaxed">
          Darkness falls across Ophelia Hall. Enter your secret academy code, bind your device, and claim your creature sigil.
        </p>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleJoin}
        className="parchment-card p-6 sm:p-8 rounded-3xl border border-nevermore-border/80 shadow-candle space-y-6"
      >
        {/* Error Callout */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-3 animate-fadeIn">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-100 uppercase tracking-wide">Access Restricted</p>
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Join Code Input */}
        <div className="space-y-2">
          <label className="font-gothic text-xs font-bold text-nevermore-parchment flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-nevermore-candle" />
              <span>Academy Join Code</span>
            </span>
            <span className="text-[10px] text-nevermore-muted font-mono">Single device per code</span>
          </label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. RAVEN-772"
            required
            className="w-full py-3.5 px-4 rounded-xl bg-black/60 border border-nevermore-border focus:border-nevermore-candle text-nevermore-parchment font-mono tracking-widest text-center text-lg uppercase outline-none focus:ring-2 focus:ring-nevermore-candle/30"
          />
          <div className="flex flex-wrap gap-2 text-[10px] text-nevermore-muted font-mono pt-1">
            <span>Sample codes:</span>
            <button
              type="button"
              onClick={() => {
                setJoinCode('RAVEN-772');
                setTeamName('The Black Dahlias');
                setSelectedSigil('raven');
              }}
              className="text-nevermore-candle hover:underline"
            >
              RAVEN-772
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setJoinCode('WOLF-409');
                setTeamName('Feral Claw Pack');
                setSelectedSigil('werewolf');
              }}
              className="text-nevermore-candle hover:underline"
            >
              WOLF-409
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setJoinCode('SIREN-813');
                setTeamName('Ophelia Wave Sirens');
                setSelectedSigil('siren');
              }}
              className="text-nevermore-candle hover:underline"
            >
              SIREN-813
            </button>
          </div>
        </div>

        {/* Team Name */}
        <div className="space-y-2">
          <label className="font-gothic text-xs font-bold text-nevermore-parchment flex items-center gap-1.5">
            <Users className="w-4 h-4 text-nevermore-candle" />
            <span>Team Name (Optional / Update)</span>
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. The Nightshade Society"
            className="w-full py-3 px-4 rounded-xl bg-black/50 border border-nevermore-border focus:border-nevermore-candle text-nevermore-parchment text-sm outline-none focus:ring-2 focus:ring-nevermore-candle/20"
          />
        </div>

        {/* Creature Sigil Picker */}
        <div className="space-y-3">
          <label className="font-gothic text-xs font-bold text-nevermore-parchment flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-nevermore-candle" />
              <span>Choose Your Creature Sigil</span>
            </span>
            <span className="text-[10px] text-nevermore-muted font-mono">6 Outcast Orders</span>
          </label>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
            {SIGIL_LIST.map((sigil) => (
              <WaxSeal
                key={sigil.id}
                sigilId={sigil.id}
                size="md"
                selected={selectedSigil === sigil.id}
                onClick={() => setSelectedSigil(sigil.id)}
                showName={true}
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-nevermore-candle to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-[0.98] text-black font-gothic text-sm font-bold tracking-wider shadow-candle transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Binding Device to Academy Archives...</span>
          ) : (
            <>
              <span>Enter The Crypt & Begin</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[10px] text-nevermore-muted text-center italic">
          Session restriction: Once bound, you cannot transfer to another device without Volunteer Admin authorization.
        </p>
      </form>
    </div>
  );
}

