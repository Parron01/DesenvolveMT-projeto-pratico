import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../routes/axios'
import type { OcorrenciaInformacaoDTO, OcorrenciaDTO } from '../models/OcorrenciaDTO'
import type { PessoaDTO } from '../models/PessoaDTO'
import { Badge } from '../components/Badge'
import { toast } from 'react-toastify'
import { ArrowLeft, CalendarDays, MapPin, Image as ImageIcon, Info as InfoIcon, User as UserIcon, UploadCloud } from 'lucide-react'

function getStatus(oco?: OcorrenciaDTO) {
  return oco?.dataLocalizacao ? 'LOCALIZADO' as const : 'DESAPARECIDO' as const
}

function formatDateBR(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

function diffDays(start?: string, end?: string): number | null {
  if (!start || !end) return null
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null
  // Normalize to UTC midnight to avoid DST/timezone drifts
  const sUTC = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())
  const eUTC = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate())
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  const delta = Math.floor((eUTC - sUTC) / MS_PER_DAY)
  return Math.max(0, delta)
}

export default function PessoaDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const [pessoa, setPessoa] = useState<PessoaDTO | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [infos, setInfos] = useState<OcorrenciaInformacaoDTO[]>([])
  const [isLoadingInfos, setIsLoadingInfos] = useState(false)

  const status = useMemo(() => getStatus(pessoa?.ultimaOcorrencia), [pessoa])
  const tone = status === 'LOCALIZADO' ? 'success' : 'danger'

  // Tabs: 'pessoais' | 'local' | 'fotos' | 'informacoes'
  const [tab, setTab] = useState<'pessoais' | 'local' | 'fotos' | 'informacoes'>('pessoais')
  const tabs = useMemo(
    () => [
      { id: 'pessoais' as const, label: 'Pessoais', Icon: UserIcon },
      { id: 'local' as const, label: 'Local', Icon: MapPin },
      { id: 'fotos' as const, label: 'Fotos', Icon: ImageIcon },
      { id: 'informacoes' as const, label: 'Informações', Icon: InfoIcon },
    ],
    []
  )

  useEffect(() => {
    let isMounted = true
    async function load() {
      if (!id) return
      setIsLoadingDetail(true)
      setNotFound(false)
      try {
        const res = await api.get<PessoaDTO>(`/v1/pessoas/${id}`)
        if (!isMounted) return
        setPessoa(res.data)
      } catch (e: any) {
        if (!isMounted) return
        if (e?.response?.status === 404) {
          setNotFound(true)
        } else {
          toast.error('Erro ao carregar detalhe da pessoa')
        }
        setPessoa(null)
      } finally {
        if (isMounted) setIsLoadingDetail(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [id])

  useEffect(() => {
    let isMounted = true
    async function loadInfos(ocoId: number) {
      setIsLoadingInfos(true)
      try {
        const res = await api.get<OcorrenciaInformacaoDTO[]>(`/v1/ocorrencias/informacoes-desaparecido`, { params: { ocorrenciaId: ocoId } })
        if (!isMounted) return
        // Sort desc by date just in case
        const data = [...res.data].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))
        setInfos(data)
      } catch (e) {
        if (!isMounted) return
        // Silent failure with toast per guide
        toast.error('Erro ao carregar informações da ocorrência')
        setInfos([])
      } finally {
        if (isMounted) setIsLoadingInfos(false)
      }
    }
    const ocoId = pessoa?.ultimaOcorrencia?.ocoId
    if (ocoId) loadInfos(ocoId)
  }, [pessoa?.ultimaOcorrencia?.ocoId])

  if (notFound) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <header className="bg-white border-b border-neutral-200">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Link to="/" className="text-sm text-brand-primary hover:underline">← Voltar à lista</Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-lg border bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-neutral-900">Pessoa não encontrada</h2>
            <p className="text-sm text-neutral-600 mt-1">Verifique o endereço ou retorne à listagem.</p>
            <Link to="/" className="inline-block mt-4 rounded-md bg-brand-primary px-4 py-2 text-white text-sm">Voltar</Link>
          </div>
        </main>
      </div>
    )
  }

  const oco = pessoa?.ultimaOcorrencia

  return (
    <div className="min-h-screen bg-neutral-100">
    <header className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-brand-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Voltar à lista</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Cabeçalho do detalhe */}
  <section className="rounded-lg border border-neutral-200 bg-white p-5">
          {isLoadingDetail ? (
            <div className="animate-pulse">
              <div className="h-20 w-20 rounded-md bg-neutral-200" />
              <div className="mt-4 h-6 w-56 bg-neutral-200 rounded" />
              <div className="mt-2 h-4 w-80 bg-neutral-200 rounded" />
            </div>
          ) : pessoa ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 rounded-md bg-neutral-200 overflow-hidden flex-shrink-0">
                {pessoa.urlFoto ? (
                  <img src={pessoa.urlFoto} alt={`Foto de ${pessoa.nome}`} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-neutral-500 text-4xl">👤</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-semibold text-neutral-900 truncate">{pessoa.nome}</h1>
                    {/* Nome social não disponível no contrato atual */}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge tone={tone as any}>{status}</Badge>
                    {/* Insight: total de dias desaparecido (apenas quando localizado e com datas válidas) */}
                    {(() => {
                      const oco = pessoa.ultimaOcorrencia
                      const days = oco?.dataLocalizacao ? diffDays(oco?.dtDesaparecimento, oco?.dataLocalizacao) : null
                      if (days == null) return null
                      return (
                        <Badge tone="danger">{days === 1 ? 'Desaparecido por 1 dia' : `Desaparecido por ${days} dias`}</Badge>
                      )
                    })()}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-neutral-800">
                  <div>
                    <div className="text-neutral-500 inline-flex items-center gap-1"><UserIcon className="h-4 w-4" /> Idade/Sexo</div>
                    <div className="font-medium">{pessoa.idade != null ? `${pessoa.idade} anos` : 'Não informado'}{pessoa.sexo ? ` · ${pessoa.sexo === 'MASCULINO' ? 'Masculino' : 'Feminino'}` : ''}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> Localização</div>
                    <div className="font-medium">{oco?.localDesaparecimentoConcat || 'Não informado'}</div>
                  </div>
                  <div>
                    {/* Mostrar ambas as datas quando localizado; caso contrário, apenas desaparecimento */}
                    <div className="text-neutral-500 inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Data do desaparecimento</div>
                    <div className="font-medium">{formatDateBR(oco?.dtDesaparecimento) || 'Não informado'}</div>
                    {oco?.dataLocalizacao && (
                      <div className="mt-2">
                        <div className="text-neutral-500 inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Data da localização</div>
                        <div className="font-medium">{formatDateBR(oco.dataLocalizacao)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {/* CTA Enviar informação (wire up in future) */}
          <div className="mt-4 flex justify-center">
            <button className="inline-flex items-center gap-2 rounded-md bg-brand-primary text-white px-5 py-2.5 text-sm shadow-md transition hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" onClick={() => toast.info('Envio de informação será implementado em breve')}>
              <UploadCloud className="h-4 w-4" /> Enviar informação
            </button>
          </div>
        </section>

        {/* Abas */}
        <section>
          <div className="flex rounded-md overflow-hidden border border-neutral-200 bg-white">
            {tabs.map(({ id: tid, label, Icon }) => (
              <button
                key={tid}
                onClick={() => setTab(tid)}
                className={`flex-1 px-4 py-2 text-sm inline-flex items-center justify-center gap-2 transition ${tab === tid ? 'bg-neutral-100 text-neutral-900 border-b-2 border-brand-accent' : 'text-neutral-600 hover:bg-neutral-50'}`}
                disabled={tid === 'informacoes' && !oco?.ocoId}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {/* Conteúdo da aba */}
            {isLoadingDetail ? (
              <div className="rounded-lg border bg-white p-6 animate-pulse">
                <div className="h-4 w-48 bg-neutral-200 rounded" />
                <div className="mt-3 h-4 w-80 bg-neutral-200 rounded" />
                <div className="mt-3 h-4 w-64 bg-neutral-200 rounded" />
              </div>
            ) : tab === 'pessoais' ? (
        <div className="rounded-lg border bg-white p-6">
                <h3 className="text-lg font-semibold text-neutral-900">Informações Pessoais</h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
          <div className="text-neutral-500 inline-flex items-center gap-1"><UserIcon className="h-4 w-4" /> Idade</div>
          <div className="font-medium">{pessoa?.idade != null ? `${pessoa.idade} anos` : 'Não informado'}</div>
                  </div>
                  <div>
          <div className="text-neutral-500 inline-flex items-center gap-1"><UserIcon className="h-4 w-4" /> Sexo</div>
          <div className="font-medium">{pessoa?.sexo ? (pessoa.sexo === 'MASCULINO' ? 'Masculino' : 'Feminino') : 'Não informado'}</div>
                  </div>
                </div>
              </div>
            ) : tab === 'local' ? (
              <div className="rounded-lg border bg-white p-6">
        <h3 className="text-lg font-semibold text-neutral-900 inline-flex items-center gap-2"><MapPin className="h-5 w-5" /> Última vez vista</h3>
        <div className="mt-3 text-sm text-neutral-800">{oco?.localDesaparecimentoConcat || 'Não informado'}</div>
                {(oco?.ocorrenciaEntrevDesapDTO?.informacao || oco?.ocorrenciaEntrevDesapDTO?.vestimentasDesaparecido) && (
                  <div className="mt-4 space-y-2 text-sm">
                    {oco?.ocorrenciaEntrevDesapDTO?.informacao && (
                      <div>
            <div className="text-neutral-500 inline-flex items-center gap-1"><InfoIcon className="h-4 w-4" /> Informações adicionais</div>
            <div className="font-medium">{oco.ocorrenciaEntrevDesapDTO.informacao}</div>
                      </div>
                    )}
                    {oco?.ocorrenciaEntrevDesapDTO?.vestimentasDesaparecido && (
                      <div>
                        <div className="text-neutral-500 inline-flex items-center gap-1"><InfoIcon className="h-4 w-4" /> Vestimentas</div>
                        <div className="font-medium">{oco.ocorrenciaEntrevDesapDTO?.vestimentasDesaparecido}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : tab === 'fotos' ? (
              <div className="rounded-lg border bg-white p-6">
        <h3 className="text-lg font-semibold text-neutral-900 inline-flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Fotos e Cartazes</h3>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {/* Foto principal */}
                  {pessoa?.urlFoto && (
          <img src={pessoa.urlFoto} alt={`Foto de ${pessoa.nome}`} className="w-full h-40 object-cover rounded-md border ring-1 ring-neutral-200" loading="lazy" />
                  )}
                  {/* Cartazes */}
                  {oco?.listaCartaz?.length ? (
                    oco.listaCartaz.map((c, idx) => {
                      const isImg = c.tipoCartaz.includes('JPG') || c.tipoCartaz.includes('INSTA')
                      return isImg ? (
            <img key={idx} src={c.urlCartaz} alt={c.tipoCartaz} className="w-full h-40 object-cover rounded-md border ring-1 ring-neutral-200" loading="lazy" />
                      ) : (
            <a key={idx} href={c.urlCartaz} target="_blank" rel="noreferrer" className="h-40 border rounded-md grid place-items-center text-sm text-brand-primary hover:underline bg-neutral-50">
                          Abrir {c.tipoCartaz}
                        </a>
                      )
                    })
                  ) : null}
                </div>
                {!pessoa?.urlFoto && !oco?.listaCartaz?.length && (
          <p className="text-sm text-neutral-600">Sem fotos/cartazes</p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border bg-white p-6">
        <h3 className="text-lg font-semibold text-neutral-900 inline-flex items-center gap-2"><InfoIcon className="h-5 w-5" /> Informações enviadas</h3>
                {isLoadingInfos ? (
                  <p className="text-sm text-neutral-600 mt-2">Carregando…</p>
                ) : infos.length ? (
                  <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1" role="region" aria-label="Lista de informações enviadas">
                    <ul className="space-y-4">
                      {infos.map(info => (
                        <li key={info.id ?? `${info.ocoId}-${info.data}-${info.informacao.slice(0, 10)}`} className="rounded-md border p-4">
              <div className="text-xs text-neutral-500 inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDateBR(info.data)}</div>
              <div className="text-sm text-neutral-900 mt-1 whitespace-pre-wrap font-medium">{info.informacao}</div>
                          {info.anexos?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {info.anexos.map((a, idx) => (
                                <a key={idx} href={a} target="_blank" rel="noreferrer" className="text-xs text-brand-primary hover:underline">Anexo {idx + 1}</a>
                              ))}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600 mt-2">Ainda não há informações enviadas.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
