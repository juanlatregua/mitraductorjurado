"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function VerifyButton({
  profileId,
  currentlyVerified,
}: {
  profileId: string;
  currentlyVerified: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        verified: !currentlyVerified,
      }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
        currentlyVerified
          ? "bg-navy-100 text-navy-600 hover:bg-navy-200"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      {loading
        ? "..."
        : currentlyVerified
        ? "Revocar"
        : "Verificar"}
    </button>
  );
}
