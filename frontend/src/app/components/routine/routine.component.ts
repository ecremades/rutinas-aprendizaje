import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { RoutineService } from '../../services/routine.service';

@Component({
  selector: 'app-routine',
  templateUrl: './routine.component.html',
  styleUrls: ['./routine.component.scss'],
  imports: [CommonModule, RouterModule, NgClass, NgFor, NgIf],
  standalone: true
})
export class RoutineComponent implements OnInit {
  routine: any = null;
  loading = false;
  error = '';
  deleteId: string | null = null;
  viewMode: 'list' | 'calendar' = 'list';
  
  // Para la vista de calendario
  weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  
  constructor(
    private routineService: RoutineService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRoutine(id);
    }
  }

  loadRoutine(id: string): void {
    this.loading = true;
    this.routineService.getRoutine(id).subscribe({
      next: (routine) => {
        this.routine = routine;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la rutina';
        this.loading = false;
      }
    });
  }

  editRoutine(): void {
    this.router.navigate(['/routine-editor', this.routine._id]);
  }

  confirmDelete(): void {
    this.deleteId = this.routine._id;
  }

  cancelDelete(): void {
    this.deleteId = null;
  }

  deleteRoutine(): void {
    if (this.deleteId) {
      this.routineService.deleteRoutine(this.deleteId).subscribe({
        next: () => {
          this.router.navigate(['/routines']);
        },
        error: (err) => {
          this.error = 'Error al eliminar la rutina';
          this.deleteId = null;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/routines']);
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'calendar' : 'list';
  }

  // Método para verificar si hay actividades para un día específico
  hasActivitiesForDay(day: string): boolean {
    if (!this.routine || !this.routine.activities) return false;
    return this.routine.activities.some((activity: any) => activity.day === day);
  }

  // Obtener actividades para un día específico (reemplaza el pipe filter)
  getActivitiesForDay(day: string): any[] {
    if (!this.routine || !this.routine.activities) return [];
    return this.routine.activities.filter((activity: any) => activity.day === day);
  }

  // Método para verificar si hay una actividad en un día y hora específicos
  hasActivityAtTimeSlot(day: string, timeSlot: string): boolean {
    if (!this.routine || !this.routine.activities) return false;
    
    return this.routine.activities.some((activity: any) => {
      // Extraer solo la hora para comparar
      const slotHour = parseInt(timeSlot.split(':')[0]);
      const startHour = parseInt(activity.startTime.split(':')[0]);
      const endHour = parseInt(activity.endTime.split(':')[0]);
      
      return activity.day === day && slotHour >= startHour && slotHour < endHour;
    });
  }

  // Método para obtener la descripción de una actividad en un día y hora específicos
  getActivityDescription(day: string, timeSlot: string): string {
    if (!this.routine || !this.routine.activities) return '';
    
    const activity = this.routine.activities.find((activity: any) => {
      // Extraer solo la hora para comparar
      const slotHour = parseInt(timeSlot.split(':')[0]);
      const startHour = parseInt(activity.startTime.split(':')[0]);
      const endHour = parseInt(activity.endTime.split(':')[0]);
      
      return activity.day === day && slotHour >= startHour && slotHour < endHour;
    });
    
    // Devolver el nombre de la rutina en lugar de la descripción
    return activity ? this.routine.name : '';
  }
}
