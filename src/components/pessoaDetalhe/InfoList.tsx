import { CalendarDays } from 'lucide-react'
import type { OcorrenciaInformacaoDTO } from '../../models/OcorrenciaDTO'

interface InfoListProps {
  infos: OcorrenciaInformacaoDTO[]
  isLoading: boolean
  highlightedInfoId: number | null
  onGoToMedia: (anexo: string) => void
  infoRefs: React.MutableRefObject<Record<number, HTMLLIElement | null>>
}

function formatDateBR(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

export function InfoList({ infos, isLoading, highlightedInfoId, onGoToMedia, infoRefs }: InfoListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <h3 className="text-lg font-semibold text-neutral-900 inline-flex items-center gap-2">
          <CalendarDays className="h-5 w-5" /> Informações enviadas
        </h3>
        <p className="text-sm text-neutral-600 mt-2">Carregando…</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-neutral-900 inline-flex items-center gap-2">
        <CalendarDays className="h-5 w-5" /> Informações enviadas
      </h3>
      {infos.length ? (
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1" role="region" aria-label="Lista de informações enviadas">
          <ul className="space-y-4">
            {infos.map(info => {
              // Separar info.informacao em blocos por prefixo (Horário, Localização, Contato)
              const lines = info.informacao.split(/\r?\n/)
              const main = []
              let horario = '', local = '', contato = ''
              for (const l of lines) {
                if (l.startsWith('Horário:')) horario = l.replace('Horário:', '').trim()
                else if (l.startsWith('Localização:')) local = l.replace('Localização:', '').trim()
                else if (l.startsWith('Contato:')) contato = l.replace('Contato:', '').trim()
                else main.push(l)
              }
              return (
                <li
                  key={info.id ?? `${info.ocoId}-${info.data}-${info.informacao.slice(0, 10)}`}
                  ref={el => { if (info.id) infoRefs.current[info.id] = el }}
                  className={`rounded-md border p-4 transition-all duration-500 ${
                    highlightedInfoId === info.id ? 'bg-blue-50 shadow-lg ring-2 ring-blue-300 animate-pulse' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatDateBR(info.data)}
                    </span>
                    {horario && (
                      <span className="px-2 py-0.5 rounded bg-neutral-100 text-xs text-neutral-700 border border-neutral-200">
                        Horário: <span className="font-semibold">{horario}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-900 whitespace-pre-wrap font-medium border-l-2 border-brand-accent/30 pl-3 mb-1">
                    {main.join('\n')}
                  </div>
                  {local && (
                    <div className="text-xs text-neutral-700 mt-1">
                      <span className="font-semibold text-brand-primary">Localização:</span> {local}
                    </div>
                  )}
                  {contato && (
                    <div className="text-xs text-neutral-700 mt-1">
                      <span className="font-semibold text-brand-primary">Contato:</span> {contato}
                    </div>
                  )}
                  {info.anexos?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {info.anexos.map((anexo, idx) => (
                        <button
                          key={idx}
                          onClick={() => onGoToMedia(anexo)}
                          className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                          title={`Ver anexo ${idx + 1}`}
                        >
                          Anexo {idx + 1}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-neutral-600 mt-2">Ainda não há informações enviadas.</p>
      )}
    </div>
  )
}
