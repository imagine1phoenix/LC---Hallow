'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Team, DeviceSession, Round, Submission } from '@/lib/types';
import WaxSeal from '@/components/WaxSeal';
import RoundTimer from '@/components/RoundTimer';
import AntiCheatGuard from '@/components/AntiCheatGuard';
import HintModal from '@/components/HintModal';
import SubmissionDialog from '@/components/SubmissionDialog';
import CrosswordGame from '@/components/games/CrosswordGame';
import CipherGame from '@/components/games/CipherGame';
import DeductionGridGame from '@/components/games/DeductionGridGame';
import TiebreakerGame from '@/components/games/TiebreakerGame';
import { sound } from '@/lib/sound';
import { HelpCircle, ShieldCheck, CheckCircle2, Lock, Save, AlertTriangle, ArrowRight } from 'lucide-react';

export default function PlayPage() {
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [session, setSession] = useState<DeviceSession | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [clientPuzzle, setClientPuzzle] = useState<any>(null);
  const [savedState, setSavedState] = useState<any>(null);

  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [currentMotive, setCurrentMotive] = useState<string>('');

  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [unlockedHints, setUnlockedHints] = useState<{ number: number; text: string }[]>([]);
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string>('Synced');
  const [submittedResult, setSubmittedResult] = useState<any>(null);

  // Fetch session data
  const loadSession = useCallback(async () => {
    try {
      const res = await fetch('/api/team/session');
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/');
        return;
      }

      setTeam(data.team);
      setSession(data.session);
      setRounds(data.rounds);
      setActiveRound(data.activeRound);
      setClientPuzzle(data.clientPuzzle);
      setSubmissions(data.submissions);
      setSavedState(data.savedState);

      // Check if already submitted for active round
      const existingSub = data.submissions.find((s: Submission) => s.round_id === data.activeRound?.id);
      if (existingSub) {
        setSubmittedResult({
          isCorrect: existingSub.is_correct === 1,
          points: existingSub.points,
          speedBonus: existingSub.speed_bonus,
          answer: existingSub.answer,
          motive: existingSub.motive,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadSession();
    // Poll session updates every 10 seconds to catch round releases/locks
    const interval = setInterval(loadSession, 10000);
    return () => clearInterval(interval);
  }, [loadSession]);

  // Handle autosave
  const handleAutosave = async (stateObj: Record<string, unknown>) => {
    if (!activeRound) return;
    setAutosaveStatus('Saving...');
    try {
      await fetch('/api/game/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: activeRound.id,
          state: stateObj,
        }),
      });
      setAutosaveStatus('Saved');
    } catch (err) {
      setAutosaveStatus('Offline');
    }
  };

  // Handle unlocking hint
  const handleUnlockHint = async (hintNum: number) => {
    if (!activeRound) return;
    try {
      const res = await fetch('/api/game/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: activeRound.id,
          hintNumber: hintNum,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.play('hint');
        setHintsUsed((prev) => prev + 1);
        setUnlockedHints((prev) => [...prev, { number: hintNum, text: data.hint.text }]);
      }
    } catch (err) {
      console.error('Hint unlock error:', err);
    }
  };

  // Handle final submission
  const handleConfirmSubmit = async () => {
    if (!activeRound) return;
    setSubmitting(true);
    sound.play('seal');
    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: activeRound.id,
          answer: currentAnswer,
          motive: currentMotive || undefined,
          hintsUsed,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.submission.isCorrect) {
          sound.play('correct');
        } else {
          sound.play('incorrect');
        }
        setSubmittedResult({
          isCorrect: data.submission.isCorrect,
          points: data.submission.points,
          speedBonus: data.submission.speedBonus,
          answer: currentAnswer,
          motive: currentMotive,
          feedback: data.submission.feedback,
        });
        setSubmissionDialogOpen(false);
      } else {
        alert(data.message || 'Submission error');
      }
    } catch (err) {
      alert('Network error submitting final verdict.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !team || !activeRound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-nevermore-candle border-t-transparent animate-spin" />
        <p className="font-gothic text-nevermore-candle text-sm tracking-wider">
          Entering Nevermore Sanctuary...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 puzzle-protected">
      {/* Background AntiCheat Monitor */}
      <AntiCheatGuard teamId={team.id} active={true} />

      {/* Top Game Bar */}
      <div className="p-4 sm:p-5 rounded-2xl parchment-card border border-nevermore-border shadow-candle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Team Identification */}
        <div className="flex items-center gap-3">
          <WaxSeal sigilId={team.sigil} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-gothic text-base sm:text-lg font-bold text-nevermore-parchment leading-tight">
                {team.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-nevermore-candle border border-nevermore-border">
                {team.join_code}
              </span>
            </div>
            <p className="text-xs text-nevermore-muted font-mono mt-0.5">
              Round {activeRound.number}: {activeRound.name}
            </p>
          </div>
        </div>

        {/* Server Round Timer & Speed Bonus */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
          <RoundTimer
            releasedAt={activeRound.released_at}
            lockedAt={activeRound.locked_at}
            timeLimitMinutes={activeRound.time_limit_minutes}
          />

          {/* Hint Trigger Button */}
          <button
            type="button"
            onClick={() => setHintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nevermore-surface hover:bg-nevermore-card border border-amber-500/30 text-nevermore-candle hover:text-amber-300 text-xs font-semibold shadow-candle transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Whispers ({hintsUsed})</span>
          </button>
        </div>
      </div>

      {/* Round Released Check */}
      {!activeRound.released_at ? (
        <div className="parchment-card p-12 rounded-3xl border border-nevermore-border text-center space-y-4">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-black/60 border border-nevermore-candle text-nevermore-candle shadow-candle">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="font-gothic text-xl font-bold text-nevermore-parchment">
            Round {activeRound.number} is Sealed
          </h3>
          <p className="text-xs text-nevermore-muted max-w-md mx-auto leading-relaxed">
            The Headmaster has not released this round yet. Keep your devices active and await the bell chimes.
          </p>
        </div>
      ) : submittedResult ? (
        /* Submission Already Sealed View */
        <div className="parchment-card p-8 rounded-3xl border border-nevermore-border text-center space-y-6">
          <div className="w-16 h-16 rounded-full mx-auto wax-seal flex items-center justify-center text-white shadow-crimson">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-gothic text-2xl font-bold text-nevermore-parchment">
              Verdict Sealed & Recorded
            </h3>
            <p className="text-xs text-nevermore-muted max-w-md mx-auto">
              Your submission for Round {activeRound.number} has been archived in the Academy vaults.
            </p>
          </div>

          {/* Points Breakdown Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-nevermore-surface border border-nevermore-border">
            <div className="text-left">
              <span className="text-[10px] text-nevermore-muted uppercase tracking-wider block">Round Points</span>
              <span className="font-mono text-xl font-bold text-nevermore-candle">
                {submittedResult.points} pts
              </span>
            </div>
            <div className="w-px h-8 bg-nevermore-border" />
            <div className="text-left">
              <span className="text-[10px] text-nevermore-muted uppercase tracking-wider block">Speed Bonus</span>
              <span className="font-mono text-xl font-bold text-emerald-400">
                +{submittedResult.speedBonus} pts
              </span>
            </div>
          </div>

          <p className="text-xs text-nevermore-bone italic">
            &ldquo;{submittedResult.feedback || 'The shadows have absorbed your verdict.'}&rdquo;
          </p>

          <div className="pt-2">
            <button
              onClick={() => router.push('/scoreboard')}
              className="py-2.5 px-6 rounded-xl bg-nevermore-surface hover:bg-nevermore-card border border-nevermore-border text-nevermore-candle text-xs font-bold inline-flex items-center gap-2 transition"
            >
              <span>View Scoreboard Standings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Active Mini-Game View */
        <div className="space-y-6">
          {/* Active Mini-Game Selector */}
          {activeRound.number === 1 && (
            <CrosswordGame
              onStateChange={handleAutosave}
              savedState={savedState}
              onAnswerChange={setCurrentAnswer}
              currentAnswer={currentAnswer}
            />
          )}

          {activeRound.number === 2 && (
            <CipherGame
              onStateChange={handleAutosave}
              savedState={savedState}
              onAnswerChange={setCurrentAnswer}
              currentAnswer={currentAnswer}
            />
          )}

          {activeRound.number === 3 && (
            <DeductionGridGame
              onStateChange={handleAutosave}
              savedState={savedState}
              onAnswerChange={setCurrentAnswer}
              currentAnswer={currentAnswer}
              onMotiveChange={setCurrentMotive}
              currentMotive={currentMotive}
            />
          )}

          {activeRound.number === 4 && (
            <TiebreakerGame
              onStateChange={handleAutosave}
              savedState={savedState}
              onAnswerChange={setCurrentAnswer}
              currentAnswer={currentAnswer}
            />
          )}

          {/* Submission Bar */}
          <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-nevermore-darkest/95 border border-nevermore-border shadow-crimson backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-nevermore-muted">
              <Save className="w-3.5 h-3.5 text-nevermore-candle" />
              <span>Autosave: {autosaveStatus}</span>
            </div>

            <button
              type="button"
              disabled={!currentAnswer.trim() || activeRound.locked_at !== null}
              onClick={() => setSubmissionDialogOpen(true)}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 hover:from-rose-600 hover:to-rose-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-gothic text-xs font-bold tracking-widest shadow-crimson transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Seal Final Verdict</span>
            </button>
          </div>
        </div>
      )}

      {/* Hint Confirmation Modal */}
      <HintModal
        isOpen={hintModalOpen}
        onClose={() => setHintModalOpen(false)}
        hintsUsed={hintsUsed}
        unlockedHints={unlockedHints}
        onConfirmUnlock={handleUnlockHint}
      />

      {/* Submission Confirmation Dialog */}
      <SubmissionDialog
        isOpen={submissionDialogOpen}
        onClose={() => setSubmissionDialogOpen(false)}
        onConfirm={handleConfirmSubmit}
        answerSummary={currentAnswer}
        motiveSummary={currentMotive}
        isLoading={submitting}
      />
    </div>
  );
}

