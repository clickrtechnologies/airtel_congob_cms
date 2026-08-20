import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { VerifyTokenComponent } from './artist/verify-token/verify-token.component';
import { VerifyTokenMnoComponent } from './mno/verify-token-mno/verify-token-mno.component';
import { UserLoginComponent } from './auth/user-login/user-login.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Public login routes
  { path: 'admin/login', component: LoginComponent },
  { path: 'artist/login', component: LoginComponent },
  { path: 'cp/login', component: LoginComponent },
  { path: 'mno/login', component: LoginComponent },
  {path: 'user/login', component: UserLoginComponent},

  // Protected lazy-loaded modules
  {
    path: 'cp',
    loadChildren: () => import('./cp/cp.module').then(m => m.CpModule),
    canActivate: [AuthGuard]
  },

  { path: 'artist/verify/:token', component: VerifyTokenComponent }, // public
  { path: 'mno/verify/:token', component: VerifyTokenMnoComponent }, // public
  {
    path: 'artist',
    loadChildren: () => import('./artist/artist.module').then(m => m.ArtistModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mno',
    loadChildren: () => import('./mno/mno.module').then(m => m.MnoModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'user',
    loadChildren:() => import('./user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard]
   
  }

  // { path: 'user/dashboard', component: DashboardComponent }, // public
  // { path: 'user/approval', component: ApprovalComponent }, // public
  // { path: 'user/contract', component: ContractsComponent }, // public
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
