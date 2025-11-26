import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';



import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


import { AuthService } from '../../shared/auth.service';

import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


import { HttpErrorResponse } from '@angular/common/http';


 @Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  private _router = inject(Router);
  clickLogar: boolean = false;
  constructor(private _fb: FormBuilder, private _authService: AuthService, private _snackBar: MatSnackBar) { }
  loading: Boolean = false;
  submitted = false;

  ngOnInit(): void {
    this.loginForm = this._fb.group({
      email: [null, [Validators.email, Validators.required]],
      senha: [null, Validators.required]
    })
  }

  login() {
    this.submitted = true;

    const form = this.loginForm;
    if (!form) return;

    const emailControl = form.get('email');
    const senhaControl = form.get('senha');

    if(emailControl?.hasError('required')) {
      this._snackBar.open('Campo obrigatório', 'O email é obrigatório.', { duration: 3000, verticalPosition: 'top', panelClass: ['warn-snackbar'] });
      return;
    }

    if(emailControl?.hasError('email')) {
      this._snackBar.open('Email inválido', 'Digite um endereço de email válido', { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar'] });
      return;
    }

    if(senhaControl?.hasError('required')) {
      this._snackBar.open('Campo obrigatório', 'A senha é obrigatória.', { duration: 3000, verticalPosition: 'top', panelClass: ['warn-snackbar'] });
      return;
    }

    if(!form.valid) {
      this._snackBar.open('Formulário inválido', 'Preencha todos os campos corretamente.', { duration: 3000, verticalPosition: 'top', panelClass: ['warn-snackbar'] });
      return;
    }

    const { email, senha } = form.getRawValue();

    this._authService.login({ email, password: senha }).subscribe({
      next: (value: { token: string }) => {
        localStorage.setItem('token', value.token);
        this._snackBar.open('Login realizado!', 'Bem-vindo!', { duration: 2500, verticalPosition: 'top' });



        setTimeout(() => {
          this._router.navigateByUrl('/dashboard');
        }, 1000);

        this.load(0);
      },
      error: (err: HttpErrorResponse) => {
        let errorMessage = 'Credenciais inválidas. Tente novamente.';
        if (err instanceof HttpErrorResponse && err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        this._snackBar.open('Erro ao fazer login', errorMessage, { duration: 3000, verticalPosition: 'top', panelClass: ['error-snackbar'] });

        this.submitted = false;
        this.load(0);
      }
    });
    this.clickLogar = false;
  }


  load(time = 1000000) {
        this.loading = true;

        setTimeout(() => {
            this.loading = false
        }, time);
    }
}