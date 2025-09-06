import { useState } from 'react'
import { Badge } from '../Badge'
import type { PessoaDTO } from '../../models/PessoaDTO'

function getStatus(p: PessoaDTO) {
  return p.ultimaOcorrencia?.dataLocalizacao ? 'LOCALIZADO' : 'DESAPARECIDO'
}

export function CardPessoa({ pessoa, onClick }: { pessoa: PessoaDTO; onClick?: () => void }) {
  const status = getStatus(pessoa)
  const tone = status === 'LOCALIZADO' ? 'success' : 'danger'
  const [imgError, setImgError] = useState(false)
  return (
    <button onClick={onClick} className="w-full text-left rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-md bg-neutral-200 overflow-hidden flex-shrink-0">
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
            <div className="h-full w-full grid place-items-center text-neutral-500 text-2xl">👤</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold text-neutral-900">{pessoa.nome}</h3>
            <Badge tone={tone as any}>{status}</Badge>
          </div>
          <div className="mt-1 text-sm text-neutral-600 flex flex-wrap gap-x-4 gap-y-1">
            {pessoa.idade != null && <span>{pessoa.idade} anos</span>}
            {pessoa.sexo && <span>{pessoa.sexo === 'MASCULINO' ? 'Masculino' : 'Feminino'}</span>}
            {pessoa.ultimaOcorrencia?.localDesaparecimentoConcat && <span>{pessoa.ultimaOcorrencia.localDesaparecimentoConcat}</span>}
          </div>
          {pessoa.ultimaOcorrencia?.dtDesaparecimento && (
            <div className="text-xs text-neutral-500 mt-1">
              Desaparecimento: {new Date(pessoa.ultimaOcorrencia.dtDesaparecimento).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
