import React from "react";

interface DrugleProps {
  className?: string;
}

export function Drugle({ className = "" }: DrugleProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-black uppercase tracking-wide ${className}`}
    >
      <span aria-label="pill" role="img">
        💊
      </span>
      <span className="inline-flex items-baseline leading-none">
        <span className="text-amber-600 dark:text-amber-400">DRUG</span>
        <span className="text-slate-900 dark:text-slate-100">LE</span>
      </span>
      <span aria-label="globe" role="img">
        💉
      </span>
    </span>
  );
}
