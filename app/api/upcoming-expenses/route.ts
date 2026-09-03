import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEMO_USER = "demo_user";

export async function GET() {
  const { data, error } = await supabase
    .from("upcoming_expenses")
    .select("*")
    .eq("user_id", DEMO_USER)
    .eq("is_paid", false)
    .order("due_date", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    expenses: data ?? [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const title = String(body.title ?? "").trim();
    const amount = Number(body.amount);
    const category = body.category
      ? String(body.category).trim()
      : null;
    const dueDate = String(body.dueDate ?? "").trim();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!dueDate) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("upcoming_expenses")
      .insert({
        user_id: DEMO_USER,
        title,
        amount,
        category,
        due_date: dueDate,
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
      expense: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
