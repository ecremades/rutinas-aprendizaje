import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private apiUrl = `${environment.apiUrl}/api/routines`;

  constructor(private http: HttpClient) { }

  // Obtener todas las rutinas
  getRoutines(): Observable<any[]> {
    console.log('Obteniendo rutinas desde:', this.apiUrl);
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(routines => {
        console.log('Rutinas obtenidas:', routines);
      }),
      catchError(this.handleError('getRoutines'))
    );
  }

  // Obtener una rutina específica
  getRoutine(id: string): Observable<any> {
    console.log(`Obteniendo rutina con ID ${id}`);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(routine => {
        console.log('Rutina obtenida:', routine);
      }),
      catchError(this.handleError('getRoutine'))
    );
  }

  // Crear una nueva rutina
  createRoutine(routineData: any): Observable<any> {
    console.log('Creando rutina con datos:', routineData);
    
    // Asegurarnos de que la rutina tenga un nombre
    if (!routineData.name) {
      routineData.name = 'Rutina de actividades';
    }
    
    // Asegurarnos de que cada actividad tenga una descripción
    if (routineData.activities && routineData.activities.length > 0) {
      routineData.activities = routineData.activities.map((activity: any) => {
        if (!activity.description) {
          activity.description = `Actividad de ${activity.interestName || 'aprendizaje'}`;
        }
        return activity;
      });
    }
    
    return this.http.post<any>(this.apiUrl, routineData).pipe(
      tap(response => {
        console.log('Rutina creada exitosamente:', response);
      }),
      catchError(this.handleError('createRoutine'))
    );
  }

  // Actualizar una rutina existente
  updateRoutine(id: string, routineData: any): Observable<any> {
    console.log(`Actualizando rutina ${id} con datos:`, routineData);
    
    // Asegurarnos de que la rutina tenga un nombre
    if (!routineData.name) {
      routineData.name = 'Rutina de actividades';
    }
    
    // Asegurarnos de que cada actividad tenga una descripción
    if (routineData.activities && routineData.activities.length > 0) {
      routineData.activities = routineData.activities.map((activity: any) => {
        if (!activity.description) {
          activity.description = `Actividad de ${activity.interestName || 'aprendizaje'}`;
        }
        return activity;
      });
    }
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, routineData).pipe(
      tap(response => {
        console.log('Rutina actualizada exitosamente:', response);
      }),
      catchError(this.handleError('updateRoutine'))
    );
  }

  // Eliminar una rutina
  deleteRoutine(id: string): Observable<any> {
    console.log(`Eliminando rutina con ID ${id}`);
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(response => {
        console.log('Rutina eliminada exitosamente:', response);
      }),
      catchError(this.handleError('deleteRoutine'))
    );
  }
  
  // Método para manejar errores HTTP
  private handleError(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`${operation} falló:`, error);
      console.error(`Mensaje de error:`, error.message);
      
      if (error.error instanceof ErrorEvent) {
        console.error(`Error del cliente:`, error.error.message);
      } else {
        console.error(`Código de error del servidor: ${error.status}, ` +
                      `Cuerpo: ${JSON.stringify(error.error)}`);
      }
      
      return throwError(() => new Error(`${operation} falló: ${error.message}`));
    };
  }
}
