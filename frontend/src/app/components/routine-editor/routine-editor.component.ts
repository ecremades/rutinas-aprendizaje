import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoutineService } from '../../services/routine.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-routine-editor',
  templateUrl: './routine-editor.component.html',
  styleUrls: ['./routine-editor.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true
})
export class RoutineEditorComponent implements OnInit {
  routineForm: FormGroup;
  loading = false;
  submitting = false;
  error = '';
  routineId: string | null = null;
  isEditMode = false;
  userInterests: any[] = [];

  constructor(
    private fb: FormBuilder,
    private routineService: RoutineService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.routineForm = this.fb.group({
      name: ['Rutina de actividades'], // Ya no es un campo visible, pero mantenemos el valor por defecto
      activities: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.routineId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.routineId;

    // Cargar los intereses del perfil del usuario
    this.loadUserInterests();

    // Ya no necesitamos escuchar cambios en el interés seleccionado
    // porque cada actividad tiene su propio interés

    if (this.isEditMode && this.routineId) {
      this.loadRoutine(this.routineId);
    } else {
      // Si es modo creación, añadir una actividad vacía
      this.addActivity();
    }
  }

  // Cargar intereses del perfil del usuario
  loadUserInterests(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile && profile.interests && profile.interests.length > 0) {
          this.userInterests = profile.interests;
          console.log('Intereses cargados:', this.userInterests);
        } else {
          this.error = 'No hay intereses definidos en el perfil. Por favor, define intereses en tu perfil primero.';
        }
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.error = 'No se encontró un perfil. Por favor, crea tu perfil primero.';
        } else {
          this.error = 'Error al cargar el perfil';
        }
        this.loading = false;
      }
    });
  }

  // Cargar una rutina existente
  loadRoutine(id: string): void {
    this.loading = true;
    this.routineService.getRoutine(id).subscribe({
      next: (routine) => {
        // Esperar a que los intereses se carguen antes de asignar valores
        if (this.userInterests.length === 0) {
          const profileSubscription = this.profileService.getProfile().subscribe({
            next: (profile) => {
              if (profile && profile.interests) {
                this.userInterests = profile.interests;
                this.setRoutineFormValues(routine);
              }
              profileSubscription.unsubscribe();
            },
            error: (err) => {
              this.error = 'Error al cargar el perfil';
              this.loading = false;
              profileSubscription.unsubscribe();
            }
          });
        } else {
          this.setRoutineFormValues(routine);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar la rutina';
        this.loading = false;
      }
    });
  }

  // Establecer los valores del formulario con los datos de la rutina
  setRoutineFormValues(routine: any): void {
    this.routineForm.patchValue({
      name: routine.name
    });

    // Limpiar y añadir las actividades existentes
    this.activitiesArray.clear();
    if (routine.activities && routine.activities.length > 0) {
      routine.activities.forEach((activity: any) => {
        const activityGroup = this.fb.group({
          interestId: [routine.interestId || '', Validators.required], // Usar el mismo interés de la rutina
          day: [activity.day, Validators.required],
          startTime: [activity.startTime, Validators.required],
          endTime: [activity.endTime, Validators.required]
        });

        // Añadir listeners para validar cuando cambian los tiempos
        activityGroup.get('startTime')?.valueChanges.subscribe(() => {
          this.validateTimeChange();
        });

        activityGroup.get('endTime')?.valueChanges.subscribe(() => {
          this.validateTimeChange();
        });

        this.activitiesArray.push(activityGroup);
      });
    } else {
      // Si no hay actividades, añadir una vacía
      this.addActivity();
    }

    this.loading = false;
  }

  // Getter para acceder al FormArray de actividades
  get activitiesArray(): FormArray {
    return this.routineForm.get('activities') as FormArray;
  }

  // Crear un grupo de formulario para una actividad
  createActivity(): FormGroup {
    const activityGroup = this.fb.group({
      interestId: ['', Validators.required],
      day: ['Lunes', Validators.required], // Día predeterminado
      startTime: ['09:00', Validators.required], // Hora de inicio predeterminada
      endTime: ['10:00', Validators.required] // Hora de fin predeterminada
    });
    
    // Si hay intereses disponibles, seleccionar el primero por defecto
    if (this.userInterests && this.userInterests.length > 0) {
      activityGroup.get('interestId')?.setValue(this.userInterests[0]._id);
    }
    
    // Añadir listeners para validar cuando cambian los tiempos
    activityGroup.get('startTime')?.valueChanges.subscribe(() => {
      this.validateTimeChange();
    });

    activityGroup.get('endTime')?.valueChanges.subscribe(() => {
      this.validateTimeChange();
    });

    return activityGroup;
  }

  // Añadir una nueva actividad al formulario
  addActivity(): void {
    const newActivity = this.createActivity();
    this.activitiesArray.push(newActivity);
    console.log('Nueva actividad añadida al formulario:', newActivity.value);
  }

  // Validar cambios de tiempo
  validateTimeChange(): void {
    // Limpiar error previo de horas
    if (this.error && this.error.includes('horas')) {
      this.error = '';
    }

    // Validar horas disponibles
    this.validateAvailableHours();
  }

  // Reiniciar las actividades (mantener solo una actividad vacía)
  resetActivities(): void {
    // Limpiar las actividades existentes
    this.activitiesArray.clear();
    
    // Añadir una actividad vacía
    this.addActivity();
    
    console.log('Actividades reiniciadas');
  }

  // Validar y añadir una actividad
  validateAndAddActivity(index?: number): void {
    // Validar que todas las actividades actuales sean válidas
    let hasInvalidActivity = false;
    this.activitiesArray.controls.forEach((control: any) => {
      if (control.invalid) {
        hasInvalidActivity = true;
        // Marcar todos los campos como tocados para mostrar errores
        Object.keys(control.controls).forEach(key => {
          control.get(key)?.markAsTouched();
        });
      }
    });

    if (hasInvalidActivity) {
      this.error = 'Hay actividades con campos incompletos. Por favor, revisa todas las actividades antes de añadir una nueva.';
      return;
    }

    // Validar horas disponibles
    if (!this.validateAvailableHours()) {
      return;
    }

    // Si todo es válido, añadir una nueva actividad
    this.addActivity();
    this.error = ''; // Limpiar errores previos
    
    console.log('Actividad validada y añadida correctamente');
    if (index !== undefined) {
      console.log('Actividad añadida desde el índice:', index);
    }
  }

  // Eliminar una actividad del formulario
  removeActivity(index: number): void {
    this.activitiesArray.removeAt(index);
    
    // Si no quedan actividades, añadir una vacía
    if (this.activitiesArray.length === 0) {
      this.addActivity();
    }
    
    // Validar horas disponibles después de eliminar
    this.validateAvailableHours();
  }

  // Método eliminado: getInterestById

  // Calcular el total de horas de las actividades
  calculateTotalHours(): number {
    let totalMinutes = 0;
    
    this.activitiesArray.controls.forEach((control: any) => {
      const startTime = control.get('startTime')?.value;
      const endTime = control.get('endTime')?.value;
      
      if (startTime && endTime) {
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        
        if (endMinutes > startMinutes) {
          totalMinutes += (endMinutes - startMinutes);
        }
      }
    });
    
    return totalMinutes / 60; // Convertir minutos a horas
  }

  // Convertir tiempo en formato HH:MM a minutos
  timeToMinutes(time: string): number {
    if (!time) return 0;
    
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60) + minutes;
  }

  // Validar que las horas de las actividades no excedan las disponibles para cada interés
  validateAvailableHours(): boolean {
    // Agrupar actividades por interés
    const interestHours: {[key: string]: number} = {};
    const interestNames: {[key: string]: string} = {};
    
    this.activitiesArray.controls.forEach((control: any) => {
      const interestId = control.get('interestId')?.value;
      if (!interestId) return;
      
      const startTime = control.get('startTime')?.value;
      const endTime = control.get('endTime')?.value;
      
      if (startTime && endTime) {
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        
        if (endMinutes > startMinutes) {
          const hours = (endMinutes - startMinutes) / 60;
          
          if (!interestHours[interestId]) {
            interestHours[interestId] = 0;
            // Buscar el interés directamente
            const interest = this.userInterests.find(i => i._id === interestId);
            interestNames[interestId] = interest ? interest.name : 'Desconocido';
          }
          
          interestHours[interestId] += hours;
        }
      }
    });
    
    // Validar cada interés
    for (const interestId in interestHours) {
      // Buscar el interés directamente
      const interest = this.userInterests.find(i => i._id === interestId);
      if (!interest) continue;
      
      const availableHours = interest.hoursPerWeek || 0;
      const usedHours = interestHours[interestId];
      
      console.log('Validando horas para interés:', { 
        interés: interest.name, 
        horasDisponibles: availableHours, 
        horasUtilizadas: usedHours 
      });
      
      if (usedHours > availableHours) {
        this.error = `Las actividades del interés "${interest.name}" suman ${usedHours.toFixed(1)} horas, pero solo tienes ${availableHours} horas disponibles.`;
        return false;
      }
    }
    
    // Limpiar error si era un error de horas
    if (this.error && this.error.includes('horas')) {
      this.error = '';
    }

    return true;
  }

  // Calcular el total de horas utilizadas para un interés específico
  calculateTotalHoursForInterest(interestId: string): number {
    let totalMinutes = 0;
    
    this.activitiesArray.controls.forEach((control: any) => {
      const activityInterestId = control.get('interestId')?.value;
      if (activityInterestId !== interestId) return;
      
      const startTime = control.get('startTime')?.value;
      const endTime = control.get('endTime')?.value;
      
      if (startTime && endTime) {
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        
        if (endMinutes > startMinutes) {
          totalMinutes += (endMinutes - startMinutes);
        }
      }
    });
    
    return totalMinutes / 60; // Convertir minutos a horas
  }
  
  // Calcular el total de horas utilizadas para todos los intereses
  calculateTotalHoursUsed(): number {
    return this.calculateTotalHours();
  }

  // Enviar formulario
  onSubmit(): void {
    if (!this.validateAvailableHours()) {
      return;
    }
    
    if (this.routineForm.valid) {
      this.submitting = true;
      
      // Verificar que haya actividades
      if (this.activitiesArray.length === 0) {
        this.error = 'Debes añadir al menos una actividad';
        this.submitting = false;
        return;
      }
      
      // Validar que todas las actividades sean válidas
      let hasInvalidActivity = false;
      this.activitiesArray.controls.forEach((control: any) => {
        if (control.invalid) {
          hasInvalidActivity = true;
          // Marcar todos los campos como tocados para mostrar errores
          Object.keys(control.controls).forEach(key => {
            control.get(key)?.markAsTouched();
          });
        }
      });
      
      if (hasInvalidActivity) {
        this.error = 'Hay actividades con campos incompletos. Por favor, revisa todas las actividades.';
        this.submitting = false;
        return;
      }
      
      const activitiesData = this.activitiesArray.controls.map(control => {
        const activityInterestId = control.get('interestId')?.value;
        // Buscar el interés directamente sin usar el método getInterestById
        const activityInterest = this.userInterests.find(interest => interest._id === activityInterestId);
        const activityInterestName = activityInterest ? activityInterest.name : 'Actividad';
        const day = control.get('day')?.value;
        const startTime = control.get('startTime')?.value;
        const endTime = control.get('endTime')?.value;
        
        // Validar que los campos obligatorios estén presentes
        if (!day || !startTime || !endTime) {
          console.error('Campos obligatorios faltantes en actividad:', { day, startTime, endTime });
          this.error = 'Hay actividades con campos obligatorios faltantes';
          this.submitting = false;
          return null;
        }
        
        return {
          interestId: activityInterestId || '',
          interestName: activityInterestName, // Incluir el nombre del interés para mostrarlo en el calendario
          day: day,
          startTime: startTime,
          endTime: endTime,
          description: activityInterestName // Usar solo el nombre del interés como descripción
        };
      }).filter(activity => activity !== null);
      
      // Verificar si hay actividades válidas después del filtrado
      if (activitiesData.length === 0) {
        this.error = 'No hay actividades válidas para guardar';
        this.submitting = false;
        return;
      }
      
      const routineData = {
        name: `Rutina de actividades - ${new Date().toLocaleDateString()}`, // Nombre con fecha
        description: `Rutina creada el ${new Date().toLocaleDateString()}`,
        activities: activitiesData
      };
      
      console.log('Enviando datos de rutina:', routineData);

      if (this.isEditMode && this.routineId) {
        this.routineService.updateRoutine(this.routineId, routineData).subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/routines']);
          },
          error: (err) => {
            this.error = 'Error al actualizar la rutina';
            this.submitting = false;
          }
        });
      } else {
        this.routineService.createRoutine(routineData).subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/routines']);
          },
          error: (err) => {
            this.error = 'Error al crear la rutina';
            this.submitting = false;
          }
        });
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.routineForm.controls).forEach(key => {
        const control = this.routineForm.get(key);
        control?.markAsTouched();
      });

      // Marcar campos de actividades como tocados
      this.activitiesArray.controls.forEach(control => {
        Object.keys((control as FormGroup).controls).forEach(key => {
          (control as FormGroup).get(key)?.markAsTouched();
        });
      });
    }
  }

  // Método para cancelar la edición
  cancel(): void {
    this.router.navigate(['/routines']);
  }
}
