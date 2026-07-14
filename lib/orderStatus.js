export const ORDER_STATUSES = ["processing", "pending", "shipped", "completed", "cancelled"];
export const CANCELLABLE_STATUSES = ["pending", "processing"];

export const ORDER_STATUS_STYLES = {
  pending: "bg-warning/15 text-warning border-warning/30",
  processing: "bg-info/15 text-info border-info/30",
  shipped: "bg-brand-50 text-brand-600 border-brand-200",
  completed: "bg-success/15 text-success border-success/30",
  cancelled: "bg-danger/15 text-danger border-danger/30",
};
