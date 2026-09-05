"use client";
import { useEffect, useState } from "react";

const COLORS = ["#8b5cf6", "#3b82f6", "#22d3ee", "#34d399"];

export default function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; x: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (!trigger) return;
    setPieces(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.3,
      }))
    );
    const t = setTimeout(() => setPieces([]), 1600);
    return () => clearTimeout(t);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{ left: `${p.x}%`, background: p.color, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  );
}
