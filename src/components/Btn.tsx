import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const variants = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  outline: "border border-border bg-card text-foreground",
  ghost: "text-muted-foreground",
} as const;

type Variant = keyof typeof variants;

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity active:opacity-80 disabled:opacity-50";

export function Btn({
  variant = "primary",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button {...props} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function LinkBtn({
  variant = "primary",
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; children?: ReactNode }) {
  return (
    <Link {...props} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
