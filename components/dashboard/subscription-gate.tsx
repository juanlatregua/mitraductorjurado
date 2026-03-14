"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const GATED_ROUTES = [
  "/dashboard/translator/editor",
  "/dashboard/translator/orders",
  "/dashboard/translator/invoices",
  "/dashboard/translator/payments",
  "/dashboard/translator/colleagues",
  "/dashboard/translator/widget",
  "/dashboard/translator/leads",
];

interface Props {
  subscribed: boolean;
  children: React.ReactNode;
}

export function SubscriptionGate({ subscribed, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isGated = GATED_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (isGated && !subscribed) {
      router.replace("/dashboard/translator/subscribe");
    }
  }, [isGated, subscribed, router]);

  if (isGated && !subscribed) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid #E8E2D8",
            borderTopColor: "#C9882A",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p className="font-sans" style={{ color: "#888", fontSize: 13 }}>
          Redirigiendo...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
