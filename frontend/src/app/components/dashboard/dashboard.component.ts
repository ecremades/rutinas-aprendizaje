import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoutineService } from '../../services/routine.service';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class DashboardComponent implements OnInit {
  user: any = null;
  routines: any[] = [];
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private routineService: RoutineService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadRoutines();
  }

  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => {
        console.error('Error al cargar el perfil:', err);
        this.logout();
      }
    });
  }

  logout(): void {
    this.authService.removeToken();
    this.router.navigate(['/login']);
  }

  loadRoutines(): void {
    this.loading = true;
    this.routineService.getRoutines().subscribe({
      next: (routines) => {
        this.routines = routines;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar rutinas:', err);
        this.error = 'Error al cargar las rutinas';
        this.loading = false;
      }
    });
  }
}