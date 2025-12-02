export enum ObraStatus {
  EmAndamento = 0,
  EmManutencao = 1,
  Suspensa = 2,
  Finalizada = 3,
}

export interface ObraListagemDto {
  id?: number;
  nome?: string;
  localizacao?: string;
  status?: ObraStatus;
  dataInicio?: string;
  dataTermino?: string;
}

export interface ObraCriacaoDto {
  nome: string;
  localizacao?: string;
  contratante?: string;
  contrato?: string;
  ordemInicioServico?: string;
  coordenadorNome?: string;
  administradorNome?: string;
  responsavelTecnicoNome?: string;
  equipe?: string;
  dataInicio?: string;
  dataTermino?: string;
  status?: ObraStatus;
  observacoes?: string;
}

export interface ObraAtualizacaoDto {
  nome: string;
  localizacao?: string;
  contratante?: string;
  contrato?: string;
  ordemInicioServico?: string;
  coordenadorNome?: string;
  administradorId?: string;
  responsavelTecnicoNome?: string;
  equipe?: string;
  dataInicio?: string;
  dataTermino?: string;
  status?: ObraStatus;
}

export interface AditivoDto {
  id?: number;
  descricao?: string;
  data?: string;
}

export interface ManutencaoDto {
  id?: number;
  dataManutencao?: string;
  descricao?: string;
  hasFoto?: boolean;
}

export interface DiarioObraDto {
  id?: number;
  data?: string;
  clima?: string;
  colaboradores?: string;
  atividades?: string;
}

export interface DocumentoDto {
  id?: number;
  nomeArquivo?: string;
  url?: string;
  pasta?: TipoPasta;
}

export enum TipoChecklist {
  InicioObra = 0,
  EntregaObra = 1,
}

export interface ChecklistItemDto {
  id?: number;
  nome?: string;
  concluido?: boolean;
  observacao?: string;
}

export interface ChecklistDto {
  id?: number;
  tipo?: TipoChecklist;
  itens?: ChecklistItemDto[];
}

import { ManutencaoListagemDto } from './manutencao.model'; // Import ManutencaoListagemDto

export interface ObraDetalhesDto {
  id?: number;
  nome?: string;
  localizacao?: string;
  contratante?: string;
  contrato?: string;
  ordemInicioServico?: string;
  coordenadorNome?: string;
  administradorNome?: string;
  responsavelTecnicoNome?: string;
  equipe?: string;
  dataInicio?: string;
  dataTermino?: string;
  status?: ObraStatus;
  observacoes?: string;
  aditivos?: AditivoDto[];
  manutencoes?: ManutencaoListagemDto[]; // Changed to ManutencaoListagemDto[]
  diariosObra?: DiarioObraDto[];
  documentos?: DocumentoDto[];
  checklists?: ChecklistDto[];
}
export enum TipoPasta {
  Contratos = 0,
  Projetos = 1,
  Relatorios = 2,
  Outros = 3,
}
