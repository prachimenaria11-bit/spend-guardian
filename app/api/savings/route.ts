import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEMO_USER = "demo_user";

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

export async function GET() {
  try {
    const month = getCurrentMonth();

    // Get monthly savings target
    const { data: financialProfile, error: profileError } =
      await supabase
        .from("financial_profile")
        .select("monthly_savings_target")
        .eq("user_id", DEMO_USER)
        .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    const savingsTarget = financialProfile
      ? Number(financialProfile.monthly_savings_target)
      : 0;

    // Get savings records for current month
    const { data: savingsRows, error: savingsError } =
      await supabase
        .from("savings")
        .select("amount_saved")
        .eq("user_id", DEMO_USER)
        .eq("month", month);

    if (savingsError) {
      return NextResponse.json(
        { error: savingsError.message },
        { status: 500 }
      );
    }

    // Calculate total saved
    const totalSaved = (savingsRows ?? []).reduce(
      (sum, row) => sum + Number(row.amount_saved),
      0
    );

    // Calculate progress percentage
    const progress =
      savingsTarget > 0
        ? Math.min((totalSaved / savingsTarget) * 100, 100)
        : 0;

    return NextResponse.json({
      month,
      totalSaved,
      savingsTarget,
      progress,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load savings information" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const amountSaved = Number(body.amountSaved);

    if (!amountSaved || amountSaved <= 0) {
      return NextResponse.json(
        {
          error: "Savings amount must be greater than 0",
        },
        { status: 400 }
      );
    }

    const month = getCurrentMonth();

    const { data, error } = await supabase
      .from("savings")
      .insert({
        user_id: DEMO_USER,
        month,
        amount_saved: amountSaved,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      savings: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}