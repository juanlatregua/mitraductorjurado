import { STATUS_LABELS, STATUS_COLORS } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
