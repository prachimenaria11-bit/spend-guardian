-- Spend Guardian — Supabase schema
-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New Query)

-- For the hackathon MVP we use a single demo user (no auth yet).
-- user_id is kept as a text column now so real auth can be dropped in later
-- without changing the schema.

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo_user',
  month text not null,              -- e.g. '2026-08'
  total_budget numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo_user',
  merchant text not null,           -- kept server-side only, never sent to the AI as-is
  amount numeric not null,
  category text,                    -- filled in by the AI categorizer
  created_at timestamptz not null default now()
);

-- Every AI decision gets logged here: this IS the audit trail feature.
create table if not exists ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo_user',
  transaction_id uuid references transactions(id),
  decision_type text not null,      -- 'categorize' | 'flag' | 'monthly_summary'
  input_summary jsonb not null,     -- the SANITIZED data actually sent to the AI
  ai_output jsonb not null,         -- structured verdict returned by the AI
  fallback_used boolean not null default false, -- true if rule-based backup fired instead
  created_at timestamptz not null default now()
);

create table if not exists savings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo_user',
  month text not null,
  amount_saved numeric not null,
  created_at timestamptz not null default now()
);

-- Helpful index for the running safe-to-spend calculation
create index if not exists idx_transactions_user_created
  on transactions (user_id, created_at desc);
-- ============================================
-- MONEY MANAGEMENT
-- ============================================

create table if not exists financial_profile (
  id uuid primary key default gen_random_uuid(),

  user_id text not null unique default 'demo_user',

  monthly_income numeric not null default 0,
  current_balance numeric not null default 0,
  monthly_savings_target numeric not null default 0,
  emergency_buffer numeric not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists upcoming_expenses(
  id uuid primary key default gen_random_uuid(),

  user_id text not null default 'demo_user',
  title text not null,
  amount numeric not null,
  category text,

  due_date date not null,

  is_paid boolean not null default false,

  created_at timestamptz not null default now()
  );
create index if not exists idx_upcoming_expenses_user_due
  on upcoming_expenses (user_id, due_date);


