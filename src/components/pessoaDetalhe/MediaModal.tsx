// #region Imports
import { ArrowLeft } from 'lucide-react'
// #endregion

// #region Tipos/Props
interface MediaModalProps {
  selectedImageUrl: string | null
  onClose: () => void
}
// #endregion

// #region Utils
function isPdf(url: string): boolean {
  return url.toLowerCase().includes('.pdf')
}
// #endregion

export function MediaModal({ selectedImageUrl, onClose }: MediaModalProps) {
  // #region Render
  if (!selectedImageUrl) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-4xl max-h-full p-4">
        {isPdf(selectedImageUrl) ? (
          <iframe src={selectedImageUrl} className="w-full h-[80vh]" title="PDF Viewer" />
        ) : (
          <img src={selectedImageUrl} alt="Imagem ampliada" className="max-w-full max-h-full object-contain" />
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition cursor-pointer"
          title="Fechar"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-900 rotate-45" />
        </button>
      </div>
    </div>
  )
  // #endregion
}
