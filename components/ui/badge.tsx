import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-gray-50 text-text-secondary",
        blue: "border-blue/30 bg-blue/10 text-blue-bright",
        green: "border-green/30 bg-green/10 text-green",
        amber: "border-amber/30 bg-amber/10 text-amber",
        red: "border-red/30 bg-red/10 text-red",
        purple: "border-purple/30 bg-purple/10 text-purple",
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