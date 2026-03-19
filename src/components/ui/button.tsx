import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] border text-sm font-semibold tracking-[0.01em] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out focus-ring active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] motion-reduce:transform-none motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary:
          "border-green/85 bg-green text-white shadow-glass-soft hover:border-green-hover hover:bg-green-hover",
        secondary:
          "border-border/90 bg-surface text-text hover:border-green/35 hover:bg-surface2/90",
        ghost:
          "border-transparent bg-transparent text-secondary hover:border-border/75 hover:bg-surface2/85 hover:text-text",
        outline:
          "border-green/55 bg-transparent text-green hover:border-green-hover hover:bg-green/5",
        danger:
          "border-error/45 bg-error text-white hover:opacity-90",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(classes, (children.props as { className?: string }).className),
      } as Record<string, unknown>);
    }

    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
