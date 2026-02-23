import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-green bg-green text-bg shadow-glass-soft hover:border-green-hover hover:bg-green-hover",
  secondary: "border-border bg-transparent text-text hover:bg-surface hover:text-text",
  ghost: "border-transparent bg-transparent text-secondary hover:bg-surface2 hover:text-text",
  danger: "border-error bg-error text-white hover:bg-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      "disabled:pointer-events-none disabled:opacity-60",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(classes, (children.props as { className?: string }).className),
        "aria-busy": loading || undefined,
      } as Record<string, unknown>);
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon && <span aria-hidden="true">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
      </button>
    );
  }
);

Button.displayName = "Button";
