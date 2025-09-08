// #region Imports
import { useEffect, useRef, useState } from 'react'
import type { EstatisticaPessoaDTO, Sexo, StatusPessoa } from '../../models/PessoaDTO'
import { Search, RotateCcw, User, Users, Gauge, SlidersHorizontal } from 'lucide-react'
// #endregion

// #region Tipos/Props
export interface FiltersPanelProps {
  kpis: EstatisticaPessoaDTO
  filters: {
    nome?: string
    faixaIdadeInicial?: number
    faixaIdadeFinal?: number
    sexo?: Sexo
    status?: StatusPessoa
  }
  onFilter: (partial: Partial<FiltersPanelProps['filters']>) => void
  onReset: () => void
  onApply?: () => void
}
// #endregion

export function FiltersPanel({ kpis, filters, onFilter, onReset, onApply }: FiltersPanelProps) {
  // Quick age presets for a friendlier selection UX (now shown in a popover)
  const AGE_PRESETS: Array<{ label: string; min: number; max?: number }> = [
    { label: '0-12', min: 0, max: 12 },
    { label: '13-17', min: 13, max: 17 },
    { label: '18-29', min: 18, max: 29 },
    { label: '30-44', min: 30, max: 44 },
    { label: '45-59', min: 45, max: 59 },
    { label: '60+', min: 60 },
  ]
  const activeAgeIdx = AGE_PRESETS.findIndex(p =>
    filters.faixaIdadeInicial === p.min && (
      p.max === undefined ? filters.faixaIdadeFinal == null : filters.faixaIdadeFinal === p.max
    )
  )
  const applyAgePreset = (idx: number) => {
    const preset = AGE_PRESETS[idx]
    onFilter({ faixaIdadeInicial: preset.min, faixaIdadeFinal: preset.max })
  }
  const clearAges = () => onFilter({ faixaIdadeInicial: undefined, faixaIdadeFinal: undefined })
  const [ageOpen, setAgeOpen] = useState(false)
  const agePopoverRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ageOpen) return
      const el = agePopoverRef.current
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setAgeOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAgeOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [ageOpen])

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-white p-5 shadow-sm border-l-4 border-state-danger">
          <div className="text-sm text-neutral-600">Pessoas Desaparecidas</div>
          <div className="mt-2 text-3xl font-bold text-neutral-900">{kpis.quantPessoasDesaparecidas}</div>
          <div className="text-xs text-neutral-500 mt-1">Total de casos ativos</div>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm border-l-4 border-state-success">
          <div className="text-sm text-neutral-600">Pessoas Localizadas</div>
          <div className="mt-2 text-3xl font-bold text-neutral-900">{kpis.quantPessoasEncontradas}</div>
          <div className="text-xs text-neutral-500 mt-1">Total de casos resolvidos</div>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-neutral-200 p-4 md:p-5 mt-6">
        <h2 className="sr-only">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-neutral-700">Buscar por nome</label>
            <input
              className="mt-1 w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-shadow hover:shadow-sm"
              placeholder="Digite o nome da pessoa..."
              value={filters.nome ?? ''}
              onChange={e => onFilter({ nome: e.target.value })}
            />
          </div>
          <div className="relative">
            <label className="text-sm font-medium text-neutral-700">Faixa de idade</label>
            <div className="mt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setAgeOpen(v => !v)}
                className="inline-flex items-center gap-2 h-10 min-w-[13rem] px-4 rounded-md border border-neutral-300 text-sm font-medium text-neutral-800 bg-white shadow-sm hover:bg-neutral-50 hover:shadow transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
                aria-haspopup="dialog"
                aria-expanded={ageOpen}
              >
                <SlidersHorizontal className="h-4 w-4" /> Opções
              </button>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    className="w-full sm:w-[10ch] h-10 rounded-md border border-neutral-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent transition-shadow hover:shadow-sm text-center"
                    placeholder="Mín"
                    value={filters.faixaIdadeInicial ?? ''}
                    onChange={e => onFilter({ faixaIdadeInicial: e.target.value ? Number(e.target.value) : undefined })}
                  />
                  <span className="text-neutral-500 hidden sm:inline">até</span>
                  <span className="text-neutral-500 sm:hidden">até</span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    className="w-full sm:w-[10ch] h-10 rounded-md border border-neutral-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent transition-shadow hover:shadow-sm text-center"
                    placeholder="Máx"
                    value={filters.faixaIdadeFinal ?? ''}
                    onChange={e => onFilter({ faixaIdadeFinal: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>
            {ageOpen && (
              <div ref={agePopoverRef} className="absolute z-20 top-12 left-0 mt-2 w-[min(26rem,calc(100vw-2rem))] rounded-md border border-neutral-200 bg-white shadow-lg p-3 origin-top-left animate-[fadeIn_0.12s_ease-out]">
                <div className="text-xs text-neutral-500 mb-2">Selecione rapidamente uma faixa de idade</div>
                <div className="flex flex-wrap gap-2">
                  {AGE_PRESETS.map((p, idx) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyAgePreset(idx)}
                      className={`h-9 px-3 rounded-full border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer ${
                        activeAgeIdx === idx
                          ? 'bg-brand-primary text-white border-brand-primary shadow-sm hover:-translate-y-px'
                          : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50 hover:-translate-y-px'
                      }`}
                      aria-pressed={activeAgeIdx === idx}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clearAges}
                    className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-neutral-300 text-xs text-neutral-800 bg-white hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Limpar faixa
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgeOpen(false)}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-brand-primary text-white text-xs font-semibold shadow-sm hover:shadow-md hover:-translate-y-px transition-all focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Sexo</label>
            <select
              className="mt-1 w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent transition-shadow hover:shadow-sm"
              value={filters.sexo ?? ''}
              onChange={e => onFilter({ sexo: e.target.value ? (e.target.value as Sexo) : undefined })}
            >
              <option value="">Todos</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-neutral-700">Status</label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <button
                className={`h-10 md:h-11 rounded-md px-4 text-sm font-semibold transition-all transform focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer ${
                  filters.status === 'DESAPARECIDO'
                    ? 'bg-brand-primary text-white shadow-sm hover:-translate-y-px'
                    : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 hover:-translate-y-px'
                }`}
                onClick={() => onFilter({ status: 'DESAPARECIDO' })}
              >
                <Users className="inline-block mr-2 h-4 w-4" /> DESAPARECIDO
              </button>
              <button
                className={`h-10 md:h-11 rounded-md px-4 text-sm font-semibold transition-all transform focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer ${
                  filters.status === 'LOCALIZADO'
                    ? 'bg-brand-primary text-white shadow-sm hover:-translate-y-px'
                    : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 hover:-translate-y-px'
                }`}
                onClick={() => onFilter({ status: 'LOCALIZADO' })}
              >
                <User className="inline-block mr-2 h-4 w-4" /> LOCALIZADO
              </button>
              <button
                className={`h-10 md:h-11 rounded-md px-4 text-sm font-semibold transition-all transform focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer ${
                  !filters.status
                    ? 'bg-brand-primary text-white shadow-sm hover:-translate-y-px'
                    : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 hover:-translate-y-px'
                }`}
                onClick={() => onFilter({ status: undefined })}
              >
                <Gauge className="inline-block mr-2 h-4 w-4" /> TODOS
              </button>
            </div>
          </div>
      <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
            <div className="flex items-center gap-3">
              <button
        className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-primary px-7 text-base font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-px active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
              onClick={onApply}
            >
        <Search className="h-4 w-4" /> Buscar
            </button>
            <button
              onClick={onReset}
        className="inline-flex h-11 items-center gap-2 rounded-md border border-neutral-300 bg-white px-7 text-base font-semibold text-neutral-800 shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md hover:-translate-y-px active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
            >
        <RotateCcw className="h-4 w-4" /> Limpar filtros
            </button>
            </div>
            <span className="text-xs text-neutral-500 sm:ml-auto">Use os filtros para refinar sua busca por pessoas desaparecidas</span>
          </div>
        </div>
      </section>
    </>
  )
  // #endregion
}
