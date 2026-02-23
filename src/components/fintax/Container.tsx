import * as React from "react";

import { cn } from "@/lib/cn";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:max-w-[1240px]", className)}
      {...props}
    />
  );
}
