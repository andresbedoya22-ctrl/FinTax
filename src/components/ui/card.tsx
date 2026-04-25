import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const cardVariants = cva("rounded-[var(--radius-xl)] border text-text", {
  variants: {
    variant: {
      panel: "surface-panel",
      soft: "surface-panel-soft",
      outline: "bg-transparent border-border/85",
      dark: "border-white/10 bg-white/[0.045] text-white shadow-[0_22px_56px_rgba(0,0,0,0.18)]",
      darkSoft: "border-white/[0.12] bg-white/[0.075] text-white shadow-[0_18px_44px_rgba(0,0,0,0.14)]",
      premiumLight: "border-white/70 bg-white text-[#102033] shadow-[0_28px_70px_rgba(0,0,0,0.16)]",
      glass: "border-white/10 bg-[#0B2340]/80 text-white shadow-[0_22px_56px_rgba(0,0,0,0.16)] backdrop-blur",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "panel",
    padding: "md",
  },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, padding, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />,
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-body text-xl font-semibold tracking-normal text-text", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm leading-6 text-secondary", className)} {...props} />,
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-6 flex items-center justify-between gap-3", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
