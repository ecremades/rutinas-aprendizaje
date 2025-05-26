import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [FormsModule, RouterLink, NgIf],
  standalone: true
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    console.log('Intentando registrar usuario:', { name: this.name, email: this.email });
    
    this.authService.register(this.name, this.email, this.password).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        if (response && response.token) {
          this.authService.saveToken(response.token);
          this.router.navigate(['/dashboard']);
        } else {
          console.error('Respuesta sin token:', response);
          this.errorMessage = 'Error en la respuesta del servidor: no se recibió token';
        }
      },
      error: (error) => {
        console.error('Error de registro:', error);
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Error al registrarse. Por favor, intenta de nuevo.';
        }
      }
    });
  }
}