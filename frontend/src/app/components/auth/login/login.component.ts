import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, RouterLink, NgIf],
  standalone: true
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    console.log('Intentando iniciar sesión con:', { email: this.email });
    
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        if (response && response.token) {
          this.authService.saveToken(response.token);
          this.router.navigate(['/dashboard']);
        } else {
          console.error('Respuesta sin token:', response);
          this.errorMessage = 'Error en la respuesta del servidor: no se recibió token';
        }
      },
      error: (error) => {
        console.error('Error de login:', error);
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
        }
      }
    });
  }
}