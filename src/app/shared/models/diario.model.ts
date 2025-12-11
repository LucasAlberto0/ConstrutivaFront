import { ComentarioDto } from './comentario.model';

export type Clima = 'Ensolarado' | 'Nublado' | 'Chuvoso' | 'ParcialmenteNublado' | 'Tempestade';

export interface DiarioObraListagemDto {
  id: number;
  data: string; 
  clima: Clima;
  obraId: number;
  nomeObra?: string;
}

export interface DiarioObraCriacaoDto {
  data: string; 
  clima: Clima;
  quantidadeColaboradores: number;
  descricaoAtividades: string;
  observacoes?: string;
  obraId: number; 
  foto?: File; 
  comentarios?: ComentarioCriacaoDto[]; 
}

export interface DiarioObraAtualizacaoDto {
  data: string; 
  clima: Clima;
  quantidadeColaboradores: number;
  descricaoAtividades: string;
  observacoes?: string;
  foto?: File; 
}

export interface DiarioObraDetalhesDto {
  id: number;
  data: string; 
  clima: Clima;
  quantidadeColaboradores: number;
  descricaoAtividades: string;
  observacoes?: string;
  hasFoto: boolean; 
  obraId: number;
  nomeObra?: string;
  comentarios?: ComentarioDto[];
}

export interface ComentarioCriacaoDto {
  texto: string;
}
