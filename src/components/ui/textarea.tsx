import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const textareaVariants = cva(
  "min-h-[120px] w-full rounded-[var(--radius-md)] border border-border/70 bg-surface/70 px-4 py-3 text-sm text-text placeholder:text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus-ring focus-visible:border-green/50 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        both: "resize",
      },
    },
    defaultVariants: {
      resize: "vertical",
    },
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, resize, ...props }, ref) => {
  return <textarea ref={ref} className={cn(textareaVariants({ resize }), className)} {...props} />;
});
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
