import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ObraService } from '../../shared/obra.service';
import { AuthService } from '../../shared/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ObraDetalhesDto } from '../../shared/models/obra.model';

@Component({
  selector: 'app-obra-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatSnackBarModule],
  templateUrl: './obra-edit.component.html',
  styleUrls: ['./obra-edit.component.scss']
})
export class ObraEditComponent implements OnInit {
  obraForm: FormGroup;
  loading = false;
  obraId: number | null = null;
  statuses = [
    { value: 0, name: 'Em Andamento' },
    { value: 1, name: 'Em Manutenção' },
    { value: 2, name: 'Suspensa' },
    { value: 3, name: 'Finalizada' }
  ];
  canEditObra: boolean = false;

  constructor(
    private fb: FormBuilder,
    private obraService: ObraService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {
    this.obraForm = this.fb.group({
      nome: ['', Validators.required],
      localizacao: ['', Validators.required],
      contratante: ['', Validators.required],
      contrato: ['', Validators.required],
      ordemInicioServico: ['', Validators.required],
      coordenadorNome: ['', Validators.required],
      administradorNome: [''],
      responsavelTecnicoNome: ['', Validators.required],
      equipe: ['', Validators.required],
      dataInicio: ['', Validators.required],
      dataTermino: ['', Validators.required],
      observacoes: [''],
      status: [0, Validators.required]
    });
    this.canEditObra = this.authService.hasRole(['Admin', 'Coordenador']);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.obraId = +id;
        this.loadObra(this.obraId);
      } else {
        this._snackBar.open('ID da obra não fornecido para edição.', 'Fechar', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar'] });
        this.router.navigate(['/obras']);
      }
    });
  }

  loadObra(id: number): void {
    this.loading = true;
    this.obraService.getObraById(id).subscribe({
      next: (response: any) => {
        const obra: ObraDetalhesDto = response.data || response;
        this.obraForm.patchValue({
          ...obra,
          dataInicio: obra.dataInicio ? new Date(obra.dataInicio).toISOString().split('T')[0] : '',
          dataTermino: obra.dataTermino ? new Date(obra.dataTermino).toISOString().split('T')[0] : ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this._snackBar.open('Falha ao carregar detalhes da obra.', 'Fechar', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar'] });
        this.router.navigate(['/obras']);
      }
    });
  }

  goBack(): void {
    if (this.obraId) {
      this.router.navigate(['/obras', this.obraId]);
    } else {
      this.router.navigate(['/obras']);
    }
  }

  onSubmit(): void {
    if (this.obraForm.valid && this.obraId) {
      this.loading = true;

      const formValue = this.obraForm.value;
      const obraData = {
        ...formValue,
        dataInicio: new Date(formValue.dataInicio + 'T00:00:00Z').toISOString(),
        dataTermino: new Date(formValue.dataTermino + 'T00:00:00Z').toISOString(),
        status: Number(formValue.status)
      };

      this.obraService.updateObra(this.obraId, obraData).subscribe({
        next: () => {
          this.loading = false;
          this._snackBar.open('Obra atualizada com sucesso!', 'Fechar', { duration: 2500, verticalPosition: 'top' });
          this.router.navigate(['/obras', this.obraId]);
        },
        error: (err) => {
          this.loading = false;
          this._snackBar.open('Falha ao atualizar obra. Tente novamente.', 'Fechar', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar'] });
        }
      });
    } else {
      this._snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000, verticalPosition: 'top', panelClass: ['warn-snackbar'] });
    }
  }
}