"use client";

import { useState } from "react";

const STATUSES = [
  { value: "available", label: "Disponible", color: "bg-green-500" },
  { value: "busy", label: "Ocupado", color: "bg-amber-500" },
  { value: "vacation", label: "Vacaciones", color: "bg-navy-400" },
] as const;

export function AvailabilityToggle({
  initialStatus,
}: {
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);

  async function handleChange(newStatus: string) {
    setStatus(newStatus);
    await fetch("/api/translator/availability-status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  return (
    <div className="flex gap-2">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => handleChange(s.value)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            status === s.value
              ? "bg-navy-900 text-white"
              : "bg-navy-100 text-navy-600 hover:bg-navy-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${s.color}`} />
          {s.label}
        </button>
      ))}
    </div>
  );
}
