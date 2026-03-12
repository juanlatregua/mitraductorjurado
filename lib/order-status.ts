import type { OrderStatus } from "@prisma/client";

// Transiciones de estado permitidas y quién puede ejecutarlas
export const STATUS_TRANSITIONS: Record<
  OrderStatus,
  { next: OrderStatus[]; allowedRoles: string[] }
> = {
  pending: {
    next: ["quoted", "cancelled"],
    allowedRoles: ["translator", "admin"],
  },
  quoted: {
    next: ["accepted", "cancelled"],
    allowedRoles: ["client", "admin"],
  },
  accepted: {
    next: ["in_progress", "cancelled"],
    allowedRoles: ["translator", "admin"],
  },
  in_progress: {
    next: ["delivered", "cancelled"],
    allowedRoles: ["translator", "admin"],
  },
  delivered: {
    next: ["closed"],
    allowedRoles: ["client", "admin"],
  },
  closed: {
    next: [],
    allowedRoles: [],
  },
  cancelled: {
    next: [],
    allowedRoles: [],
  },
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  quoted: "Presupuestado",
  accepted: "Aceptado",
  in_progress: "En curso",
  delivered: "Entregado",
  closed: "Cerrado",
  cancelled: "Cancelado",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  quoted: "bg-blue-100 text-blue-700",
  accepted: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  closed: "bg-navy-100 text-navy-600",
  cancelled: "bg-red-100 text-red-700",
};

export function canTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  userRole: string
): boolean {
  const transition = STATUS_TRANSITIONS[currentStatus];
  return (
    transition.next.includes(newStatus) &&
    transition.allowedRoles.includes(userRole)
  );
}
