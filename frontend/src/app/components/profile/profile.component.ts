import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  success = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {
    this.profileForm = this.fb.group({
      interests: this.fb.array([this.createInterest()])
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  // Cargar perfil existente
  loadProfile(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          // Resetear arrays
          this.interestsArray.clear();

          // Cargar intereses
          if (profile.interests && profile.interests.length > 0) {
            profile.interests.forEach((interest: any) => {
              this.interestsArray.push(this.fb.group({
                name: [interest.name || '', Validators.required],
                hoursPerWeek: [interest.hoursPerWeek || 1, [Validators.required, Validators.min(1)]]
              }));
            });
          } else {
            this.interestsArray.push(this.createInterest());
          }
        }
        this.loading = false;
      },
      error: (err) => {
        // Si es 404, no hay perfil aún, lo cual es normal
        if (err.status !== 404) {
          this.error = 'Error al cargar el perfil';
        }
        this.loading = false;
      }
    });
  }

  // Getter para acceder al FormArray
  get interestsArray(): FormArray {
    return this.profileForm.get('interests') as FormArray;
  }

  // Método para crear control de formulario de interés
  createInterest() {
    return this.fb.group({
      name: ['', Validators.required],
      hoursPerWeek: [1, [Validators.required, Validators.min(1)]]
    });
  }

  // Método para agregar nuevo interés
  addInterest(): void {
    this.interestsArray.push(this.createInterest());
  }

  // Método para eliminar interés
  removeInterest(index: number): void {
    if (this.interestsArray.length > 1) {
      this.interestsArray.removeAt(index);
    }
  }

  // Enviar formulario
  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.success = false;
      this.error = '';

      // Obtener los valores del formulario
      const formData = this.profileForm.value;
      
      // Crear el objeto de datos a enviar
      const profileData = {
        interests: formData.interests
      };

      console.log('Enviando datos de perfil:', profileData);

      this.profileService.updateProfile(profileData).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          this.success = true;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al guardar el perfil:', err);
          this.error = 'Error al guardar el perfil: ' + (err.error?.msg || err.message || 'Error desconocido');
          this.loading = false;
        }
      });
    }
  }
}
