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
}

export interface ManutencaoAtualizacaoDto {
  dataManutencao: string;
  descricao: string;
}

export interface ManutencaoDetalhesDto {
  id: number;
  dataManutencao: string;
  descricao: string;
  hasFoto: boolean;
  obraId: number;
  nomeObra: string;
}
