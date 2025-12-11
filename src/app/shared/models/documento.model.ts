import { TipoPasta } from './obra.model';

export interface DocumentoListagemDto {
  id?: number;
  nome?: string;
  caminhoArquivo?: string;
  obraId?: number;
  descricao?: string;
  tamanhoArquivo?: number;
  dataAnexamento?: string;
  dataUpload?: string;
  tipo?: string;
}

export interface DocumentoCriacaoDto {
  nome: string;
  caminhoArquivo: string;
  obraId: number;
  descricao?: string;
  tipo: string;
}

export interface DocumentoAtualizacaoDto {
  nome: string;
  caminhoArquivo: string;
  descricao?: string;
  tipo?: string;
}

export interface DocumentoDetalhesDto {
  id?: number;
  nome?: string;
  caminhoArquivo?: string;
  obraId?: number;
  nomeObra?: string;
  descricao?: string;
  tamanhoArquivo?: number;
  dataAnexamento?: string;
  dataUpload?: string;
  tipo?: string;
}
