import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoutineService } from '../../services/routine.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-routine-list',
  templateUrl: './routine-list.component.html',
  styleUrls: ['./routine-list.component.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class RoutineListComponent implements OnInit {
  routines: any[] = [];
  loading = false;
  error = '';
  deleteId: string | null = null;
  userInterests: any[] = [];

  constructor(
    private routineService: RoutineService,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRoutines();
    this.loadUserInterests();
  }
  
  // Cargar intereses del perfil del usuario
  loadUserInterests(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile && profile.interests && profile.interests.length > 0) {
          this.userInterests = profile.interests;
        }
      },
      error: (err) => {
        console.error('Error al cargar el perfil:', err);
      }
    });
  }
  
  // Obtener el interés correspondiente a una rutina
  getInterestForRoutine(routine: any): any {
    if (!this.userInterests || this.userInterests.length === 0) return null;
    
    // Primero intentar buscar por interestId
    if (routine.interestId) {
      const interest = this.userInterests.find(interest => interest._id === routine.interestId);
      if (interest) return interest;
    }
    
    // Si no tiene interestId o no se encontró, intentar por interestName
    if (routine.interestName) {
      const interest = this.userInterests.find(interest => interest.name === routine.interestName);
      if (interest) return interest;
    }
    
    // Como último recurso, intentar por el nombre de la rutina (compatibilidad con versiones anteriores)
    return this.userInterests.find(interest => interest.name === routine.name);
  }
  
  // Calcular las horas totales de una rutina
  calculateRoutineHours(routine: any): number {
    if (!routine.activities || routine.activities.length === 0) return 0;
    
    let totalHours = 0;
    
    routine.activities.forEach((activity: any) => {
      if (activity.startTime && activity.endTime) {
        const startHour = parseInt(activity.startTime.split(':')[0]);
        const startMinute = parseInt(activity.startTime.split(':')[1]) || 0;
        const endHour = parseInt(activity.endTime.split(':')[0]);
        const endMinute = parseInt(activity.endTime.split(':')[1]) || 0;
        
        // Calcular la diferencia en horas
        let hourDiff = endHour - startHour;
        const minuteDiff = endMinute - startMinute;
        
        // Ajustar por diferencia de minutos
        hourDiff += minuteDiff / 60;
        
        // Si es negativo, asumir que cruza la medianoche
        if (hourDiff < 0) {
          hourDiff += 24;
        }
        
        totalHours += hourDiff;
      }
    });
    
    return totalHours;
  }

  loadRoutines(): void {
    console.log('Cargando rutinas...');
    this.loading = true;
    this.routineService.getRoutines().subscribe({
      next: (routines) => {
        console.log('Rutinas cargadas:', routines);
        this.routines = routines;
        
        // Verificar si hay rutinas con actividades
        if (routines && routines.length > 0) {
          let totalActivities = 0;
          routines.forEach((routine: any) => {
            if (routine.activities && routine.activities.length > 0) {
              totalActivities += routine.activities.length;
              console.log(`Rutina ${routine.name} tiene ${routine.activities.length} actividades`);
            } else {
              console.warn(`Rutina ${routine.name} no tiene actividades`);
            }
          });
          console.log(`Total de rutinas: ${routines.length}, Total de actividades: ${totalActivities}`);
        } else {
          console.warn('No se encontraron rutinas');
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar las rutinas:', err);
        this.error = 'Error al cargar las rutinas: ' + (err.message || 'Error desconocido');
        this.loading = false;
      }
    });
  }

  viewRoutine(id: string): void {
    this.router.navigate(['/routine', id]);
  }

  editRoutine(id: string): void {
    this.router.navigate(['/routine-editor', id]);
  }

  confirmDelete(id: string): void {
    this.deleteId = id;
  }

  cancelDelete(): void {
    this.deleteId = null;
  }

  deleteRoutine(): void {
    if (this.deleteId) {
      this.routineService.deleteRoutine(this.deleteId).subscribe({
        next: () => {
          this.loadRoutines();
          this.deleteId = null;
        },
        error: (err) => {
          this.error = 'Error al eliminar la rutina';
          this.deleteId = null;
        }
      });
    }
  }

  createNewRoutine(): void {
    this.router.navigate(['/routine-editor']);
  }

  /**
   * Navega a la vista de todas las actividades
   * Como no existe una vista específica de actividades, redirigimos al dashboard
   */
  viewActivities(): void {
    console.log('Navegando al dashboard para ver todas las actividades');
    this.router.navigate(['/dashboard']);
  }
}
