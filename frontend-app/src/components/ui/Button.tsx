import React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'emerald' | 'destructive';
type ButtonSize = 'md' | 'sm' | 'icon';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-ink)] border-transparent hover:opacity-90 shadow-sm',
  secondary:
    'bg-[var(--surface-elevated)] text-[var(--ink)] border-[var(--border-hairline)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]',
  outline:
    'bg-transparent text-[var(--ink-secondary)] border-[var(--border-hairline)] hover:bg-[var(--surface-elevated)] hover:text-[var(--ink)]',
  ghost:
    'bg-transparent text-[var(--ink-muted)] border-transparent hover:bg-[var(--surface-elevated)] hover:text-[var(--ink)]',
  emerald:
    'bg-[var(--emerald-soft)] text-[var(--emerald)] border-[color:var(--emerald)]/30 hover:bg-[var(--emerald)] hover:text-white',
  destructive:
    'bg-[var(--rose)] text-white border-transparent hover:opacity-90',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-[40px] px-4 py-2 text-[13px]',
  sm: 'min-h-[34px] px-3 py-1.5 text-[12px]',
  icon: 'min-h-[40px] min-w-[40px] p-0',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bright)] disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap',
        VARIANTS[variant] || VARIANTS.secondary,
        SIZES[size] || SIZES.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
