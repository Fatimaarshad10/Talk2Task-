import { type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "outline" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-foreground text-white hover:opacity-90 active:opacity-80",
  secondary:
    "bg-accent text-[color:var(--color-accent-foreground)] hover:brightness-95 active:brightness-90",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-surface",
  ghost:
    "bg-transparent text-foreground hover:bg-surface",
};

export default function Button({ variant = "primary", className, ...props }: Props) {
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}
