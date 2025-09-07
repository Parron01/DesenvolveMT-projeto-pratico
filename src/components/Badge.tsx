// #region Imports
import React from 'react'
// #endregion

// #region Tipos/Props
type Tone = 'success' | 'danger' | 'neutral'
// #endregion

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  // #region Constantes
  const map: Record<Tone, string> = {
    success: 'bg-state-success/10 text-state-success border-state-success/30',
    danger: 'bg-state-danger/10 text-state-danger border-state-danger/30',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  }
  // #endregion

  // #region Render (JSX)
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}>
      {children}
    </span>
  )
  // #endregion
}
