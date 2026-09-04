"use client";

import { useEffect, useState } from "react";

type SavingsData = {
  totalSaved: number;
  savingsTarget: number;
  progress: number;
};

export default function SavingsProgress() {
  const [data, setData] = useState<SavingsData | null>(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadSavings() {
    try {
      const res = await fetch("/api/savings");
      const result = await res.json();

      if (res.ok) {
        setData(result);
      }
    } catch {
      setMessage("Unable to load savings information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSavings();
  }, []);

  async function handleAddSavings(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const savedAmount = Number(amount);

    if (!savedAmount || savedAmount <= 0) {
      setMessage("Enter a valid savings amount.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/savings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountSaved: savedAmount,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(
          result.error || "Unable to add savings."
        );
        return;
      }

      setAmount("");
      setMessage("Savings added successfully.");

      await loadSavings();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h2>🎯 Savings Progress</h2>
        <p>Loading savings progress...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <h2>🎯 Savings Progress</h2>
        <p>Unable to load savings information.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>🎯 Savings Progress</h2>

      <p
        style={{
          color: "var(--text-dim)",
          marginBottom: 18,
        }}
      >
        Track how close you are to your monthly savings goal.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span>
          ₹{data.totalSaved.toFixed(0)} saved
        </span>

        <span
          style={{
            color: "var(--text-dim)",
          }}
        >
          of ₹{data.savingsTarget.toFixed(0)}
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: 12,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${data.progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, var(--success), var(--cyan))",
           
            borderRadius: 10,
            transition: "width 0.5s ease",
          }}
        />
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 16,
        }}
      >
        <strong style={{ fontSize: 24 }}>
          {data.progress.toFixed(0)}%
        </strong>

        <p
          style={{
            color: "var(--text-dim)",
            marginTop: 4,
            fontSize: 14,
          }}
        >
          {data.progress >= 100
            ? "🎉 Monthly savings target reached!"
            : "Keep going — you're building your savings."}
        </p>
      </div>

      <form
        onSubmit={handleAddSavings}
        style={{ marginTop: 24 }}
      >
        <div className="field">
          <label htmlFor="savingsAmount">
            Add savings (₹)
          </label>

          <input
            id="savingsAmount"
            type="number"
            min="1"
            placeholder="e.g. 1000"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />
        </div>

        <button
          className="btn"
          disabled={saving}
        >
          {saving ? "Adding..." : "Add Savings"}
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
    </div>
  );
}