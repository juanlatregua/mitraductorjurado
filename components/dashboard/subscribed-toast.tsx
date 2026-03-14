"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function SubscribedToast() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("subscribed") === "true") {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 6000);
      window.history.replaceState({}, "", "/dashboard/translator");
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div
      style={{
        background: "rgba(74,138,90,0.1)",
        border: "1px solid rgba(74,138,90,0.3)",
        borderRadius: 8,
        padding: "14px 18px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#4A8A5A", fontSize: 18 }}>&#10003;</span>
        <span className="font-sans" style={{ fontSize: 14, color: "#1A3A2A", fontWeight: 500 }}>
          Suscripcion activada — bienvenido al Plan Fundador
        </span>
      </div>
      <button
        onClick={() => setShow(false)}
        style={{
          background: "none",
          border: "none",
          color: "#4A8A5A",
          cursor: "pointer",
          fontSize: 18,
          padding: "0 4px",
          lineHeight: 1,
        }}
      >
        &times;
      </button>
    </div>
  );
}
