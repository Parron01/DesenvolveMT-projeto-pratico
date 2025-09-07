// #region Imports
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePessoas } from '../hooks/usePessoas'
import type { FiltrosLista, StatusPessoa } from '../models/PessoaDTO'
import { FiltersPanel } from '../components/homePage/FiltersPanel'
import { PeopleGrid } from '../components/homePage/PeopleGrid'
// #endregion

// #region Tipos/Props
type LocalFilters = Pick<FiltrosLista, 'nome' | 'faixaIdadeInicial' | 'faixaIdadeFinal' | 'sexo' | 'status'> & { pagina: number }
// #endregion

export function HomePage() {
  // #region Estado
  const [filters, setFilters] = useState<LocalFilters>({
    nome: '',
    faixaIdadeInicial: undefined,
    faixaIdadeFinal: undefined,
    sexo: undefined,
    status: undefined,
    pagina: 0,
  })
  // #endregion

  // #region Hooks
  const { people, isLoading: isLoadingList, kpis, pageMeta, reload } = usePessoas()
  const [searchParams, setSearchParams] = useSearchParams()
  // #endregion

  // #region Efeitos
  // Load filters from URL on mount and observe changes
  useEffect(() => {
    const nome = searchParams.get('nome') || ''
    const faixaIdadeInicial = searchParams.get('faixaIdadeInicial') ? Number(searchParams.get('faixaIdadeInicial')) : undefined
    const faixaIdadeFinal = searchParams.get('faixaIdadeFinal') ? Number(searchParams.get('faixaIdadeFinal')) : undefined
    const sexo = searchParams.get('sexo') as 'MASCULINO' | 'FEMININO' | undefined
    const status = searchParams.get('status') as StatusPessoa | undefined
    const pagina = searchParams.get('pagina') ? Number(searchParams.get('pagina')) : 0

    setFilters({ nome, faixaIdadeInicial, faixaIdadeFinal, sexo, status, pagina })

    // Trigger reload with URL params
    reload({
      nome: nome || undefined,
      faixaIdadeInicial,
      faixaIdadeFinal,
      sexo,
      status,
      pagina,
      porPagina: POR_PAGINA,
    })
  }, [searchParams, reload])
  // #endregion

  // #region Handlers/Callbacks
  const onFilter = (partial: Partial<LocalFilters>) => {
    setFilters(prev => ({ ...prev, ...partial }))
  }

  const onApply = () => {
    const params = new URLSearchParams()
    if (filters.nome) params.set('nome', filters.nome)
    if (filters.faixaIdadeInicial !== undefined) params.set('faixaIdadeInicial', filters.faixaIdadeInicial.toString())
    if (filters.faixaIdadeFinal !== undefined) params.set('faixaIdadeFinal', filters.faixaIdadeFinal.toString())
    if (filters.sexo) params.set('sexo', filters.sexo)
    if (filters.status) params.set('status', filters.status)
    params.set('pagina', '0') // Reset to first page on apply
    setSearchParams(params)
  }

  const onPageChange = (pageNum: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('pagina', pageNum.toString())
    setSearchParams(params)
  }

  const resetFilters = () => {
    setFilters({ nome: '', faixaIdadeInicial: undefined, faixaIdadeFinal: undefined, sexo: undefined, status: undefined, pagina: 0 })
    setSearchParams(new URLSearchParams())
  }
  // #endregion

  // #region Constantes
  const POR_PAGINA = 10
  // #endregion

  // #region Derivações/Memos
  const currentItems = people
  const currentPageNumber = pageMeta?.number ?? filters.pagina
  const totalPages = pageMeta?.totalPages ?? 1
  const totalElements = pageMeta?.totalElements ?? currentItems.length
  // #endregion

  // #region Render (JSX)
  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-neutral-900 text-white grid place-items-center text-sm font-bold">MT</div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">Pessoas Desaparecidas</h1>
              <p className="text-xs text-neutral-500">Procuradoria de Justiça Criminal - Mato Grosso</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <FiltersPanel
          kpis={kpis}
          filters={{ nome: filters.nome, faixaIdadeInicial: filters.faixaIdadeInicial, faixaIdadeFinal: filters.faixaIdadeFinal, sexo: filters.sexo, status: filters.status }}
          onFilter={onFilter}
          onReset={resetFilters}
          onApply={onApply}
        />
        <PeopleGrid
          items={currentItems}
          totalElements={totalElements}
          totalPages={totalPages}
          page={currentPageNumber}
          onPageChange={onPageChange}
          isLoading={isLoadingList}
        />
      </main>
    </div>
  )
  // #endregion
}
