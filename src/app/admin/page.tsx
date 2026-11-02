'use client';

import React, { useState, useEffect } from 'react';
import WaxSeal from '@/components/WaxSeal';
import AdminAuthGate from '@/components/AdminAuthGate';
import {
  ShieldAlert,
  Play,
  Lock,
  Unlock,
  PlusCircle,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  History,
  KeyRound,
  Users,
  Plus,
  Edit3,
} from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<
    'rounds' | 'teams' | 'submissions' | 'scores' | 'judging' | 'flags' | 'keys' | 'audit'
  >('rounds');

  // Judging state
  const [judgingScores, setJudgingScores] = useState<Record<string, number>>({});

  // Device unbind modal state
  const [unbindModal, setUnbindModal] = useState<{ teamId: string; teamName: string } | null>(null);
  const [unbindReason, setUnbindReason] = useState('');

  // Score adjustment modal state
  const [scoreModal, setScoreModal] = useState<{ teamId: string; teamName: string } | null>(null);
  const [scoreDelta, setScoreDelta] = useState<number>(10);
  const [scoreReason, setScoreReason] = useState('');
  const [scoreRoundId, setScoreRoundId] = useState<string>('round-1');

  // New Team Modal state
  const [newTeamModal, setNewTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamSigil, setNewTeamSigil] = useState('raven');

  // Action status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: string, payload: Record<string, any>) => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setStatusMsg(resJson.message || 'Action executed successfully.');
        fetchAdminData();
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        alert(resJson.error || 'Action failed.');
      }
    } catch (err) {
      alert('Network error executing admin action.');
    }
  };

  const handleUnbindConfirm = async () => {
    if (!unbindModal || !unbindReason.trim()) {
      alert('A valid reason is required under Academy rules.');
      return;
    }
    await handleAction('UNBIND_DEVICE', {
      teamId: unbindModal.teamId,
      reason: unbindReason.trim(),
    });
    setUnbindModal(null);
    setUnbindReason('');
  };

  const handleScoreConfirm = async () => {
    if (!scoreModal || !scoreReason.trim()) {
      alert('A mandatory reason is required to adjust scores.');
      return;
    }
    await handleAction('ADJUST_SCORE', {
      teamId: scoreModal.teamId,
      roundId: scoreRoundId,
      delta: scoreDelta,
      reason: scoreReason.trim(),
    });
    setScoreModal(null);
    setScoreReason('');
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    await handleAction('CREATE_TEAM', {
      name: newTeamName.trim(),
      sigil: newTeamSigil,
    });
    setNewTeamModal(false);
    setNewTeamName('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-nevermore-candle border-t-transparent animate-spin" />
        <p className="font-gothic text-xs text-nevermore-muted tracking-wider">
          Accessing Headmaster Admin Archives...
        </p>
      </div>
    );
  }

  const rounds = data?.rounds || [];
  const teams = data?.teams || [];
  const leaderboard = data?.leaderboard || [];
  const auditLogs = data?.auditLogs || [];
  const answerKeys = data?.answerKeys || [];
  const isScoreboardVisible = data?.settings?.scoreboard_visible === '1';

  return (
    <AdminAuthGate>
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Admin Command Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-nevermore-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-gothic text-2xl sm:text-3xl font-extrabold text-nevermore-parchment">
              Admin & Volunteer Desk
            </h1>
          </div>
          <p className="text-xs text-nevermore-muted font-mono mt-0.5">
            Round Orchestration · Device Bindings · Score Adjustments · Integrity Review
          </p>
        </div>

        {/* Global Scoreboard Reveal Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleAction('TOGGLE_SCOREBOARD', { visible: !isScoreboardVisible })}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
              isScoreboardVisible
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-candle'
                : 'bg-black/60 text-stone-400 border-nevermore-border hover:text-white'
            }`}
          >
            {isScoreboardVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>Scoreboard: {isScoreboardVisible ? 'Public' : 'Hidden'}</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="p-2 rounded-xl bg-nevermore-surface hover:bg-nevermore-card border border-nevermore-border text-nevermore-candle"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <span>✓</span>
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 border-b border-nevermore-border/40 text-xs font-semibold -mx-1 px-1">
        {[
          { id: 'rounds', label: 'Round Control' },
          { id: 'teams', label: 'Teams & Devices' },
          { id: 'submissions', label: 'Submissions & Disputes' },
          { id: 'scores', label: 'Score Adjuster' },
          { id: 'judging', label: 'Host Judging (0–30)' },
          { id: 'flags', label: 'Integrity Flags' },
          { id: 'keys', label: 'Answer Keys' },
          { id: 'audit', label: 'Audit Trail' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-nevermore-surface text-nevermore-candle border border-nevermore-candle/40 shadow-candle'
                : 'text-nevermore-muted hover:text-nevermore-parchment hover:bg-nevermore-surface/50 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Round Control */}
      {activeTab === 'rounds' && (
        <div className="space-y-4">
          <h3 className="font-gothic text-base font-bold text-nevermore-parchment">
            Round Flow Orchestration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rounds.map((r: any) => {
              const isReleased = !!r.released_at;
              const isLocked = !!r.locked_at;

              return (
                <div
                  key={r.id}
                  className="parchment-card p-5 rounded-2xl border border-nevermore-border space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-nevermore-candle uppercase tracking-wider block">
                        Round {r.number}
                      </span>
                      <h4 className="font-gothic text-base font-bold text-nevermore-parchment">
                        {r.name}
                      </h4>
                      <p className="text-xs text-nevermore-muted mt-0.5">
                        Target Output: <span className="font-mono text-amber-200">{r.target_output}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      {isLocked ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-600/40 font-mono font-bold">
                          LOCKED
                        </span>
                      ) : isReleased ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 font-mono font-bold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 text-stone-400 border border-nevermore-border font-mono">
                          SEALED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-nevermore-border/40">
                    {!isReleased ? (
                      <button
                        onClick={() => handleAction('RELEASE_ROUND', { roundId: r.id })}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Release to Teams</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction('LOCK_ROUND', { roundId: r.id })}
                          disabled={isLocked}
                          className="flex-1 py-2 px-3 rounded-lg bg-rose-800 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Lock Submissions</span>
                        </button>
                        <button
                          onClick={() => handleAction('RELEASE_ROUND', { roundId: r.id })}
                          className="py-2 px-3 rounded-lg bg-nevermore-surface hover:bg-nevermore-card border border-nevermore-border text-nevermore-candle text-xs font-medium"
                        >
                          Reset Timer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Teams & Device Lock */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-gothic text-base font-bold text-nevermore-parchment">
              Registered Teams & Active Sessions
            </h3>
            <button
              onClick={() => setNewTeamModal(true)}
              className="py-1.5 px-3 rounded-lg bg-nevermore-candle text-black text-xs font-bold flex items-center gap-1.5 shadow-candle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Team</span>
            </button>
          </div>

          <div className="parchment-card rounded-2xl border border-nevermore-border overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-nevermore-border/60 bg-black/40 text-nevermore-muted font-mono uppercase tracking-wider text-[11px]">
                  <th className="p-3">Team</th>
                  <th className="p-3">Join Code</th>
                  <th className="p-3">Device Binding</th>
                  <th className="p-3 text-center">Flags</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nevermore-border/30">
                {leaderboard.map((item: any) => {
                  const isBound = !!item.activeSession;
                  return (
                    <tr key={item.team.id} className="hover:bg-nevermore-surface/40">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <WaxSeal sigilId={item.team.sigil} size="sm" />
                          <span className="font-bold text-nevermore-parchment">{item.team.name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-nevermore-candle font-semibold">
                        {item.team.join_code}
                      </td>
                      <td className="p-3">
                        {isBound ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 font-mono">
                              Bound: {item.activeSession.device_fingerprint.slice(0, 14)}...
                            </span>
                            <p className="text-[10px] text-nevermore-muted">
                              Since {new Date(item.activeSession.bound_at).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-black/50 text-stone-400 border border-stone-700/50">
                            Unbound (Ready to Join)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded ${
                            item.flagCount > 0
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40'
                              : 'text-stone-500'
                          }`}
                        >
                          {item.flagCount} flags
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {isBound && (
                          <button
                            onClick={() =>
                              setUnbindModal({ teamId: item.team.id, teamName: item.team.name })
                            }
                            className="py-1 px-2.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-600/40 text-[11px] font-semibold"
                          >
                            Unbind Device
                          </button>
                        )}
                        <button
                          onClick={() => handleAction('REGENERATE_CODE', { teamId: item.team.id })}
                          className="py-1 px-2.5 rounded-lg bg-nevermore-surface hover:bg-nevermore-card border border-nevermore-border text-nevermore-muted hover:text-white text-[11px]"
                        >
                          New Code
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Submissions & Disputes */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-gothic text-base font-bold text-nevermore-parchment">
                Live Submissions & Dispute Resolution
              </h3>
              <p className="text-xs text-nevermore-muted font-mono mt-0.5">
                Inspect raw answers, timestamps, and hint deductions to resolve team challenges.
              </p>
            </div>
          </div>

          <div className="parchment-card rounded-2xl border border-nevermore-border overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-nevermore-border/60 bg-black/40 text-nevermore-muted font-mono uppercase tracking-wider text-[11px]">
                  <th className="p-3">Team</th>
                  <th className="p-3">Round</th>
                  <th className="p-3">Verdict Answer</th>
                  <th className="p-3 text-center">Result</th>
                  <th className="p-3 text-center">Points</th>
                  <th className="p-3">Submitted At</th>
                  <th className="p-3 text-right">Dispute Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nevermore-border/30">
                {(data?.submissions || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-nevermore-muted italic">
                      No submissions have been sealed by teams yet.
                    </td>
                  </tr>
                ) : (
                  (data?.submissions || []).map((sub: any) => {
                    const team = teams.find((t: any) => t.id === sub.team_id);
                    const round = rounds.find((r: any) => r.id === sub.round_id);
                    const isCorrect = sub.is_correct === 1;

                    return (
                      <tr key={sub.id} className="hover:bg-nevermore-surface/40">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {team && <WaxSeal sigilId={team.sigil} size="sm" />}
                            <span className="font-bold text-nevermore-parchment">
                              {team?.name || sub.team_id}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-nevermore-candle font-semibold">
                          Round {round?.number || '?'}: {round?.name || sub.round_id}
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-xs font-bold text-nevermore-parchment block">
                            {sub.answer}
                          </span>
                          {sub.motive && (
                            <span className="text-[10px] text-amber-300 block font-mono">
                              Motive: {sub.motive} {sub.is_motive_correct === 1 ? '✓ (+20p)' : '✗'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isCorrect ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px]">
                              CORRECT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-mono font-bold text-[10px]">
                              INCORRECT
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono">
                          <span className="font-bold text-nevermore-parchment">{sub.points}p</span>
                          {sub.speed_bonus > 0 && (
                            <span className="text-emerald-400 text-[10px] block">
                              +{sub.speed_bonus}p speed
                            </span>
                          )}
                          {sub.hints_used > 0 && (
                            <span className="text-rose-400 text-[10px] block">
                              −{sub.hints_used * 15}p hints
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-nevermore-muted font-mono text-[11px]">
                          {new Date(sub.submitted_at).toLocaleTimeString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setScoreModal({ teamId: sub.team_id, teamName: team?.name || sub.team_id });
                              setScoreRoundId(sub.round_id);
                            }}
                            className="py-1 px-2.5 rounded-lg bg-nevermore-surface hover:bg-nevermore-card border border-amber-500/40 text-nevermore-candle hover:text-amber-300 text-[11px] font-semibold transition"
                          >
                            Adjust Points
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Score Adjuster */}
      {activeTab === 'scores' && (
        <div className="space-y-4">
          <h3 className="font-gothic text-base font-bold text-nevermore-parchment">
            Add / Cut Points with Mandatory Audit Log
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {leaderboard.map((item: any) => (
              <div
                key={item.team.id}
                className="parchment-card p-4 rounded-xl border border-nevermore-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WaxSeal sigilId={item.team.sigil} size="sm" />
                    <div>
                      <h4 className="font-bold text-sm text-nevermore-parchment truncate">
                        {item.team.name}
                      </h4>
                      <p className="font-mono text-xs text-nevermore-candle">
                        Current: {item.totalScore} pts
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setScoreModal({ teamId: item.team.id, teamName: item.team.name })
                  }
                  className="w-full py-2 px-3 rounded-lg bg-nevermore-surface hover:bg-nevermore-card border border-amber-500/30 text-nevermore-candle text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Adjust Points (+ / −)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Host Final Judging (0-30 pts) */}
      {activeTab === 'judging' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-gothic text-base font-bold text-nevermore-parchment">
              Host Final Question Judging (0–30 Points)
            </h3>
            <p className="text-xs text-nevermore-muted font-mono mt-0.5">
              Score each team’s final creative argument or sudden-death solution as mandated by Section 7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaderboard.map((item: any) => {
              const currentJudgeScore = item.finalQuestionScore || 0;
              const inputVal = judgingScores[item.team.id] !== undefined ? judgingScores[item.team.id] : currentJudgeScore;

              return (
                <div
                  key={item.team.id}
                  className="parchment-card p-5 rounded-2xl border border-nevermore-border space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <WaxSeal sigilId={item.team.sigil} size="sm" />
                      <div>
                        <h4 className="font-bold text-sm text-nevermore-parchment">
                          {item.team.name}
                        </h4>
                        <span className="text-[10px] text-nevermore-muted font-mono">
                          Total: {item.totalScore}p · Current Judged: {currentJudgeScore}/30p
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-nevermore-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-nevermore-candle font-semibold">
                        Host Score (0 – 30 pts):
                      </label>
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        {inputVal} pts
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={inputVal}
                      onChange={(e) =>
                        setJudgingScores({
                          ...judgingScores,
                          [item.team.id]: Number(e.target.value),
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />

                    <button
                      onClick={() =>
                        handleAction('JUDGE_FINAL_QUESTION', {
                          teamId: item.team.id,
                          score: inputVal,
                          notes: 'Awarded by Event Host on stage',
                        })
                      }
                      className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold transition shadow-candle"
                    >
                      Save Judge Score ({inputVal} pts)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Integrity Review */}
      {activeTab === 'flags' && (
        <div className="space-y-4">
          <h3 className="font-gothic text-base font-bold text-nevermore-parchment">
            Integrity Monitoring (Tab-switches, Blurs & Inspector Detection)
          </h3>

          <div className="parchment-card rounded-2xl border border-nevermore-border overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-nevermore-border/60 bg-black/40 text-nevermore-muted font-mono uppercase tracking-wider text-[11px]">
                  <th className="p-3">Team</th>
                  <th className="p-3">Flag Type</th>
                  <th className="p-3">Occurred At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nevermore-border/30">
                {(data?.flags || []).map((f: any) => (
                  <tr key={f.id} className="hover:bg-nevermore-surface/40">
                    <td className="p-3 font-semibold text-nevermore-parchment font-mono">
                      {teams.find((t: any) => t.id === f.team_id)?.name || f.team_id}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-600/40 font-mono text-[11px]">
                        {f.event_type}
                      </span>
                    </td>
                    <td className="p-3 text-nevermore-muted font-mono">
                      {new Date(f.occurred_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Answer Keys */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
            ⚠ Confidential Headmaster Dossier: Never share this screen with competing teams.
          </div>

          <div className="space-y-3">
            {answerKeys.map((k: any) => (
              <div
                key={k.roundId}
                className="parchment-card p-5 rounded-2xl border border-nevermore-border space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-nevermore-candle font-bold">
                    Round {k.roundNumber}: {k.title}
                  </span>
                </div>
                <p className="text-nevermore-bone font-medium">{k.targetQuestion}</p>
                <div className="p-3 rounded-xl bg-black/60 border border-nevermore-border font-mono text-amber-300 space-y-1">
                  {k.roundNumber === 1 && <p>Correct Answer: 03:15 AM (or 3:15 AM / THREE FIFTEEN)</p>}
                  {k.roundNumber === 2 && <p>Correct Answer: CRACKSTONE CRYPT</p>}
                  {k.roundNumber === 3 && (
                    <>
                      <p>Murderer: PROFESSOR MARILYN THORNHILL (LAUREL GATES)</p>
                      <p>Motive: Ancestral Blood Vengeance (Crackstone Resurrection)</p>
                    </>
                  )}
                  {k.roundNumber === 4 && <p>Tiebreaker Riddle: OPHELIA / RAVEN</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h3 className="font-gothic text-base font-bold text-nevermore-parchment">
            Immutable Administrative Audit Trail
          </h3>

          <div className="parchment-card rounded-2xl border border-nevermore-border overflow-hidden">
            <div className="divide-y divide-nevermore-border/30">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-nevermore-candle font-bold mr-2">[{log.actor}]</span>
                    <span className="font-semibold text-nevermore-parchment mr-2">{log.action}:</span>
                    <span className="text-nevermore-bone">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-nevermore-muted font-mono whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unbind Device Modal */}
      {unbindModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="parchment-card w-full max-w-md p-6 rounded-2xl border border-rose-900/60 shadow-crimson space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-gothic text-base font-bold">
              <Unlock className="w-5 h-5 text-rose-400" />
              <span>Unbind Device for {unbindModal.teamName}</span>
            </div>

            <p className="text-nevermore-muted leading-relaxed">
              Section 4.4 Rule: Unbinding a device requires a mandatory reason. This event will be logged in the immutable audit trail.
            </p>

            <div className="space-y-1">
              <label className="text-nevermore-parchment font-semibold block">Reason for Unbind (Mandatory):</label>
              <textarea
                value={unbindReason}
                onChange={(e) => setUnbindReason(e.target.value)}
                placeholder="e.g. Battery depleted; swapped to teammate phone at Volunteer Desk"
                rows={3}
                className="w-full p-3 rounded-xl bg-black/60 border border-nevermore-border focus:border-rose-500 text-nevermore-parchment outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleUnbindConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold transition"
              >
                Confirm Device Reset
              </button>
              <button
                onClick={() => setUnbindModal(null)}
                className="py-2.5 px-4 rounded-xl bg-nevermore-surface text-nevermore-muted hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Score Modal */}
      {scoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="parchment-card w-full max-w-md p-6 rounded-2xl border border-nevermore-candle/50 shadow-candle space-y-4 text-xs">
            <div className="flex items-center gap-2 text-nevermore-candle font-gothic text-base font-bold">
              <Edit3 className="w-5 h-5" />
              <span>Adjust Score · {scoreModal.teamName}</span>
            </div>

            <div className="space-y-1">
              <label className="text-nevermore-parchment font-semibold block">Point Delta (+ or −):</label>
              <input
                type="number"
                value={scoreDelta}
                onChange={(e) => setScoreDelta(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-black/60 border border-nevermore-border font-mono text-center text-lg text-nevermore-candle outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-nevermore-parchment font-semibold block">Related Round:</label>
              <select
                value={scoreRoundId}
                onChange={(e) => setScoreRoundId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black/60 border border-nevermore-border text-nevermore-parchment outline-none"
              >
                <option value="round-1">Round 1 (Time of Murders)</option>
                <option value="round-2">Round 2 (Location)</option>
                <option value="round-3">Round 3 (Murderer & Motive)</option>
                <option value="final-judged">Final Question / Host Judged</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-nevermore-parchment font-semibold block">Mandatory Reason / Justification:</label>
              <textarea
                value={scoreReason}
                onChange={(e) => setScoreReason(e.target.value)}
                placeholder="e.g. Host granted creative bonus for Latin translation"
                rows={2}
                className="w-full p-3 rounded-xl bg-black/60 border border-nevermore-border text-nevermore-parchment outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleScoreConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold transition shadow-candle"
              >
                Save Adjustment
              </button>
              <button
                onClick={() => setScoreModal(null)}
                className="py-2.5 px-4 rounded-xl bg-nevermore-surface text-nevermore-muted hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {newTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="parchment-card w-full max-w-md p-6 rounded-2xl border border-nevermore-border space-y-4 text-xs">
            <h4 className="font-gothic text-base font-bold text-nevermore-parchment">
              Enroll New Team into Academy
            </h4>

            <div className="space-y-1">
              <label className="text-nevermore-parchment font-semibold block">Team Name:</label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Nightshade Inquisitors"
                className="w-full p-3 rounded-xl bg-black/60 border border-nevermore-border text-nevermore-parchment outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-nevermore-parchment font-semibold block">Sigil:</label>
              <select
                value={newTeamSigil}
                onChange={(e) => setNewTeamSigil(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black/60 border border-nevermore-border text-nevermore-parchment outline-none"
              >
                <option value="raven">Order of the Raven</option>
                <option value="werewolf">Lycan Brotherhood</option>
                <option value="siren">Abyssal Sirens</option>
                <option value="gorgon">Gorgon Enclave</option>
                <option value="hyde">The Hyde Coven</option>
                <option value="vampire">Nightshade Vampires</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleCreateTeam}
                className="flex-1 py-2.5 px-4 rounded-xl bg-nevermore-candle text-black font-bold transition shadow-candle"
              >
                Create & Generate Code
              </button>
              <button
                onClick={() => setNewTeamModal(false)}
                className="py-2.5 px-4 rounded-xl bg-nevermore-surface text-nevermore-muted hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminAuthGate>
  );
}

