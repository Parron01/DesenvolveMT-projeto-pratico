import React from 'react'

type Tone = 'success' | 'danger' | 'neutral'

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  const map: Record<Tone, string> = {
    success: 'bg-state-success/10 text-state-success border-state-success/30',
    danger: 'bg-state-danger/10 text-state-danger border-state-danger/30',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}>
      {children}
    </span>
  )
}
