// #region Interfaces
export interface OcorrenciaCartazDTO {
  urlCartaz: string
  tipoCartaz:
    | "PDF_DESAPARECIDO"
    | "PDF_LOCALIZADO"
    | "JPG_DESAPARECIDO"
    | "JPG_LOCALIZADO"
    | "INSTA_DESAPARECIDO"
    | "INSTA_LOCALIZADO"
}

export interface OcorrenciaDTO {
  ocoId: number
  dtDesaparecimento?: string // date-time
  dataLocalizacao?: string // date
  encontradoVivo?: boolean
  localDesaparecimentoConcat?: string
  ocorrenciaEntrevDesapDTO?: {
    informacao?: string
    vestimentasDesaparecido?: string
  }
  listaCartaz?: OcorrenciaCartazDTO[]
}

export interface OcorrenciaInformacaoDTO {
  id?: number
  ocoId: number
  informacao: string
  data: string // YYYY-MM-DD
  anexos?: string[]
}
// #endregion
