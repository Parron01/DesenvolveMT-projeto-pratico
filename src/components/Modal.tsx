import React, { useEffect, useRef } from "react";

interface ModalProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, description, isOpen, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Keep latest onClose without re-running effect
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Disable page scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.activeElement as HTMLElement | null;
    // focus first focusable inside modal
    setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("[tabindex],button,input,textarea,select,a[href]")?.focus(), 0);
    
    return () => {
      // Restore page scroll
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      
      document.removeEventListener("keydown", onKey);
      // restore focus
      prev?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" aria-labelledby="modal-title" aria-describedby={description ? "modal-desc" : undefined}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-start sm:items-center justify-center p-3 sm:p-4">
        <div ref={dialogRef} className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl outline-none" tabIndex={-1}>
          <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100">
            <div className="pr-4">
              <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-neutral-900 leading-tight">{title}</h2>
              {description && <p id="modal-desc" className="text-sm text-neutral-600 mt-1.5 leading-relaxed">{description}</p>}
            </div>
            <button 
              onClick={onClose} 
              className="flex-shrink-0 rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 cursor-pointer" 
              aria-label="Fechar modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="max-h-[75vh] overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
