import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiarioService } from '../../../shared/diario.service';
import { DiarioObraListagemDto, DiarioObraCriacaoDto, ComentarioCriacaoDto, Clima, DiarioObraDetalhesDto } from '../../../shared/models/diario.model';
import { ComentarioDto } from '../../../shared/models/comentario.model';
import { AuthService } from '../../../shared/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-diario-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './diario-list.component.html',
  styleUrls: ['./diario-list.component.scss']
})
export class DiarioListComponent implements OnInit {
  @Input() obraId!: number;
  @Input() diarios: DiarioObraListagemDto[] = [];
  @Output() diarioAdded = new EventEmitter<void>();
  @Output() diarioDeleted = new EventEmitter<void>();

  climaOptions: Clima[] = ['Ensolarado', 'Nublado', 'Chuvoso', 'ParcialmenteNublado', 'Tempestade'];

  newDiario: DiarioObraCriacaoDto = {
    data: new Date().toISOString(),
    clima: 'Ensolarado',
    quantidadeColaboradores: 0,
    descricaoAtividades: '',
    observacoes: '',
    obraId: 0,
    foto: undefined,
    comentarios: []
  };
  selectedFile: File | undefined;
  newComentarioTexto: string = '';
  currentDiarioDetalhes: DiarioObraDetalhesDto | null = null;
  currentDiarioPhotoUrl: string | undefined; 
  loading: boolean = false;
  canManageDiarios: boolean = false;

  constructor(private diarioService: DiarioService, private authService: AuthService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.newDiario.obraId = this.obraId;
    this.canManageDiarios = this.authService.hasRole(['Admin', 'Fiscal']);
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.newDiario.foto = this.selectedFile;
    } else {
      this.selectedFile = undefined;
      this.newDiario.foto = undefined;
    }
  }

  addDiario(): void {
    if (!this.newDiario.data || !this.newDiario.clima || !this.newDiario.descricaoAtividades) {
      this.snackBar.open('Data, Clima e Atividades são obrigatórios para o diário.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
      return;
    }

    this.loading = true;

    const diarioToCreate: DiarioObraCriacaoDto = {
      ...this.newDiario,
      foto: this.selectedFile
    };

    this.diarioService.createDiario(this.obraId, diarioToCreate).subscribe({
      next: () => {
        this.newDiario = {
          data: new Date().toISOString().split('T')[0],
          clima: 'Ensolarado',
          quantidadeColaboradores: 0,
          descricaoAtividades: '',
          observacoes: '',
          obraId: this.obraId,
          foto: undefined,
          comentarios: []
        };
        this.selectedFile = undefined;
        this.diarioAdded.emit();
        this.loading = false;
        this.snackBar.open('Diário de obra adicionado com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'], verticalPosition: 'top' });
      },
      error: (err) => {
        this.snackBar.open('Falha ao adicionar diário de obra.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
        this.loading = false;
        console.error('Erro ao adicionar diário:', err);
      }
    });
  }

  deleteDiario(diarioId: number | undefined): void {
    if (!diarioId || !confirm('Tem certeza que deseja excluir este diário de obra?')) {
      return;
    }

    this.loading = true;
    this.diarioService.deleteDiario(this.obraId, diarioId).subscribe({
      next: () => {
        this.diarioDeleted.emit();
        this.loading = false;
        this.snackBar.open('Diário de obra excluído com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'], verticalPosition: 'top' });
      },
      error: (err) => {
        this.snackBar.open('Falha ao excluir diário de obra.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
        this.loading = false;
        console.error('Erro ao excluir diário:', err);
      }
    });
  }

  viewDiarioDetails(diarioId: number | undefined): void {
    if (!diarioId) return;

    this.loading = true;
    this.currentDiarioPhotoUrl = undefined;

    this.diarioService.getDiarioById(this.obraId, diarioId).subscribe({
      next: (details) => {
        this.currentDiarioDetalhes = details;
        if (details.hasFoto) {
          this.diarioService.getDiarioPhoto(this.obraId, diarioId).subscribe({
            next: (photoBlob) => {
              const objectURL = URL.createObjectURL(photoBlob);
              this.currentDiarioPhotoUrl = objectURL;
            },
            error: (photoErr) => {
              console.error('Erro ao carregar foto do diário:', photoErr);
              this.snackBar.open('Falha ao carregar foto do diário.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
            }
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Falha ao carregar detalhes do diário.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
        this.loading = false;
        console.error('Erro ao carregar detalhes do diário:', err);
      }
    });
  }

  closeDiarioDetails(): void {
    this.currentDiarioDetalhes = null;
    if (this.currentDiarioPhotoUrl) {
      URL.revokeObjectURL(this.currentDiarioPhotoUrl); 
      this.currentDiarioPhotoUrl = undefined;
    }
  }

  addComentario(diarioId: number | undefined): void {
    if (!diarioId || !this.newComentarioTexto) {
      this.snackBar.open('Comentário é obrigatório.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
      return;
    }

    const comentario: ComentarioCriacaoDto = {
      texto: this.newComentarioTexto
    };

    this.loading = true;
    this.diarioService.addComentarioToDiario(this.obraId, diarioId, comentario).subscribe({
      next: (newComment) => {
        this.newComentarioTexto = '';
        if (this.currentDiarioDetalhes && this.currentDiarioDetalhes.comentarios) {
          this.currentDiarioDetalhes.comentarios.push(newComment);
        } else if (this.currentDiarioDetalhes) {
          this.currentDiarioDetalhes.comentarios = [newComment]; 
        }
        this.loading = false;
        this.snackBar.open('Comentário adicionado com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'], verticalPosition: 'top' });
      },
      error: (err) => {
        this.snackBar.open('Falha ao adicionar comentário.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
        this.loading = false;
        console.error('Erro ao adicionar comentário:', err);
      }
    });
  }

  deleteComentario(diarioId: number | undefined, comentarioId: number | undefined): void {
    if (!diarioId || !comentarioId || !confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }

    this.loading = true;
    this.diarioService.deleteComentarioFromDiario(this.obraId, diarioId, comentarioId).subscribe({
      next: () => {
        this.viewDiarioDetails(diarioId); 
        this.loading = false;
        this.snackBar.open('Comentário excluído com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'], verticalPosition: 'top' });
      },
      error: (err) => {
        this.snackBar.open('Falha ao excluir comentário.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
        this.loading = false;
        console.error('Erro ao excluir comentário:', err);
      }
    });
  }

  getClimaName(climaValue: Clima | number): string {
    if (typeof climaValue === 'string') {
      return climaValue;
    }
    switch (climaValue) {
      case 0: return 'Ensolarado';
      case 1: return 'Nublado';
      case 2: return 'Chuvoso';
      case 3: return 'Parcialmente Nublado';
      case 4: return 'Tempestade';
      default: return 'Desconhecido';
    }
  }
}