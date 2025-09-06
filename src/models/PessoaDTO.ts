import type { OcorrenciaDTO } from './OcorrenciaDTO';
import type { PageableObject, SortObject } from './PaginationDTO';

export type Sexo = "MASCULINO" | "FEMININO";
export type StatusPessoa = "DESAPARECIDO" | "LOCALIZADO";

export interface PessoaDTO {
  id: number;
  nome: string;
  idade?: number;
  sexo?: Sexo;
  vivo?: boolean;
  urlFoto?: string;
  ultimaOcorrencia?: OcorrenciaDTO;
}

export interface PagePessoaDTO {
  content: PessoaDTO[];
  totalPages: number;
  totalElements: number;
  number: number; // current page (0-based)
  size: number; // items per page
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable?: PageableObject;
  sort?: SortObject;
  empty: boolean;
}

export interface EstatisticaPessoaDTO {
  quantPessoasDesaparecidas: number;
  quantPessoasEncontradas: number;
}

export interface FiltrosLista {
  nome?: string;
  faixaIdadeInicial?: number;
  faixaIdadeFinal?: number;
  sexo?: Sexo;
  status?: StatusPessoa;
  pagina: number;
  porPagina: number; // fixed 10 in UI
}
