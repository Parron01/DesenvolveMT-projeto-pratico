import { api } from "../routes/axios";
import type { OcorrenciaInformacaoDTO } from "../models/OcorrenciaDTO";

export async function getInfosOcorrencia(ocoId: number) {
  const res = await api.get<OcorrenciaInformacaoDTO[]>(
    "/v1/ocorrencias/informacoes-desaparecido",
    { params: { ocorrenciaId: ocoId } }
  );
  return res.data;
}

export interface PostInfoPayload {
  informacao: string; // with location/time/contact embedded when applicable
  descricao: string; // required even without files (e.g., "Sem anexos")
  data: string; // yyyy-MM-dd
  ocoId: number;
  files?: File[];
}

export async function postInfoOcorrencia(payload: PostInfoPayload) {
  const { informacao, descricao, data, ocoId, files } = payload;

  // Build query params in URL
  const url = 
    `/v1/ocorrencias/informacoes-desaparecido?informacao=${encodeURIComponent(informacao)}` +
    `&descricao=${encodeURIComponent(descricao || "Sem anexos")}` +
    `&data=${encodeURIComponent(data)}` +
    `&ocoId=${encodeURIComponent(String(ocoId))}`;

  const form = new FormData();
  if (files && files.length) {
    for (const f of files) {
      form.append("files", f);
    }
  }

  const res = await api.post<OcorrenciaInformacaoDTO>(url, form);
  return res.data;
}
