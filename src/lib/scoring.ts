import { Round, Submission, ScoreAdjustment, FinalAnswer, TeamScoreSummary, Team, DeviceSession, IntegrityFlag } from './types';

export const HINT_PENALTY_PER_HINT = 15;
export const MAX_HINT_PENALTY = 30; // cap at 2 hints penalty

/**
 * Calculate speed bonus based on elapsed time from round release
 * Under 5 min (< 300s) -> 30
 * 5–10 min (300-599s)   -> 20
 * 10–15 min (600-899s)  -> 10
 * 15+ min (>= 900s)     -> 0
 */
export function calculateSpeedBonus(elapsedSeconds: number, isCorrect: boolean): number {
  if (!isCorrect || elapsedSeconds < 0) return 0;
  if (elapsedSeconds < 300) return 30;
  if (elapsedSeconds < 600) return 20;
  if (elapsedSeconds < 900) return 10;
  return 0;
}

/**
 * Calculate round points after hint penalty
 * Wrong answer = 0 pts (no speed bonus, no motive bonus)
 */
export function calculateRoundPoints(
  roundNumber: number,
  isCorrect: boolean,
  hintsUsed: number,
  isMotiveCorrect: boolean = false
): number {
  if (!isCorrect) return 0;

  let basePoints = 100;
  if (roundNumber === 3 && isMotiveCorrect) {
    basePoints += 20; // Motive bonus (+20)
  }

  const penalty = Math.min(hintsUsed * HINT_PENALTY_PER_HINT, MAX_HINT_PENALTY);
  return Math.max(0, basePoints - penalty);
}

/**
 * Compute full scores and ranking for a list of teams
 */
export function computeLeaderboard(
  teams: Team[],
  rounds: Round[],
  submissions: Submission[],
  adjustments: ScoreAdjustment[],
  finalAnswers: FinalAnswer[],
  flags: IntegrityFlag[],
  activeSessions: DeviceSession[]
): TeamScoreSummary[] {
  const roundMap = new Map(rounds.map((r) => [r.id, r]));

  const summaries: TeamScoreSummary[] = teams.map((team) => {
    const teamSubmissions = submissions.filter((s) => s.team_id === team.id);
    const teamAdjustments = adjustments.filter((a) => a.team_id === team.id);
    const teamFinal = finalAnswers.find((f) => f.team_id === team.id);
    const teamFlags = flags.filter((f) => f.team_id === team.id);
    const session = activeSessions.find((s) => s.team_id === team.id && !s.revoked_at) || null;

    let totalPoints = 0;
    let totalHints = 0;
    let totalTime = 0;
    let correctCount = 0;

    const roundScores = rounds.map((round) => {
      const sub = teamSubmissions.find((s) => s.round_id === round.id);
      if (!sub) {
        return {
          round_id: round.id,
          round_number: round.number,
          points: 0,
          speed_bonus: 0,
          hints_used: 0,
          time_taken_seconds: null,
          is_correct: false,
          submitted_at: null,
        };
      }

      let timeTaken: number | null = null;
      if (round.released_at && sub.submitted_at) {
        const released = new Date(round.released_at).getTime();
        const submitted = new Date(sub.submitted_at).getTime();
        timeTaken = Math.max(0, Math.floor((submitted - released) / 1000));
      }

      const isCorrect = sub.is_correct === 1;
      const roundPts = sub.points;
      const speedPts = sub.speed_bonus;

      totalPoints += roundPts + speedPts;
      totalHints += sub.hints_used;
      if (timeTaken !== null) totalTime += timeTaken;
      if (isCorrect) correctCount += 1;

      return {
        round_id: round.id,
        round_number: round.number,
        points: roundPts,
        speed_bonus: speedPts,
        hints_used: sub.hints_used,
        time_taken_seconds: timeTaken,
        is_correct: isCorrect,
        submitted_at: sub.submitted_at,
      };
    });

    const finalQuestionScore = teamFinal?.judge_score ?? 0;
    const manualAdjustments = teamAdjustments.reduce((sum, adj) => sum + adj.delta, 0);

    const totalScore = totalPoints + finalQuestionScore + manualAdjustments;

    return {
      team,
      activeSession: session,
      roundScores,
      finalQuestionScore,
      manualAdjustments,
      totalScore,
      flagCount: teamFlags.length,
      totalHintsUsed: totalHints,
      totalTimeSeconds: totalTime,
      correctAnswerCount: correctCount,
    };
  });

  // Apply tie-breaker ranking:
  // 1) Total Score (descending)
  // 2) Most correct answers (descending)
  // 3) Fewest hints used (ascending)
  // 4) Lowest total time (ascending)
  // 5) Final question score (descending)
  summaries.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.correctAnswerCount !== a.correctAnswerCount) return b.correctAnswerCount - a.correctAnswerCount;
    if (a.totalHintsUsed !== b.totalHintsUsed) return a.totalHintsUsed - b.totalHintsUsed;
    if (a.totalTimeSeconds !== b.totalTimeSeconds) return a.totalTimeSeconds - b.totalTimeSeconds;
    return b.finalQuestionScore - a.finalQuestionScore;
  });

  // Assign ranks with ties
  let currentRank = 1;
  for (let i = 0; i < summaries.length; i++) {
    if (i > 0) {
      const prev = summaries[i - 1];
      const curr = summaries[i];
      const isTie =
        curr.totalScore === prev.totalScore &&
        curr.correctAnswerCount === prev.correctAnswerCount &&
        curr.totalHintsUsed === prev.totalHintsUsed &&
        curr.totalTimeSeconds === prev.totalTimeSeconds &&
        curr.finalQuestionScore === prev.finalQuestionScore;

      if (!isTie) {
        currentRank = i + 1;
      }
    }
    summaries[i].rank = currentRank;
  }

  return summaries;
}

