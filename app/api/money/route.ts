import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEMO_USER = "demo_user";

export async function GET() {
  const { data, error } = await supabase
    .from("financial_profile")
    .select("*")
    .eq("user_id", DEMO_USER)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const monthlyIncome = Number(body.monthlyIncome);
    const currentBalance = Number(body.currentBalance);
    const monthlySavingsTarget = Number(body.monthlySavingsTarget);
    const emergencyBuffer = Number(body.emergencyBuffer);

    if (
      monthlyIncome < 0 ||
      currentBalance < 0 ||
      monthlySavingsTarget < 0 ||
      emergencyBuffer < 0
    ) {
      return NextResponse.json(
        { error: "Financial values cannot be negative" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("financial_profile")
      .upsert(
        {
          user_id: DEMO_USER,
          monthly_income: monthlyIncome,
          current_balance: currentBalance,
          monthly_savings_target: monthlySavingsTarget,
          emergency_buffer: emergencyBuffer,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
