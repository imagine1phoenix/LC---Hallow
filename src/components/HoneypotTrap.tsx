'use client';

import { useEffect } from 'react';

export default function HoneypotTrap() {
  useEffect(() => {
    // Only execute on browser client
    if (typeof window === 'undefined') return;

    // Check if honeypot has already run in this session to prevent spam
    if ((window as unknown as { __NEVERMORE_HONEYPOT_LOADED__?: boolean }).__NEVERMORE_HONEYPOT_LOADED__) {
      return;
    }
    (window as unknown as { __NEVERMORE_HONEYPOT_LOADED__?: boolean }).__NEVERMORE_HONEYPOT_LOADED__ = true;

    // 1. Stylized ASCII Banner and convincing DevTools leak
    const banner = `%c
 ███╗   ██╗███████╗██╗   ██╗███████╗██████╗ ███╗   ███╗ ██████╗ ██████╗ ███████╗
 ████╗  ██║██╔════╝██║   ██║██╔════╝██╔══██╗████╗ ████║██╔═══██╗██╔══██╗██╔════╝
 ██╔██╗ ██║█████╗  ██║   ██║█████╗  ██████╔╝██╔████╔██║██║   ██║██████╔╝█████╗  
 ██║╚██╗██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║╚██╔╝██║██║   ██║██╔══██╗██╔══╝  
 ██║ ╚████║███████╗ ╚████╔╝ ███████╗██║  ██║██║ ╚═╝ ██║╚██████╔╝██║  ██║███████╗
 ╚═╝  ╚═══╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
`;

    // Print stylized leak to console
    try {
      console.log(banner, 'color: #d97706; font-family: monospace; font-size: 9px; font-weight: bold;');
      console.log(
        '%c[NEVERMORE_SYSTEM_DIAGNOSTIC]%c Developer console hook attached. Loading cached round state...',
        'color: #f59e0b; font-weight: bold; background: #261605; padding: 2px 6px; border-radius: 4px;',
        'color: #a3a3a3;'
      );

      // Decoy verification table
      const decoyPayload = [
        {
          Round: 'Round 1 (Crossword)',
          Target_Metric: 'Murder Timestamp',
          Decrypted_Key: '11:45 PM',
          Checksum: '0x7FA910',
          Verified: true,
        },
        {
          Round: 'Round 2 (Cipher)',
          Target_Metric: 'Murder Location',
          Decrypted_Key: 'NIGHTSHADE GREENHOUSE',
          Checksum: '0x99BC12',
          Verified: true,
        },
        {
          Round: 'Round 3 (Deduction)',
          Target_Metric: 'True Culprit',
          Decrypted_Key: 'Dr. Valerie Kinbott',
          Checksum: '0x44D12A',
          Verified: true,
        },
        {
          Round: 'Round 3 (Bonus)',
          Target_Metric: 'Concealed Motive',
          Decrypted_Key: 'Extortion over stolen student grades',
          Checksum: '0x88EF31',
          Verified: true,
        },
        {
          Round: 'Tiebreaker',
          Target_Metric: 'Sudden-Death Inscription',
          Decrypted_Key: 'JOSEPH CRACKSTONE EFFIGY',
          Checksum: '0x12FA00',
          Verified: true,
        },
        {
          Round: 'Headmaster Vault',
          Target_Metric: 'Master Override Token',
          Decrypted_Key: 'corvus_noctis_666',
          Checksum: '0xDEADBEEF',
          Verified: true,
        },
      ];

      console.table(decoyPayload);

      console.warn(
        '%c[WARN] Verification table exposed in memory cache. Do not share window.__NEVERMORE_INTERNAL__ keys with students.',
        'color: #f87171; font-style: italic;'
      );
    } catch {
      // Ignore if environment overrides console
    }

    // 2. Global Window Decoy Object for console probers
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__NEVERMORE_INTERNAL__ = Object.freeze({
        environment: 'staging-sandbox',
        debug_token: '0x7f83b1657ff1',
        active_verification: {
          round1_timestamp: '11:45 PM',
          round2_location: 'NIGHTSHADE GREENHOUSE',
          round3_suspect: 'Dr. Valerie Kinbott',
          round3_motive: 'Extortion over stolen student grades',
          tiebreaker_passphrase: 'JOSEPH CRACKSTONE EFFIGY',
          headmaster_override_passcode: 'corvus_noctis_666',
        },
        status: 'READY_FOR_EVALUATION',
      });
    } catch {
      // Ignore
    }
  }, []);

  return (
    // Hidden DOM element for Elements / DOM inspector probers
    <div
      id="__nevermore_verification_tokens__"
      style={{ display: 'none' }}
      aria-hidden="true"
      data-r1-time="11:45 PM"
      data-r2-loc="NIGHTSHADE GREENHOUSE"
      data-r3-who="Dr. Valerie Kinbott"
      data-r3-why="Extortion over stolen student grades"
      data-tiebreak="JOSEPH CRACKSTONE EFFIGY"
      data-headmaster-key="corvus_noctis_666"
    />
  );
}

