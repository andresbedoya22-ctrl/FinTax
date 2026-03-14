import * as React from "react";

import { cn } from "@/lib/cn";
import { Card as UiCard, CardContent } from "@/components/ui";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <UiCard
      ref={ref}
      className={cn(
        "rounded-[var(--radius-xl)]",
        className
      )}
      {...props}
    />
  );
});

Card.displayName = "Card";

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("border-b border-border/40 px-5 py-4 sm:px-6 sm:py-5", className)} {...props} />
    );
  }
);

CardHeader.displayName = "CardHeader";

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
      ({ className, ...props }, ref) => {
    return <CardContent ref={ref} className={cn("px-5 py-4 sm:px-6 sm:py-5", className)} {...props} />;
  }
);

CardBody.displayName = "CardBody";
