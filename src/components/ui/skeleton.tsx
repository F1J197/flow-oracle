import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-bg-tile border border-glass-border terminal-panel", className)}
      {...props}
    />
  )
}

export { Skeleton }
