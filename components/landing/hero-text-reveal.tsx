"use client";

import { useEffect, useState } from "react";

interface HeroTextRevealProps {
  text: string;
  highlightWord?: string;
  className?: string;
}

export function HeroTextReveal({
  text,
  highlightWord,
  className = "",
}: HeroTextRevealProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const words = text.split(" ");

  return (
    <h1 className={className}>
      {words.map((word, i) => {
        const isHighlight = highlightWord && word.replace(/[.,!?]/g, "") === highlightWord;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.3em",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.5s ease ${i * 120}ms, transform 0.5s ease ${i * 120}ms`,
            }}
          >
            {isHighlight ? (
              <em className="text-gradient" style={{ fontStyle: "italic" }}>{word}</em>
            ) : (
              word
            )}
          </span>
        );
      })}
    </h1>
  );
}
