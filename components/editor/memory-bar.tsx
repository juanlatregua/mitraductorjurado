"use client";

interface Props {
  identicalCount: number;
  similarCount: number;
  glossaryCount: number;
}

export function MemoryBar({ identicalCount, similarCount, glossaryCount }: Props) {
  const total = identicalCount + similarCount + glossaryCount;

  if (total === 0) return null;

  return (
    <div
      className="font-mono"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "5px 16px",
        background: "#243D2E",
        fontSize: 8,
        color: "#6A9A7A",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="6" cy="6" r="5" stroke="#6A9A7A" strokeWidth="1" />
        <path d="M4 6L5.5 7.5L8 4.5" stroke="#6A9A7A" strokeWidth="1" />
      </svg>
      {identicalCount > 0 && <span>{identicalCount} coincidencias exactas</span>}
      {similarCount > 0 && <span>{similarCount} similares</span>}
      {glossaryCount > 0 && <span>{glossaryCount} glosario</span>}
    </div>
  );
}
