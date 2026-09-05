"use client";
import { useEffect, useState } from "react";

export type GuardianMood = "calm" | "happy" | "worried";

export default function GuardianMascot({ mood, message }: { mood: GuardianMood; message?: string }) {
  const [showSparks, setShowSparks] = useState(false);

  useEffect(() => {
    if (mood === "happy") {
      setShowSparks(true);
      const t = setTimeout(() => setShowSparks(false), 2000);
      return () => clearTimeout(t);
    }
    setShowSparks(false);
  }, [mood]);

  const mouthPath =
    mood === "happy" ? "M80 122 Q100 145 120 122"
    : mood === "worried" ? "M82 132 Q100 120 118 132"
    : "M82 125 Q100 138 118 125";

  const bodyFill = mood === "worried" ? "var(--danger)" : mood === "happy" ? "var(--success)" : "var(--primary)";

  return (
    <div className="guardian-wrap">
      <svg width="110" height="121" viewBox="0 0 200 220" className={`guardian-svg g-${mood}`}>
        <g className="g-body">
          <path
            d="M100 20 L160 45 L160 110 C160 150 135 175 100 190 C65 175 40 150 40 110 L40 45 Z"
            fill={bodyFill}
          />
          <ellipse className="g-eye" cx="82" cy="95" rx="6" ry="8" fill="var(--text)" />
          <ellipse className="g-eye" cx="118" cy="95" rx="6" ry="8" fill="var(--text)" />
          <path d={mouthPath} fill="none" stroke="var(--text)" strokeWidth="4" strokeLinecap="round" />
        </g>
        {showSparks && (
          <g>
            <path className="g-spark" style={{ animationDelay: "0.1s" }} d="M35 60 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 Z" fill="var(--warning)" />
            <path className="g-spark" style={{ animationDelay: "0.25s" }} d="M155 55 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 Z" fill="var(--warning)" />
            <path className="g-spark" style={{ animationDelay: "0.4s" }} d="M165 150 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 Z" fill="var(--warning)" />
          </g>
        )}
      </svg>
      {message && <p className="guardian-message">{message}</p>}
    </div>
  );
}
