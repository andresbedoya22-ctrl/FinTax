import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

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
    const normalizedVariant = variant === "danger" ? "danger" : variant;
    const classes = cn(
      buttonVariants({ variant: normalizedVariant }),
      "active:translate-y-px",
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
