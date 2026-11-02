'use client';

import React, { useState, useEffect } from 'react';
import WaxSeal from '@/components/WaxSeal';
import { Trophy, ShieldAlert, Sparkles, RefreshCw, EyeOff, Award, Clock } from 'lucide-react';

export default function ScoreboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchScoreboard = async () => {
    try {
      const res = await fetch('/api/scoreboard');
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      console.error('Scoreboard load error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoreboard();
    const interval = setInterval(fetchScoreboard, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-nevermore-candle border-t-transparent animate-spin" />
        <p className="font-gothic text-xs text-nevermore-muted tracking-wider">
          Summoning Academy Standings...
        </p>
      </div>
    );
  }

  // Hidden State (Admin Controlled)
  if (!data?.visible) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6 animate-fadeInUp">
        <div className="w-20 h-20 rounded-full mx-auto bg-black/60 border border-nevermore-border flex items-center justify-center text-nevermore-muted shadow-parchment animate-float">
          <EyeOff className="w-10 h-10 text-nevermore-candle animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="font-gothic text-2xl sm:text-3xl font-extrabold text-nevermore-parchment">
            Scoreboard Sealed in Darkness
          </h2>
          <p className="text-xs sm:text-sm text-nevermore-muted max-w-md mx-auto leading-relaxed">
            The Headmaster has veiled the leaderboard during active investigation. Ranks and scores will be unveiled between rounds.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={fetchScoreboard}
            className="py-2.5 px-5 rounded-xl bg-nevermore-surface hover:bg-nevermore-card border border-nevermore-border text-nevermore-candle text-xs font-semibold inline-flex items-center gap-2 transition hover:scale-105 active:scale-95 shadow-candle"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Visibility</span>
          </button>
        </div>
      </div>
    );
  }

  const leaderboard = data.leaderboard || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-nevermore-border/60">
        <div>
          <h1 className="font-gothic text-2xl sm:text-3xl font-extrabold text-nevermore-parchment flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-nevermore-gold" />
            <span>Nevermore Standings</span>
          </h1>
          <p className="text-xs text-nevermore-muted font-mono mt-1">
            Official Academy Murder-Mystery Leaderboard
          </p>
        </div>

        <button
          onClick={fetchScoreboard}
          className="text-xs px-3.5 py-2 rounded-xl bg-nevermore-surface hover:bg-nevermore-card border border-nevermore-border text-nevermore-candle flex items-center gap-1.5 transition active:scale-95 shadow-candle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top 3 Podium Cards */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Rank 2 */}
          <div className="order-2 sm:order-1 parchment-card p-5 rounded-2xl border border-stone-600/40 text-center space-y-2 animate-fadeInUp" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
              Rank II · Silver
            </span>
            <div className="flex justify-center">
              <WaxSeal sigilId={leaderboard[1].sigil} size="md" />
            </div>
            <h3 className="font-gothic text-base font-bold text-nevermore-parchment truncate">
              {leaderboard[1].teamName}
            </h3>
            <p className="font-mono text-xl font-bold text-nevermore-candle">
              {leaderboard[1].totalScore} pts
            </p>
          </div>

          {/* Rank 1 (Crown) */}
          <div className="order-1 sm:order-2 parchment-card p-6 rounded-2xl border-2 border-nevermore-candle shadow-candle text-center space-y-2 relative sm:-translate-y-3 animate-fadeInScale animate-shimmer">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-nevermore-candle text-black text-[10px] font-bold uppercase tracking-wider font-mono shadow-candle">
              ★ Leading The Investigation ★
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
              Rank I · Gold
            </span>
            <div className="flex justify-center">
              <WaxSeal sigilId={leaderboard[0].sigil} size="lg" />
            </div>
            <h3 className="font-gothic text-lg font-bold text-nevermore-parchment truncate">
              {leaderboard[0].teamName}
            </h3>
            <p className="font-mono text-2xl font-black text-amber-400">
              {leaderboard[0].totalScore} pts
            </p>
          </div>

          {/* Rank 3 */}
          <div className="order-3 parchment-card p-5 rounded-2xl border border-amber-900/40 text-center space-y-2 animate-fadeInUp" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700">
              Rank III · Bronze
            </span>
            <div className="flex justify-center">
              <WaxSeal sigilId={leaderboard[2].sigil} size="md" />
            </div>
            <h3 className="font-gothic text-base font-bold text-nevermore-parchment truncate">
              {leaderboard[2].teamName}
            </h3>
            <p className="font-mono text-xl font-bold text-nevermore-candle">
              {leaderboard[2].totalScore} pts
            </p>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="parchment-card rounded-2xl border border-nevermore-border overflow-hidden animate-fadeInUp" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-nevermore-border/60 bg-black/40 text-nevermore-muted font-mono uppercase tracking-wider text-[11px]">
                <th className="p-3 text-center w-14">Rank</th>
                <th className="p-3">Team & Sigil</th>
                <th className="p-3 text-center">R1 (Time)</th>
                <th className="p-3 text-center">R2 (Loc)</th>
                <th className="p-3 text-center">R3 (Who)</th>
                <th className="p-3 text-center">Judged</th>
                <th className="p-3 text-right pr-4">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nevermore-border/30">
              {leaderboard.map((item: any) => {
                const r1 = item.roundScores?.find((r: any) => r.round_number === 1);
                const r2 = item.roundScores?.find((r: any) => r.round_number === 2);
                const r3 = item.roundScores?.find((r: any) => r.round_number === 3);

                return (
                  <tr key={item.teamId} className="hover:bg-nevermore-surface/50 transition">
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono font-bold text-xs ${
                        item.rank === 1 ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40 shadow-candle' :
                        item.rank === 2 ? 'bg-stone-500/20 text-stone-300 ring-1 ring-stone-400/40' :
                        item.rank === 3 ? 'bg-amber-900/30 text-amber-500 ring-1 ring-amber-700/40' :
                        'text-nevermore-muted bg-black/40'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <WaxSeal sigilId={item.sigil} size="sm" />
                        <div>
                          <p className="font-bold text-nevermore-parchment text-sm">{item.teamName}</p>
                          <span className="text-[10px] text-nevermore-muted font-mono">
                            {item.hintsUsed} hints · {item.totalTimeSeconds}s elapsed
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono">
                      {r1?.points !== undefined ? (
                        <span className={r1.points > 0 ? 'text-amber-300 font-bold' : 'text-stone-500'}>
                          {r1.points + r1.speed_bonus}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-center font-mono">
                      {r2?.points !== undefined ? (
                        <span className={r2.points > 0 ? 'text-amber-300 font-bold' : 'text-stone-500'}>
                          {r2.points + r2.speed_bonus}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-center font-mono">
                      {r3?.points !== undefined ? (
                        <span className={r3.points > 0 ? 'text-amber-300 font-bold' : 'text-stone-500'}>
                          {r3.points + r3.speed_bonus}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-center font-mono text-nevermore-muted">
                      {item.finalScore ? `+${item.finalScore}` : '0'}
                    </td>
                    <td className="p-3 text-right pr-4 font-mono font-bold text-base text-nevermore-candle">
                      {item.totalScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

