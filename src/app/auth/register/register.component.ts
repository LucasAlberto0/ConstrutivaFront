import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { RegisterDto } from '../../shared/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData: RegisterDto = { email: '', password: '', confirmPassword: '', nomeCompleto: '' };
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onRegister(): void {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.successMessage = 'Cadastro realizado com sucesso! Você pode fazer login agora.';
        // Optionally redirect to login after successful registration
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = 'Falha no cadastro. Verifique os dados e tente novamente.';
        console.error('Register error:', err);
      }
    });
  }
}