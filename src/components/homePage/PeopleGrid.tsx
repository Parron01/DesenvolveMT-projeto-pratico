import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PessoaDTO } from '../../models/PessoaDTO'
import { CardPessoa } from './CardPessoa'

export interface PeopleGridProps {
  items: PessoaDTO[]
  totalElements: number
  totalPages: number
  page: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function PeopleGrid({ items, totalElements, totalPages, page, onPageChange, isLoading }: PeopleGridProps) {
  const navigate = useNavigate()
  const windowPages = useMemo(() => {
    const WINDOW = 7
    if (!totalPages || totalPages <= 0) return [] as number[]
    if (totalPages <= WINDOW) return Array.from({ length: totalPages }, (_, i) => i)
    const half = Math.floor(WINDOW / 2)
    let start = page - half
    if (start < 0) start = 0
    let end = start + WINDOW
    if (end > totalPages) {
      end = totalPages
      start = Math.max(0, end - WINDOW)
    }
    return Array.from({ length: end - start }, (_, i) => start + i)
  }, [page, totalPages])
  return (
    <>
      <p className="text-sm text-neutral-600">{totalElements} pessoas encontradas</p>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {items.map(p => (
              <CardPessoa key={p.id} pessoa={p} onClick={() => navigate(`/pessoas/${p.id}`)} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-1 mt-6" aria-label="Paginação">
              {/* First */}
              <button
                className="px-2 py-1 text-sm rounded border border-neutral-300 disabled:opacity-50"
                disabled={page === 0}
                onClick={() => onPageChange(0)}
                aria-label="Primeira página"
                title="Primeira página"
              >
                «
              </button>
              {/* Prev */}
              <button
                className="px-2 py-1 text-sm rounded border border-neutral-300 disabled:opacity-50"
                disabled={page === 0}
                onClick={() => onPageChange(Math.max(0, page - 1))}
                aria-label="Página anterior"
                title="Página anterior"
              >
                ‹
              </button>
              {/* Windowed pages */}
              {windowPages.map(pn => (
                <button
                  key={pn}
                  className={`px-3 py-1 text-sm rounded border ${pn === page ? 'bg-brand-primary text-white border-brand-primary' : 'border-neutral-300 hover:border-brand-primary/60'}`}
                  onClick={() => onPageChange(pn)}
                  aria-current={pn === page ? 'page' : undefined}
                >
                  {pn + 1}
                </button>
              ))}
              {/* Next */}
              <button
                className="px-2 py-1 text-sm rounded border border-neutral-300 disabled:opacity-50"
                disabled={page === totalPages - 1}
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                aria-label="Próxima página"
                title="Próxima página"
              >
                ›
              </button>
              {/* Last */}
              <button
                className="px-2 py-1 text-sm rounded border border-neutral-300 disabled:opacity-50"
                disabled={page === totalPages - 1}
                onClick={() => onPageChange(totalPages - 1)}
                aria-label="Última página"
                title="Última página"
              >
                »
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-neutral-800">Nenhum resultado encontrado</h3>
          <p className="text-sm text-neutral-500 mt-1">Ajuste os filtros e tente novamente.</p>
        </div>
      )}
    </>
  )
}
