import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // Import RouterLink
import { AuthService } from '../../shared/auth.service';
import { LoginDto } from '../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Add RouterLink to imports
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData: LoginDto = { email: '', password: '' };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onLogin(): void {
    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        console.error('Login error:', err);
      }
    });
  }
}