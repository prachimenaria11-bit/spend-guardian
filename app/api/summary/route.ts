import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateMonthSummary } from "@/lib/ai";

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return start;
}

export async function GET() {
  const start = currentMonthRange();
  const month = `${start.getFullYear()}-${String(
    start.getMonth() + 1
  ).padStart(2, "0")}`;

  const { data: budgetRow } = await supabase
    .from("budgets")
    .select("*")
    .eq("month", month)
    .eq("user_id", "demo_user")
    .maybeSingle();

  const { data: monthTxns, error } = await supabase
    .from("transactions")
    .select("amount, category")
    .eq("user_id", "demo_user")
    .gte("created_at", start.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalSpent = (monthTxns ?? []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const categoryBreakdown: Record<string, number> = {};
  for (const t of monthTxns ?? []) {
    const cat = t.category ?? "other";
    categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + Number(t.amount);
  }

  const totalBudget = budgetRow ? Number(budgetRow.total_budget) : 0;

  const { summary, fallbackUsed } = await generateMonthSummary({
    totalBudget,
    totalSpent,
    categoryBreakdown,
  });

  await supabase.from("ai_logs").insert({
    decision_type: "monthly_summary",
    input_summary: { totalBudget, totalSpent, categoryBreakdown },
    ai_output: { summary },
    fallback_used: fallbackUsed,
    user_id: "demo_user",
  });

  const saved = totalBudget - totalSpent;
  if (saved > 0) {
    await supabase.from("savings").insert({
      month,
      amount_saved: saved,
      user_id: "demo_user",
    });
  }

  return NextResponse.json({
    totalBudget,
    totalSpent,
    saved,
    categoryBreakdown,
    summary,
  });
}
