import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-elevated text-text-secondary",
        blue: "border-blue/20 bg-blue/10 text-blue-bright",
        green: "border-green/20 bg-green/10 text-green",
        amber: "border-amber/20 bg-amber/10 text-amber",
        red: "border-red/20 bg-red/10 text-red",
        purple: "border-purple/20 bg-purple/10 text-purple",
        cyan: "border-cyan/20 bg-cyan/10 text-cyan",
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
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
