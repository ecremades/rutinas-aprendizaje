import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RoutineListComponent } from './components/routine-list/routine-list.component';
import { RoutineComponent } from './components/routine/routine.component';
import { RoutineEditorComponent } from './components/routine-editor/routine-editor.component';
import { ActivityCalendarComponent } from './components/activity-calendar/activity-calendar.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'routines', component: RoutineListComponent, canActivate: [AuthGuard] },
  { path: 'routine/:id', component: RoutineComponent, canActivate: [AuthGuard] },
  { path: 'routine-editor', component: RoutineEditorComponent, canActivate: [AuthGuard] },
  { path: 'routine-editor/:id', component: RoutineEditorComponent, canActivate: [AuthGuard] },
  { path: 'activity-calendar', component: ActivityCalendarComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
