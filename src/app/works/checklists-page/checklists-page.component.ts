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
        this.checklistService.getChecklist(this.obraId, ChecklistTipo.InicioObra).subscribe({
          next: (data: any) => {
            if (data && data.itens && data.itens.length > 0) {
              this.inicioObraChecklist = data.itens.map((item: any) => ({
                name: item.nome,
                completed: item.concluido 
              }));
              this.cdr.detectChanges(); 
            } else {
            }
          },
          error: (err: any) => {
          }
        });
        this.checklistService.getChecklist(this.obraId, ChecklistTipo.EntregaObra).subscribe({
          next: (data: any) => {
            if (data && data.itens && data.itens.length > 0) {
              this.entregaObraChecklist = data.itens.map((item: any) => ({
                name: item.nome,
                completed: item.concluido 
              }));
              this.cdr.detectChanges(); 
            } else {
            }
          },
          error: (err: any) => {
          }
        });

      } else {
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

    this.checklistService.createChecklist(this.obraId, checklistToSave).subscribe({
      next: (response: any) => {
      },
      error: (error: any) => {
      }
    });
  }
}