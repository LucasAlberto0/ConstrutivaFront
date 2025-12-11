import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ChecklistService } from '../../shared/checklist.service';
import { ChecklistCriacaoDto, ChecklistItemCriacaoDto, ChecklistTipo } from '../../shared/models/checklist.model';
import { ChangeDetectorRef } from '@angular/core';

interface ChecklistItem {
  name: string;
  completed: boolean;
}

@Component({
  selector: 'app-checklists-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './checklists-page.component.html',
  styleUrls: ['./checklists-page.component.scss']
})
export class ChecklistsPageComponent implements OnInit {
  @Input() obraId!: number; 

  showInicioObraChecklist: boolean = true; 
  showEntregaObraChecklist: boolean = false;

  inicioObraChecklist: ChecklistItem[] = [
    { name: 'ART / RRT', completed: false },
    { name: 'Placa de obra instalada', completed: false },
    { name: 'EPIs disponíveis', completed: false },
    { name: 'CIPA constituída', completed: false },
    { name: 'Alvará de construção', completed: false },
    { name: 'Procuração e documentos', completed: false },
    { name: 'Diário de obra iniciado', completed: false },
    { name: 'Canteiro de obras montado', completed: false },
  ];

  entregaObraChecklist: ChecklistItem[] = [
    { name: 'Limpeza final realizada', completed: false },
    { name: 'Termos de garantia assinados', completed: false },
    { name: 'Manuais de equipamentos entregues', completed: false },
    { name: 'As Built finalizado', completed: false },
    { name: 'Habite-se obtido', completed: false },
    { name: 'Jogo de chaves entregue', completed: false },
    { name: 'Vistoria final aprovada', completed: false },
    { name: 'Documentação completa arquivada', completed: false },
  ];

  constructor(
    private route: ActivatedRoute,
    private checklistService: ChecklistService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.obraId = +id;
        console.log('ChecklistsPageComponent received obraId:', this.obraId);
        this.checklistService.getChecklist(this.obraId, ChecklistTipo.InicioObra).subscribe({
          next: (data: any) => {
            if (data && data.itens && data.itens.length > 0) {
              this.inicioObraChecklist = data.itens.map((item: any) => ({
                name: item.nome,
                completed: item.concluido 
              }));
              console.log('InicioObraChecklist populated from backend:', this.inicioObraChecklist);
              this.cdr.detectChanges(); 
            } else {
              console.log('No existing InicioObra checklist found, using default.');
            }
          },
          error: (err: any) => {
            console.warn('No existing InicioObra checklist found or error loading:', err);
          }
        });
        this.checklistService.getChecklist(this.obraId, ChecklistTipo.EntregaObra).subscribe({
          next: (data: any) => {
            if (data && data.itens && data.itens.length > 0) {
              this.entregaObraChecklist = data.itens.map((item: any) => ({
                name: item.nome,
                completed: item.concluido 
              }));
              console.log('EntregaObraChecklist populated from backend:', this.entregaObraChecklist);
              this.cdr.detectChanges(); 
            } else {
              console.log('No existing EntregaObra checklist found, using default.');
            }
          },
          error: (err: any) => {
            console.warn('No existing EntregaObra checklist found or error loading:', err);
          }
        });

      } else {
        console.error('ChecklistsPageComponent: obraId not found in route parameters.');
      }
    });
  }

  getInicioObraProgress(): number {
    if (this.inicioObraChecklist.length === 0) return 0;
    const completedItems = this.inicioObraChecklist.filter(item => item.completed).length;
    return (completedItems / this.inicioObraChecklist.length) * 100;
  }

  getEntregaObraProgress(): number {
    if (this.entregaObraChecklist.length === 0) return 0;
    const completedItems = this.entregaObraChecklist.filter(item => item.completed).length;
    return (completedItems / this.entregaObraChecklist.length) * 100;
  }

  toggleChecklist(type: 'inicio' | 'entrega'): void {
    if (type === 'inicio') {
      this.showInicioObraChecklist = !this.showInicioObraChecklist;
      this.showEntregaObraChecklist = false; 
    } else {
      this.showEntregaObraChecklist = !this.showEntregaObraChecklist;
      this.showInicioObraChecklist = false; 
    }
  }

  calculateProgress(type: 'inicio' | 'entrega'): void {
  }

  saveChecklist(type: 'inicio' | 'entrega'): void {
    if (!this.obraId) {
      console.error('Obra ID is missing, cannot save checklist.');
      return;
    }

    let checklistToSave: ChecklistCriacaoDto;
    let checklistItems: ChecklistItemCriacaoDto[];
    let checklistTipo: ChecklistTipo;

    if (type === 'inicio') {
      checklistItems = this.inicioObraChecklist.map(item => ({
        Nome: item.name,
        Concluido: item.completed,
        Observacao: ''
      }));
      checklistTipo = ChecklistTipo.InicioObra;
    } else {
      checklistItems = this.entregaObraChecklist.map(item => ({
        Nome: item.name,
        Concluido: item.completed,
        Observacao: ''
      }));
      checklistTipo = ChecklistTipo.EntregaObra;
    }

    checklistToSave = {
      Tipo: checklistTipo,
      ObraId: this.obraId,
      Itens: checklistItems
    };
    console.log('Payload being sent to backend:', checklistToSave);

    this.checklistService.createChecklist(this.obraId, checklistToSave).subscribe({
      next: (response: any) => {
        console.log('Checklist saved successfully:', response);
      },
      error: (error: any) => {
        console.error('Error saving checklist:', error);
      }
    });
  }
}