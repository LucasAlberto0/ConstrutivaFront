import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AditivoService } from '../../../shared/aditivo.service';
import { AditivoListagemDto, AditivoCriacaoDto } from '../../../shared/models/aditivo.model';
import { AuthService } from '../../../shared/auth.service';

@Component({
  selector: 'app-aditivo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aditivo-list.component.html',
  styleUrls: ['./aditivo-list.component.scss']
})
export class AditivoListComponent implements OnInit {
  @Input() obraId!: number;
  @Input() aditivos: AditivoListagemDto[] = [];
  @Output() aditivoAdded = new EventEmitter<void>();
  @Output() aditivoDeleted = new EventEmitter<void>();

  newAditivo: AditivoCriacaoDto = {
    descricao: '',
    data: new Date().toISOString(),
    obraId: 0
  };
  loading: boolean = false;
  error: string | null = null;
  canManageAditivos: boolean = false;

  constructor(private aditivoService: AditivoService, private authService: AuthService) { }

  ngOnInit(): void {
    this.newAditivo.obraId = this.obraId;
    this.canManageAditivos = this.authService.hasRole(['Admin', 'Coordenador']);
  }

  addAditivo(): void {
    if (!this.newAditivo.descricao || !this.newAditivo.data) {
      this.error = 'Descrição e data são obrigatórias.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.aditivoService.createAditivo(this.obraId, this.newAditivo).subscribe({
      next: () => {
        this.newAditivo = { descricao: '', data: new Date().toISOString(), obraId: this.obraId };
        this.aditivoAdded.emit(); 
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Falha ao adicionar aditivo.';
        this.loading = false;
        console.error('Erro ao adicionar aditivo:', err);
      }
    });
  }

  deleteAditivo(aditivoId: number | undefined): void {
    if (!aditivoId || !confirm('Tem certeza que deseja excluir este aditivo?')) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.aditivoService.deleteAditivo(this.obraId, aditivoId).subscribe({
      next: () => {
        this.aditivoDeleted.emit(); 
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Falha ao excluir aditivo.';
        this.loading = false;
        console.error('Erro ao excluir aditivo:', err);
      }
    });
  }
}