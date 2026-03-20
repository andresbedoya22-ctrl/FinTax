import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const inputVariants = cva(
  "w-full rounded-[var(--radius-md)] border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-muted transition focus-ring focus-visible:border-green/70 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11",
        lg: "h-12 px-5 text-[0.95rem]",
      },
      tone: {
        default: "border-border/90",
        subtle: "border-border/75 bg-surface2/70",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, size, tone, ...props }, ref) => {
  return <input ref={ref} className={cn(inputVariants({ size, tone }), className)} {...props} />;
});
Input.displayName = "Input";

export { Input, inputVariants };
