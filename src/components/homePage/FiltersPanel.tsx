import type { EstatisticaPessoaDTO, Sexo, StatusPessoa } from '../../models/PessoaDTO'

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

export function FiltersPanel({ kpis, filters, onFilter, onReset, onApply }: FiltersPanelProps) {
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
              className="mt-1 w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              placeholder="Digite o nome da pessoa..."
              value={filters.nome ?? ''}
              onChange={e => onFilter({ nome: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Faixa de idade</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="Mín"
                value={filters.faixaIdadeInicial ?? ''}
                onChange={e => onFilter({ faixaIdadeInicial: e.target.value ? Number(e.target.value) : undefined })}
              />
              <span className="text-neutral-500">até</span>
              <input
                type="number"
                className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="Máx"
                value={filters.faixaIdadeFinal ?? ''}
                onChange={e => onFilter({ faixaIdadeFinal: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Sexo</label>
            <select
              className="mt-1 w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
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
                className={`h-10 rounded-md px-4 text-sm font-medium ${filters.status === 'DESAPARECIDO' ? 'bg-brand-primary text-white' : 'bg-neutral-200 text-neutral-900'}`}
                onClick={() => onFilter({ status: 'DESAPARECIDO' })}
              >
                DESAPARECIDO
              </button>
              <button
                className={`h-10 rounded-md px-4 text-sm font-medium ${filters.status === 'LOCALIZADO' ? 'bg-brand-primary text-white' : 'bg-neutral-200 text-neutral-900'}`}
                onClick={() => onFilter({ status: 'LOCALIZADO' })}
              >
                LOCALIZADO
              </button>
              <button
                className={`h-10 rounded-md px-4 text-sm font-medium ${!filters.status ? 'bg-brand-primary text-white' : 'bg-neutral-200 text-neutral-900'}`}
                onClick={() => onFilter({ status: undefined })}
              >
                TODOS
              </button>
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-3 mt-2">
            <button
              className="inline-flex h-10 items-center rounded-md bg-brand-primary px-4 text-sm font-medium text-white"
              onClick={onApply}
            >
              Buscar
            </button>
            <button onClick={onReset} className="text-sm text-neutral-600 hover:underline">
              Limpar filtros
            </button>
            <span className="ml-auto text-xs text-neutral-500">Use os filtros para refinar sua busca por pessoas desaparecidas</span>
          </div>
        </div>
      </section>
    </>
  )
}
