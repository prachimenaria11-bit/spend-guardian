"use client";

import { useEffect, useState } from "react";

type FinancialProfile = {
  monthly_income: number;
  current_balance: number;
  monthly_savings_target: number;
  emergency_buffer: number;
};

export default function MoneyManagement() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [savingsTarget, setSavingsTarget] = useState("");
  const [emergencyBuffer, setEmergencyBuffer] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/money");
        const data = await res.json();

        if (data.profile) {
          const profile: FinancialProfile = data.profile;

          setMonthlyIncome(String(profile.monthly_income));
          setCurrentBalance(String(profile.current_balance));
          setSavingsTarget(String(profile.monthly_savings_target));
          setEmergencyBuffer(String(profile.emergency_buffer));
        }
      } catch {
        setMessage("Unable to load your financial information.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const income = Number(monthlyIncome);
    const balance = Number(currentBalance);
    const savings = Number(savingsTarget);
    const emergency = Number(emergencyBuffer);

    if (
      income < 0 ||
      balance < 0 ||
      savings < 0 ||
      emergency < 0
    ) {
      setMessage("Values cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/money", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthlyIncome: income,
          currentBalance: balance,
          monthlySavingsTarget: savings,
          emergencyBuffer: emergency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Unable to save your financial plan.");
        return;
      }

      setMessage("Financial plan saved successfully.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h2>Money Management</h2>
        <p>Loading your financial information...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>💰 Money Management</h2>

      <p style={{ color: "var(--text-dim)", marginBottom: 20 }}>
        Tell Spend Guardian about your money so it can help you plan
        spending and saving.
      </p>

      <form onSubmit={handleSave}>
        <div className="field">
          <label htmlFor="monthlyIncome">
            Monthly income (₹)
          </label>

          <input
            id="monthlyIncome"
            type="number"
            min="0"
            placeholder="e.g. 25000"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="currentBalance">
            Current balance (₹)
          </label>

          <input
            id="currentBalance"
            type="number"
            min="0"
            placeholder="e.g. 12000"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="savingsTarget">
            Monthly savings target (₹)
          </label>

          <input
            id="savingsTarget"
            type="number"
            min="0"
            placeholder="e.g. 5000"
            value={savingsTarget}
            onChange={(e) => setSavingsTarget(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="emergencyBuffer">
            Emergency buffer (₹)
          </label>

          <input
            id="emergencyBuffer"
            type="number"
            min="0"
            placeholder="e.g. 2000"
            value={emergencyBuffer}
            onChange={(e) => setEmergencyBuffer(e.target.value)}
          />
        </div>

        <button className="btn" disabled={saving}>
          {saving ? "Saving..." : "Save Financial Plan"}
        </button>
      </form>

      {message && (
  <p
    key={message}
    className="save-message"
    style={{
      marginTop: 16,
      color: "var(--text-dim)",
      fontSize: 14,
    }}
  >
    {message}
  </p>
)}
        >
          {message}
        </p>
      )}
    </div>
  );
}
