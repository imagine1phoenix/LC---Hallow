'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, EyeOff } from 'lucide-react';

interface AntiCheatGuardProps {
  teamId?: string;
  active?: boolean;
}

export default function AntiCheatGuard({ teamId, active = true }: AntiCheatGuardProps) {
  const [warningVisible, setWarningVisible] = useState(false);
  const [flagNotice, setFlagNotice] = useState<string | null>(null);
  const lastReportedTime = useRef<number>(0);

  const reportFlag = async (eventType: string) => {
    const now = Date.now();
    // Debounce to at most once every 3 seconds to prevent network flood
    if (now - lastReportedTime.current < 3000) return;
    lastReportedTime.current = now;

    try {
      await fetch('/api/team/integrity-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType }),
      });
    } catch (err) {
      console.warn('Flag log sync warning:', err);
    }
  };

  useEffect(() => {
    if (!active) return;

    // 1. Tab visibility change detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportFlag('tab_switch');
        setFlagNotice('Tab Switch Detected · Logged to Headmaster Audit');
        setWarningVisible(true);
      }
    };

    // 2. Window blur detection
    const handleBlur = () => {
      reportFlag('blur');
      setFlagNotice('Window Unfocused · Logged to Headmaster Audit');
      setWarningVisible(true);
    };

    // 3. Right-click context menu prevention
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      reportFlag('context_menu');
      setFlagNotice('Inspector Restricted by Academy Rules');
      setWarningVisible(true);
      return false;
    };

    // 4. Copy attempt prevention
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportFlag('copy_attempt');
      setFlagNotice('Parchment is Sealed — Text Copying Prohibited');
      setWarningVisible(true);
      return false;
    };

    // 5. DevTools key combinations detection
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c'))
      ) {
        e.preventDefault();
        reportFlag('inspect_attempt');
        setFlagNotice('Academy Wards Prevent Inspection');
        setWarningVisible(true);
        return false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  // Auto-hide warning after 4 seconds
  useEffect(() => {
    if (warningVisible) {
      const timer = setTimeout(() => {
        setWarningVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [warningVisible]);

  if (!warningVisible || !flagNotice) return null;

  return (
    <aside aria-label="Integrity Alert" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce">
      <div className="bg-rose-950/95 border border-rose-500/70 text-rose-200 px-4 py-2.5 rounded-lg shadow-crimson flex items-center gap-3 backdrop-blur-md">
        <AlertTriangle className="w-5 h-5 text-nevermore-candle shrink-0 animate-pulse" />
        <div className="flex-1 text-xs font-medium">
          <p className="font-semibold text-rose-100">{flagNotice}</p>
          <p className="text-[10px] text-rose-300/80">Admins review all integrity events before final scoring.</p>
        </div>
        <button
          onClick={() => setWarningVisible(false)}
          className="text-rose-400 hover:text-rose-100 text-xs px-1.5 py-0.5 rounded"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}

