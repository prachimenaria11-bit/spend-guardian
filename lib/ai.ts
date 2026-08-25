import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Gemini 2.5 Flash is on Google's free tier (no credit card required) as of
// this writing. If you later want higher quality reasoning and have billing
// enabled, you can swap this to "gemini-2.5-pro".
const MODEL = "gemini-2.5-flash";

function getModel() {
  return genAI.getGenerativeModel({ model: MODEL });
}

/* -------------------------------------------------------------------------
 * PRIVACY LAYER
 * ---------------------------------------------------------------------- */
export type SanitizedTransaction = {
  amountBucket: string;
  amount: number;
  categoryHint: string;
  dayOfWeek: string;
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ["swiggy", "zomato", "restaurant", "cafe", "food", "dominos", "pizza"],
  travel: ["uber", "ola", "irctc", "flight", "indigo", "rapido", "metro"],
  shopping: ["amazon", "flipkart", "myntra", "shop", "mall"],
  bills: ["electricity", "recharge", "airtel", "jio", "broadband", "rent"],
};

function guessCategory(merchant: string): string {
  const m = merchant.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => m.includes(k))) return category;
  }
  return "other";
}

export function sanitizeForAI(
  merchant: string,
  amount: number
): SanitizedTransaction {
  return {
    amountBucket: amount < 200 ? "small" : amount < 1000 ? "medium" : "large",
    amount,
    categoryHint: guessCategory(merchant),
    dayOfWeek: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  };
}

function stripCodeFences(text: string): string {
  return text.replace(/```json|```/g, "").trim();
}

/* -------------------------------------------------------------------------
 * CATEGORIZATION
 * ---------------------------------------------------------------------- */
export async function categorizeTransaction(
  sanitized: SanitizedTransaction
): Promise<{ category: string; fallbackUsed: boolean }> {
  try {
    const model = getModel();
    const result = await model.generateContent(
      `Classify this transaction into exactly one category: food, travel, shopping, bills, or other.
Data: ${JSON.stringify(sanitized)}
Respond with ONLY the category word, nothing else.`
    );
    const text = result.response.text().trim().toLowerCase();

    const valid = ["food", "travel", "shopping", "bills", "other"];
    if (valid.includes(text)) {
      return { category: text, fallbackUsed: false };
    }
    throw new Error("Unexpected model output: " + text);
  } catch (err) {
    console.error("categorizeTransaction fallback triggered:", err);
    return { category: sanitized.categoryHint, fallbackUsed: true };
  }
}

/* -------------------------------------------------------------------------
 * BUDGET FLAG / SAFE-TO-SPEND REASONING
 * ---------------------------------------------------------------------- */
export type FlagResult = {
  flagged: boolean;
  severity: "none" | "low" | "medium" | "high";
  reason: string;
  fallbackUsed: boolean;
};

export async function evaluateSpend(params: {
  totalBudget: number;
  spentSoFar: number;
  daysElapsed: number;
  daysInMonth: number;
  sanitized: SanitizedTransaction;
}): Promise<FlagResult> {
  const { totalBudget, spentSoFar, daysElapsed, daysInMonth, sanitized } =
    params;

  const expectedPace = (totalBudget / daysInMonth) * daysElapsed;
  const overPaceBy = spentSoFar - expectedPace;
  const ruleFlagged = overPaceBy > totalBudget * 0.05;

  try {
    const model = getModel();
    const result = await model.generateContent(
      `You are a budget-pacing assistant. Decide if the user should be gently warned about this transaction.

Monthly budget: ${totalBudget}
Spent so far this month (including this transaction): ${spentSoFar}
Days elapsed in month: ${daysElapsed} of ${daysInMonth}
Transaction: ${JSON.stringify(sanitized)}
Basic pace check says over-budget-pace: ${ruleFlagged}

Respond ONLY with valid JSON, no markdown, in this exact shape:
{"flagged": boolean, "severity": "none"|"low"|"medium"|"high", "reason": "one short encouraging or cautionary sentence, max 20 words"}`
    );

    const text = stripCodeFences(result.response.text());
    const parsed = JSON.parse(text);

    return {
      flagged: Boolean(parsed.flagged),
      severity: parsed.severity ?? "none",
      reason: parsed.reason ?? "",
      fallbackUsed: false,
    };
  } catch (err) {
    console.error("evaluateSpend fallback triggered:", err);
    return {
      flagged: ruleFlagged,
      severity: ruleFlagged ? "medium" : "none",
      reason: ruleFlagged
        ? "You're spending faster than your usual pace this month."
        : "You're on track with your budget pace.",
      fallbackUsed: true,
    };
  }
}

/* -------------------------------------------------------------------------
 * MONTH-END SUMMARY
 * ---------------------------------------------------------------------- */
export async function generateMonthSummary(params: {
  totalBudget: number;
  totalSpent: number;
  categoryBreakdown: Record<string, number>;
}): Promise<{ summary: string; fallbackUsed: boolean }> {
  const { totalBudget, totalSpent, categoryBreakdown } = params;
  const saved = totalBudget - totalSpent;

  try {
    const model = getModel();
    const result = await model.generateContent(
      `Write a short (max 3 sentences), warm, honest month-end spending recap for a user.
Total budget: ${totalBudget}
Total spent: ${totalSpent}
Saved: ${saved}
Category breakdown: ${JSON.stringify(categoryBreakdown)}
Be specific and encouraging, mention one concrete category insight. Plain text only, no markdown.`
    );
    const text = result.response.text().trim();
    return { summary: text, fallbackUsed: false };
  } catch (err) {
    console.error("generateMonthSummary fallback triggered:", err);
    const topCategory = Object.entries(categoryBreakdown).sort(
      (a, b) => b[1] - a[1]
    )[0];
    return {
      summary:
        saved >= 0
          ? `You saved ₹${saved.toFixed(0)} this month out of a ₹${totalBudget} budget. Your biggest category was ${
              topCategory?.[0] ?? "other"
            }.`
          : `You went ₹${Math.abs(saved).toFixed(
              0
            )} over budget this month. Your biggest category was ${
              topCategory?.[0] ?? "other"
            }.`,
      fallbackUsed: true,
    };
  }
}