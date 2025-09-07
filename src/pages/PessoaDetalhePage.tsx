// #region Imports
import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../routes/axios'
import type { OcorrenciaInformacaoDTO, OcorrenciaDTO } from '../models/OcorrenciaDTO'
import type { PessoaDTO } from '../models/PessoaDTO'
import { Badge } from '../components/Badge'
import { toast } from 'react-toastify'
import { ArrowLeft, CalendarDays, MapPin, Info as InfoIcon, User as UserIcon, UploadCloud } from 'lucide-react'
import { EnviarInformacaoModal } from '../components/EnviarInformacaoModal'
import { TabsSection } from '../components/pessoaDetalhe/TabsSection'
import { MediaGrid } from '../components/pessoaDetalhe/MediaGrid'
import { InfoList } from '../components/pessoaDetalhe/InfoList'
import { MediaModal } from '../components/pessoaDetalhe/MediaModal'
// #endregion

// #region Utils
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
// #endregion

export default function PessoaDetalhePage() {
  // #region Estado
  const { id } = useParams<{ id: string }>()
  const [pessoa, setPessoa] = useState<PessoaDTO | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [infos, setInfos] = useState<OcorrenciaInformacaoDTO[]>([])
  const [isLoadingInfos, setIsLoadingInfos] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  // Estados para modal de imagem e destaque
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [highlightedInfoId, setHighlightedInfoId] = useState<number | null>(null)
  const [highlightedImageUrl, setHighlightedImageUrl] = useState<string | null>(null)
  const infoRefs = useRef<Record<number, HTMLLIElement | null>>({})
  const imageRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Tabs: 'pessoais' | 'local' | 'fotos' | 'informacoes'
  const [tab, setTab] = useState<'pessoais' | 'local' | 'fotos' | 'informacoes'>('pessoais')
  // #endregion

  // #region Derivações/Memos
  const status = useMemo(() => getStatus(pessoa?.ultimaOcorrencia), [pessoa])
  const tone = status === 'LOCALIZADO' ? 'success' : 'danger'
  // #endregion
  // #endregion

  // #region Efeitos
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

  // Controlar scroll da página quando modal de imagem/PDF está aberto
  useEffect(() => {
    if (!selectedImageUrl) return;
    
    // Disable page scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImageUrl(null);
    };
    document.addEventListener("keydown", onKey);
    
    return () => {
      // Restore page scroll
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      
      document.removeEventListener("keydown", onKey);
    };
  }, [selectedImageUrl])
  // #endregion

  // #region Handlers/Callbacks
  const onSuccess = async () => {
    const ocoId = pessoa?.ultimaOcorrencia?.ocoId
    if (!ocoId) return
    try {
      const res = await api.get<OcorrenciaInformacaoDTO[]>(`/v1/ocorrencias/informacoes-desaparecido`, { params: { ocorrenciaId: ocoId } })
      const data = [...res.data].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))
      setInfos(data)
    } catch {}
  }
  // #endregion

  // #region Render (JSX)
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 break-words">{pessoa.nome}</h1>
                    {/* Nome social não disponível no contrato atual */}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
                    <Badge tone={tone as any}>{status}</Badge>
                    {/* Insight: total de dias desaparecido (para localizados: até a data de localização; para desaparecidos: até hoje) */}
                    {(() => {
                      const oco = pessoa.ultimaOcorrencia
                      if (!oco?.dtDesaparecimento) return null
                      const endRef = oco.dataLocalizacao ?? new Date().toISOString()
                      const days = diffDays(oco.dtDesaparecimento, endRef)
                      if (days == null) return null
                      return (
                        <Badge tone="danger">
                          {days === 1 ? '1 dia' : `${days} dias`}
                        </Badge>
                      )
                    })()}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-800">
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
          {/* CTA Enviar informação */}
          <div className="mt-4 flex justify-center">
            <button className="inline-flex items-center gap-2 rounded-md bg-brand-primary text-white px-5 py-2.5 text-sm shadow-md transition hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer" onClick={() => setIsInfoModalOpen(true)}>
              <UploadCloud className="h-4 w-4" /> Enviar informação
            </button>
          </div>
        </section>

        {/* Abas */}
        <TabsSection
          tab={tab}
          onTabChange={setTab}
          disabledTabs={oco?.ocoId ? [] : ['informacoes']}
        />

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
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
              <MediaGrid
                infos={infos}
                highlightedImageUrl={highlightedImageUrl}
                onViewImage={setSelectedImageUrl}
                onGoToInfo={(infoId) => {
                  setTab('informacoes')
                  setHighlightedInfoId(infoId ?? 0)
                  setTimeout(() => {
                    const el = infoRefs.current[infoId ?? 0]
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 100)
                }}
                imageRefs={imageRefs}
              />
            ) : (
              <InfoList
                infos={infos}
                isLoading={isLoadingInfos}
                highlightedInfoId={highlightedInfoId}
                onGoToMedia={(anexo) => {
                  setTab('fotos')
                  setHighlightedImageUrl(anexo)
                  setTimeout(() => {
                    const el = imageRefs.current[anexo]
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 100)
                }}
                infoRefs={infoRefs}
              />
            )}
          </div>
      </main>

      {/* Modal de envio de informação (não interfere nas abas/fotos) */}
      <EnviarInformacaoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        pessoaNome={pessoa?.nome ?? ''}
        ocoId={pessoa?.ultimaOcorrencia?.ocoId}
        onSuccess={onSuccess}
      />

      {/* Modal para visualizar imagem ou PDF */}
      <MediaModal
        selectedImageUrl={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
      />
    </div>
  )
  // #endregion
}
