import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

const API_URL = 'http://localhost:3000/api/users';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  register(name: string, email: string, password: string): Observable<any> {
    console.log('Registrando usuario:', { name, email });
    return this.http.post(`${API_URL}/register`, { name, email, password })
      .pipe(
        tap(response => console.log('Respuesta de registro:', response)),
        catchError(this.handleError)
      );
  }

  login(email: string, password: string): Observable<any> {
    console.log('Iniciando sesión:', { email });
    return this.http.post(`${API_URL}/login`, { email, password })
      .pipe(
        tap(response => console.log('Respuesta de login:', response)),
        catchError(this.handleError)
      );
  }
  
  private handleError(error: HttpErrorResponse) {
    console.error('Error en la solicitud HTTP:', error);
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.error?.message || error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${API_URL}/me`);
  }

  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}