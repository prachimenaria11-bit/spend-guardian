import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sanitizeForAI, categorizeTransaction, evaluateSpend } from "@/lib/ai";

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const daysElapsed = now.getDate();
  return { start, daysInMonth, daysElapsed };
}

export async function GET() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", "demo_user")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ transactions: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const merchant = String(body.merchant ?? "").trim();
  const amount = Number(body.amount);

  if (!merchant || !amount || amount <= 0) {
    return NextResponse.json(
      { error: "merchant and a positive amount are required" },
      { status: 400 }
    );
  }

  // 1. Sanitize before anything touches the AI.
  const sanitized = sanitizeForAI(merchant, amount);

  // 2. Categorize (AI + local fallback).
  const { category, fallbackUsed: catFallback } = await categorizeTransaction(
    sanitized
  );

  // 3. Store the transaction. Merchant name stays in our DB only — it is
  // never sent onward past this point.
  const { data: txn, error: txnError } = await supabase
    .from("transactions")
    .insert({
      merchant,
      amount,
      category,
      user_id: "demo_user",
    })
    .select()
    .single();

  if (txnError) {
    return NextResponse.json({ error: txnError.message }, { status: 500 });
  }

  // 4. Log the categorization decision to the audit trail.
  await supabase.from("ai_logs").insert({
    transaction_id: txn.id,
    decision_type: "categorize",
    input_summary: sanitized,
    ai_output: { category },
    fallback_used: catFallback,
    user_id: "demo_user",
  });

  // 5. Pull this month's budget + spend so far to evaluate pacing.
  const { start, daysInMonth, daysElapsed } = currentMonthRange();
  const month = `${start.getFullYear()}-${String(
    start.getMonth() + 1
  ).padStart(2, "0")}`;

  const { data: budgetRow } = await supabase
    .from("budgets")
    .select("*")
    .eq("month", month)
    .eq("user_id", "demo_user")
    .maybeSingle();

  const { data: monthTxns } = await supabase
    .from("transactions")
    .select("amount, created_at")
    .eq("user_id", "demo_user")
    .gte("created_at", start.toISOString());

  const spentSoFar = (monthTxns ?? []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  let flagResult = null;
  if (budgetRow) {
    flagResult = await evaluateSpend({
      totalBudget: Number(budgetRow.total_budget),
      spentSoFar,
      daysElapsed,
      daysInMonth,
      sanitized,
    });

    await supabase.from("ai_logs").insert({
      transaction_id: txn.id,
      decision_type: "flag",
      input_summary: {
        sanitized,
        spentSoFar,
        daysElapsed,
        daysInMonth,
        totalBudget: budgetRow.total_budget,
      },
      ai_output: flagResult,
      fallback_used: flagResult.fallbackUsed,
      user_id: "demo_user",
    });
  }

  const safeToSpend = budgetRow
    ? Math.max(Number(budgetRow.total_budget) - spentSoFar, 0)
    : null;

  return NextResponse.json({
    transaction: txn,
    flag: flagResult,
    spentSoFar,
    safeToSpend,
  });
}
