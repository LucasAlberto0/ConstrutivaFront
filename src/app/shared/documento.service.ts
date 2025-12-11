import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DocumentoListagemDto, DocumentoCriacaoDto, DocumentoAtualizacaoDto, DocumentoDetalhesDto } from './models/documento.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDocumentos(obraId: number): Observable<DocumentoListagemDto[]> {
    return this.http.get<DocumentoListagemDto[]>(`${this.apiUrl}/api/obras/${obraId}/Documentos`);
  }

  getDocumentoById(obraId: number, id: number): Observable<DocumentoDetalhesDto> {
    return this.http.get<DocumentoDetalhesDto>(`${this.apiUrl}/api/obras/${obraId}/Documentos/${id}`);
  }

  createDocumento(obraId: number, documento: DocumentoCriacaoDto): Observable<DocumentoDetalhesDto> {
    return this.http.post<DocumentoDetalhesDto>(`${this.apiUrl}/api/obras/${obraId}/Documentos`, documento);
  }

  updateDocumento(obraId: number, id: number, documento: DocumentoAtualizacaoDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/obras/${obraId}/Documentos/${id}`, documento);
  }

  deleteDocumento(obraId: number, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/obras/${obraId}/Documentos/${id}`);
  }

  uploadDocumento(obraId: number, documentoId: number, file: File, description: string, type: string): Observable<DocumentoDetalhesDto> {
    const formData = new FormData();
    formData.append('Arquivo', file);
    formData.append('description', description);
    formData.append('type', type);
    return this.http.post<DocumentoDetalhesDto>(`${this.apiUrl}/api/obras/${obraId}/Documentos/${documentoId}/anexar`, formData);
  }

  downloadDocumento(obraId: number, documentoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/api/obras/${obraId}/Documentos/${documentoId}/download`, { responseType: 'blob' });
  }
}