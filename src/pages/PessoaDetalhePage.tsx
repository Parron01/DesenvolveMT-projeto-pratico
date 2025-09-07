import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../routes/axios'
import type { OcorrenciaInformacaoDTO, OcorrenciaDTO } from '../models/OcorrenciaDTO'
import type { PessoaDTO } from '../models/PessoaDTO'
import { Badge } from '../components/Badge'
import { toast } from 'react-toastify'
import { ArrowLeft, CalendarDays, MapPin, Image as ImageIcon, Info as InfoIcon, User as UserIcon, UploadCloud, Eye, ArrowRight, FileText } from 'lucide-react'

function getStatus(oco?: OcorrenciaDTO) {
  return oco?.dataLocalizacao ? 'LOCALIZADO' as const : 'DESAPARECIDO' as const
}

function formatDateBR(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

function isPdf(url: string): boolean {
  return url.toLowerCase().includes('.pdf')
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

  // Estados para modal de imagem e destaque
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [highlightedInfoId, setHighlightedInfoId] = useState<number | null>(null)
  const [highlightedImageUrl, setHighlightedImageUrl] = useState<string | null>(null)
  const infoRefs = useRef<Record<number, HTMLLIElement | null>>({})
  const imageRefs = useRef<Record<string, HTMLDivElement | null>>({})

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

  // Limpar destaque após 5 segundos
  useEffect(() => {
    if (highlightedInfoId) {
      const timer = setTimeout(() => setHighlightedInfoId(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [highlightedInfoId])

  // Limpar destaque da imagem após 5 segundos
  useEffect(() => {
    if (highlightedImageUrl) {
      const timer = setTimeout(() => setHighlightedImageUrl(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [highlightedImageUrl])

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
                    {/* Insight: total de dias desaparecido (para localizados: até a data de localização; para desaparecidos: até hoje) */}
                    {(() => {
                      const oco = pessoa.ultimaOcorrencia
                      if (!oco?.dtDesaparecimento) return null
                      const endRef = oco.dataLocalizacao ?? new Date().toISOString()
                      const days = diffDays(oco.dtDesaparecimento, endRef)
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
        <h3 className="text-lg font-semibold text-neutral-900 inline-flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Fotos</h3>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {infos.flatMap(info => (info.anexos || []).map(anexo => ({ url: anexo, info }))).map(({ url, info }, idx) => (
                    <div
                      key={idx}
                      ref={el => { imageRefs.current[url] = el }}
                      className={`relative group rounded-md overflow-hidden ${highlightedImageUrl === url ? 'ring-4 ring-brand-accent animate-pulse shadow-lg' : ''}`}
                    >
                      {isPdf(url) ? (
                        <div className="w-full h-40 bg-neutral-100 border flex items-center justify-center">
                          <FileText className="h-12 w-12 text-neutral-500" />
                        </div>
                      ) : (
                        <img src={url} alt={`Anexo ${idx + 1}`} className="w-full h-40 object-cover" loading="lazy" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedImageUrl(url)}
                          className="p-2 bg-white/80 rounded-full hover:bg-white transition"
                          title="Visualizar"
                        >
                          <Eye className="h-5 w-5 text-neutral-900" />
                        </button>
                        <button
                          onClick={() => {
                            setTab('informacoes')
                            setHighlightedInfoId(info.id ?? 0)
                            setTimeout(() => {
                              const el = infoRefs.current[info.id ?? 0]
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 100)
                          }}
                          className="p-2 bg-white/80 rounded-full hover:bg-white transition"
                          title="Ver informação relacionada"
                        >
                          <ArrowRight className="h-5 w-5 text-neutral-900" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {infos.flatMap(info => info.anexos || []).length === 0 && (
          <p className="text-sm text-neutral-600">Sem fotos</p>
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
                        <li
                          key={info.id ?? `${info.ocoId}-${info.data}-${info.informacao.slice(0, 10)}`}
                          ref={el => { if (info.id) infoRefs.current[info.id] = el }}
                          className={`rounded-md border p-4 transition-all duration-500 ${highlightedInfoId === info.id ? 'bg-blue-50 shadow-lg ring-2 ring-blue-300 animate-pulse' : ''}`}
                        >
              <div className="text-xs text-neutral-500 inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDateBR(info.data)}</div>
              <div className="text-sm text-neutral-900 mt-1 whitespace-pre-wrap font-medium">{info.informacao}</div>
                          {info.anexos?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {info.anexos.map((anexo, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setTab('fotos')
                                    setHighlightedImageUrl(anexo)
                                    setTimeout(() => {
                                      const el = imageRefs.current[anexo]
                                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                    }, 100)
                                  }}
                                  className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                                  title={`Ver anexo ${idx + 1}`}
                                >
                                  Anexo {idx + 1}
                                </button>
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

      {/* Modal para visualizar imagem ou PDF */}
      {selectedImageUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setSelectedImageUrl(null)}>
          <div className="relative max-w-4xl max-h-full p-4">
            {isPdf(selectedImageUrl) ? (
              <iframe src={selectedImageUrl} className="w-full h-[80vh]" title="PDF Viewer" />
            ) : (
              <img src={selectedImageUrl} alt="Imagem ampliada" className="max-w-full max-h-full object-contain" />
            )}
            <button
              onClick={() => setSelectedImageUrl(null)}
              className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition"
              title="Fechar"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-900 rotate-45" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
