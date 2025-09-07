// #region Imports
import { Eye, ArrowRight, FileText } from 'lucide-react'
import type { OcorrenciaInformacaoDTO } from '../../models/OcorrenciaDTO'
// #endregion

// #region Tipos/Props
interface MediaItem {
  url: string
  info: OcorrenciaInformacaoDTO
}

interface MediaGridProps {
  infos: OcorrenciaInformacaoDTO[]
  highlightedImageUrl: string | null
  onViewImage: (url: string) => void
  onGoToInfo: (infoId: number | undefined) => void
  imageRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
}
// #endregion

// #region Utils
function isPdf(url: string): boolean {
  return url.toLowerCase().includes('.pdf')
}
// #endregion

export function MediaGrid({ infos, highlightedImageUrl, onViewImage, onGoToInfo, imageRefs }: MediaGridProps) {
  // #region Memos
  const mediaItems: MediaItem[] = infos.flatMap(info =>
    (info.anexos || []).map(anexo => ({ url: anexo, info }))
  )
  // #endregion

  // #region Render
  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-neutral-900 inline-flex items-center gap-2">
        <Eye className="h-5 w-5" /> Fotos
      </h3>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {mediaItems.map(({ url, info }, idx) => (
          <div
            key={idx}
            ref={el => { imageRefs.current[url] = el }}
            className={`relative group rounded-md overflow-hidden ${
              highlightedImageUrl === url ? 'ring-4 ring-brand-accent animate-pulse shadow-lg' : ''
            }`}
          >
            {isPdf(url) ? (
              <div className="w-full h-40 bg-neutral-100 border flex items-center justify-center">
                <FileText className="h-12 w-12 text-neutral-500" />
              </div>
            ) : (
              <img src={url} alt={`Anexo ${idx + 1}`} className="w-full h-40 object-cover" loading="lazy" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
              <button
                onClick={() => onViewImage(url)}
                className="p-3 md:p-2 bg-white/80 rounded-full hover:bg-white transition cursor-pointer"
                title="Visualizar"
              >
                <Eye className="h-6 w-6 md:h-5 md:w-5 text-neutral-900" />
              </button>
              <button
                onClick={() => onGoToInfo(info.id)}
                className="p-3 md:p-2 bg-white/80 rounded-full hover:bg-white transition cursor-pointer"
                title="Ver informação relacionada"
              >
                <ArrowRight className="h-6 w-6 md:h-5 md:w-5 text-neutral-900" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {mediaItems.length === 0 && (
        <p className="text-sm text-neutral-600">Sem fotos</p>
      )}
    </div>
  )
  // #endregion
}
