import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface BentoCardProps {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
}

/** Aceternity-inspired Bento surface card with crisp hairline border and pointer spotlight glow. */
export function BentoCard({ className, onClick, children }: BentoCardProps) {
  const [spot, setSpot] = useState({ x: -200, y: -200, active: false });

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseMove={handleMove}
        onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
        className={cn(
          'group relative overflow-hidden rounded-xl border bg-[var(--surface)] p-4 text-left shadow-apple transition-all duration-150 hover:border-[var(--border-strong)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bright)]',
          className
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: spot.active ? 1 : 0,
            background: `radial-gradient(240px circle at ${spot.x}px ${spot.y}px, var(--spotlight), transparent 70%)`,
          }}
        />
        <div className="relative z-10 h-full">{children}</div>
      </button>
    );
  }

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-[var(--surface)] p-4 text-left shadow-apple transition-all duration-150 hover:border-[var(--border-strong)]',
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(240px circle at ${spot.x}px ${spot.y}px, var(--spotlight), transparent 70%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
