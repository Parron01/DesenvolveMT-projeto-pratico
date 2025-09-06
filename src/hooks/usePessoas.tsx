import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../routes/axios'
import { toast } from 'react-toastify'
import type { PessoaDTO, EstatisticaPessoaDTO, PagePessoaDTO, FiltrosLista } from '../models/PessoaDTO'

// #region Context + Provider (inlined in hook)
interface PeopleContextValue {
  dataset: PessoaDTO[]
  kpis: EstatisticaPessoaDTO | null
  isLoading: boolean
  pageMeta: Pick<PagePessoaDTO, 'totalPages' | 'totalElements' | 'number' | 'size'> | null
  reload: (params?: Partial<FiltrosLista>) => Promise<void>
}

const PeopleContext = createContext<PeopleContextValue | undefined>(undefined)

export function PeopleProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = useState<PessoaDTO[]>([])
  const [kpis, setKpis] = useState<EstatisticaPessoaDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageMeta, setPageMeta] = useState<Pick<PagePessoaDTO, 'totalPages' | 'totalElements' | 'number' | 'size'> | null>(null)
  const lastParamsRef = useRef<Partial<FiltrosLista> | null>(null)

  const reload = useCallback(async (params?: Partial<FiltrosLista>) => {
    setIsLoading(true)
    try {
      // merge defaults + last + new
      const merged: Partial<FiltrosLista> = {
        pagina: 0,
        porPagina: 10,
        status: 'DESAPARECIDO',
        ...(lastParamsRef.current ?? {}),
        ...(params ?? {}),
      }
      lastParamsRef.current = merged

      // Build query params for API, omitting empty values
      const queryParams: Record<string, any> = {
        pagina: merged.pagina,
        porPagina: merged.porPagina,
      }
      if (merged.nome?.trim()) queryParams.nome = merged.nome.trim()
      if (merged.faixaIdadeInicial !== undefined) queryParams.faixaIdadeInicial = merged.faixaIdadeInicial
      if (merged.faixaIdadeFinal !== undefined) queryParams.faixaIdadeFinal = merged.faixaIdadeFinal
      if (merged.sexo) queryParams.sexo = merged.sexo
      if (merged.status) queryParams.status = merged.status

      const kpisRes = await api.get<EstatisticaPessoaDTO>('/v1/pessoas/aberto/estatistico')
      console.log('KPIs:', kpisRes.data)
      setKpis(kpisRes.data)

      const pessoasRes = await api.get<PagePessoaDTO>('/v1/pessoas/aberto/filtro', { params: queryParams })
      console.log('Pessoas:', pessoasRes.data)
      setDataset(pessoasRes.data.content)
      setPageMeta({
        totalPages: pessoasRes.data.totalPages,
        totalElements: pessoasRes.data.totalElements,
        number: pessoasRes.data.number,
        size: pessoasRes.data.size,
      })
    } catch (e: any) {
      console.error('Erro na API:', e)
      // Treat 404 as empty results, not error
      if (e.response?.status === 404) {
        setDataset([])
        setPageMeta({
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size: 10,
        })
      } else {
        toast.error(e?.response?.data?.message || 'Erro ao carregar dados')
        setKpis(null)
        setDataset([])
        setPageMeta(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const value: PeopleContextValue = { dataset, kpis, isLoading, pageMeta, reload }
  return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>
}

function usePeopleContext() {
  const ctx = useContext(PeopleContext)
  if (!ctx) throw new Error('usePeopleContext must be used within PeopleProvider')
  return ctx
}
// #endregion

// #region Hook (data-only)
export function usePessoas() {
  const { dataset, kpis, isLoading, pageMeta, reload } = usePeopleContext()
  const people: PessoaDTO[] = useMemo(() => dataset, [dataset])
  const kpisData: EstatisticaPessoaDTO = useMemo(() => {
    if (kpis) return kpis
    let encontrados = 0
    let desaparecidos = 0
    for (const p of dataset) {
      if (p.ultimaOcorrencia?.dataLocalizacao) encontrados++
      else desaparecidos++
    }
    return { quantPessoasDesaparecidas: desaparecidos, quantPessoasEncontradas: encontrados }
  }, [dataset, kpis])
  return { people, isLoading, reload, kpis: kpisData, pageMeta }
}
// #endregion
