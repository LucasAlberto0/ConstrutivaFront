export interface ManutencaoListagemDto {
  id: number;
  dataManutencao: string;
  descricao: string;
  hasFoto: boolean;
  obraId: number;
  nomeObra: string;
}

export interface ManutencaoCriacaoDto {
  dataManutencao: string;
  descricao: string;
  obraId: number;
  // Foto will be handled as File object in FormData
}

export interface ManutencaoAtualizacaoDto {
  dataManutencao: string;
  descricao: string;
  // Foto will be handled as File object in FormData
}

export interface ManutencaoDetalhesDto {
  id: number;
  dataManutencao: string;
  descricao: string;
  hasFoto: boolean;
  obraId: number;
  nomeObra: string;
}
