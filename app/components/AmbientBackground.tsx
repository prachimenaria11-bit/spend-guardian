"use client";
import { useEffect, useState } from "react";

export default function AmbientBackground() {
  const [hue, setHue] = useState(0);

  useEffect(() => {
    function handleClick() {
      setHue((h) => (h + 47) % 360);
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="ambient-bg" style={{ filter: `hue-rotate(${hue}deg)` }}>
      <div className="ambient-blob blob-a" />
      <div className="ambient-blob blob-b" />
      <div className="ambient-blob blob-c" />
    </div>
  );
}
