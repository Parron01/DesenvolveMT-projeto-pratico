// #region Imports
import React, { useMemo, useState, useCallback } from "react"
import { Modal } from "./Modal"
import { formatDateISO, isValidISODate } from "../utils/date"
import { getImageExtensions, validateImages } from "../utils/files"
import { formatDate, formatTime, formatPhone, formatEmail } from "../utils/masks"
import { postInfoOcorrencia } from "../services/occurrences"
import { toast } from "react-toastify"
// #endregion

// #region Tipos/Props
interface Props {
  isOpen: boolean
  onClose: () => void
  pessoaNome: string
  ocoId?: number // disable submit when absent
  onSuccess?: () => void // called after successful submit to refresh timeline
}
// #endregion

export function EnviarInformacaoModal({ isOpen, onClose, pessoaNome, ocoId, onSuccess }: Props) {
  // #region Estado
  const [informacao, setInformacao] = useState("")
  const [data, setData] = useState("") // dd/mm/yyyy
  const [hora, setHora] = useState("") // hh:mm (optional, will be embedded)
  const [local, setLocal] = useState("")
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState("")
  const [descricao, setDescricao] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  // #endregion

  // #region Handlers/Callbacks
  const handleDataChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value)
    setData(formatted)
  }, [])

  const handleHoraChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTime(e.target.value)
    setHora(formatted)
  }, [])

  const handleTelefoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setTelefone(formatted)
  }, [])

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatEmail(e.target.value)
    setEmail(formatted)
  }, [])
  // #endregion

  const handleInformacaoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInformacao(e.target.value);
  }, []);

  const handleLocalChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocal(e.target.value);
  }, []);

  const handleNomeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNome(e.target.value);
  }, []);

  const handleDescricaoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescricao(e.target.value);
  }, []);

  const remaining = 1000 - (informacao?.length ?? 0);

  function reset() {
    setInformacao("");
    setData("");
    setHora("");
    setLocal("");
    setNome("");
    setTelefone("");
    setEmail("");
    setDescricao("");
    setFiles([]);
    setErrors([]);
  }

  function closeAndReset() {
    reset();
    onClose();
  }

  const isDisabled = useMemo(() => {
    if (!ocoId) return true;
    if (!informacao?.trim()) return true;
    if ((informacao?.length ?? 0) > 1000) return true;
    if (!data) return true;
    const iso = formatDateISO(data);
    if (!isValidISODate(iso)) return true;
    return false;
  }, [ocoId, informacao, data]);

  // Permitir imagens e PDF
  const allowedExtensions = [...getImageExtensions(), 'pdf'];
  function isAllowedFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ext && allowedExtensions.includes(ext);
  }

  function onSelectFiles(ev: React.ChangeEvent<HTMLInputElement> | FileList | File[]) {
    let f: File[] = [];
    if ('target' in ev) {
      f = Array.from(ev.target.files ?? []);
    } else if (Array.isArray(ev)) {
      f = ev;
    } else {
      f = Array.from(ev);
    }
    // Filtrar apenas arquivos permitidos
    f = f.filter(isAllowedFile);
    const all = [...files, ...f].slice(0, 5);
  const v = validateImages(all, { maxFiles: 5, maxMB: 50, allowedExts: allowedExtensions });
    if (!v.isValid) toast.error(v.errors.join("\n"));
    setFiles(v.isValid ? all : files);
    if ('target' in ev) ev.target.value = "";
  }

  // Drag and drop state
  const [isDragActive, setIsDragActive] = useState(false);
  function onDrop(ev: React.DragEvent<HTMLLabelElement | HTMLDivElement>) {
    ev.preventDefault();
    setIsDragActive(false);
    if (ev.dataTransfer?.files?.length) {
      onSelectFiles(ev.dataTransfer.files);
    }
  }
  function onDragOver(ev: React.DragEvent<HTMLLabelElement | HTMLDivElement>) {
    ev.preventDefault();
    setIsDragActive(true);
  }
  function onDragLeave(ev: React.DragEvent<HTMLLabelElement | HTMLDivElement>) {
    ev.preventDefault();
    setIsDragActive(false);
  }

  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit() {
    const issues: string[] = [];
    if (!ocoId) issues.push("Ocorrência inválida.");
    const infoTrim = informacao.trim().replace(/\s+/g, " ");
    if (!infoTrim) issues.push("Informe o texto da informação.");
    if (infoTrim.length > 1000) issues.push("Informação muito longa (máximo 1000).");
    const iso = formatDateISO(data);
    if (!isValidISODate(iso)) issues.push("Data inválida (use dd/mm/aaaa).");
    // validate images already done in onSelectFiles; re-check briefly
  const v = validateImages(files, { maxFiles: 5, maxMB: 50, allowedExts: allowedExtensions });
    if (!v.isValid) issues.push(...v.errors);

    setErrors(issues);
    if (issues.length) return;

    // Build information text including optional fields
    const extraParts: string[] = [];
    if (hora) extraParts.push(`Horário: ${hora}`);
    if (local) extraParts.push(`Localização: ${local}`);
    const contato: string[] = [];
    if (nome) contato.push(nome);
    if (telefone) contato.push(telefone);
    if (email) contato.push(email);
    if (contato.length) extraParts.push(`Contato: ${contato.join(", ")}`);
    const infoFinal = [infoTrim, ...extraParts].join("\n");

    try {
      setIsSubmitting(true);
      await postInfoOcorrencia({
        informacao: infoFinal,
        descricao: descricao?.trim() || (files.length ? "Anexos de imagens" : "Sem anexos"),
        data: iso,
        ocoId: ocoId!,
        files,
      });
      toast.success("Informação enviada com sucesso.");
      closeAndReset();
      onSuccess?.();
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404) toast.error("Ocorrência não encontrada (ocoId inválido).");
      else toast.error(e?.response?.data?.message || "Erro ao enviar informação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title={`Enviar informação sobre ${pessoaNome}`}
      description="Compartilhe informações que possam ajudar na localização desta pessoa."
    >
      <div className="space-y-6">
        {/* Informação Principal */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-900">
            Informação principal *
          </label>
          <div className="relative">
            <textarea
              value={informacao}
              onChange={handleInformacaoChange}
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg border-0 bg-neutral-50 p-3 sm:p-4 text-sm text-neutral-900 placeholder-neutral-500 shadow-sm ring-1 ring-inset ring-neutral-200 transition-all focus:bg-white focus:ring-2 focus:ring-brand-accent/60 focus:ring-offset-0"
              placeholder="Descreva detalhadamente a informação que você tem sobre esta pessoa. Inclua todos os detalhes que considerar relevantes..."
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs">
              <span className={`font-medium ${remaining < 50 ? "text-amber-600" : remaining < 0 ? "text-red-600" : "text-neutral-400"}`}>
                {Math.max(0, remaining)} caracteres restantes
              </span>
            </div>
          </div>
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-900">
              Data do avistamento *
            </label>
            <div className="relative">
              <input
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                value={data}
                onChange={handleDataChange}
                maxLength={10}
                className="w-full h-10 sm:h-12 rounded-lg border-0 bg-neutral-50 px-4 text-sm text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-200 transition-all focus:bg-white focus:ring-2 focus:ring-brand-accent/60"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Horário aproximado
            </label>
            <input
              placeholder="00:00:00"
              value={hora}
              onChange={handleHoraChange}
              maxLength={8}
              className="w-full h-10 sm:h-12 rounded-lg border-0 bg-neutral-50 px-4 text-sm text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-200 transition-all focus:bg-white focus:ring-2 focus:ring-brand-accent/60"
            />
          </div>
        </div>

        {/* Localização */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Localização
          </label>
          <textarea
            placeholder="Digite o endereço, bairro ou ponto de referência"
            value={local}
            onChange={handleLocalChange}
            rows={1}
            maxLength={200}
            style={{ resize: 'vertical', minHeight: '3rem', maxHeight: '8.5rem' }}
            className="w-full rounded-lg border-0 bg-neutral-50 px-3 sm:px-4 py-2 sm:py-3 text-sm text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-200 transition-all focus:bg-white focus:ring-2 focus:ring-brand-accent/60"
          />
        </div>

        {/* Upload de Fotos Modernizado */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-700">
              Fotos (opcional)
            </label>
            {files.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-medium text-brand-primary">
                {files.length} de 5 fotos
              </span>
            )}
          </div>
          
          <div className="relative">
            <input 
              type="file" 
              multiple 
              accept={allowedExtensions.map(e => "." + e).join(",")} 
              onChange={onSelectFiles} 
              className="hidden" 
              id="file-input" 
            />
            {files.length === 0 ? (
              <label
                htmlFor="file-input"
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed ${isDragActive ? 'border-brand-accent bg-brand-primary/10' : 'border-neutral-200 bg-neutral-50/50'} px-6 py-8 text-center transition-all hover:border-brand-accent/50 hover:bg-brand-primary/5`}
              >
                <div className="rounded-full bg-brand-primary/10 p-3 group-hover:bg-brand-primary/20 transition-colors">
                  <svg className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-neutral-900">Adicionar fotos ou PDF</p>
                  <p className="text-xs text-neutral-500 mt-1">Máximo 5 arquivos, até 50MB cada</p>
                  <span className="block text-xs text-brand-accent mt-1" style={{opacity: isDragActive ? 1 : 0, transition: 'opacity 0.2s'}}>Solte para adicionar</span>
                </div>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {files.map((file, idx) => {
                    const ext = file.name.split('.').pop()?.toLowerCase();
                    const isPdf = ext === 'pdf';
                    return (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200 flex items-center justify-center">
                        {isPdf ? (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <svg className="h-8 w-8 text-brand-primary mb-1" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            <span className="text-xs text-neutral-700">PDF</span>
                          </div>
                        ) : (
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Preview ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 rounded-full bg-white/90 p-1.5 text-neutral-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-red-600 cursor-pointer"
                          aria-label="Remover arquivo"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="rounded bg-black/50 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">
                            <span className="truncate block" title={file.name}>{file.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {files.length < 5 && (
                    <label 
                      htmlFor="file-input"
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      className={`group aspect-square cursor-pointer rounded-lg border-2 border-dashed ${isDragActive ? 'border-brand-accent bg-brand-primary/10' : 'border-neutral-200 bg-neutral-50'} transition-all hover:border-brand-accent/50 hover:bg-brand-primary/5 flex items-center justify-center`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-neutral-200 p-2 group-hover:bg-brand-primary/20 transition-colors">
                          <svg className="h-4 w-4 text-neutral-500 group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </div>
                        <span className="mt-1 text-xs text-neutral-500">Adicionar</span>
                        <span className="block text-xs text-brand-accent mt-1" style={{opacity: isDragActive ? 1 : 0, transition: 'opacity 0.2s'}}>Solte para adicionar</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-500">Formatos aceitos: JPG, PNG, GIF, WebP, PDF</p>
        </div>

        {/* Descrição dos anexos */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-900">
            Descrição das fotos *
          </label>
          <textarea
            placeholder={files.length ? "Descreva brevemente o conteúdo das fotos" : "Sem anexos"}
            value={descricao}
            onChange={handleDescricaoChange}
            rows={1}
            maxLength={200}
            style={{ resize: 'vertical', minHeight: '3rem', maxHeight: '8.5rem' }}
            className="w-full rounded-lg border-0 bg-neutral-50 px-3 sm:px-4 py-2 sm:py-3 text-sm text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-200 transition-all focus:bg-white focus:ring-2 focus:ring-brand-accent/60"
          />
        </div>

        {/* Contato opcional */}
        <div className="rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-4 ring-1 ring-neutral-200">
          <h3 className="text-sm font-medium text-neutral-900 mb-3">Informações de contato (opcional)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <input 
              placeholder="Seu nome" 
              value={nome} 
              onChange={handleNomeChange} 
              className="h-10 sm:h-11 rounded-lg border-0 bg-white px-3 text-sm shadow-sm ring-1 ring-inset ring-neutral-200 transition-all focus:ring-2 focus:ring-brand-accent/60" 
            />
            <input 
              placeholder="(65) 99999-9999" 
              value={telefone} 
              onChange={handleTelefoneChange}
              maxLength={15}
              className="h-10 sm:h-11 rounded-lg border-0 bg-white px-3 text-sm shadow-sm ring-1 ring-inset ring-neutral-200 transition-all focus:ring-2 focus:ring-brand-accent/60" 
            />
            <input 
              type="email"
              placeholder="seu@email.com" 
              value={email} 
              onChange={handleEmailChange} 
              className="h-10 sm:h-11 rounded-lg border-0 bg-white px-3 text-sm shadow-sm ring-1 ring-inset ring-neutral-200 transition-all focus:ring-2 focus:ring-brand-accent/60 lg:col-span-2" 
            />
          </div>
        </div>

        {/* Erros */}
        {errors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4" aria-live="polite">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Corrija os seguintes erros:</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc space-y-1 pl-5">
                    {errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-neutral-200">
          <button 
            className="h-10 sm:h-11 rounded-lg px-6 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 cursor-pointer order-2 sm:order-1" 
            onClick={closeAndReset} 
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            className={`h-10 sm:h-11 rounded-lg px-6 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer order-1 sm:order-2 ${
              isDisabled || isSubmitting 
                ? 'bg-neutral-400 cursor-not-allowed' 
                : 'bg-brand-primary hover:bg-brand-primary/90 hover:shadow-md active:scale-[0.98]'
            }`}
            onClick={onSubmit}
            disabled={isDisabled || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              'Enviar informação'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
  // #endregion
}
