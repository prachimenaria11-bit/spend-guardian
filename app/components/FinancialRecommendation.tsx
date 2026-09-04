"use client";

import { useEffect, useState } from "react";

type RecommendationResponse = {
  recommendation?: string;
  fallbackUsed?: boolean;
  safeToSpend?: number;
  dailySafeToSpend?: number;
  error?: string;
};

export default function FinancialRecommendation() {
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadRecommendation() {
    try {
      setError("");

      const response = await fetch("/api/recommendation");

      const data: RecommendationResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load recommendation"
        );
      }

      setRecommendation(data.recommendation || "");
    } catch (err) {
      console.error("Recommendation loading error:", err);
      setError("Unable to load your financial recommendation.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadRecommendation();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    loadRecommendation();
  }

  return (
    <section className="card recommendation-card">
      <div className="recommendation-header">
        <div>
          <p className="recommendation-label">
            AI FINANCIAL GUIDANCE
          </p>

          <h2>Spend Guardian Recommendation</h2>
        </div>

        <span className="recommendation-icon">🤖</span>
      </div>

      {loading ? (
        <p className="recommendation-message">
          Analyzing your financial situation...
        </p>
      ) : error ? (
        <p className="recommendation-error">{error}</p>
      ) : (
        <p className="recommendation-message">
          {recommendation}
        </p>
      )}

      <button
        type="button"
        className="recommendation-refresh"
        onClick={handleRefresh}
        disabled={loading || refreshing}
      >
        {refreshing ? "Refreshing..." : "Refresh Recommendation"}
      </button>
    </section>
  );
}