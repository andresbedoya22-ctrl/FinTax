import * as React from "react";

import { cn } from "@/lib/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-card border border-border/50 bg-surface/75 backdrop-blur-md shadow-glass",
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
      <div ref={ref} className={cn("border-b border-border/50 px-6 py-5", className)} {...props} />
    );
  }
);

CardHeader.displayName = "CardHeader";

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("px-6 py-5", className)} {...props} />;
  }
);

CardBody.displayName = "CardBody";
