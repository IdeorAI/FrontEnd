"use client";

import * as React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface ThemeAwareLogoProps {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}

/**
 * Logo que troca automaticamente conforme o tema (light/dark).
 * Light theme → /assets/ideorLogo.png
 * Dark theme  → /assets/logo_branco.png
 */
export function ThemeAwareLogo({
  width,
  height,
  className,
  priority,
  alt = "IDEOR Logo",
}: ThemeAwareLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const src =
    mounted && resolvedTheme === "light"
      ? "/assets/ideorLogo.png"
      : "/assets/logo_branco.png";

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
