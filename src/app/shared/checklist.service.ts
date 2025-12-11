import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChecklistCriacaoDto, ChecklistTipo } from './models/checklist.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {
  private apiUrl = `${environment.apiUrl}/api/obras`;

  constructor(private http: HttpClient) { }

  createChecklist(obraId: number, checklist: ChecklistCriacaoDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/${obraId}/checklists`, checklist);
  }

  getChecklist(obraId: number, tipo: ChecklistTipo): Observable<any> {
    return this.http.get(`${this.apiUrl}/${obraId}/checklists?tipo=${tipo}`);
  }
}
