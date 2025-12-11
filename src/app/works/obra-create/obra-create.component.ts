import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ObraService } from '../../shared/obra.service';
import { AuthService } from '../../shared/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-obra-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatSnackBarModule],
  templateUrl: './obra-create.component.html',
  styleUrls: ['./obra-create.component.scss']
})
export class ObraCreateComponent {
  obraForm: FormGroup;
  loading = false;
  statuses = [
    { value: 0, name: 'Em Andamento' },
    { value: 1, name: 'Em Manutenção' },
    { value: 2, name: 'Suspensa' },
    { value: 3, name: 'Finalizada' }
  ];
  canCreateObra: boolean = false;

  constructor(
    private fb: FormBuilder,
    private obraService: ObraService,
    private router: Router,
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
    this.canCreateObra = this.authService.hasRole(['Admin', 'Coordenador']);
    console.log('ObraCreateComponent: canCreateObra =', this.canCreateObra);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onSubmit(): void {
    if (this.obraForm.valid) {
      this.loading = true;

      const formValue = this.obraForm.value;
      const obraData = {
        ...formValue,
        dataInicio: new Date(formValue.dataInicio + 'T00:00:00Z').toISOString(),
        dataTermino: new Date(formValue.dataTermino + 'T00:00:00Z').toISOString(),
        status: Number(formValue.status)
      };

      this.obraService.createObra(obraData).subscribe({
        next: () => {
          this.loading = false;
          this._snackBar.open('Obra criada com sucesso!', 'Fechar', { duration: 2500, verticalPosition: 'top' });
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this._snackBar.open('Falha ao criar obra. Tente novamente.', 'Fechar', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar'] });
          console.error(err);
        }
      });
    } else {
      this._snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000, verticalPosition: 'top', panelClass: ['warn-snackbar'] });
    }
  }
}
