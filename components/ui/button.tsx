"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-blue text-white hover:bg-blue-bright shadow-lg shadow-blue/20 hover:shadow-blue/30 hover:shadow-xl",
        secondary: "bg-white/[0.06] text-text-primary border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.12]",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-white/[0.06]",
        danger: "bg-red/10 text-red hover:bg-red/20 border border-red/20",
        success: "bg-green/10 text-green hover:bg-green/20 border border-green/20",
        outline: "border border-white/[0.08] text-text-primary hover:bg-white/[0.06]",
        link: "text-blue hover:text-blue-bright underline-offset-4 hover:underline",
        glow: "bg-blue text-white hover:bg-blue-bright shadow-lg shadow-blue/30 hover:shadow-blue/40 hover:shadow-xl animate-pulse-glow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
