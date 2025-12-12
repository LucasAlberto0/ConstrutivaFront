import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DocumentoService } from '../../../shared/documento.service';
import { DocumentoListagemDto, DocumentoCriacaoDto } from '../../../shared/models/documento.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-documento-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './documento-list.component.html',
  styleUrl: './documento-list.component.scss'
})
export class DocumentoListComponent implements OnInit, OnChanges {
  @Input() obraId!: number;
  @Input() documentos: DocumentoListagemDto[] = [];
  @Output() documentoAdded = new EventEmitter<void>();
  @Output() documentoDeleted = new EventEmitter<void>();

  selectedFile: File | null = null;
  uploadProgress: number = 0;
  selectedFolder: string = '';
  groupedDocuments: { [key: string]: DocumentoListagemDto[] } = {};

  constructor(
    private documentoService: DocumentoService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documentos'] && changes['documentos'].currentValue) {
      this.groupDocumentsByFolder(changes['documentos'].currentValue);
    }
  }

  private groupDocumentsByFolder(documents: DocumentoListagemDto[]): void {
    this.groupedDocuments = documents.reduce((acc, document) => {
      const folderName = document.tipo ? document.tipo.toString() : 'Outros'; 
      if (!acc[folderName]) {
        acc[folderName] = [];
      }
      acc[folderName].push(document);
      return acc;
    }, {} as { [key: string]: DocumentoListagemDto[] });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.uploadProgress = 0;
  }

  onUpload(): void {
    if (!this.selectedFile || !this.obraId) {
      this.snackBar.open('Nenhum arquivo selecionado ou ID da obra ausente.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
      return;
    }

    const documentDescription = `Documento anexado para obra ${this.obraId}`;
    const documentType = this.selectedFolder || 'Outros'; 
    const newDocumento: DocumentoCriacaoDto = {
      nome: this.selectedFile.name,
      caminhoArquivo: this.selectedFile.name, 
      obraId: this.obraId,
      descricao: documentDescription,
      tipo: documentType
    };

    this.documentoService.createDocumento(this.obraId, newDocumento).subscribe({
      next: (createdDocumento) => {
        if (createdDocumento.id) {
          this.documentoService.uploadDocumento(this.obraId, createdDocumento.id, this.selectedFile!, documentDescription, documentType).subscribe({
            next: (event: any) => {
              if (event.type === HttpEventType.UploadProgress) {
                this.uploadProgress = Math.round(100 * (event.loaded / event.total));
              } else if (event.type === HttpEventType.Response) {
                this.selectedFile = null;
                this.uploadProgress = 0;
                this.documentoAdded.emit(); 
                this.snackBar.open('Documento enviado com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'], verticalPosition: 'top' });
              }
            },
            error: (uploadErr) => {
              this.snackBar.open('Erro ao fazer upload do arquivo.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
              if (createdDocumento.id) {
                this.documentoService.deleteDocumento(this.obraId, createdDocumento.id).subscribe(() => {
                });
              }
            }
          });
        }
      },
      error: (createErr) => {
        this.snackBar.open('Erro ao criar entrada do documento.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
      }
    });
  }

  onDownload(documento: DocumentoListagemDto): void {
    if (documento.id && this.obraId) {
      this.documentoService.downloadDocumento(this.obraId, documento.id).subscribe({
        next: (response: Blob) => {
          const filename = documento.nome || 'download';
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(response);
          a.href = objectUrl;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(objectUrl);
        },
        error: (err) => {
          this.snackBar.open('Erro ao baixar documento.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
        }
      });
    }
  }

  formatBytes(bytes: number | undefined, decimals = 2): string {
    if (bytes === undefined || bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  onDelete(documento: DocumentoListagemDto): void {
    if (!documento.id || !this.obraId) {
      this.snackBar.open('ID do documento ou ID da obra ausente para exclusão.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o documento "${documento.nome}"?`)) {
      this.documentoService.deleteDocumento(this.obraId, documento.id).subscribe({
        next: () => {
          this.documentoDeleted.emit(); 
          this.snackBar.open('Documento excluído com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'], verticalPosition: 'top' });
        },
        error: (err) => {
          this.snackBar.open('Erro ao excluir documento.', 'Fechar', { duration: 3000, verticalPosition: 'top' });
        }
      });
    }
  }
}