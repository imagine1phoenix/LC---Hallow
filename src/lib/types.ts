export type SigilId = 'raven' | 'werewolf' | 'siren' | 'gorgon' | 'hyde' | 'vampire';

export interface CreatureSigil {
  id: SigilId;
  name: string;
  latinName: string;
  description: string;
  powers?: string;
  color: string;
  badgeBg: string;
  iconName: string;
}

export interface Team {
  id: string;
  name: string;
  sigil: SigilId;
  join_code: string;
  created_at: string;
}

export interface DeviceSession {
  id: string;
  team_id: string;
  device_fingerprint: string;
  bound_at: string;
  revoked_at: string | null;
  revoked_by: string | null;
  reason: string | null;
}

export interface Round {
  id: string;
  number: number;
  name: string;
  variant_seed: string;
  target_output: 'time' | 'location' | 'murderer' | 'tiebreaker';
  time_limit_minutes: number;
  released_at: string | null;
  locked_at: string | null;
}

export interface Submission {
  id: string;
  team_id: string;
  round_id: string;
  answer: string;
  motive?: string | null; // For Round 3 motive bonus
  submitted_at: string;
  hints_used: number;
  is_correct: number; // 1 or 0
  is_motive_correct?: number; // 1 or 0
  points: number;
  speed_bonus: number;
}

export interface ScoreAdjustment {
  id: string;
  team_id: string;
  round_id: string | null;
  delta: number;
  reason: string;
  admin_id: string;
  created_at: string;
}

export interface IntegrityFlag {
  id: string;
  team_id: string;
  event_type: 'tab_switch' | 'blur' | 'context_menu' | 'copy_attempt' | 'device_conflict' | 'inspect_attempt';
  occurred_at: string;
}

export interface FinalAnswer {
  id: string;
  team_id: string;
  text: string;
  judge_score: number | null; // 0 - 30 judged
  judged_at: string | null;
  judged_by: string | null;
}

export interface Admin {
  id: string;
  name: string;
  role: 'headmaster' | 'volunteer' | 'host';
  passcode: string;
}

export interface GameState {
  team_id: string;
  round_id: string;
  state_json: string;
  updated_at: string;
}

export interface TeamScoreSummary {
  team: Team;
  activeSession: DeviceSession | null;
  roundScores: {
    round_id: string;
    round_number: number;
    points: number;
    speed_bonus: number;
    hints_used: number;
    time_taken_seconds: number | null;
    is_correct: boolean;
    submitted_at: string | null;
  }[];
  finalQuestionScore: number;
  manualAdjustments: number;
  totalScore: number;
  flagCount: number;
  totalHintsUsed: number;
  totalTimeSeconds: number;
  correctAnswerCount: number;
  rank?: number;
}

