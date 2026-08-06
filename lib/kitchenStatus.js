// Bill.kitchenStatus is denormalized server-side from the linked Kot(s) (see
// kot.service.js#computeBillKitchenStatus in the backend) and comes back
// directly on GET pos/list — these are just the display labels/styles for it.

export const KITCHEN_STATUS_LABELS = {
  pending: "Not Started",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

export const KITCHEN_STATUS_STYLES = {
  pending: "bg-muted text-muted-foreground border-border",
  preparing:
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30",
  ready:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
  served:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30",
  cancelled:
    "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-500/15 dark:text-gray-400 dark:border-gray-500/30",
};
