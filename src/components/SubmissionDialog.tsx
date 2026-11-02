'use client';

import React from 'react';
import { ShieldAlert, Check } from 'lucide-react';

interface SubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answerSummary: string;
  motiveSummary?: string;
  isLoading?: boolean;
}

export default function SubmissionDialog({
  isOpen,
  onClose,
  onConfirm,
  answerSummary,
  motiveSummary,
  isLoading = false,
}: SubmissionDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md parchment-card p-6 rounded-2xl border border-rose-900/60 shadow-crimson space-y-5 animate-fadeInScale">
        {/* Seal Icon Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full wax-seal flex items-center justify-center text-white mb-2 shadow-crimson">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-gothic text-lg font-bold text-nevermore-parchment">
            Seal Final Verdict
          </h3>
          <p className="text-xs text-rose-300 font-semibold tracking-wide uppercase mt-0.5">
            Irreversible Submission
          </p>
        </div>

        {/* Answer Summary Card */}
        <div className="p-4 rounded-xl bg-nevermore-surface border border-nevermore-border/80 space-y-2 text-xs">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-nevermore-muted block">
              Primary Verdict:
            </span>
            <span className="font-mono text-sm font-bold text-nevermore-candle">
              {answerSummary || 'No answer entered'}
            </span>
          </div>

          {motiveSummary && (
            <div>
              <span className="text-[11px] uppercase tracking-wider text-nevermore-muted block">
                Motive Claim:
              </span>
              <span className="font-mono text-xs font-semibold text-nevermore-parchment">
                {motiveSummary}
              </span>
            </div>
          )}
        </div>

        {/* Strict PRD Quote Warning */}
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-center">
          <p className="text-xs text-rose-200 font-medium leading-relaxed">
            &ldquo;You cannot change this answer.&rdquo;
          </p>
          <p className="text-[10px] text-rose-300/80 mt-1">
            Nevermore rules permit only one submission per round. Once stamped with your wax seal, your verdict is final.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isLoading || !answerSummary.trim()}
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 active:scale-95 text-white font-gothic text-sm font-bold tracking-wider shadow-crimson transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Sealing with Wax...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Stamp & Submit</span>
              </>
            )}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-nevermore-surface hover:bg-nevermore-card border border-nevermore-border text-nevermore-muted hover:text-nevermore-parchment text-xs font-semibold"
          >
            Review Clues
          </button>
        </div>
      </div>
    </div>
  );
}

