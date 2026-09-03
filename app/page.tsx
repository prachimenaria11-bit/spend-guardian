"use client";

import { useEffect, useState } from "react";
import SpendRing from "./components/SpendRing";
import MoneyManagement from "./components/MoneyManagement";
import UpcomingExpenses from "./components/UpcomingExpenses";

type Budget = {
  id: string;
  total_budget: number;
  month: string;
};

type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  created_at: string;
};

type FlagResult = {
  flagged: boolean;
  severity: "none" | "low" | "medium" | "high";
  reason: string;
};

export default function Home() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [safeToSpend, setSafeToSpend] = useState<number | null>(null);

  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [alerts, setAlerts] = useState<
    { id: string; flag: FlagResult; merchant: string }[]
  >([]);

  const [showAudit, setShowAudit] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  async function loadBudget() {
    const res = await fetch("/api/budget");
    const data = await res.json();

    setBudget(data.budget);

    if (data.budget) {
      setSafeToSpend(Number(data.budget.total_budget));
    }
  }

  async function loadTransactions() {
    const res = await fetch("/api/expense");
    const data = await res.json();

    setTransactions(data.transactions ?? []);
  }

  useEffect(() => {
    loadBudget();
    loadTransactions();
  }, []);

  async function handleSetBudget(e: React.FormEvent) {
    e.preventDefault();

    const val = Number(budgetInput);

    if (!val || val <= 0) return;

    setSubmitting(true);

    const res = await fetch("/api/budget", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        totalBudget: val,
      }),
    });

    const data = await res.json();

    setBudget(data.budget);
    setSafeToSpend(val);
    setBudgetInput("");
    setSubmitting(false);
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();

    const amt = Number(amount);

    if (!merchant.trim() || !amt || amt <= 0) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant,
          amount: amt,
        }),
      });

      const data = await res.json();

      if (data.safeToSpend !== null && data.safeToSpend !== undefined) {
        setSafeToSpend(data.safeToSpend);
      }

      if (data.flag && data.flag.flagged) {
        setAlerts((prev) => [
          {
            id: data.transaction.id,
            flag: data.flag,
            merchant,
          },
          ...prev,
        ]);
      }

      setMerchant("");
      setAmount("");

      await loadTransactions();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGetSummary() {
    setSummaryLoading(true);

    try {
      const res = await fetch("/api/summary");
      const data = await res.json();

      setSummary(data.summary);
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="eyebrow">Spend Guardian</div>

      <h1 className="title">Spend without worry.</h1>

      <p className="subtitle">
        Track UPI &amp; QR spending in real time — the AI watches the pace so
        you don&apos;t have to.
      </p>

      {/* ============================================
          MONEY MANAGEMENT
          ============================================ */}

      <MoneyManagement />
      
      {/* ============================================
          UPCOMING EXPENSES
          ============================================ */}

    <UpcomingExpenses />

      {/* ============================================
          EXISTING SPEND GUARDIAN FEATURES
          ============================================ */}

      {!budget ? (
        <div className="card">
          <h2>Set this month&apos;s budget</h2>

          <form onSubmit={handleSetBudget}>
            <div className="field">
              <label htmlFor="budget">
                Total monthly budget (₹)
              </label>

              <input
                id="budget"
                type="number"
                placeholder="e.g. 12000"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
            </div>

            <button className="btn" disabled={submitting}>
              Start tracking
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Spend Ring */}

          <div className="card">
            <SpendRing
              safeToSpend={safeToSpend}
              totalBudget={Number(budget.total_budget)}
            />
          </div>

          {/* Log Payment */}

          <div className="card">
            <h2>Log a payment</h2>

            <form onSubmit={handleAddExpense}>
              <div className="field">
                <label htmlFor="merchant">
                  Merchant / what for
                </label>

                <input
                  id="merchant"
                  type="text"
                  placeholder="e.g. Swiggy, Uber, Rent"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="amount">
                  Amount (₹)
                </label>

                <input
                  id="amount"
                  type="number"
                  placeholder="e.g. 340"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <button className="btn" disabled={submitting}>
                {submitting
                  ? "Checking with AI…"
                  : "Add expense"}
              </button>
            </form>
          </div>

          {/* Nudges */}

          {alerts.length > 0 && (
            <div className="card">
              <h2>Nudges</h2>

              {alerts.map((a) => (
                <div
                  key={a.id}
                  className={`alert ${a.flag.severity}`}
                >
                  <div className="alert-severity">
                    {a.flag.severity}
                  </div>

                  <div>
                    <strong>{a.merchant}</strong> —{" "}
                    {a.flag.reason}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Transactions */}

          <div className="card">
            <h2>Recent transactions</h2>

            {transactions.length === 0 ? (
              <div className="empty">
                No expenses logged yet — add one above to see it
                here.
              </div>
            ) : (
              transactions.map((t) => (
                <div className="txn-row" key={t.id}>
                  <span>{t.merchant}</span>

                  <span className="tag">
                    {t.category}
                  </span>

                  <span className="txn-amount">
                    ₹{Number(t.amount).toFixed(0)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Month-end Wrap-up */}

          <div className="card">
            <h2>Month-end wrap-up</h2>

            {summary ? (
              <p className="summary-text">
                &ldquo;{summary}&rdquo;
              </p>
            ) : (
              <button
                className="btn"
                onClick={handleGetSummary}
                disabled={summaryLoading}
              >
                {summaryLoading
                  ? "Writing your recap…"
                  : "Generate wrap-up"}
              </button>
            )}
          </div>

          {/* AI Audit Trail */}

          <button
            className="btn-ghost"
            onClick={() => setShowAudit((s) => !s)}
          >
            {showAudit ? "Hide" : "Show"} AI audit trail
          </button>

          {showAudit && (
            <div
              className="card"
              style={{ marginTop: 14 }}
            >
              <h2>What the AI decided, and why</h2>

              <p
                style={{
                  color: "var(--text-dim)",
                  fontSize: 13,
                }}
              >
                Every AI decision — categorization, budget
                nudges, and this summary — is logged in
                Supabase&apos;s <code>ai_logs</code> table with
                the exact (privacy-sanitized) input it saw and
                whether a fallback rule fired instead. Query
                that table directly to inspect the full trail
                for your demo.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}