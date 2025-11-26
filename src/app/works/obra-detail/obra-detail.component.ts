import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ObraService } from '../../shared/obra.service';
import { ObraDetalhesDto, ObraStatus } from '../../shared/models/obra.model';
import { AditivoListComponent } from '../aditivos/aditivo-list/aditivo-list.component';
import { ManutencaoListComponent } from '../manutencoes/manutencao-list/manutencao-list.component';
import { DiarioListComponent } from '../diarios/diario-list/diario-list.component';
import { DocumentoListComponent } from '../documentos/documento-list/documento-list.component';
import { ChecklistListComponent } from '../checklists/checklist-list/checklist-list.component'; // Import ChecklistListComponent

@Component({
  selector: 'app-obra-detail',
  standalone: true,
  imports: [CommonModule, ManutencaoListComponent, DiarioListComponent, DocumentoListComponent],
  templateUrl: './obra-detail.component.html',
  styleUrls: ['./obra-detail.component.scss']
})
export class ObraDetailComponent implements OnInit {
  obraId: number | null = null;
  obra: ObraDetalhesDto | null = null;
  loading: boolean = true;
  error: string | null = null;
  currentTab: string = 'Dados Básicos'; // Initialize currentTab

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private obraService: ObraService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.obraId = +id; // Convert string to number
        this.loadObraDetails(this.obraId);
      } else {
        this.error = 'Obra ID not provided.';
        this.loading = false;
      }
    });
  }

  loadObraDetails(id: number): void {
    this.loading = true;
    this.obraService.getObraById(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.obra = response.data;
        } else {
          // If the response is not wrapped, use it directly.
          // This handles both cases, making it more robust.
          this.obra = response;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load obra details.';
        this.loading = false;
        console.error('Error loading obra details:', err);
      }
    });
  }

  selectTab(tabName: string): void {
    this.currentTab = tabName;
  }

  refreshAditivos(): void {
    if (this.obraId) {
      this.loadObraDetails(this.obraId); // Reload obra details to get updated aditivos
    }
  }

  refreshManutencoes(): void {
    if (this.obraId) {
      this.loadObraDetails(this.obraId); // Reload obra details to get updated manutencoes
    }
  }

  refreshDiarios(): void {
    if (this.obraId) {
      this.loadObraDetails(this.obraId); // Reload obra details to get updated diarios
    }
  }

  refreshDocumentos(): void {
    if (this.obraId) {
      this.loadObraDetails(this.obraId); // Reload obra details to get updated documentos
    }
  }

  refreshChecklists(): void {
    if (this.obraId) {
      this.loadObraDetails(this.obraId); // Reload obra details to get updated checklists
    }
  }

  getStatusName(status: ObraStatus | undefined): string {
    switch (status) {
      case ObraStatus.EmAndamento: return 'Em Andamento';
      case ObraStatus.EmManutencao: return 'Em Manutenção';
      case ObraStatus.Suspensa: return 'Suspensa';
      case ObraStatus.Finalizada: return 'Finalizada';
      default: return 'Desconhecido';
    }
  }

  goBack(): void {
    this.router.navigate(['/obras']);
  }
}