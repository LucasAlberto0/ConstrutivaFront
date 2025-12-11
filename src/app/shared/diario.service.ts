import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DiarioObraListagemDto, DiarioObraCriacaoDto, DiarioObraAtualizacaoDto, DiarioObraDetalhesDto, ComentarioCriacaoDto } from './models/diario.model';
import { ComentarioDto } from './models/comentario.model';

@Injectable({
  providedIn: 'root'
})
export class DiarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDiarios(obraId: number): Observable<DiarioObraListagemDto[]> {
    return this.http.get<DiarioObraListagemDto[]>(`${this.apiUrl}/api/obras/${obraId}/Diarios`);
  }

  getDiarioById(obraId: number, id: number): Observable<DiarioObraDetalhesDto> {
    return this.http.get<DiarioObraDetalhesDto>(`${this.apiUrl}/api/obras/${obraId}/Diarios/${id}`);
  }

  createDiario(obraId: number, diario: DiarioObraCriacaoDto): Observable<DiarioObraDetalhesDto> {
    const formData = new FormData();
    formData.append('data', diario.data);
    formData.append('clima', diario.clima);
    formData.append('quantidadeColaboradores', diario.quantidadeColaboradores.toString());
    formData.append('descricaoAtividades', diario.descricaoAtividades);
    if (diario.observacoes) {
      formData.append('observacoes', diario.observacoes);
    }
    formData.append('obraId', diario.obraId.toString());
    if (diario.foto) {
      formData.append('foto', diario.foto, diario.foto.name);
    }
    if (diario.comentarios && diario.comentarios.length > 0) {
      formData.append('comentarios', JSON.stringify(diario.comentarios));
    }
    return this.http.post<DiarioObraDetalhesDto>(`${this.apiUrl}/api/obras/${obraId}/Diarios`, formData);
  }

  updateDiario(obraId: number, id: number, diario: DiarioObraAtualizacaoDto): Observable<DiarioObraDetalhesDto> {
    const formData = new FormData();
    formData.append('data', diario.data);
    formData.append('clima', diario.clima);
    formData.append('quantidadeColaboradores', diario.quantidadeColaboradores.toString());
    formData.append('descricaoAtividades', diario.descricaoAtividades);
    if (diario.observacoes) {
      formData.append('observacoes', diario.observacoes);
    }
    if (diario.foto) {
      formData.append('foto', diario.foto, diario.foto.name);
    }
    return this.http.put<DiarioObraDetalhesDto>(`${this.apiUrl}/api/obras/${obraId}/Diarios/${id}`, formData);
  }

  deleteDiario(obraId: number, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/obras/${obraId}/Diarios/${id}`);
  }

  getDiarioPhoto(obraId: number, diarioId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/api/obras/${obraId}/Diarios/${diarioId}/foto`, { responseType: 'blob' });
  }

  addComentarioToDiario(obraId: number, diarioId: number, comentario: ComentarioCriacaoDto): Observable<ComentarioDto> {
    return this.http.post<ComentarioDto>(`${this.apiUrl}/api/obras/${obraId}/Diarios/${diarioId}/comentarios`, comentario);
  }

  deleteComentarioFromDiario(obraId: number, diarioId: number, comentarioId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/obras/${obraId}/Diarios/${diarioId}/comentarios/${comentarioId}`);
  }
}