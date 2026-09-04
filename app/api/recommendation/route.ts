import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateFinancialRecommendation } from "@/lib/ai";

const DEMO_USER = "demo_user";

export async function GET() {
  try {
    // Get financial profile
    const { data: financialProfile, error: profileError } =
      await supabase
        .from("financial_profile")
        .select(
          "monthly_income, current_balance, monthly_savings_target, emergency_buffer"
        )
        .eq("user_id", DEMO_USER)
        .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Get upcoming unpaid expenses
    const { data: upcomingExpenses, error: upcomingError } =
      await supabase
        .from("upcoming_expenses")
        .select("amount")
        .eq("user_id", DEMO_USER)
        .eq("is_paid", false);

    if (upcomingError) {
      return NextResponse.json(
        { error: upcomingError.message },
        { status: 500 }
      );
    }

    // Get current month's transactions
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const { data: transactions, error: transactionsError } =
      await supabase
        .from("transactions")
        .select("amount, category, created_at")
        .eq("user_id", DEMO_USER)
        .gte("created_at", startOfMonth)
        .order("created_at", { ascending: false });

    if (transactionsError) {
      return NextResponse.json(
        { error: transactionsError.message },
        { status: 500 }
      );
    }

    // Financial profile values
    const monthlyIncome = Number(
      financialProfile?.monthly_income ?? 0
    );

    const currentBalance = Number(
      financialProfile?.current_balance ?? 0
    );

    const savingsTarget = Number(
      financialProfile?.monthly_savings_target ?? 0
    );

    const emergencyBuffer = Number(
      financialProfile?.emergency_buffer ?? 0
    );

    // Upcoming expenses total
    const upcomingExpensesTotal = (upcomingExpenses ?? []).reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    // Monthly spending
    const totalSpent = (transactions ?? []).reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};

    for (const transaction of transactions ?? []) {
      const category = transaction.category || "other";

      categoryBreakdown[category] =
        (categoryBreakdown[category] || 0) +
        Number(transaction.amount);
    }

    // Calculate safe-to-spend
    const safeToSpend = Math.max(
      currentBalance -
        upcomingExpensesTotal -
        savingsTarget -
        emergencyBuffer,
      0
    );

    // Calculate remaining days in current month
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const daysRemaining = Math.max(
      daysInMonth - now.getDate() + 1,
      1
    );

    const dailySafeToSpend = safeToSpend / daysRemaining;

    // Generate AI recommendation
    const result = await generateFinancialRecommendation({
      monthlyIncome,
      currentBalance,
      savingsTarget,
      emergencyBuffer,
      upcomingExpensesTotal,
      safeToSpend,
      dailySafeToSpend,
      totalSpent,
      categoryBreakdown,
    });

    return NextResponse.json({
      recommendation: result.recommendation,
      fallbackUsed: result.fallbackUsed,
      safeToSpend,
      dailySafeToSpend,
      totalSpent,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Recommendation API error:", error);

    return NextResponse.json(
      { error: "Unable to generate financial recommendation" },
      { status: 500 }
    );
  }
}