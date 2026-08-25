"use client";

export default function SpendRing({
  safeToSpend,
  totalBudget,
}: {
  safeToSpend: number | null;
  totalBudget: number;
}) {
  const size = 200;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const ratio =
    totalBudget > 0 && safeToSpend !== null
      ? Math.max(0, Math.min(1, safeToSpend / totalBudget))
      : 1;

  const dashoffset = circumference * (1 - ratio);

  const color = ratio > 0.4 ? "var(--gold)" : ratio > 0.15 ? "#e0a83f" : "var(--coral)";

  return (
    <div className="ring-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.6s ease" }}
        />
      </svg>
      <div className="ring-number">
        {safeToSpend !== null ? `₹${safeToSpend.toFixed(0)}` : "—"}
      </div>
      <div className="ring-label">safe to spend this month</div>
    </div>
  );
}
