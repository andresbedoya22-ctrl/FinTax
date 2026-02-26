import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/cn";

type PictogramName = "check" | "candado" | "documento" | "escudo";

const SOURCES: Record<PictogramName, string> = {
  check: "/visuals/icons/check.png",
  candado: "/visuals/icons/candado.png",
  documento: "/visuals/icons/documento.png",
  escudo: "/visuals/icons/escudo.png",
};

const DEFAULT_ALT: Record<PictogramName, string> = {
  check: "Verified",
  candado: "Secure",
  documento: "Document",
  escudo: "Shield",
};

export interface PictogramProps {
  name: PictogramName;
  size?: number;
  decorative?: boolean;
  alt?: string;
  className?: string;
}

export function Pictogram({
  name,
  size = 20,
  decorative = true,
  alt,
  className,
}: PictogramProps) {
  const resolvedAlt = decorative ? "" : (alt ?? DEFAULT_ALT[name]);

  return (
    <Image
      src={SOURCES[name]}
      alt={resolvedAlt}
      width={size}
      height={size}
      className={cn("inline-block shrink-0 align-[-0.125em] object-contain", className)}
      aria-hidden={decorative ? true : undefined}
    />
  );
}

