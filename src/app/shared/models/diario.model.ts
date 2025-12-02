import { ComentarioDto } from './comentario.model';

export type Clima = 'Ensolarado' | 'Nublado' | 'Chuvoso' | 'ParcialmenteNublado' | 'Tempestade';

export interface DiarioObraListagemDto {
  id: number;
  data: string; // Formato ISO 8601 (e.g., "2025-12-02T10:30:00Z")
  clima: Clima;
  obraId: number;
  nomeObra?: string;
}

export interface DiarioObraCriacaoDto {
  data: string; // Formato ISO 8601
  clima: Clima;
  quantidadeColaboradores: number;
  descricaoAtividades: string;
  observacoes?: string;
  obraId: number; // Deve corresponder ao {obraId} da rota
  foto?: File; // Opcional, enviar como File no FormData
  comentarios?: ComentarioCriacaoDto[]; // Opcional, pode ser um array de objetos
}

export interface DiarioObraAtualizacaoDto {
  data: string; // Formato ISO 8601
  clima: Clima;
  quantidadeColaboradores: number;
  descricaoAtividades: string;
  observacoes?: string;
  foto?: File; // Opcional, enviar como File no FormData. Se presente, substitui a foto anterior.
}

export interface DiarioObraDetalhesDto {
  id: number;
  data: string; // Formato ISO 8601
  clima: Clima;
  quantidadeColaboradores: number;
  descricaoAtividades: string;
  observacoes?: string;
  hasFoto: boolean; // Indica se há uma foto associada (para buscar via endpoint /foto)
  obraId: number;
  nomeObra?: string;
  comentarios?: ComentarioDto[];
}

export interface ComentarioCriacaoDto {
  texto: string;
  autorId: string; // ID do usuário que está criando o comentário
}
