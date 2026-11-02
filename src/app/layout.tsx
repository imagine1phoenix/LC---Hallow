import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Crest from '@/components/Crest';
import SoundToggle from '@/components/SoundToggle';
import HoneypotTrap from '@/components/HoneypotTrap';
import EntranceLoader from '@/components/EntranceLoader';
import { Trophy, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nevermore Murders · Official Event Platform',
  description: 'The Nevermore Academy Murder-Mystery Event Platform. Solve the mystery, seal your verdict, claim the cup.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col justify-between selection:bg-rose-900 selection:text-white">
        <EntranceLoader />
        <HoneypotTrap />
        {/* Top Atmospheric Header */}
        <header className="border-b border-nevermore-border/70 bg-nevermore-bg/90 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="hover:opacity-90 transition group flex items-center">
              <Crest size="sm" showSubtitle={true} />
            </Link>

            <nav className="flex items-center gap-3 sm:gap-4">
              <SoundToggle />
              <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs uppercase tracking-wider font-semibold">
                <Link
                  href="/scoreboard"
                  className="text-nevermore-muted hover:text-nevermore-gold transition flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5 text-nevermore-gold" />
                  <span>Scoreboard</span>
                </Link>
                <span className="text-nevermore-border">·</span>
                <Link
                  href="/admin"
                  className="text-nevermore-muted hover:text-nevermore-gold transition flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-nevermore-muted" />
                  <span>Admin</span>
                </Link>
              </div>
            </nav>
          </div>
          {/* Subtle gothic gradient line */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-nevermore-candle/30 to-transparent" />
        </header>

        {/* Main Content Arena */}
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8 animate-fadeIn">
          {children}
        </main>

        {/* Atmospheric Footer */}
        <footer className="border-t border-nevermore-border/50 bg-black/60 py-4 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-nevermore-muted">
            <div className="flex items-center gap-2">
              <span className="text-nevermore-candle/60">⚜</span>
              <span>Nevermore Academy · &ldquo;Crescendo in Tenebris&rdquo;</span>
              <span className="text-nevermore-candle/60">⚜</span>
            </div>
            <span className="font-mono text-[10px] text-nevermore-muted/70">
              Version 1.0 · Ink in Quills
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
