import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { RoutineService } from './routine.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private routineService: RoutineService
  ) { }

  /**
   * Obtiene todas las actividades de todas las rutinas
   * @returns Observable con un array de actividades
   */
  getAllActivities(): Observable<any[]> {
    console.log('Solicitando todas las rutinas para extraer actividades');
    return this.routineService.getRoutines().pipe(
      map(routines => {
        console.log('Rutinas obtenidas para extraer actividades:', routines);
        // Extraer todas las actividades de todas las rutinas
        const allActivities: any[] = [];
        
        if (!routines || routines.length === 0) {
          console.warn('No hay rutinas disponibles');
          return [];
        }
        
        routines.forEach((routine: any) => {
          console.log(`Procesando rutina: ${routine.name} (${routine._id})`);
          console.log('Actividades en la rutina:', routine.activities);
          
          if (routine.activities && routine.activities.length > 0) {
            // Añadir el nombre de la rutina y la información del interés a cada actividad
            const activitiesWithDetails = routine.activities.map((activity: any) => {
              // Determinar el nombre del interés si existe
              let interestName = '';
              if (activity.interestId) {
                // Intentar obtener el nombre del interés de la actividad
                interestName = activity.interestName || '';
              }
              
              const activityWithDetails = {
                ...activity,
                routineName: routine.name || 'Rutina sin nombre',
                routineId: routine._id,
                interestName: interestName || 'Actividad general'
              };
              
              console.log('Actividad procesada:', activityWithDetails);
              return activityWithDetails;
            });
            
            allActivities.push(...activitiesWithDetails);
          } else {
            console.warn(`La rutina ${routine.name} no tiene actividades`);
          }
        });
        
        console.log('Total de actividades cargadas para el calendario:', allActivities.length);
        return allActivities;
      })
    );
  }
}
