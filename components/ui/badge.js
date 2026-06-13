import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors",
        variant === "secondary"
          ? "border-transparent bg-secondary text-secondary-foreground"
          : "border-transparent bg-primary text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
