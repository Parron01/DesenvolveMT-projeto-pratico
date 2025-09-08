// #region Imports
import { useState } from 'react'
import { Badge } from '../Badge'
import type { PessoaDTO } from '../../models/PessoaDTO'
import { ArrowRight, MapPin, CalendarDays, User } from 'lucide-react'
// #endregion

// #region Utils
function getStatus(p: PessoaDTO) {
  return p.ultimaOcorrencia?.dataLocalizacao ? 'LOCALIZADO' : 'DESAPARECIDO'
}
// #endregion

export function CardPessoa({ pessoa, onClick }: { pessoa: PessoaDTO; onClick?: () => void }) {
  // #region Estado
  const [imgError, setImgError] = useState(false)
  // #endregion

  // #region Derivações/Memos
  const status = getStatus(pessoa)
  const tone = status === 'LOCALIZADO' ? 'success' : 'danger'
  // #endregion

  // #region Render (JSX)
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-lg hover:border-brand-primary/40 focus:ring-2 focus:ring-brand-accent focus:outline-none relative cursor-pointer sm:shadow-sm sm:hover:shadow-lg md:shadow-sm md:hover:shadow-lg lg:shadow-sm lg:hover:shadow-lg xl:shadow-sm xl:hover:shadow-lg ring-1 ring-transparent animate-pulse ring-blue-300/90 sm:animate-none sm:ring-transparent"
      title="Ver detalhes"
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-md bg-neutral-200 overflow-hidden flex-shrink-0 ring-1 ring-neutral-300">
          {pessoa.urlFoto && !imgError ? (
            <img
              src={pessoa.urlFoto}
              alt={`Foto de ${pessoa.nome}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-neutral-500"><User className="h-7 w-7" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold text-neutral-900">{pessoa.nome}</h3>
            <Badge tone={tone as any}>{status}</Badge>
          </div>
          <div className="mt-1 text-sm text-neutral-700 flex flex-wrap gap-x-4 gap-y-1">
            {pessoa.idade != null && (
              <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5 text-neutral-400" />{pessoa.idade} anos{pessoa.sexo ? ` · ${pessoa.sexo === 'MASCULINO' ? 'Masculino' : 'Feminino'}` : ''}</span>
            )}
            {!pessoa.idade && pessoa.sexo && (
              <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5 text-neutral-400" />{pessoa.sexo === 'MASCULINO' ? 'Masculino' : 'Feminino'}</span>
            )}
            {pessoa.ultimaOcorrencia?.localDesaparecimentoConcat && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-neutral-400" />{pessoa.ultimaOcorrencia.localDesaparecimentoConcat}</span>
            )}
          </div>
          {pessoa.ultimaOcorrencia?.dataLocalizacao ? (
            <div className="text-xs text-neutral-600 mt-1 inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-neutral-400" /> Localizado em: {new Date(pessoa.ultimaOcorrencia.dataLocalizacao).toLocaleDateString('pt-BR')}
            </div>
          ) : pessoa.ultimaOcorrencia?.dtDesaparecimento ? (
            <div className="text-xs text-neutral-600 mt-1 inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-neutral-400" /> Desaparecimento: {new Date(pessoa.ultimaOcorrencia.dtDesaparecimento).toLocaleDateString('pt-BR')}
            </div>
          ) : null}
        </div>
        <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-primary opacity-0 translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0" />
      </div>
    </button>
  )
  // #endregion
}
