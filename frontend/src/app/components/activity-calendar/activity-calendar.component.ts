import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-activity-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './activity-calendar.component.html',
  styleUrls: ['./activity-calendar.component.scss']
})
export class ActivityCalendarComponent implements OnInit {
  activities: any[] = [];
  filteredActivities: any[] = [];
  loading = false;
  error = '';
  
  // Para la vista de calendario
  weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  
  // Para filtrar por interés
  interests: {id: string, name: string}[] = [];
  selectedInterestId: string = '';

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading = true;
    this.activityService.getAllActivities().subscribe({
      next: (activities) => {
        this.activities = activities;
        this.filteredActivities = [...activities];
        this.extractInterests();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las actividades';
        this.loading = false;
      }
    });
  }
  
  // Extraer intereses únicos de las actividades
  extractInterests(): void {
    const interestsMap = new Map<string, string>();
    
    this.activities.forEach(activity => {
      if (activity.interestId && activity.interestName) {
        interestsMap.set(activity.interestId, activity.interestName);
      }
    });
    
    this.interests = Array.from(interestsMap).map(([id, name]) => ({ id, name }));
    console.log('Intereses disponibles:', this.interests);
  }
  
  // Filtrar actividades por interés
  filterByInterest(interestId: string): void {
    this.selectedInterestId = interestId;
    
    if (!interestId) {
      // Si no hay filtro, mostrar todas las actividades
      this.filteredActivities = [...this.activities];
    } else {
      // Filtrar actividades por el interés seleccionado
      this.filteredActivities = this.activities.filter(activity => 
        activity.interestId === interestId
      );
    }
    
    console.log(`Actividades filtradas por interés ${interestId}:`, this.filteredActivities.length);
  }

  // Método para verificar si hay una actividad en un día y hora específicos
  hasActivityAtTimeSlot(day: string, timeSlot: string): boolean {
    if (!this.filteredActivities || this.filteredActivities.length === 0) return false;
    
    return this.filteredActivities.some((activity: any) => {
      // Extraer solo la hora para comparar
      const slotHour = parseInt(timeSlot.split(':')[0]);
      const startHour = parseInt(activity.startTime.split(':')[0]);
      const endHour = parseInt(activity.endTime.split(':')[0]);
      
      return activity.day === day && slotHour >= startHour && slotHour < endHour;
    });
  }
  
  // Método para obtener el color de fondo para una celda del calendario
  getBackgroundColorForTimeSlot(day: string, timeSlot: string): string {
    const activities = this.getActivitiesAtTimeSlot(day, timeSlot);
    if (activities.length === 0) return '';
    
    // Si hay más de una actividad, usar un color de superposición
    if (activities.length > 1) return 'bg-primary';
    
    // Si solo hay una actividad, usar el color basado en el interés
    const activity = activities[0];
    if (activity.interestId) {
      // Generar un número de 1 a 7 basado en el interestId
      const hash = Array.from(activity.interestId as string).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const colorIndex = (hash % 7) + 1;
      return `interest-${colorIndex}`;
    }
    
    return 'bg-primary';
  }
  
  // Calcular horas totales para un día específico
  getHoursForDay(day: string): number {
    if (!this.filteredActivities || this.filteredActivities.length === 0) return 0;
    
    // Filtrar actividades por día
    const activitiesForDay = this.filteredActivities.filter(activity => activity.day === day);
    
    // Calcular horas totales
    let totalHours = 0;
    activitiesForDay.forEach(activity => {
      const startHour = parseInt(activity.startTime.split(':')[0]);
      const startMinutes = parseInt(activity.startTime.split(':')[1]) || 0;
      const endHour = parseInt(activity.endTime.split(':')[0]);
      const endMinutes = parseInt(activity.endTime.split(':')[1]) || 0;
      
      const startTotalMinutes = startHour * 60 + startMinutes;
      const endTotalMinutes = endHour * 60 + endMinutes;
      
      totalHours += (endTotalMinutes - startTotalMinutes) / 60;
    });
    
    return parseFloat(totalHours.toFixed(1));
  }
  
  // Calcular horas totales para un interés específico
  getHoursForInterest(interestId: string): number {
    if (!this.activities || this.activities.length === 0) return 0;
    
    // Filtrar actividades por interés
    const activitiesForInterest = this.activities.filter(activity => activity.interestId === interestId);
    
    // Calcular horas totales
    let totalHours = 0;
    activitiesForInterest.forEach(activity => {
      const startHour = parseInt(activity.startTime.split(':')[0]);
      const startMinutes = parseInt(activity.startTime.split(':')[1]) || 0;
      const endHour = parseInt(activity.endTime.split(':')[0]);
      const endMinutes = parseInt(activity.endTime.split(':')[1]) || 0;
      
      const startTotalMinutes = startHour * 60 + startMinutes;
      const endTotalMinutes = endHour * 60 + endMinutes;
      
      totalHours += (endTotalMinutes - startTotalMinutes) / 60;
    });
    
    return parseFloat(totalHours.toFixed(1));
  }

  // Método para obtener las actividades en un día y hora específicos
  getActivitiesAtTimeSlot(day: string, timeSlot: string): any[] {
    if (!this.filteredActivities || this.filteredActivities.length === 0) return [];
    
    return this.filteredActivities.filter((activity: any) => {
      // Extraer solo la hora para comparar
      const slotHour = parseInt(timeSlot.split(':')[0]);
      const startHour = parseInt(activity.startTime.split(':')[0]);
      const endHour = parseInt(activity.endTime.split(':')[0]);
      
      return activity.day === day && slotHour >= startHour && slotHour < endHour;
    });
  }
  
  // Método para obtener el nombre de la primera actividad en una celda
  getFirstActivityName(day: string, timeSlot: string): string {
    const activities = this.getActivitiesAtTimeSlot(day, timeSlot);
    if (activities.length === 0) return '';
    
    // Devolver el nombre del interés de la primera actividad
    return activities[0].interestName || 'Actividad';
  }
  
  // Método para obtener el ID de la rutina de la primera actividad en una celda
  getFirstActivityRoutineId(day: string, timeSlot: string): string {
    const activities = this.getActivitiesAtTimeSlot(day, timeSlot);
    if (activities.length === 0) return '';
    
    // Devolver el ID de la rutina de la primera actividad
    return activities[0].routineId || '';
  }
}
