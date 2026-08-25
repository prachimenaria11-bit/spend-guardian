import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  const month = currentMonthKey();
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("month", month)
    .eq("user_id", "demo_user")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ budget: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const totalBudget = Number(body.totalBudget);

  if (!totalBudget || totalBudget <= 0) {
    return NextResponse.json(
      { error: "totalBudget must be a positive number" },
      { status: 400 }
    );
  }

  const month = currentMonthKey();

  const { data, error } = await supabase
    .from("budgets")
    .insert({ month, total_budget: totalBudget, user_id: "demo_user" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ budget: data });
}
