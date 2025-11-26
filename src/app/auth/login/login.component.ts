import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../shared/auth.service';
import { MessageModule } from 'primeng/message';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { HttpErrorResponse } from '@angular/common/http';


 @Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, ButtonModule, FormsModule, PasswordModule, FloatLabelModule, InputTextModule, ReactiveFormsModule, MessageModule, ToastModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  private _router = inject(Router);
  clickLogar: boolean = false;
  constructor(private _fb: FormBuilder, private _authService: AuthService, private _messageService: MessageService) { }
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

    if(emailControl?.hasError('required')) return this._toast('warn', 'Campo obrigatório', 'O email é obrigatório.');

    if(emailControl?.hasError('email')) return this._toast('error', 'Email inválido', 'Digite um endereço de email válido');

    if(senhaControl?.hasError('required')) return this._toast('warn', 'Campo obrigatório', 'A senha é obrigatória.');

    if(!form.valid)  return this._toast('warn', 'Formulário inválido', 'Preencha todos os campos corretamente.');

    const { email, senha } = form.getRawValue();

    this._authService.login({ email, password: senha }).subscribe({
      next: (value: { token: string }) => {
        localStorage.setItem('token', value.token);

        this._messageService.add({
          severity: 'success',
          summary: 'Login realizado!',
          detail: 'Bem-vindo!',
          life: 2500
        });

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
        this._messageService.add({
          severity: 'error',
          summary: 'Erro ao fazer login',
          detail: errorMessage,
          life: 3000,
        });
        this.submitted = false;
        this.load(0);
      }
    });
    this.clickLogar = false;
  }

  private _toast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) {
    this._messageService.add({ severity, summary, detail, life: 3000, });
    this.load(0);
  }
  load(time = 1000000) {
        this.loading = true;

        setTimeout(() => {
            this.loading = false
        }, time);
    }
}