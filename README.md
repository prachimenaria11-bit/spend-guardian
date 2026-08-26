\# Spend Guardian



Spend without worry. Save without trying.



A UPI/QR-spending companion that categorizes every expense with AI, shows a

live "safe to spend" number, nudges you before you overspend, and writes an

honest month-end recap — with a full audit trail of every AI decision it

made, and a privacy layer that keeps merchant/account data away from the AI.



Built for the Razorpay Buildathon 2026 — Open Track.



\## Stack



\- \*\*Next.js 14\*\* (App Router) — frontend + API routes in one project

\- \*\*Supabase\*\* (Postgres) — budgets, transactions, savings, AI decision logs

\- \*\*Google Gemini (2.5 Flash)\*\* — categorization, budget-pacing reasoning, month-end summary. Chosen for its genuine free tier (no credit card required) — a good fit for a student hackathon budget.

\- Rule-based fallback logic for every AI call (see `lib/ai.ts`) — if Gemini

&#x20; fails or returns bad output, the app never breaks



\## Setup



\### 1. Install dependencies



```bash

npm install

```



\### 2. Create a Supabase project



1\. Go to \[supabase.com](https://supabase.com) → New Project (free tier is fine)

2\. Once created, go to \*\*SQL Editor → New Query\*\*, paste the contents of

&#x20;  `supabase/schema.sql`, and run it

3\. Go to \*\*Project Settings → API Keys → Legacy anon, service\_role API keys\*\*

&#x20;  and copy the \*\*Project URL\*\* and \*\*anon public\*\* key

4\. Row Level Security is on by default on new tables. For this single-demo-user

&#x20;  build, disable it on the four tables so the app can read/write:

```sql

&#x20;  ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;

&#x20;  ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

&#x20;  ALTER TABLE ai\_logs DISABLE ROW LEVEL SECURITY;

&#x20;  ALTER TABLE savings DISABLE ROW LEVEL SECURITY;

```

&#x20;  (A production version with real auth would use proper RLS policies instead

&#x20;  of disabling it — this is a deliberate hackathon-scope simplification.)



\### 3. Get a Google Gemini API key



Go to \[aistudio.google.com](https://aistudio.google.com), sign in, click

"Get API key" → "Create API key". Free tier, no credit card required.



\### 4. Set environment variables



Copy `.env.example` to `.env.local` and fill in the three values:



```bash

cp .env.example .env.local

```



\### 5. Run it



```bash

npm run dev

```



Open \[http://localhost:3000](http://localhost:3000).



\## How it works



1\. \*\*Set a monthly budget\*\* — one number to start

2\. \*\*Log a payment\*\* (stand-in for a real UPI/QR scan) — merchant + amount

3\. The amount and a \*\*sanitized\*\* version of the transaction (see

&#x20;  `sanitizeForAI()` in `lib/ai.ts`) go to Gemini for categorization —

&#x20;  the raw merchant name and any payment identifiers never leave your

&#x20;  database

4\. Gemini also evaluates whether this transaction puts you off pace for

&#x20;  the month; if so, you get a nudge with a plain-English reason

5\. The \*\*safe-to-spend ring\*\* updates live after every transaction

6\. At month end (or any time, for demo purposes), generate an AI-written

&#x20;  recap of how the month went



Every AI decision — categorization, nudges, and the recap — is written to

the `ai\_logs` table in Supabase with the exact sanitized input the model

saw, its output, and whether a fallback rule fired instead. That table

\*\*is\*\* the audit trail; query it directly during your demo/interview to

show judges the reasoning behind every flagged transaction.



\## What's simulated vs. real (be upfront about this in your pitch)



\- \*\*Payments are simulated\*\* via a simple form, not a live UPI/QR scan —

&#x20; this was a deliberate scope decision to focus build time on the AI

&#x20; reasoning and UX rather than payment infra in a few days. The next real

&#x20; step would be wiring this to Razorpay's test-mode QR Code / Orders API

&#x20; and a webhook instead of the manual form.

\- \*\*Single demo user, no auth\*\* — every row uses `user\_id = 'demo\_user'`.

&#x20; Swapping in Supabase Auth later is a schema-compatible change (the

&#x20; `user\_id` column is already there).

\- \*\*Row Level Security is disabled\*\* on all tables for demo simplicity —

&#x20; a production version would re-enable it with policies scoped to real

&#x20; authenticated users.



\## Project structure

app/

page.tsx — main dashboard (budget, ring, form, nudges, audit)

layout.tsx — fonts + root layout

globals.css — design tokens (palette, type, components)

components/SpendRing.tsx — the signature "safe to spend" gauge

api/budget/route.ts — get/set monthly budget

api/expense/route.ts — log expense -> AI categorize -> AI flag -> audit log

api/summary/route.ts — month-end AI recap

lib/

supabase.ts — Supabase client

ai.ts — sanitizeForAI() + all three Gemini calls + fallbacks

supabase/

schema.sql — run this in Supabase SQL Editor



\## Known non-issue



`npm audit` flags Next.js 14.x under a broad advisory range that covers most

of the framework's history and is mostly about production/self-hosted

deployment edge cases (SSRF, cache poisoning, etc. in specific configs).

For a local demo this doesn't matter; if you deploy this beyond the

buildathon, upgrade to the latest Next.js patch before going live.



\## Stretch ideas (not built — mentioned here for the interview round)



\- Real Razorpay test-mode QR/payment integration with a webhook

\- Pre-payment interstitial that gates the transaction, not just flags it after

\- Goal-linked dynamic daily safe-to-spend pacing

\- Weekly check-in nudges, not just month-end

\- Encryption at rest, data retention limits, "delete my data" action

\- Re-enable Row Level Security with real auth-scoped policies

