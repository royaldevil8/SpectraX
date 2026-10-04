import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
}: ButtonProps) {
  const variants = {
    primary:
      'bg-accent-cyan text-bg-base font-semibold hover:bg-cyan-300 active:bg-cyan-400 disabled:opacity-40',
    secondary:
      'bg-bg-elevated text-text-primary border border-border hover:border-accent-cyan/50 hover:bg-bg-hover disabled:opacity-40',
    ghost:
      'text-text-secondary hover:text-text-primary hover:bg-bg-hover disabled:opacity-40',
    danger:
      'bg-danger text-white font-semibold hover:bg-danger-dim disabled:opacity-40',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-5 text-sm gap-2',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 select-none',
        'focus:outline-none focus:ring-1 focus:ring-accent-cyan/40',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
