"use client";

import { useState } from "react";

type AffordabilityResponse = {
  affordable?: boolean;
  status?: "safe" | "caution" | "not_recommended";
  message?: string;
  purchaseAmount?: number;
  safeToSpend?: number;
  remainingSafeToSpend?: number;
  error?: string;
};

export default function AffordabilityChecker() {
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] =
    useState<AffordabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkAffordability() {
    setError("");
    setResult(null);

    const purchaseAmount = Number(amount);

    if (!item.trim()) {
      setError("Please enter what you want to buy.");
      return;
    }

    if (!Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
      setError("Please enter a valid purchase amount.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/affordability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item: item.trim(),
          amount: purchaseAmount,
        }),
      });

      const data: AffordabilityResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to check affordability"
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Affordability check error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to check affordability."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card affordability-card">
      <div className="affordability-header">
        <div>
          <p className="affordability-label">
            SMART PURCHASE CHECK
          </p>

          <h2>Can I Afford This?</h2>
        </div>

        <span className="affordability-icon">💰</span>
      </div>

      <p className="affordability-description">
        Check whether a purchase fits within your current
        safe-to-spend amount while protecting your financial goals.
      </p>

      <div className="affordability-form">
        <label htmlFor="affordability-item">
          What do you want to buy?
        </label>

        <input
          id="affordability-item"
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="e.g. New shoes"
        />

        <label htmlFor="affordability-amount">
          How much does it cost?
        </label>

        <input
          id="affordability-amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 2500"
        />

        <button
          type="button"
          className="affordability-button"
          onClick={checkAffordability}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Affordability"}
        </button>
      </div>

      {error && (
        <p className="affordability-error">
          {error}
        </p>
      )}

      {result && (
  <div
    key={result.status}
    className={`affordability-result ${result.status || ""}`}
  >
          <div className="affordability-result-title">
            {result.status === "safe" && "🟢 Safe"}
            {result.status === "caution" && "🟡 Caution"}
            {result.status === "not_recommended" &&
              "🔴 Not Recommended"}
          </div>

          <p>{result.message}</p>

          <div className="affordability-numbers">
            <div>
              <span>Purchase</span>
              <strong>
                ₹{result.purchaseAmount?.toFixed(0)}
              </strong>
            </div>

            <div>
              <span>Safe-to-Spend</span>
              <strong>
                ₹{result.safeToSpend?.toFixed(0)}
              </strong>
            </div>

            <div>
              <span>After Purchase</span>
              <strong>
                ₹{result.remainingSafeToSpend?.toFixed(0)}
              </strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
