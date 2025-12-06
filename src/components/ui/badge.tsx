import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent-cyan/20 text-accent-cyan",
        secondary:
          "border-transparent bg-background-tertiary text-foreground-secondary",
        destructive:
          "border-transparent bg-accent-danger/20 text-accent-danger",
        success:
          "border-transparent bg-accent-success/20 text-accent-success",
        warning:
          "border-transparent bg-accent-warning/20 text-accent-warning",
        info:
          "border-transparent bg-accent-info/20 text-accent-info",
        outline: 
          "border-border text-foreground-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
