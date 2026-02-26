import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

const selectVariants = cva(
  "peer h-11 w-full appearance-none rounded-[var(--radius-md)] border border-border/70 bg-surface/70 px-4 pr-10 text-sm text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus-ring focus-visible:border-green/50 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      size: {
        sm: "h-9 px-3 pr-9 text-sm",
        md: "h-11",
        lg: "h-12 px-5 pr-11 text-[0.95rem]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {
  wrapperClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapperClassName, children, size, ...props }, ref) => {
    return (
      <div className={cn("relative", wrapperClassName)}>
        <select ref={ref} className={cn(selectVariants({ size }), className)} {...props}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition peer-focus:text-green" />
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select, selectVariants };
