# Spend Guardian

Spend without worry. Save without trying.

A UPI/QR-spending companion that categorizes every expense with AI, shows a
live "safe to spend" number, nudges you before you overspend, and writes an
honest month-end recap — with a full audit trail of every AI decision it
made, and a privacy layer that keeps merchant/account data away from the AI.

Built for the Razorpay Buildathon 2026 — Open Track.

## Stack

- **Next.js 14** (App Router) — frontend + API routes in one project
- **Supabase** (Postgres) — budgets, transactions, savings, AI decision logs
- **Claude (Anthropic API)** — categorization, budget-pacing reasoning, month-end summary
- Rule-based fallback logic for every AI call (see `lib/ai.ts`) — if Claude
  fails or returns bad output, the app never breaks

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project (free tier is fine)
2. Once created, go to **SQL Editor → New Query**, paste the contents of
   `supabase/schema.sql`, and run it
3. Go to **Project Settings → API** and copy the **Project URL** and
   **anon public key**

### 3. Get an Anthropic API key

Go to [console.anthropic.com](https://console.anthropic.com) → API Keys →
Create Key.

### 4. Set environment variables

Copy `.env.example` to `.env.local` and fill in the three values:

```bash
cp .env.example .env.local
```

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

1. **Set a monthly budget** — one number to start
2. **Log a payment** (stand-in for a real UPI/QR scan) — merchant + amount
3. The amount and a **sanitized** version of the transaction (see
   `sanitizeForAI()` in `lib/ai.ts`) go to Claude for categorization —
   the raw merchant name and any payment identifiers never leave your
   database
4. Claude also evaluates whether this transaction puts you off pace for
   the month; if so, you get a nudge with a plain-English reason
5. The **safe-to-spend ring** updates live after every transaction
6. At month end (or any time, for demo purposes), generate an AI-written
   recap of how the month went

Every AI decision — categorization, nudges, and the recap — is written to
the `ai_logs` table in Supabase with the exact sanitized input Claude saw,
its output, and whether a fallback rule fired instead. That table **is**
the audit trail; query it directly during your demo/interview to show
judges the reasoning behind every flagged transaction.

## What's simulated vs. real (be upfront about this in your pitch)

- **Payments are simulated** via a simple form, not a live UPI/QR scan —
  this was a deliberate scope decision to focus build time on the AI
  reasoning and UX rather than payment infra in a few days. The next real
  step would be wiring this to Razorpay's test-mode QR Code / Orders API
  and a webhook instead of the manual form.
- **Single demo user, no auth** — every row uses `user_id = 'demo_user'`.
  Swapping in Supabase Auth later is a schema-compatible change (the
  `user_id` column is already there).

## Project structure

```
app/
  page.tsx                 — main dashboard (budget, ring, form, nudges, audit)
  layout.tsx                — fonts + root layout
  globals.css                — design tokens (palette, type, components)
  components/SpendRing.tsx   — the signature "safe to spend" gauge
  api/budget/route.ts        — get/set monthly budget
  api/expense/route.ts       — log expense -> AI categorize -> AI flag -> audit log
  api/summary/route.ts       — month-end AI recap
lib/
  supabase.ts                 — Supabase client
  ai.ts                       — sanitizeForAI() + all three Claude calls + fallbacks
supabase/
  schema.sql                  — run this in Supabase SQL Editor
```

## Known non-issue

`npm audit` flags Next.js 14.x under a broad advisory range that covers most
of the framework's history and is mostly about production/self-hosted
deployment edge cases (SSRF, cache poisoning, etc. in specific configs).
For a local demo this doesn't matter; if you deploy this beyond the
buildathon, upgrade to the latest Next.js patch before going live.

## Stretch ideas (not built — mentioned here for the interview round)

- Real Razorpay test-mode QR/payment integration with a webhook
- Pre-payment interstitial that gates the transaction, not just flags it after
- Goal-linked dynamic daily safe-to-spend pacing
- Weekly check-in nudges, not just month-end
- Encryption at rest, data retention limits, "delete my data" action
