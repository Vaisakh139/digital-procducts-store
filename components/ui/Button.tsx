import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "md" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:brightness-110",
  secondary:
    "bg-surface text-foreground border border-border-subtle hover:bg-surface-muted",
  outline:
    "border border-border-subtle text-foreground hover:bg-surface-muted",
  ghost: "text-foreground hover:bg-surface-muted",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  icon,
  ...rest
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 active:scale-95",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:opacity-50 disabled:pointer-events-none",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(" ");

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
        {icon}
      </Link>
    );
  }

  const { href: _unusedHref, ...buttonProps } = rest;
  void _unusedHref;

  return (
    <button className={classes} {...buttonProps}>
      {children}
      {icon}
    </button>
  );
}
