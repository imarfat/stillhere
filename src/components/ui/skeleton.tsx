import { cn } from "@/lib/utils"

function Skeleton({
  className,
  tone = "light",
  ...props
}: React.ComponentProps<"div"> & { tone?: "light" | "dark" }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        tone === "dark" ? "skeleton-block-dark" : "skeleton-block",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
