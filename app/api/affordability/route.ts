import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEMO_USER = "demo_user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Purchase amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Get the user's financial profile
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

    if (!financialProfile) {
      return NextResponse.json(
        {
          error:
            "Please create your financial plan before checking affordability.",
        },
        { status: 400 }
      );
    }

    // Get unpaid upcoming expenses
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

    const monthlyIncome = Number(
      financialProfile.monthly_income ?? 0
    );

    const currentBalance = Number(
      financialProfile.current_balance ?? 0
    );

    const savingsTarget = Number(
      financialProfile.monthly_savings_target ?? 0
    );

    const emergencyBuffer = Number(
      financialProfile.emergency_buffer ?? 0
    );

    const upcomingExpensesTotal = (
      upcomingExpenses ?? []
    ).reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    // Calculate current safe-to-spend amount
    const safeToSpend = Math.max(
      currentBalance -
        upcomingExpensesTotal -
        savingsTarget -
        emergencyBuffer,
      0
    );

    // Calculate remaining safe-to-spend after the purchase
    const remainingSafeToSpend = safeToSpend - amount;

    let affordable = false;
    let status: "safe" | "caution" | "not_recommended";
    let message: string;

    if (amount <= safeToSpend * 0.5) {
      affordable = true;
      status = "safe";

      message =
        "This purchase looks affordable and leaves most of your safe-to-spend amount protected.";
    } else if (amount <= safeToSpend) {
      affordable = true;
      status = "caution";

      message =
        "You can afford this purchase, but it would use a significant part of your safe-to-spend amount.";
    } else {
      affordable = false;
      status = "not_recommended";

      message =
        "This purchase would exceed your current safe-to-spend amount. Consider postponing it or choosing a lower-cost option.";
    }

    return NextResponse.json({
      affordable,
      status,
      message,
      purchaseAmount: amount,
      safeToSpend,
      remainingSafeToSpend: Math.max(remainingSafeToSpend, 0),
      monthlyIncome,
      currentBalance,
      savingsTarget,
      emergencyBuffer,
      upcomingExpensesTotal,
    });
  } catch (error) {
    console.error("Affordability API error:", error);

    return NextResponse.json(
      { error: "Unable to check affordability" },
      { status: 500 }
    );
  }
}