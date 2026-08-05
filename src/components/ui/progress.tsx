import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "go" | "revise" | "stop";
}

function Progress({ className, value, max = 100, variant = "default", ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          variant === "go" && "bg-go",
          variant === "revise" && "bg-revise",
          variant === "stop" && "bg-stop",
          variant === "default" && "bg-primary"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };