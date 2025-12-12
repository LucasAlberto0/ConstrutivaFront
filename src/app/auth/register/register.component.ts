import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { RegisterDto } from '../../shared/models/auth.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData: RegisterDto = { email: '', password: '', confirmPassword: '', nomeCompleto: '', role: 'Fiscal' }; 
  roles: ('Admin' | 'Coordenador' | 'Fiscal')[] = ['Admin', 'Coordenador', 'Fiscal'];

  private _router = inject(Router);
  constructor(private authService: AuthService, private _snackBar: MatSnackBar) { }

  onRegister(): void {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this._snackBar.open('Erro de validação', 'As senhas não conferem.', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar'] });
      return;
    }

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this._snackBar.open('Cadastro realizado!', 'Você pode fazer login agora.', { duration: 2500, verticalPosition: 'top' });
        this._router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        let errorMessage = 'Falha no cadastro. Verifique os dados e tente novamente.';
        if (err.error && err.error.errors && err.error.errors.ConfirmPassword) {
          errorMessage = err.error.errors.ConfirmPassword[0];
        } else if (err.error && err.error.title) {
          errorMessage = err.error.title;
        } else if (err.message) {
          errorMessage = err.message;
        }
        this._snackBar.open('Erro ao cadastrar', errorMessage, { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar'] });
      }
    });
  }
}