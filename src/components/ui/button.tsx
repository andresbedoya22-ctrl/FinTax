import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] border text-sm font-medium tracking-[0.01em] transition duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary:
          "border-green/40 bg-gradient-to-b from-green/95 to-green/75 text-[#04120d] shadow-[0_10px_28px_rgba(54,182,119,0.28)] hover:border-green-hover/55 hover:from-green-hover hover:to-green",
        secondary:
          "border-border/70 bg-surface/80 text-text shadow-glass-soft hover:border-copper/35 hover:bg-surface2/90",
        ghost:
          "border-transparent bg-transparent text-secondary hover:border-border/40 hover:bg-white/5 hover:text-text",
        outline:
          "border-copper/35 bg-copper/5 text-text hover:border-copper/50 hover:bg-copper/10",
        danger:
          "border-error/40 bg-error/10 text-red-200 hover:bg-error/15",
      },
      size: {
        sm: "h-9 px-3.5",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-[0.95rem]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
