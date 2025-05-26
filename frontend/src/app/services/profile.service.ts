import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/api/profile`;

  constructor(private http: HttpClient) { }

  // Obtener perfil del usuario
  getProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Crear o actualizar perfil
  updateProfile(profileData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, profileData);
  }
}
