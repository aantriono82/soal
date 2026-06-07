import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground", className)} {...props} />;
}
