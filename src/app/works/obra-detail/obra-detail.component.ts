import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ObraService } from '../../shared/obra.service';
import { ObraDetalhesDto, ObraStatus, ManutencaoDto, DiarioObraDto } from '../../shared/models/obra.model';
import { ManutencaoListagemDto } from '../../shared/models/manutencao.model';
import { Clima, DiarioObraListagemDto } from '../../shared/models/diario.model';
import { ManutencaoListComponent } from '../manutencoes/manutencao-list/manutencao-list.component';
import { DiarioListComponent } from '../diarios/diario-list/diario-list.component';
import { DocumentoListComponent } from '../documentos/documento-list/documento-list.component';
import { AuthService } from '../../shared/auth.service';
import { ChecklistsPageComponent } from '../checklists-page/checklists-page.component';

@Component({
  selector: 'app-obra-detail',
  standalone: true,
  imports: [
    CommonModule,
    ManutencaoListComponent,
    DiarioListComponent,
    DocumentoListComponent,
    ChecklistsPageComponent
  ],
  templateUrl: './obra-detail.component.html',
  styleUrls: ['./obra-detail.component.scss']
})
export class ObraDetailComponent implements OnInit {
  obraId: number | null = null;
  obra: ObraDetalhesDto | null = null;
  loading: boolean = true;
  error: string | null = null;
  currentTab: string = 'Dados Básicos'; 
  progress: number = 0; 
  canEditObra: boolean = false; 
  diariosListagem: DiarioObraListagemDto[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private obraService: ObraService,
    private authService: AuthService 
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.obraId = +id; 
        this.loadObraDetails(this.obraId);
      } else {
        this.error = 'Obra ID not provided.';
        this.loading = false;
      }
    });
    this.canEditObra = this.authService.hasRole(['Admin', 'Coordenador']); 
  }

  loadObraDetails(id: number): void {
    this.loading = true;
    this.obraService.getObraById(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.obra = response.data;
        } else {
          this.obra = response;
        }

        if (this.obra && this.obra.manutencoes) {
          this.obra.manutencoes = this.obra.manutencoes.map((manutencao: ManutencaoDto) => ({
            id: manutencao.id!, 
            dataManutencao: manutencao.dataManutencao || '',
            descricao: manutencao.descricao || '',
            hasFoto: manutencao.hasFoto || false,
            obraId: this.obraId!, 
            nomeObra: this.obra?.nome || '' 
          }));
        }
        if (this.obra && this.obra.diariosObra) {
          this.diariosListagem = this.obra.diariosObra.map((diario: DiarioObraDto) => ({
            id: diario.id!,
            data: diario.data || '',
            clima: diario.clima as Clima, 
            obraId: this.obraId!,
            nomeObra: this.obra?.nome || ''
          }));
        }
        
        setTimeout(() => {
          this.progress = this.calculateProgress(); 
        }, 100);

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
      this.loadObraDetails(this.obraId); 
    }
  }

  refreshManutencoes(): void {
    if (this.obraId) {
      this.loadObraDetails(this.obraId); 
    }
  }

  refreshDiarios(): void {
    if (this.obraId) {
      this.loadObraDetails(this.obraId); 
    }
  }

  refreshDocumentos(): void {
    if (this.obraId) {
      this.loadObraDetails(this.obraId); 
    }
  }

  refreshChecklists(): void {
    if (this.obraId) {
      this.loadObraDetails(this.obraId); 
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

  editObra(): void {
    if (this.obraId) {
      this.router.navigate(['/obras/edit', this.obraId]); 
    }
  }

  deleteObra(): void {
    if (this.obraId && confirm('Você tem certeza que deseja excluir esta obra?')) {
      this.obraService.deleteObra(this.obraId).subscribe({
        next: () => {
          this.router.navigate(['/obras']); 
        },
        error: (err) => {
          console.error('Failed to delete obra:', err);
        }
      });
    }
  }

  navigateToChecklists(): void {
    if (this.obraId) {
      this.currentTab = 'Checklists';
    }
  }

  calculateProgress(): number {
    if (!this.obra || !this.obra.dataInicio || !this.obra.dataTermino) {
      return 0;
    }

    const startDate = new Date(this.obra.dataInicio);
    const endDate = new Date(this.obra.dataTermino);
    const currentDate = new Date();

    if (currentDate < startDate) {
      return 0;
    }

    if (currentDate > endDate) {
      return 100;
    }

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = currentDate.getTime() - startDate.getTime();

    if (totalDuration === 0) {
      return 0; 
    }

    const progress = (elapsedDuration / totalDuration) * 100;
    return Math.min(100, Math.max(0, progress)); 
  }
}