import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManutencaoService } from '../../../shared/manutencao.service';
import { ManutencaoListagemDto, ManutencaoCriacaoDto } from '../../../shared/models/manutencao.model';
import { AuthService } from '../../../shared/auth.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manutencao-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './manutencao-list.component.html',
  styleUrls: ['./manutencao-list.component.scss']
})
export class ManutencaoListComponent implements OnInit {
  @Input() obraId!: number;
  @Input() manutencoes: ManutencaoListagemDto[] = [];
  @Output() manutencaoAdded = new EventEmitter<void>();
  @Output() manutencaoDeleted = new EventEmitter<void>();

  newManutencao: ManutencaoCriacaoDto = {
    dataManutencao: new Date().toISOString().split('T')[0], 
    descricao: '',
    obraId: 0
  };
  selectedFile: File | null = null;
  loading: boolean = false;
  canManageManutencoes: boolean = false;
  manutencaoImageUrls: { [key: number]: string } = {}; 

  showModal: boolean = false;
  modalImageUrl: string = '';

  openImageModal(imageUrl: string): void {
    this.modalImageUrl = imageUrl;
    this.showModal = true;
  }

  closeImageModal(): void {
    this.showModal = false;
    this.modalImageUrl = '';
  }

  constructor(
    private manutencaoService: ManutencaoService,
    private authService: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.newManutencao.obraId = this.obraId;
    this.canManageManutencoes = this.authService.hasRole(['Admin', 'Coordenador']);
    this.manutencoes.forEach(manutencao => {
      if (manutencao.hasFoto && manutencao.id) {
        this.fetchManutencaoPhoto(manutencao.id);
      }
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  addManutencao(): void {
    if (!this.newManutencao.dataManutencao || !this.newManutencao.descricao) {
      this.snackBar.open('Data da manutenção e descrição são obrigatórias.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
      return;
    }

    this.loading = true;

    const formData = new FormData();
    formData.append('DataManutencao', this.newManutencao.dataManutencao);
    formData.append('Descricao', this.newManutencao.descricao);
    formData.append('ObraId', this.obraId.toString());
    if (this.selectedFile) {
      formData.append('Foto', this.selectedFile, this.selectedFile.name);
    }

    this.manutencaoService.createManutencao(this.obraId, formData).subscribe({
      next: () => {
        this.newManutencao = {
          dataManutencao: new Date().toISOString().split('T')[0],
          descricao: '',
          obraId: this.obraId
        };
        this.selectedFile = null; 
        this.manutencaoAdded.emit(); 
        this.loading = false;
        this.snackBar.open('Manutenção adicionada com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'], verticalPosition: 'top' });
      },
      error: (err) => {
        this.snackBar.open('Falha ao adicionar manutenção.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
        this.loading = false;
        console.error('Erro ao adicionar manutenção:', err);
      }
    });
  }

  deleteManutencao(manutencaoId: number | undefined): void {
    if (!manutencaoId || !confirm('Tem certeza que deseja excluir esta manutenção?')) {
      return;
    }

    this.loading = true;
    this.manutencaoService.deleteManutencao(this.obraId, manutencaoId).subscribe({
      next: () => {
        this.manutencaoDeleted.emit();
        this.loading = false;
        this.snackBar.open('Manutenção excluída com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'], verticalPosition: 'top' });
      },
      error: (err) => {
        this.snackBar.open('Falha ao excluir manutenção.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
        this.loading = false;
        console.error('Erro ao excluir manutenção:', err);
      }
    });
  }

  fetchManutencaoPhoto(manutencaoId: number): void {
    const photoUrl = this.manutencaoService.getManutencaoPhotoUrl(this.obraId, manutencaoId);
    this.http.get(photoUrl, { responseType: 'blob' }).subscribe({
      next: (imageBlob: Blob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        this.manutencaoImageUrls[manutencaoId] = objectURL;
      },
      error: (err) => {
        console.error(`Erro ao buscar foto para manutenção ${manutencaoId}:`, err);
        this.snackBar.open('Erro ao buscar foto para manutenção.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
      }
    });
  }

  getManutencaoPhotoUrl(manutencaoId: number): string {
    return this.manutencaoImageUrls[manutencaoId] || ''; 
  }
}