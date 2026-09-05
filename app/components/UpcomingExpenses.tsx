"use client";

import { useEffect, useState } from "react";

type UpcomingExpense = {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  due_date: string;
  is_paid: boolean;
};

export default function UpcomingExpenses() {
  const [expenses, setExpenses] = useState<UpcomingExpense[]>([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadExpenses() {
    try {
      const res = await fetch("/api/upcoming-expenses");
      const data = await res.json();

      setExpenses(data.expenses ?? []);
    } catch {
      setMessage("Unable to load upcoming expenses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const expenseAmount = Number(amount);

    if (!title.trim()) {
      setMessage("Please enter an expense title.");
      return;
    }

    if (!expenseAmount || expenseAmount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    if (!dueDate) {
      setMessage("Please select a due date.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/upcoming-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: expenseAmount,
          category: category.trim() || null,
          dueDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Unable to add expense.");
        return;
      }

      setTitle("");
      setAmount("");
      setCategory("");
      setDueDate("");

      setMessage("Upcoming expense added successfully.");

      await loadExpenses();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h2>📅 Upcoming Expenses</h2>
        <p>Loading upcoming expenses...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>📅 Upcoming Expenses</h2>

      <p style={{ color: "var(--text-dim)", marginBottom: 20 }}>
        Add bills and payments you expect to make soon.
      </p>

      <form onSubmit={handleAddExpense}>
        <div className="field">
          <label htmlFor="upcomingTitle">
            Expense
          </label>

          <input
            id="upcomingTitle"
            type="text"
            placeholder="e.g. Rent, Electricity Bill"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="upcomingAmount">
            Amount (₹)
          </label>

          <input
            id="upcomingAmount"
            type="number"
            min="0"
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="upcomingCategory">
            Category
          </label>

          <input
            id="upcomingCategory"
            type="text"
            placeholder="e.g. Housing"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="upcomingDueDate">
            Due date
          </label>

          <input
            id="upcomingDueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <button className="btn" disabled={saving}>
          {saving ? "Adding..." : "Add Upcoming Expense"}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: 16,
            color: "var(--text-dim)",
            fontSize: 14,
          }}
        >
          {message}
        </p>
      )}

      {expenses.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Planned payments</h3>

          {expenses.map((expense, i) => (
  <div
    className="txn-row enter"
    key={expense.id}
    style={{ animationDelay: `${i * 0.06}s` }}
  >
              <span>
                <strong>{expense.title}</strong>
                <br />
                <small>{expense.due_date}</small>
              </span>

              {expense.category && (
                <span className="tag">
                  {expense.category}
                </span>
              )}

              <span className="txn-amount">
                ₹{Number(expense.amount).toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
