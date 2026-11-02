# 🦅 Nevermore Murders: Event Platform

> **Official Event Platform for the Nevermore Academy Murder-Mystery Tournament**  
> *Version 1.0 · Owner: Ink in Quills · "Crescendo in Tenebris"*

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind_css)
![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57?style=for-the-badge&logo=sqlite)
![Neon Postgres](https://img.shields.io/badge/Neon-Serverless%20Postgres-00E599?style=for-the-badge&logo=postgresql)

---

## 📖 Overview

**Nevermore Murders** is a web-based, real-time murder-mystery event engine designed for collegiate and live interactive tournaments. Teams of 3–5 players join using secret Academy codes, bind their sessions to an authorized mobile device, solve 4 immersive mini-games across scored rounds, and compete on a live dashboard leading up to a dramatic stage reveal.

### Core Tournament Goals
- **100% Autonomous Round Execution**: Teams progress without manual resets; round timers and grading are authoritative on the server.
- **Zero Spreadsheet Dependencies**: Volunteers handle device swaps, score disputes, and adjustments with an immutable audit trail directly from the Admin Vault.
- **Unified Audience & Stage Reveal**: The Host unmasks the culprits and crowns winners using the exact live scoring data shown on the scoreboard.

---

## 🏰 The 4 Mini-Game Investigations

Every mini-game is self-contained with its own state autosave, server-side timer, speed bonus calculator, and oracle hint system:

| Round | Mini-Game | Target Verdict | Max Points | Description |
|---|---|---|---|---|
| **Round 1** | **The Midnight Hour** *(Lore Crossword)* | **Time of Murders** (`03:15 AM`) | **100 pts** (+30 speed) | Interactive 2D playable crossword grid. Typing letters auto-advances cursor. Golden illuminated cells across 3-Down and 7-Across spell the Roman hour hands (`THREE FIFTEEN`). |
| **Round 2** | **The Encrypted Crypt** *(Cipher Decode)* | **Location** (`CRACKSTONE CRYPT`) | **100 pts** (+30 speed) | Caesar shift dial (0–25) decrypting scorched runic scrolls (`JYHJRFZVUL JYFWA`) supported by archived witness statements from Eugene, Enid, and Xavier. |
| **Round 3** | **Nightshade Syndicate** *(Deduction Grid)* | **Murderer & Motive** | **120 pts** (+30 speed) | Interactive logic elimination matrix ($\times$ / $\checkmark$) cross-referencing suspects, botanical poisons, and alibis. Awarding $+20\text{ pts}$ bonus for identifying the hidden motive (*Crackstone Resurrection*). |
| **Round 4** | **Poe Cryptic Riddle** *(Sudden Death)* | **Tiebreaker Answer** (`OPHELIA`) | **Tiebreak Only** | Ancient stone tablet displaying the Nevermore founders' riddle for sudden-death tie resolution. |

---

## 🏆 Scoring Rules (PRD Locked Formula)

$$\text{Maximum Possible Score} = 100 + 100 + 120 + (30 \times 3) + 30 = \mathbf{440\text{ Points}}$$

- **Speed Bonus (Per Round)**:
  - $< 5\text{ minutes}$: **$+30\text{ points}$**
  - $5\text{–}10\text{ minutes}$: **$+20\text{ points}$**
  - $10\text{–}15\text{ minutes}$: **$+10\text{ points}$**
  - $15+\text{ minutes}$: **$0\text{ points}$**
- **Oracle Hints**: Deducts **$-15\text{ points}$** per hint (capped at $-30\text{ points}$ max penalty per round).
- **Final Question**: Graded $0\text{–}30\text{ points}$ by Host/Judges.
- **Tie-Breaker Hierarchy**:
  1. Most correct answers $\rightarrow$ 2. Fewest hints used $\rightarrow$ 3. Lowest total elapsed time $\rightarrow$ 4. Sudden-death question.

---

## 🔐 Admin & Volunteer Security Gate

The Admin Command Desk (`/admin`) and Host Reveal (`/admin/reveal`) are locked behind an encrypted clearance vault. Unauthorized spectators or competing teams cannot access round controls, device unbinding, or secret answer keys.

### Default Clearance Passcodes
| Role | Character | Passcode | Capabilities |
|---|---|---|---|
| **Headmaster** | Principal Larissa Weems | `nevermore1891` | Full system control, round releases, device unbinding, score overrides |
| **Host** | Edgar Allan Poe | `raven1845` | Final reveal stage beats, 0–30 question judging, scoreboard reveal |
| **Volunteer Desk** | Thing | `claws123` | Device resets, score adjustment logging, integrity flag review |

> **Environment Override**: Set `ADMIN_SECRET_PASSCODE="your-secure-passcode"` in `.env.local` to override the master headmaster password.

---

## 🛡️ Session Integrity & Anti-Cheat System

- **Single Device per Team**: Joining binds the team's unique code to the device hardware fingerprint. Rejoining from a second device is blocked server-side and instructs the team to report to the Volunteer Desk.
- **Device Swaps with Audit Trail**: Volunteers can unbind devices from the Admin Panel, but **must provide a mandatory reason** (e.g., *"Phone battery died"*), logged with an immutable timestamp.
- **Tab-Switch & Blur Detection**: `visibilitychange`, `blur`, `copy`, and inspector attempts are captured and silently logged as integrity flags for volunteer review.
- **Single Submission Guarantee**: Teams confirm through a sealed dialog: *"You cannot change this answer."* Answers cannot be edited once submitted.

---

## 🎨 UI/UX Design System: "Gothic Dark Academia"

- **Palette**: Midnight Obsidian (`#0C0A14`), Crypt Purple (`#141121`), Candle Amber (`#F59E0B`), Blood Crimson (`#881337`), Parchment Bone (`#F4EDE2`).
- **Typography**: `Cinzel` (Gothic display headers), `Inter` (high-contrast 16px+ mobile readability), `JetBrains Mono` (cipher coordinates & timers).
- **The 6 Outcast Creature Sigils (3D Wax Seals)**:
  - 🦅 **Order of the Raven** (*Corvus Noctis*)
  - 🐺 **Lycan Brotherhood** (*Lupus Furor*)
  - 🌊 **Abyssal Sirens** (*Sirena Profunda*)
  - 🐍 **Gorgon Enclave** (*Gorgona Lapidea*)
  - 👹 **The Hyde Coven** (*Monstrum Occultum*)
  - 🦇 **Nightshade Vampires** (*Sanguis Antiquus*)
- **Synthesized Audio** (`src/lib/sound.ts`): Web Audio API cues for correct harp chords, dissonant error gongs, oracle whisper bells, and heavy wax seal stamps (muteable via the header speaker icon).

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: `v20+` or `v26+`
- **npm** or **pnpm**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/imagine1phoenix/LC---Hallow.git
cd LC---Hallow

# Install dependencies
npm install
```

### 3. Initialize & Seed Database
```bash
# Initialize schema, indexes, and computed view
npm run db:init

# Seed default rounds, admins, and sample teams
npm run db:seed

# Run the 25-point automated verification suite
npm run db:test
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Management & CLI Commands

| Command | Action |
|---|---|
| `npm run db:init` | Initializes or migrates all SQLite tables, indexes, and `team_scores_view`. |
| `npm run db:seed` | Populates default rounds, admins, and 6 creature teams. |
| `npm run db:test` | Runs the 25-point automated test suite (unique constraints, device locks, scoring math). |
| `npm run db:neon` | Connects to Neon Serverless Postgres and runs schema migrations + cloud seeding. |
| `npm run db:reset` | Resets live tournament submissions & sessions (keeps registered teams intact). |
| `npm run db:reset -- --hard` | Full wipe of all tables and data. |
| `npm run clean` | Deletes stale `.next` cache files. |

---

## ⚡ Neon Serverless Postgres Setup

The platform includes full support for **Neon Serverless Postgres** via `@neondatabase/serverless`.

Credentials are configured in `.env.local`:
```env
# Pooled connection via PgBouncer (for edge/serverless queries)
DATABASE_URL="postgresql://neondb_owner:npg_PDFlMY3msfe7@ep-morning-salad-aktmxu6r-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require"

# Direct connection (for DDL migrations)
DIRECT_URL="postgresql://neondb_owner:npg_PDFlMY3msfe7@ep-morning-salad-aktmxu6r.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require"

NEON_PROJECT_ID="icy-glade-70012067"
NEON_ORG_ID="org-aged-king-36912517"
```

To sync your Neon cloud database:
```bash
npm run db:neon
```

---

## ⚠️ Git Caution: GitHub 100MB File Limit

Never commit `node_modules/` or `.next/` to Git. The `@next/swc-darwin-arm64` binary is **124 MB** and will cause GitHub to reject `git push`. Ensure `.gitignore` includes:
```gitignore
/node_modules
/.next/
data/nevermore.db*
.env*.local
```

---

## 📂 Project Structure

```text
├── data/                      # Local SQLite database (WAL mode)
│   └── nevermore.db
├── scripts/
│   ├── init-db.mjs            # Schema, view, and index initializer
│   ├── seed-db.mjs            # Default rounds, admins, and lore teams
│   ├── test-db.mjs            # 25-point verification suite
│   ├── reset-db.mjs           # Tournament wipe & reset script
│   └── neon-migrate.mjs       # Cloud Neon Postgres migration
├── src/
│   ├── app/
│   │   ├── page.tsx           # Team Onboarding & Device Binding
│   │   ├── play/page.tsx      # Main Mini-Game Arena & Timer
│   │   ├── scoreboard/page.tsx# Public & Team Standings (Admin Toggled)
│   │   ├── admin/page.tsx     # Volunteer Desk & Dispute Center
│   │   ├── admin/reveal/page.tsx # Host 4-Stage Final Unmasking
│   │   └── api/               # Server-authoritative API routes
│   ├── components/
│   │   ├── AdminAuthGate.tsx  # Headmaster Vault Security Barrier
│   │   ├── Crest.tsx          # Nevermore Academy Crest SVG
│   │   ├── WaxSeal.tsx        # 3D Embossed Creature Sigil
│   │   ├── RoundTimer.tsx     # Authoritative Server Countdown
│   │   ├── AntiCheatGuard.tsx # Tab Switch & Blur Integrity Monitor
│   │   ├── HintModal.tsx      # Point Deduction Warning Dialog
│   │   ├── SubmissionDialog.tsx # Irrevocable Submission Gate
│   │   ├── SoundToggle.tsx    # Audio Mute/Unmute Controller
│   │   └── games/
│   │       ├── CrosswordGame.tsx     # Round 1: 2D Playable Crossword
│   │       ├── CipherGame.tsx        # Round 2: Interactive Caesar Dial
│   │       ├── DeductionGridGame.tsx # Round 3: Suspect Matrix & Motive
│   │       └── TiebreakerGame.tsx    # Round 4: Sudden Death Riddle
│   └── lib/
│       ├── db.ts              # SQLite singleton with WAL & pragmas
│       ├── neon.ts            # Neon Postgres serverless client
│       ├── scoring.ts         # Section 7 scoring engine & tiebreakers
│       ├── sound.ts           # Web Audio API gothic synthesizer
│       ├── sigils.ts          # The 6 Outcast Orders & lore metadata
│       └── types.ts           # TypeScript interfaces
```

---

## 📜 License
Built for the **Nevermore Academy Murder-Mystery Tournament**. All lore, symbols, and sigils adapted for campus event staging.

